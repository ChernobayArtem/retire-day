// Read-only release integrity audit for the encrypted public vault.
//
// Output is deliberately aggregate and redacted. Never add secret values,
// source paths, key identifiers, hashes, or ciphertext to diagnostics here.
import { createHash, timingSafeEqual, webcrypto } from 'node:crypto'
import { existsSync } from 'node:fs'
import { lstat, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vaultDir = path.join(root, 'public/vault')
const mediaDir = path.join(vaultDir, 'media')
const manifestPath = path.join(vaultDir, 'manifest.json')
const contentPath = path.join(vaultDir, 'content.bin')
const credentialsDir = path.join(root, 'local-content/credentials')
const cekPath = path.join(root, 'local-content/credentials/cek.json')
const passwordsPath = path.join(root, 'local-content/credentials/passwords.json')
const localContentPath = path.join(root, 'local-content/current/content.mjs')
const localMediaDir = path.join(root, 'local-content/current/media')
const subtle = webcrypto.subtle

const SCHEMA_VERSION = 1
const PBKDF2_ITERATIONS_FLOOR = 600_000
const PBKDF2_ITERATIONS_CURRENT = 600_000
const EXPECTED_ROLES = ['live', 'test']
const EXPECTED_VAULT_ENTRIES = new Set(['manifest.json', 'content.bin', 'media'])
const DAY_CATEGORIES = new Set([
  'compliment',
  'photos',
  'cert',
  'coupon',
  'restaurant',
  'video',
])
const DAY_KEYS = new Set([
  'day',
  'title',
  'category',
  'emoji',
  'icon',
  'compliment',
  'collage',
  'video',
  'bonusVideo',
  'booking',
  'cert',
  'coupon',
  'photos',
  'compliments',
  'wish',
  'meme',
  'message',
])
const KEY_ID_PATTERN = /^[a-f0-9]{16}$/
const SHA_PATTERN = /^[a-f0-9]{16}$/
const BLOB_FILE_PATTERN = /^m([a-f0-9]{16})-([a-f0-9]{16})\.bin$/
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

const issues = []
const addIssue = (code, message) => issues.push({ code, message })

// A bare `catch {}` around a decrypt reports every failure — a failed read, an
// exhausted file handle, an out-of-memory abort — as a cryptographic
// authentication failure, which reads like corrupted vault data. Keep the cause
// so a transient I/O fault is never mistaken for a broken blob. Only the error
// identity is reported: never a path, key, or any decrypted content.
function describeError(error) {
  const code = error?.code
  if (typeof code === 'string' && code) return code
  const name = error?.name
  if (typeof name === 'string' && name) return name
  return 'unknown error'
}

const allowedFlags = new Set(['--allow-missing-local', '--allow-missing-origin'])
for (const argument of process.argv.slice(2)) {
  if (!allowedFlags.has(argument)) {
    addIssue('CLI_ARGUMENT', 'unsupported audit option')
  }
}
const allowMissingLocal = process.argv.includes('--allow-missing-local')
const allowMissingOrigin = process.argv.includes('--allow-missing-origin')

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasExactKeys(value, expected, code) {
  if (!isPlainObject(value)) {
    addIssue(code, 'expected an object')
    return false
  }

  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    addIssue(code, 'object fields do not match the supported schema')
    return false
  }
  return true
}

function hasOnlyKeys(value, allowed, code) {
  if (!isPlainObject(value)) {
    addIssue(code, 'expected an object')
    return false
  }
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    addIssue(code, 'object contains unsupported fields')
    return false
  }
  return true
}

function decodeBase64(value, expectedBytes, code) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length % 4 !== 0 ||
    !BASE64_PATTERN.test(value)
  ) {
    addIssue(code, 'field is not canonical base64')
    return null
  }

  const decoded = Buffer.from(value, 'base64')
  if (decoded.toString('base64') !== value) {
    addIssue(code, 'field is not canonical base64')
    return null
  }
  if (decoded.length !== expectedBytes) {
    addIssue(code, 'decoded field length is invalid')
    return null
  }
  return decoded
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0 && value === value.normalize('NFC')
}

function validateOptionalString(value, code) {
  if (value !== undefined && !isNonEmptyString(value)) {
    addIssue(code, 'optional text field is invalid')
  }
}

function validateStringArray(value, code) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => !isNonEmptyString(item))) {
    addIssue(code, 'expected a non-empty array of canonical strings')
    return false
  }
  return true
}

function isSafeMediaSourcePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.normalize('NFC')) return false
  if (value.includes('\\') || /[\0-\x1F\x7F?#]/.test(value)) return false
  if (path.posix.isAbsolute(value) || path.posix.normalize(value) !== value) return false

  const parts = value.split('/')
  return parts.length >= 2 && parts.every((part) => part.length > 0 && part !== '.' && part !== '..')
}

async function readJson(filePath, code) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch {
    addIssue(code, 'JSON file is missing, unreadable, or malformed')
    return null
  }
}

