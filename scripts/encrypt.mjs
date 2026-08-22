// Build step: encrypt all day content + personal images into public/vault/.
// Reads local plaintext sources from local-content/ (gitignored), then writes
// ciphertext the app decrypts at runtime. Run with: npm run encrypt
import { copyFile, lstat, readFile, writeFile, mkdir, readdir, rm, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const subtle = globalThis.crypto.subtle
const ITER = 600000

const { days, secretMedia } = await import(path.join(root, 'local-content/current/content.mjs'))
const passwords = JSON.parse(
  await readFile(path.join(root, 'local-content/credentials/passwords.json'), 'utf8'),
)

const localMediaDir = path.join(root, 'local-content/current/media')
const publicDir = path.join(root, 'public')
const vaultDir = path.join(publicDir, 'vault')
const mediaDir = path.join(vaultDir, 'media')
const manifestPath = path.join(vaultDir, 'manifest.json')
const TEMP_VAULT_PATTERN = /^\.vault-next-\d+-\d+$/u
const BACKUP_VAULT_PATTERN = /^\.vault-backup-\d+-\d+$/u

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

if (
  !Array.isArray(days) ||
  days.length === 0 ||
  days.some((day) => !isPlainRecord(day) || !Number.isSafeInteger(day.day) || day.day < 1) ||
  new Set(days.map((day) => day.day)).size !== days.length
) {
  throw new Error('Day content is invalid; encryption aborted before writing.')
}

if (
  !isPlainRecord(passwords) ||
  Object.keys(passwords).sort().join(',') !== 'live,test' ||
  typeof passwords.live !== 'string' ||
  passwords.live.length === 0 ||
  typeof passwords.test !== 'string' ||
  passwords.test.length === 0 ||
  passwords.live === passwords.test
) {
  throw new Error('Password records are invalid; encryption aborted before writing.')
}

async function recoverInterruptedSwap() {
  await mkdir(publicDir, { recursive: true })
  const entries = await readdir(publicDir, { withFileTypes: true })
  const backups = entries
    .filter((entry) => entry.isDirectory() && BACKUP_VAULT_PATTERN.test(entry.name))
    .map((entry) => path.join(publicDir, entry.name))
  const pending = entries
    .filter((entry) => entry.isDirectory() && TEMP_VAULT_PATTERN.test(entry.name))
    .map((entry) => path.join(publicDir, entry.name))

  if (!existsSync(vaultDir)) {
    if (backups.length !== 1) {
      if (backups.length > 0 || pending.length > 0) {
        throw new Error('Interrupted vault state is ambiguous; encryption aborted.')
      }
      return { backups: [], pending: [] }
    }
    await rename(backups[0], vaultDir)
    return { backups: [], pending }
  }
  return { backups, pending }
}

const staleVaultDirectories = await recoverInterruptedSwap()

function resolveInside(base, relativePath) {
  if (
    typeof relativePath !== 'string' ||
    relativePath.length === 0 ||
    relativePath.includes('\\') ||
    path.posix.isAbsolute(relativePath) ||
    path.posix.normalize(relativePath) !== relativePath
  ) {
    throw new Error('secretMedia contains an unsafe path; encryption aborted.')
  }

  const resolved = path.resolve(base, relativePath)
  const prefix = `${path.resolve(base)}${path.sep}`
  if (!resolved.startsWith(prefix)) {
    throw new Error('secretMedia escapes its allowed directory; encryption aborted.')
  }
  return resolved
}

if (!Array.isArray(secretMedia) || new Set(secretMedia).size !== secretMedia.length) {
  throw new Error('secretMedia must contain unique paths; encryption aborted.')
}

for (const rel of secretMedia) {
  const source = resolveInside(localMediaDir, rel)
  let info
  try {
    info = await lstat(source)
  } catch {
    throw new Error('A required local media file is missing; encryption aborted.')
  }
  if (!info.isFile() || info.isSymbolicLink()) {
    throw new Error('secretMedia must reference ordinary local files; encryption aborted.')
  }
  if (existsSync(resolveInside(publicDir, rel))) {
    throw new Error('Plaintext personal media was found in public/; encryption aborted.')
  }
}

const b64 = (buf) => Buffer.from(buf).toString('base64')
const rand = (n) => crypto.getRandomValues(new Uint8Array(n))

async function deriveKEK(pw, salt) {
  const base = await subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, [
    'deriveKey',
  ])
  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}
async function enc(key, data) {
  const iv = rand(12)
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, data))
  return { iv: b64(iv), ct }
}

// Content-encryption key, kept in local-content/credentials/cek.json and REUSED.
//
// Rolling a fresh key every run would re-encrypt all ~8MB of media, so the service
// worker had to re-download the whole vault before it could apply an update —
// on a phone opened for a minute that never finished, and the stale (but
// self-consistent) cache kept serving last week's content with no password
// prompt. A stable key also means the saved session survives a content edit.
const cekPath = path.join(root, 'local-content/credentials/cek.json')
if (!existsSync(cekPath)) {
  throw new Error(
    'The existing content key is missing. Restore local-content/credentials/cek.json; ' +
      'automatic key creation is disabled to protect installed sessions.',
  )
}
const cekRecord = JSON.parse(await readFile(cekPath, 'utf8'))
if (
  !isPlainRecord(cekRecord) ||
  Object.keys(cekRecord).join(',') !== 'cek' ||
  typeof cekRecord.cek !== 'string'
) {
  throw new Error('The content key record is invalid; encryption aborted.')
}
const cekRaw = Buffer.from(cekRecord.cek, 'base64')
if (cekRaw.length !== 32 || b64(cekRaw) !== cekRecord.cek) {
  throw new Error('The content key is invalid; encryption aborted.')
}
const cek = await subtle.importKey('raw', cekRaw, { name: 'AES-GCM' }, false, ['encrypt'])
const keyId = createHash('sha256').update(cekRaw).digest('hex').slice(0, 16)

