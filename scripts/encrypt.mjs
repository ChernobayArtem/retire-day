// Build step: encrypt all day content + personal images into public/vault/.
// Reads the plaintext sources from secret/ (gitignored) and the passwords, then
// writes ciphertext the app decrypts at runtime. Run with: npm run encrypt
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const subtle = globalThis.crypto.subtle
const ITER = 600000

const { days, secretMedia } = await import(path.join(root, 'secret/content.mjs'))
const passwords = JSON.parse(await readFile(path.join(root, 'secret/passwords.json'), 'utf8'))

const missingMedia = secretMedia.filter((rel) => !existsSync(path.join(root, 'public', rel)))
if (missingMedia.length > 0) {
  throw new Error(`Missing staged media:\n${missingMedia.map((rel) => `- ${rel}`).join('\n')}`)
}

const b64 = (buf) => Buffer.from(buf).toString('base64')
const rand = (n) => crypto.getRandomValues(new Uint8Array(n))

async function deriveKEK(pw, salt) {
  const base = await subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
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

// Content-encryption key, kept in secret/cek.json (gitignored) and REUSED.
//
// Rolling a fresh key every run would re-encrypt all ~8MB of media, so the service
// worker had to re-download the whole vault before it could apply an update —
// on a phone opened for a minute that never finished, and the stale (but
// self-consistent) cache kept serving last week's content with no password
// prompt. A stable key also means the saved session survives a content edit.
const cekPath = path.join(root, 'secret/cek.json')
let cekRaw
if (existsSync(cekPath)) {
  cekRaw = Buffer.from(JSON.parse(await readFile(cekPath, 'utf8')).cek, 'base64')
} else {
  cekRaw = Buffer.from(rand(32))
  await writeFile(cekPath, JSON.stringify({ cek: b64(cekRaw) }, null, 2))
  console.log('secret/cek.json: сгенерирован новый ключ (первый запуск)')
}
const cek = await subtle.importKey('raw', cekRaw, { name: 'AES-GCM' }, false, ['encrypt'])
const keyId = createHash('sha256').update(cekRaw).digest('hex').slice(0, 16)

// wrap the CEK for each password
const wraps = []
for (const role of ['live', 'test']) {
  const salt = rand(16)
  const kek = await deriveKEK(passwords[role], salt)
  const w = await enc(kek, cekRaw)
  wraps.push({ role, salt: b64(salt), iv: w.iv, ct: b64(w.ct) })
}

const vaultDir = path.join(root, 'public/vault')
const mediaDir = path.join(vaultDir, 'media')
const manifestPath = path.join(vaultDir, 'manifest.json')
await mkdir(mediaDir, { recursive: true })

// encrypt the content JSON
const contentEnc = await enc(cek, new TextEncoder().encode(JSON.stringify(days)))
await writeFile(path.join(vaultDir, 'content.bin'), Buffer.from(contentEnc.ct))

// Encrypt each personal image, then delete the plaintext copy from public/.
//
// Blobs are content-addressed and scoped to the CEK: an unchanged photo keeps
// the same URL during ordinary content edits, while a deliberate key rotation
// gets a new URL and cannot collide with ciphertext cached under the old key.
const prevManifest = existsSync(manifestPath)
  ? JSON.parse(await readFile(manifestPath, 'utf8'))
  : null
const prevIvByHash = new Map()
// Ciphertext can only be reused when it was produced by this exact CEK.
// Without this guard a deliberate key rotation would keep the old media blobs,
// making them impossible to decrypt with the newly generated key.
if (prevManifest?.keyId === keyId) {
  for (const entry of Object.values(prevManifest?.media ?? {})) {
    if (entry.sha) prevIvByHash.set(entry.sha, entry.iv)
  }
}

const media = {}
const blobs = new Map()
let fresh = 0
for (const rel of secretMedia) {
  const src = path.join(root, 'public', rel)
  const plain = await readFile(src)
  const hash = createHash('sha256').update(plain).digest('hex').slice(0, 16)

  let blob = blobs.get(hash)
  if (!blob) {
    const file = `m${hash}-${keyId}.bin`
    const out = path.join(mediaDir, file)
    const prevIv = prevIvByHash.get(hash)
    if (prevIv && existsSync(out)) {
      blob = { file, iv: prevIv } // unchanged — leave the ciphertext alone
    } else {
      const e = await enc(cek, plain)
      await writeFile(out, Buffer.from(e.ct))
      blob = { file, iv: e.iv }
      fresh++
    }
    blobs.set(hash, blob)
  }
  media[rel] = { ...blob, sha: hash }
  await rm(src)
}

// drop blobs no longer referenced by any day
const keep = new Set(Object.values(media).map((m) => m.file))
for (const f of await readdir(mediaDir)) {
  if (f.endsWith('.bin') && !keep.has(f)) await rm(path.join(mediaDir, f))
}

const manifest = { v: 1, iter: ITER, keyId, wraps, content: { iv: contentEnc.iv }, media }
await writeFile(manifestPath, JSON.stringify(manifest))

console.log(
  `vault: ${days.length} days, ${Object.keys(media).length} images ` +
    `(${fresh} re-encrypted, ${Object.keys(media).length - fresh} unchanged)`,
)