async function isRegularFile(filePath, minimumBytes, code) {
  try {
    const info = await lstat(filePath)
    if (!info.isFile() || info.isSymbolicLink()) {
      addIssue(code, 'expected a regular, non-symlink file')
      return false
    }
    if (info.size < minimumBytes) {
      addIssue(code, 'encrypted file is unexpectedly short')
      return false
    }
    return true
  } catch {
    addIssue(code, 'required encrypted file is missing or unreadable')
    return false
  }
}

async function validateVaultLayout() {
  let vaultReady = false
  let manifestReady = false
  let contentEntryReady = false
  let mediaReady = false
  try {
    const vaultInfo = await lstat(vaultDir)
    if (!vaultInfo.isDirectory() || vaultInfo.isSymbolicLink()) {
      addIssue('VAULT_DIRECTORY', 'vault root must be a real directory, not a symlink')
      return { vaultReady, mediaReady }
    }
    vaultReady = true

    const entries = await readdir(vaultDir, { withFileTypes: true })
    const names = new Set(entries.map((entry) => entry.name))
    const unexpectedCount = entries.filter((entry) => !EXPECTED_VAULT_ENTRIES.has(entry.name)).length
    if (unexpectedCount > 0) {
      addIssue('VAULT_LAYOUT', 'vault root contains unexpected entries')
    }
    if ([...EXPECTED_VAULT_ENTRIES].some((name) => !names.has(name))) {
      addIssue('VAULT_LAYOUT', 'vault root is missing required entries')
    }

    for (const entry of entries) {
      if (entry.name === 'manifest.json' || entry.name === 'content.bin') {
        if (!entry.isFile() || entry.isSymbolicLink()) {
          addIssue('VAULT_LAYOUT', 'vault root contains an invalid required file entry')
        } else if (entry.name === 'manifest.json') {
          manifestReady = true
        } else {
          contentEntryReady = true
        }
      } else if (entry.name === 'media') {
        if (!entry.isDirectory() || entry.isSymbolicLink()) {
          addIssue('MEDIA_DIRECTORY', 'vault media entry must be a real directory, not a symlink')
        } else {
          mediaReady = true
        }
      }
    }
  } catch {
    addIssue('VAULT_DIRECTORY', 'vault root is missing or unreadable')
  }
  return { vaultReady, manifestReady, contentEntryReady, mediaReady }
}

async function isSecureLocalFile(filePath, code) {
  try {
    const info = await lstat(filePath)
    if (!info.isFile() || info.isSymbolicLink()) {
      addIssue(code, 'local secret record must be a regular, non-symlink file')
      return false
    }
    return true
  } catch {
    return false
  }
}

async function auditCredentialPermissions(directory) {
  if (!existsSync(directory) || process.platform === 'win32') return
  const directoryInfo = await lstat(directory)
  if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink() || (directoryInfo.mode & 0o077) !== 0) {
    addIssue(
      'LOCAL_CREDENTIAL_PERMISSIONS',
      'credential directories must be owner-only real directories',
    )
    return
  }
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    const info = await lstat(target)
    if (info.isSymbolicLink()) {
      addIssue('LOCAL_CREDENTIAL_PERMISSIONS', 'credential storage must not contain symlinks')
    } else if (info.isDirectory()) {
      await auditCredentialPermissions(target)
    } else if (!info.isFile() || (info.mode & 0o077) !== 0) {
      addIssue(
        'LOCAL_CREDENTIAL_PERMISSIONS',
        'credential files must be regular files readable only by their owner',
      )
    }
  }
}