const prevManifest = existsSync(manifestPath)
  ? JSON.parse(await readFile(manifestPath, 'utf8'))
  : null
if (prevManifest?.keyId && prevManifest.keyId !== keyId) {
  throw new Error('The local content key does not match the published vault; encryption aborted.')
}
if (
  prevManifest !== null &&
  (!isPlainRecord(prevManifest) ||
    prevManifest.v !== 1 ||
    typeof prevManifest.keyId !== 'string' ||
    !/^[a-f0-9]{16}$/u.test(prevManifest.keyId) ||
    !isPlainRecord(prevManifest.media) ||
    Object.values(prevManifest.media).some(
      (entry) =>
        !isPlainRecord(entry) ||
        typeof entry.file !== 'string' ||
        !/^m[a-f0-9]{16}-[a-f0-9]{16}\.bin$/u.test(entry.file) ||
        typeof entry.iv !== 'string' ||
        typeof entry.sha !== 'string',
    ))
) {
  throw new Error('The published vault manifest is invalid; encryption aborted.')
}

// A valid current vault is authoritative. Old encrypted temp/backup directories
// can now be removed safely; no plaintext is stored in them.
for (const directory of [...staleVaultDirectories.backups, ...staleVaultDirectories.pending]) {
  await rm(directory, { recursive: true, force: true })
}

// wrap the CEK for each password
const wraps = []
for (const role of ['live', 'test']) {
  const salt = rand(16)
  const kek = await deriveKEK(passwords[role], salt)
  const w = await enc(kek, cekRaw)
  wraps.push({ role, salt: b64(salt), iv: w.iv, ct: b64(w.ct) })
}

const tempVaultDir = path.join(publicDir, `.vault-next-${process.pid}-${Date.now()}`)
const tempMediaDir = path.join(tempVaultDir, 'media')
const backupVaultDir = path.join(publicDir, `.vault-backup-${process.pid}-${Date.now()}`)
await mkdir(tempMediaDir, { recursive: true })

// Build a complete next vault outside the published path. Only after every
// ciphertext and the manifest are ready do we swap the directory into place.
let media
let fresh = 0
try {
  const contentEnc = await enc(cek, new TextEncoder().encode(JSON.stringify(days)))
  await writeFile(path.join(tempVaultDir, 'content.bin'), Buffer.from(contentEnc.ct))

  // Encrypt directly from the gitignored canonical media source. Plaintext is
  // never copied into public/. Blobs are content-addressed and scoped to the
  // stable CEK, so unchanged media keeps its published URL.
  const prevIvByHash = new Map()
  if (prevManifest?.keyId === keyId) {
    for (const entry of Object.values(prevManifest?.media ?? {})) {
      if (entry.sha) prevIvByHash.set(entry.sha, entry.iv)
    }
  }

  media = {}
  const blobs = new Map()
  for (const rel of secretMedia) {
    const src = resolveInside(localMediaDir, rel)
    const plain = await readFile(src)
    const hash = createHash('sha256').update(plain).digest('hex').slice(0, 16)

    let blob = blobs.get(hash)
    if (!blob) {
      const file = `m${hash}-${keyId}.bin`
      const out = path.join(tempMediaDir, file)
      const prevIv = prevIvByHash.get(hash)
      const previousBlob = path.join(mediaDir, file)
      if (prevIv && existsSync(previousBlob)) {
        await copyFile(previousBlob, out)
        blob = { file, iv: prevIv }
      } else {
        const e = await enc(cek, plain)
        await writeFile(out, Buffer.from(e.ct))
        blob = { file, iv: e.iv }
        fresh++
      }
      blobs.set(hash, blob)
    }
    media[rel] = { ...blob, sha: hash }
  }

  const manifest = { v: 1, iter: ITER, keyId, wraps, content: { iv: contentEnc.iv }, media }
  await writeFile(path.join(tempVaultDir, 'manifest.json'), JSON.stringify(manifest))
} catch (error) {
  await rm(tempVaultDir, { recursive: true, force: true })
  throw error
}

let previousVaultMoved = false
try {
  if (existsSync(vaultDir)) {
    await rename(vaultDir, backupVaultDir)
    previousVaultMoved = true
  }
  await rename(tempVaultDir, vaultDir)
} catch (error) {
  await rm(tempVaultDir, { recursive: true, force: true })
  if (previousVaultMoved && !existsSync(vaultDir) && existsSync(backupVaultDir)) {
    await rename(backupVaultDir, vaultDir)
  }
  throw error
}
if (previousVaultMoved) await rm(backupVaultDir, { recursive: true, force: true })

console.log(
  `vault: ${days.length} days, ${Object.keys(media).length} images ` +
    `(${fresh} re-encrypted, ${Object.keys(media).length - fresh} unchanged)`,
)