function validateContentShape(value) {
  if (!Array.isArray(value) || value.length === 0) {
    addIssue('CONTENT_SHAPE', 'decrypted content must be a non-empty day array')
    return { valid: false, stringValues: new Set(), mediaReferences: new Set(), dayCount: 0 }
  }

  const initialIssueCount = issues.length
  let valid = true
  const seenDays = new Set()
  const stringValues = new Set()
  const mediaReferences = new Set()
  const remember = (text) => {
    if (typeof text === 'string') stringValues.add(text)
  }
  const rememberMedia = (text) => {
    remember(text)
    if (typeof text === 'string') mediaReferences.add(text)
  }

  for (const day of value) {
    if (!hasOnlyKeys(day, DAY_KEYS, 'CONTENT_DAY_SCHEMA')) {
      valid = false
      continue
    }

    if (!Number.isSafeInteger(day.day) || day.day < 1 || seenDays.has(day.day)) {
      addIssue('CONTENT_DAY_NUMBER', 'day numbers must be unique positive integers')
      valid = false
    } else {
      seenDays.add(day.day)
    }
    if (!isNonEmptyString(day.title) || !isNonEmptyString(day.emoji)) {
      addIssue('CONTENT_DAY_REQUIRED', 'a required day text field is invalid')
      valid = false
    }
    if (!DAY_CATEGORIES.has(day.category)) {
      addIssue('CONTENT_DAY_CATEGORY', 'day category is unsupported')
      valid = false
    } else {
      const hasCategoryContent = {
        compliment: Boolean(
          isNonEmptyString(day.compliment) ||
          day.compliments?.length ||
          isNonEmptyString(day.wish) ||
          isNonEmptyString(day.message),
        ),
        photos: Boolean(isNonEmptyString(day.collage) || day.photos?.length),
        cert: isPlainObject(day.cert),
        coupon: isPlainObject(day.coupon),
        restaurant: isPlainObject(day.booking),
        video: isPlainObject(day.video),
      }[day.category]
      if (!hasCategoryContent) {
        addIssue('CONTENT_DAY_CATEGORY_PAYLOAD', 'day category has no matching content payload')
        valid = false
      }
    }

    for (const key of ['title', 'category', 'emoji', 'icon', 'compliment', 'collage', 'wish', 'message']) {
      if (day[key] !== undefined) remember(day[key])
    }
    for (const key of ['icon', 'compliment', 'collage', 'wish', 'message']) {
      validateOptionalString(day[key], 'CONTENT_DAY_OPTIONAL')
    }
    if (day.collage !== undefined) rememberMedia(day.collage)

    if (day.video !== undefined) {
      if (!hasOnlyKeys(day.video, new Set(['src', 'poster']), 'CONTENT_VIDEO_SCHEMA')) {
        valid = false
      } else {
        if (!isNonEmptyString(day.video.poster)) {
          addIssue('CONTENT_VIDEO_POSTER', 'video poster is required')
          valid = false
        }
        validateOptionalString(day.video.src, 'CONTENT_VIDEO_SOURCE')
        rememberMedia(day.video.poster)
        rememberMedia(day.video.src)
      }
    }

    if (day.bonusVideo !== undefined) {
      if (!hasOnlyKeys(day.bonusVideo, new Set(['src']), 'CONTENT_BONUS_VIDEO_SCHEMA')) {
        valid = false
      } else if (!isNonEmptyString(day.bonusVideo.src)) {
        addIssue('CONTENT_BONUS_VIDEO_SOURCE', 'bonus video source is required')
        valid = false
      } else {
        rememberMedia(day.bonusVideo.src)
      }
    }

    if (day.booking !== undefined) {
      if (!hasOnlyKeys(day.booking, new Set(['card', 'background', 'when', 'where']), 'CONTENT_BOOKING_SCHEMA')) {
        valid = false
      } else {
        if (
          !isNonEmptyString(day.booking.card) ||
          !isNonEmptyString(day.booking.when) ||
          !isNonEmptyString(day.booking.where)
        ) {
          addIssue('CONTENT_BOOKING_REQUIRED', 'booking is missing a required field')
          valid = false
        }
        validateOptionalString(day.booking.background, 'CONTENT_BOOKING_BACKGROUND')
        for (const field of Object.values(day.booking)) remember(field)
        rememberMedia(day.booking.card)
        rememberMedia(day.booking.background)
      }
    }

    if (day.cert !== undefined) {
      if (!hasOnlyKeys(day.cert, new Set(['brand', 'banner', 'codes']), 'CONTENT_CERT_SCHEMA')) {
        valid = false
      } else {
        validateOptionalString(day.cert.brand, 'CONTENT_CERT_TEXT')
        validateOptionalString(day.cert.banner, 'CONTENT_CERT_TEXT')
        remember(day.cert.brand)
        rememberMedia(day.cert.banner)
        if (!Array.isArray(day.cert.codes) || day.cert.codes.length === 0) {
          addIssue('CONTENT_CERT_CODES', 'certificate codes must be a non-empty array')
          valid = false
        } else {
          for (const code of day.cert.codes) {
            if (!hasOnlyKeys(code, new Set(['label', 'value']), 'CONTENT_CERT_CODE_SCHEMA')) {
              valid = false
              continue
            }
            if (!isNonEmptyString(code.value)) {
              addIssue('CONTENT_CERT_CODE_VALUE', 'certificate code value is invalid')
              valid = false
            }
            validateOptionalString(code.label, 'CONTENT_CERT_CODE_LABEL')
            remember(code.label)
            remember(code.value)
          }
        }
      }
    }

    if (day.coupon !== undefined) {
      const couponKeys = new Set(['title', 'desc', 'claim', 'emoji'])
      if (!hasOnlyKeys(day.coupon, couponKeys, 'CONTENT_COUPON_SCHEMA')) {
        valid = false
      } else {
        for (const key of ['title', 'desc', 'claim']) {
          if (!isNonEmptyString(day.coupon[key])) {
            addIssue('CONTENT_COUPON_REQUIRED', 'coupon is missing a required text field')
            valid = false
          }
          remember(day.coupon[key])
        }
        validateOptionalString(day.coupon.emoji, 'CONTENT_COUPON_TEXT')
        remember(day.coupon.emoji)
      }
    }

    if (day.photos !== undefined) {
      if (!validateStringArray(day.photos, 'CONTENT_STRING_ARRAY')) valid = false
      for (const field of day.photos ?? []) rememberMedia(field)
    }
    if (day.compliments !== undefined) {
      if (!validateStringArray(day.compliments, 'CONTENT_STRING_ARRAY')) valid = false
      for (const field of day.compliments ?? []) remember(field)
    }

    if (day.meme !== undefined) {
      if (!hasOnlyKeys(day.meme, new Set(['photo', 'caption', 'reaction']), 'CONTENT_MEME_SCHEMA')) {
        valid = false
      } else {
        if (!isNonEmptyString(day.meme.photo)) {
          addIssue('CONTENT_MEME_PHOTO', 'meme photo is required')
          valid = false
        }
        validateOptionalString(day.meme.caption, 'CONTENT_MEME_TEXT')
        validateOptionalString(day.meme.reaction, 'CONTENT_MEME_TEXT')
        rememberMedia(day.meme.photo)
        remember(day.meme.caption)
        remember(day.meme.reaction)
      }
    }
  }

  if (seenDays.size === value.length) {
    for (let expected = 1; expected <= value.length; expected++) {
      if (!seenDays.has(expected)) {
        addIssue('CONTENT_DAY_SEQUENCE', 'day numbers must form a contiguous sequence')
        valid = false
        break
      }
    }
  }

  return {
    valid: valid && issues.length === initialIssueCount,
    stringValues,
    mediaReferences,
    dayCount: value.length,
  }
}

async function deriveKEK(password, salt, iterations) {
  const base = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

async function decryptAesGcm(rawKey, iv, ciphertext) {
  const key = await subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt'])
  const plain = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return Buffer.from(plain)
}

const layout = await validateVaultLayout()
const manifest = layout.manifestReady ? await readJson(manifestPath, 'MANIFEST_JSON') : null
let manifestMediaCount = 0
let referencedBlobCount = 0
let orphanBlobCount = 0
let decryptedBlobCount = 0
let dayCount = 0
let wrapVerificationCount = 0
let originProtectedMappingCount = 0
let originStatus = 'failed'
let localStatus = 'required verification failed'
let localCek = null
let localPasswords = null
let localDays = null
let localSecretMedia = null
let localContentMatch = false
let localMediaMatchCount = 0
let decodedContentIv = null
const decodedWraps = new Map()
const mediaRecordsByFile = new Map()
const regularMediaFiles = new Set()
const cekIvOwners = new Map()
let contentFileReady = false

if (manifest && hasExactKeys(manifest, ['v', 'iter', 'keyId', 'wraps', 'content', 'media'], 'MANIFEST_SCHEMA')) {
  if (manifest.v !== SCHEMA_VERSION) {
    addIssue('MANIFEST_VERSION', 'unsupported vault schema version')
  }
  if (!Number.isSafeInteger(manifest.iter) || manifest.iter < PBKDF2_ITERATIONS_FLOOR) {
    addIssue('PBKDF2_FLOOR', 'PBKDF2 iteration count is below the security floor')
  }
  if (manifest.iter !== PBKDF2_ITERATIONS_CURRENT) {
    addIssue('PBKDF2_CURRENT', 'PBKDF2 iteration count differs from the current encryption contract')
  }
  if (typeof manifest.keyId !== 'string' || !KEY_ID_PATTERN.test(manifest.keyId)) {
    addIssue('KEY_ID_SHAPE', 'key identity has an invalid shape')
  }

  if (!Array.isArray(manifest.wraps)) {
    addIssue('WRAPS_SCHEMA', 'password wraps must be an array')
  } else {
    const seenRoles = new Set()
    for (const wrap of manifest.wraps) {
      if (!hasExactKeys(wrap, ['role', 'salt', 'iv', 'ct'], 'WRAP_SCHEMA')) continue
      if (typeof wrap.role !== 'string' || !EXPECTED_ROLES.includes(wrap.role)) {
        addIssue('WRAP_ROLE', 'password wrap has an unexpected role')
        continue
      }
      if (seenRoles.has(wrap.role)) {
        addIssue('WRAP_ROLE', 'password wrap roles are not unique')
        continue
      }
      seenRoles.add(wrap.role)
      const salt = decodeBase64(wrap.salt, 16, 'WRAP_SALT')
      const iv = decodeBase64(wrap.iv, 12, 'WRAP_IV')
      const ciphertext = decodeBase64(wrap.ct, 48, 'WRAP_CIPHERTEXT')
      if (salt && iv && ciphertext) decodedWraps.set(wrap.role, { salt, iv, ciphertext })
    }
    if (
      manifest.wraps.length !== EXPECTED_ROLES.length ||
      EXPECTED_ROLES.some((role) => !seenRoles.has(role))
    ) {
      addIssue('WRAP_ROLES', 'vault must contain exactly one live and one test password wrap')
    }
  }

  if (hasExactKeys(manifest.content, ['iv'], 'CONTENT_SCHEMA')) {
    decodedContentIv = decodeBase64(manifest.content.iv, 12, 'CONTENT_IV')
    if (decodedContentIv) cekIvOwners.set(manifest.content.iv, 'content')
  }
  if (layout.contentEntryReady) {
    contentFileReady = await isRegularFile(contentPath, 17, 'CONTENT_FILE')
  }

  if (!isPlainObject(manifest.media)) {
    addIssue('MEDIA_SCHEMA', 'media map must be an object')
  } else {
    const mediaEntries = Object.entries(manifest.media)
    manifestMediaCount = mediaEntries.length
    const canonicalSourcePaths = new Set()
    const referencedFiles = new Map()

    for (const [sourcePath, entry] of mediaEntries) {
      if (!isSafeMediaSourcePath(sourcePath)) {
        addIssue('MEDIA_SOURCE_PATH', 'media map contains an unsafe or non-canonical source path')
      } else {
        const collisionKey = sourcePath.normalize('NFC').toLocaleLowerCase('en-US')
        if (canonicalSourcePaths.has(collisionKey)) {
          addIssue('MEDIA_SOURCE_UNIQUENESS', 'media source paths collide after canonicalization')
        }
        canonicalSourcePaths.add(collisionKey)
      }

      if (!hasExactKeys(entry, ['file', 'iv', 'sha'], 'MEDIA_ENTRY_SCHEMA')) continue
      const iv = decodeBase64(entry.iv, 12, 'MEDIA_IV')
      if (typeof entry.sha !== 'string' || !SHA_PATTERN.test(entry.sha)) {
        addIssue('MEDIA_SHA_SHAPE', 'media identity has an invalid shape')
      }
      if (typeof entry.file !== 'string') {
        addIssue('MEDIA_BLOB_PATH', 'encrypted media filename is invalid')
        continue
      }
      const match = BLOB_FILE_PATTERN.exec(entry.file)
      if (!match || path.basename(entry.file) !== entry.file) {
        addIssue('MEDIA_BLOB_PATH', 'encrypted media filename is unsafe or non-canonical')
        continue
      }
      if (match[1] !== entry.sha || match[2] !== manifest.keyId) {
        addIssue('MEDIA_BLOB_IDENTITY', 'encrypted media filename does not match its declared identities')
      }

      const signature = `${entry.sha}:${entry.iv}`
      const priorSignature = referencedFiles.get(entry.file)
      if (priorSignature && priorSignature !== signature) {
        addIssue('MEDIA_BLOB_UNIQUENESS', 'one encrypted media file has conflicting manifest metadata')
      }
      referencedFiles.set(entry.file, signature)
      if (iv && SHA_PATTERN.test(entry.sha)) {
        const priorIvOwner = cekIvOwners.get(entry.iv)
        if (priorIvOwner && priorIvOwner !== entry.file) {
          addIssue('CEK_IV_REUSE', 'AES-GCM IV is reused across distinct payloads under the CEK')
        } else {
          cekIvOwners.set(entry.iv, entry.file)
        }
        mediaRecordsByFile.set(entry.file, { iv, sha: entry.sha })
      }

      const resolvedBlob = path.resolve(mediaDir, entry.file)
      if (path.dirname(resolvedBlob) !== mediaDir) {
        addIssue('MEDIA_BLOB_PATH', 'encrypted media mapping escapes the vault media directory')
      } else {
        if (await isRegularFile(resolvedBlob, 17, 'MEDIA_BLOB_FILE')) {
          regularMediaFiles.add(entry.file)
        }
      }
    }
    referencedBlobCount = referencedFiles.size

    if (layout.mediaReady) {
      try {
        const directoryEntries = await readdir(mediaDir, { withFileTypes: true })
        const encryptedFiles = new Set()
        for (const entry of directoryEntries) {
          if (!entry.isFile() || entry.isSymbolicLink() || !BLOB_FILE_PATTERN.test(entry.name)) {
            addIssue('MEDIA_DIRECTORY', 'vault media directory contains an unexpected entry')
            continue
          }
          encryptedFiles.add(entry.name)
        }
        orphanBlobCount = [...encryptedFiles].filter((file) => !referencedFiles.has(file)).length
        if (orphanBlobCount > 0) {
          addIssue('MEDIA_ORPHANS', 'vault media directory contains unreferenced encrypted files')
        }
        if ([...referencedFiles.keys()].some((file) => !encryptedFiles.has(file))) {
          addIssue('MEDIA_DIRECTORY_MAPPING', 'manifest references encrypted files absent from the media directory')
        }
      } catch {
        addIssue('MEDIA_DIRECTORY', 'vault media directory is missing or unreadable')
      }
    }
  }
}

// Existing published mappings are immutable by default. New mappings are fine.
const originRef = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'origin/main'], {
  cwd: root,
  encoding: 'utf8',
})
if (originRef.status !== 0) {
  if (allowMissingOrigin) {
    originStatus = 'partial (explicitly allowed)'
  } else {
    addIssue('ORIGIN_UNAVAILABLE', 'origin/main is unavailable; published mapping protection was not performed')
    originStatus = 'unavailable'
  }
} else {
  const originManifestResult = spawnSync('git', ['show', 'origin/main:public/vault/manifest.json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (originManifestResult.status !== 0) {
    addIssue('ORIGIN_MANIFEST', 'origin/main exists but its vault manifest cannot be read')
  } else {
    try {
      const originManifest = JSON.parse(originManifestResult.stdout)
      if (
        !isPlainObject(originManifest) ||
        !KEY_ID_PATTERN.test(originManifest.keyId ?? '') ||
        !isPlainObject(originManifest.media)
      ) {
        addIssue('ORIGIN_MANIFEST', 'origin/main vault manifest does not support compatibility comparison')
      } else if (!manifest || !isPlainObject(manifest.media)) {
        addIssue('ORIGIN_COMPARISON', 'current vault manifest is unavailable for compatibility comparison')
      } else {
        if (originManifest.keyId !== manifest.keyId) {
          addIssue('ORIGIN_KEY_ID', 'vault key identity changed relative to origin/main')
        }
        const originEntries = Object.entries(originManifest.media)
        originProtectedMappingCount = originEntries.length
        let removed = 0
        let changed = 0
        for (const [sourcePath, priorEntry] of originEntries) {
          const priorEntryIsValid =
            isSafeMediaSourcePath(sourcePath) &&
            isPlainObject(priorEntry) &&
            Object.keys(priorEntry).length === 3 &&
            Object.hasOwn(priorEntry, 'file') &&
            Object.hasOwn(priorEntry, 'iv') &&
            Object.hasOwn(priorEntry, 'sha') &&
            typeof priorEntry.file === 'string' &&
            typeof priorEntry.iv === 'string' &&
            typeof priorEntry.sha === 'string'
          if (!priorEntryIsValid) {
            addIssue('ORIGIN_MEDIA_SCHEMA', 'origin/main contains an unsupported media mapping')
            changed++
            continue
          }
          if (!Object.hasOwn(manifest.media, sourcePath)) {
            removed++
          } else {
            const currentEntry = manifest.media[sourcePath]
            if (
              !isPlainObject(currentEntry) ||
              priorEntry.file !== currentEntry.file ||
              priorEntry.iv !== currentEntry.iv ||
              priorEntry.sha !== currentEntry.sha
            ) {
              changed++
            }
          }
        }
        if (removed > 0) {
          addIssue('ORIGIN_MEDIA_REMOVED', 'published media mappings were removed')
        }
        if (changed > 0) {
          addIssue('ORIGIN_MEDIA_CHANGED', 'published media mappings changed')
        }
        if (removed === 0 && changed === 0 && originManifest.keyId === manifest.keyId) {
          originStatus = 'compatible'
        } else {
          originStatus = 'incompatible'
        }
      }
    } catch {
      addIssue('ORIGIN_MANIFEST', 'origin/main vault manifest is malformed')
    }
  }
}

// Full release mode requires local key and password records. The opt-out exists
// only for intentionally partial CI/build environments and is always reported.
await auditCredentialPermissions(credentialsDir)
const hasCek = existsSync(cekPath) && (await isSecureLocalFile(cekPath, 'LOCAL_CEK_FILE'))
const hasPasswords =
  existsSync(passwordsPath) && (await isSecureLocalFile(passwordsPath, 'LOCAL_PASSWORDS_FILE'))
const hasContentSource =
  existsSync(localContentPath) &&
  (await isSecureLocalFile(localContentPath, 'LOCAL_CONTENT_FILE'))
if (!hasCek && !hasPasswords && !hasContentSource && allowMissingLocal) {
  localStatus = 'partial (explicitly allowed)'
} else {
  if (!hasCek) addIssue('LOCAL_CEK_REQUIRED', 'local CEK record is required for a full vault audit')
  if (!hasPasswords) addIssue('LOCAL_PASSWORDS_REQUIRED', 'local password record is required for a full vault audit')
  if (!hasContentSource) {
    addIssue('LOCAL_CONTENT_REQUIRED', 'local content source is required for a full vault audit')
  }

  if (hasCek) {
    const cekRecord = await readJson(cekPath, 'LOCAL_CEK_JSON')
    if (cekRecord && hasExactKeys(cekRecord, ['cek'], 'LOCAL_CEK_SCHEMA')) {
      localCek = decodeBase64(cekRecord.cek, 32, 'LOCAL_CEK_SHAPE')
    }
  }
  if (hasPasswords) {
    const passwords = await readJson(passwordsPath, 'LOCAL_PASSWORDS_JSON')
    if (passwords && hasExactKeys(passwords, EXPECTED_ROLES, 'LOCAL_PASSWORDS_SCHEMA')) {
      if (EXPECTED_ROLES.every((role) => isNonEmptyString(passwords[role]))) {
        localPasswords = passwords
      } else {
        addIssue('LOCAL_PASSWORDS_SHAPE', 'local password fields are invalid')
      }
    }
  }
  if (hasContentSource) {
    try {
      const contentModule = await import(
        `${pathToFileURL(localContentPath).href}?vault-audit=${Date.now()}`
      )
      if (!Array.isArray(contentModule.days) || !Array.isArray(contentModule.secretMedia)) {
        addIssue('LOCAL_CONTENT_EXPORTS', 'local content source has unsupported exports')
      } else {
        localDays = contentModule.days
        localSecretMedia = contentModule.secretMedia
      }
    } catch {
      addIssue('LOCAL_CONTENT_IMPORT', 'local content source could not be imported')
    }
  }

  if (localCek && manifest) {
    const localKeyId = createHash('sha256').update(localCek).digest('hex').slice(0, 16)
    if (localKeyId !== manifest.keyId) {
      addIssue('LOCAL_CEK_KEY_ID', 'local CEK does not match the public vault key identity')
    }

    if (localPasswords && Number.isSafeInteger(manifest.iter)) {
      for (const role of EXPECTED_ROLES) {
        const decodedWrap = decodedWraps.get(role)
        if (!decodedWrap) continue
        try {
          const kek = await deriveKEK(localPasswords[role], decodedWrap.salt, manifest.iter)
          const unwrapped = Buffer.from(
            await subtle.decrypt(
              { name: 'AES-GCM', iv: decodedWrap.iv },
              kek,
              decodedWrap.ciphertext,
            ),
          )
          if (unwrapped.length !== localCek.length || !timingSafeEqual(unwrapped, localCek)) {
            addIssue('PASSWORD_WRAP_KEY', 'a password wrap does not unwrap to the local CEK')
          } else {
            wrapVerificationCount++
          }
        } catch (error) {
          addIssue(
            'PASSWORD_WRAP_AUTH',
            `a password wrap failed authenticated decryption (${describeError(error)})`,
          )
        }
      }
    }

    let contentShape = null
    if (decodedContentIv && contentFileReady) {
      let contentCiphertext = null
      try {
        contentCiphertext = await readFile(contentPath)
      } catch (error) {
        addIssue('CONTENT_READ', `encrypted content could not be read (${describeError(error)})`)
      }
      if (contentCiphertext !== null) {
        let plaintext = null
        try {
          plaintext = await decryptAesGcm(localCek, decodedContentIv, contentCiphertext)
        } catch (error) {
          addIssue(
            'CONTENT_AUTH',
            `content failed AES-GCM authenticated decryption (${describeError(error)})`,
          )
        }
        if (plaintext !== null) {
          let decodedContent
          try {
            decodedContent = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plaintext))
          } catch {
            addIssue('CONTENT_JSON_AUTH', 'authenticated content is not valid UTF-8 JSON')
          }
          if (decodedContent !== undefined) {
            contentShape = validateContentShape(decodedContent)
            dayCount = contentShape.dayCount
            if (localDays) {
              const currentBytes = Buffer.from(JSON.stringify(decodedContent))
              const sourceBytes = Buffer.from(JSON.stringify(localDays))
              if (
                currentBytes.length !== sourceBytes.length ||
                !timingSafeEqual(currentBytes, sourceBytes)
              ) {
                addIssue('LOCAL_CONTENT_MISMATCH', 'encrypted content differs from the local content source')
              } else {
                localContentMatch = true
              }
            }
          }
        }
      }
    }

    for (const [file, record] of mediaRecordsByFile) {
      if (!regularMediaFiles.has(file)) continue
      let ciphertext
      try {
        ciphertext = await readFile(path.join(mediaDir, file))
      } catch (error) {
        addIssue(
          'MEDIA_READ',
          `an encrypted media blob could not be read (${describeError(error)})`,
        )
        continue
      }
      try {
        const plaintext = await decryptAesGcm(localCek, record.iv, ciphertext)
        const actualSha = createHash('sha256').update(plaintext).digest('hex').slice(0, 16)
        if (actualSha !== record.sha) {
          addIssue('MEDIA_PLAINTEXT_SHA', 'decrypted media does not match its declared plaintext identity')
        } else {
          decryptedBlobCount++
        }
      } catch (error) {
        addIssue(
          'MEDIA_AUTH',
          `an encrypted media blob failed AES-GCM authenticated decryption (${describeError(error)})`,
        )
      }
    }

    if (contentShape && isPlainObject(manifest.media)) {
      const manifestSourcePaths = Object.keys(manifest.media)
      const missingMappings = [...contentShape.mediaReferences].filter(
        (sourcePath) => !Object.hasOwn(manifest.media, sourcePath),
      ).length
      const unreferencedMappings = manifestSourcePaths.filter(
        (sourcePath) => !contentShape.mediaReferences.has(sourcePath),
      ).length
      if (missingMappings > 0) {
        addIssue('CONTENT_MEDIA_MISSING', 'content references media absent from the encrypted vault')
      }
      if (unreferencedMappings > 0) {
        addIssue('CONTENT_MEDIA_REFERENCES', 'encrypted content does not reference every media mapping')
      }
    }

    if (localSecretMedia && isPlainObject(manifest.media)) {
      const uniqueSourcePaths = new Set(localSecretMedia)
      if (
        uniqueSourcePaths.size !== localSecretMedia.length ||
        localSecretMedia.some((sourcePath) => !isSafeMediaSourcePath(sourcePath))
      ) {
        addIssue('LOCAL_MEDIA_LIST', 'local encrypted-media allowlist is invalid')
      } else {
        const manifestSourcePaths = Object.keys(manifest.media)
        if (
          manifestSourcePaths.length !== uniqueSourcePaths.size ||
          manifestSourcePaths.some((sourcePath) => !uniqueSourcePaths.has(sourcePath))
        ) {
          addIssue('LOCAL_MEDIA_MAPPING', 'vault media mappings differ from the local encrypted-media allowlist')
        }

        for (const sourcePath of uniqueSourcePaths) {
          const entry = manifest.media[sourcePath]
          if (!isPlainObject(entry) || typeof entry.sha !== 'string') continue
          const sourceFile = path.resolve(localMediaDir, sourcePath)
          if (!sourceFile.startsWith(`${localMediaDir}${path.sep}`)) {
            addIssue('LOCAL_MEDIA_PATH', 'a local media source escapes the prepared-media directory')
            continue
          }
          if (!(await isSecureLocalFile(sourceFile, 'LOCAL_MEDIA_FILE'))) {
            addIssue('LOCAL_MEDIA_REQUIRED', 'a prepared local media source is missing or invalid')
            continue
          }
          try {
            const plaintext = await readFile(sourceFile)
            const actualSha = createHash('sha256').update(plaintext).digest('hex').slice(0, 16)
            if (actualSha !== entry.sha) {
              addIssue('LOCAL_MEDIA_MISMATCH', 'encrypted media differs from its prepared local source')
            } else {
              localMediaMatchCount++
            }
          } catch {
            addIssue('LOCAL_MEDIA_READ', 'a prepared local media source cannot be read')
          }
        }
      }
    }

    if (
      localKeyId === manifest.keyId &&
      wrapVerificationCount === EXPECTED_ROLES.length &&
      contentShape?.valid === true &&
      decryptedBlobCount === mediaRecordsByFile.size &&
      localContentMatch &&
      localSecretMedia &&
      localMediaMatchCount === localSecretMedia.length
    ) {
      localStatus = 'complete'
    }
  }
}

const roleCount = Array.isArray(manifest?.wraps) ? manifest.wraps.length : 0
console.log(
  `vault audit: schema v${manifest?.v ?? '?'}; PBKDF2 ${manifest?.iter ?? '?'}; ` +
    `roles ${roleCount}/${EXPECTED_ROLES.length}`,
)
console.log(
  `vault audit: ${manifestMediaCount} media mappings -> ${referencedBlobCount} encrypted blobs; ` +
    `${orphanBlobCount} orphan blobs`,
)
console.log(
  `vault audit: local verification ${localStatus}; wraps ${wrapVerificationCount}/${EXPECTED_ROLES.length}; ` +
    `content ${dayCount > 0 ? 'authenticated' : 'not verified'}${localContentMatch ? ' and matched' : ''}; ` +
    `media ${decryptedBlobCount}/${mediaRecordsByFile.size} authenticated, ` +
    `${localMediaMatchCount}/${localSecretMedia?.length ?? 0} matched to local sources`,
)
console.log(
  `vault audit: origin compatibility ${originStatus}; ` +
    `${originProtectedMappingCount} published mappings protected`,
)

if (issues.length > 0) {
  const grouped = new Map()
  for (const issue of issues) {
    const current = grouped.get(issue.code) ?? { count: 0, message: issue.message }
    current.count++
    grouped.set(issue.code, current)
  }

  console.error(`vault audit: FAILED (${issues.length} issue${issues.length === 1 ? '' : 's'})`)
  for (const [code, issue] of grouped) {
    const suffix = issue.count > 1 ? ` (${issue.count} occurrences)` : ''
    console.error(`- ${code}: ${issue.message}${suffix}`)
  }
  process.exit(1)
}

console.log('vault audit: OK')
