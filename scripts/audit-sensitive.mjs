#!/usr/bin/env node

// Read-only release audit for plaintext credentials, personal copy, personal
// media, and the local content-encryption key. Findings deliberately use stable
// file ordinals: a personal filename must never become part of audit output.

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const ALLOW_MISSING = process.argv.includes('--allow-missing')
const SELF_TEST = process.argv.includes('--self-test')
const SUPPORTED_FLAGS = new Set(['--allow-missing', '--self-test'])
const UNKNOWN_FLAGS = process.argv.slice(2).filter((flag) => !SUPPORTED_FLAGS.has(flag))

const PLAINTEXT_SOURCE_PREFIXES = ['local-content/']
const TEXT_SCAN_EXCLUDED_PREFIXES = [...PLAINTEXT_SOURCE_PREFIXES, 'public/vault/', 'dist/vault/']

// Every plaintext/art file shipped from public/ must be explicitly reviewed.
// Personal day media is never added here: it belongs only in public/vault/ as
// encrypted blobs. A new intentional app/brand asset requires a policy change.
const SAFE_PUBLIC_FILES = new Set([
  'public/art/day-28.png',
  'public/art/golden-apple.svg',
  'public/art/lamoda.svg',
  'public/art/ozon.svg',
  'public/art/wb.svg',
  'public/favicon.png',
  'public/icons/apple-touch-icon-180.png',
  'public/icons/icon-192.png',
  'public/icons/icon-512-maskable.png',
  'public/icons/icon-512.png',
  'public/peek.webp',
  'public/scenes/day29-poster.jpg',
  'public/scenes/day29.mp4',
])

const SAFE_NON_PUBLIC_MEDIA_FILES = new Set(['src/assets/gate-logo.png'])
const SAFE_VAULT_FILES = new Set(['public/vault/manifest.json', 'public/vault/content.bin'])
const VAULT_BLOB_PATTERN = /^public\/vault\/media\/m[a-f0-9]{16}-[a-f0-9]{16}\.bin$/u

const BINARY_OR_ART_EXTENSIONS = new Set([
  '.7z',
  '.avif',
  '.bin',
  '.bmp',
  '.eot',
  '.gif',
  '.gz',
  '.heic',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mov',
  '.mp3',
  '.mp4',
  '.ogg',
  '.otf',
  '.pdf',
  '.png',
  '.tar',
  '.tif',
  '.tiff',
  '.ttf',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.zip',
])

// The content schema is classified field-by-field. Adding a new string field
// makes the audit fail closed until that field is deliberately classified.
const CONTENT_FIELD_POLICY = new Map([
  ['days.[].booking.background', 'media-path'],
  ['days.[].booking.card', 'media-path'],
  ['days.[].booking.when', 'personal-text'],
  ['days.[].booking.where', 'personal-text'],
  ['days.[].bonusVideo.src', 'media-path'],
  ['days.[].cert.banner', 'media-path'],
  ['days.[].cert.codes.[].label', 'metadata'],
  ['days.[].cert.codes.[].value', 'certificate-code'],
  ['days.[].collage', 'media-path'],
  ['days.[].compliment', 'personal-text'],
  ['days.[].coupon.claim', 'personal-text'],
  ['days.[].coupon.desc', 'personal-text'],
  ['days.[].coupon.title', 'personal-text'],
  ['days.[].category', 'metadata'],
  ['days.[].emoji', 'metadata'],
  ['days.[].icon', 'metadata'],
  ['days.[].meme.caption', 'personal-text'],
  ['days.[].meme.photo', 'media-path'],
  ['days.[].meme.reaction', 'personal-text'],
  ['days.[].photos.[]', 'media-path'],
  ['days.[].title', 'personal-text'],
  ['days.[].video.poster', 'media-path'],
  ['days.[].video.src', 'media-path'],
  ['days.[].wish', 'personal-text'],
  ['secretMedia.[]', 'media-path'],
])

// These are application vocabulary, not personal day copy. The allowlist is
// field-aware so the same text remains sensitive in every other field.
const SAFE_FIELD_VALUES = new Map([
  [
    'days.[].title',
    new Set([
      'Комплимент',
      'Фото',
      'Фоточки',
      'Сертификат',
      'Купон',
      'Ресторан',
      'Видос',
      'Видео',
      'Mission completed',
      'Мишон комплитед',
    ]),
  ],
])

const QUOTED_FRAGMENT_PATTERNS = [
  /`([^`\r\n]+)`/gu,
  /"([^"\r\n]+)"/gu,
  /'([^'\r\n]+)'/gu,
  /«([^»\r\n]+)»/gu,
  /“([^”\r\n]+)”/gu,
  /„([^“\r\n]+)“/gu,
]

if (UNKNOWN_FLAGS.length > 0) {
  console.error('Sensitive audit: ERROR (unsupported option)')
  process.exit(2)
}

function toRepoPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function hasPrefix(repoPath, prefixes) {
  const normalized = repoPath.replace(/^\.\//u, '')
  return prefixes.some(
    (prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix),
  )
}

function isBinaryOrArtPath(repoPath) {
  return BINARY_OR_ART_EXTENSIONS.has(path.extname(repoPath).toLowerCase())
}

function isExcludedFromTextScan(repoPath) {
  return hasPrefix(repoPath, TEXT_SCAN_EXCLUDED_PREFIXES) || isBinaryOrArtPath(repoPath)
}

function gitFileList(args) {
  const output = execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'ignore'],
  })

  return output.toString('utf8').split('\0').filter(Boolean).map(toRepoPath)
}

async function walkDirectory(directory, prefix = directory) {
  const absoluteDirectory = path.join(ROOT, directory)
  const result = []
  let entries

  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return result
    throw error
  }

  for (const entry of entries) {
    const repoPath = toRepoPath(path.join(prefix, entry.name))
    if (entry.isSymbolicLink()) {
      result.push({ repoPath, kind: 'symlink' })
      continue
    }
    if (entry.isDirectory()) result.push(...(await walkDirectory(repoPath, repoPath)))
    if (entry.isFile()) result.push({ repoPath, kind: 'file' })
  }

  return result
}

function isProbablyText(buffer) {
  if (buffer.length === 0) return true
  const sample = buffer.subarray(0, Math.min(buffer.length, 16_384))
  if (sample.includes(0)) return false

  let suspiciousControls = 0
  for (const byte of sample) {
    const allowedControl = byte === 9 || byte === 10 || byte === 13
    if (byte < 32 && !allowedControl) suspiciousControls += 1
  }

  return suspiciousControls / sample.length < 0.01
}

function lineNumberAt(text, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) line += 1
  }
  return line
}

function canonicalize(value) {
  return String(value)
    .replace(/[\u00a0\u2007\u202f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function sourceIndexAtCanonicalOffset(value, targetOffset) {
  let normalizedOffset = 0
  let started = false
  let pendingWhitespace = false
  let pendingWhitespaceIndex = -1

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (/\s|[\u00a0\u2007\u202f]/u.test(char)) {
      if (started) {
        pendingWhitespace = true
        if (pendingWhitespaceIndex < 0) pendingWhitespaceIndex = index
      }
      continue
    }

    if (pendingWhitespace) {
      if (normalizedOffset === targetOffset) return pendingWhitespaceIndex
      normalizedOffset += 1
      pendingWhitespace = false
      pendingWhitespaceIndex = -1
    }

    if (normalizedOffset === targetOffset) return index
    normalizedOffset += 1
    started = true
  }

  return 0
}

function collectPasswords(value, output = []) {
  if (typeof value === 'string' && value.length > 0) output.push(value)
  else if (Array.isArray(value)) value.forEach((item) => collectPasswords(item, output))
  else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectPasswords(item, output))
  }
  return output
}

function collectContent(value) {
  const output = {
    codes: [],
    texts: [],
    secretMediaPaths: [],
    totalStringValues: 0,
    classifiedStringValues: 0,
    unknownFieldPaths: new Set(),
  }

  function visit(child, branch = []) {
    if (Array.isArray(child)) {
      child.forEach((item) => visit(item, [...branch, '[]']))
      return
    }

    if (child && typeof child === 'object') {
      Object.entries(child).forEach(([key, nested]) => visit(nested, [...branch, key]))
      return
    }

    if (typeof child !== 'string') return

    output.totalStringValues += 1
    const fieldPath = branch.join('.')
    const policy = CONTENT_FIELD_POLICY.get(fieldPath)
    if (!policy) {
      output.unknownFieldPaths.add(fieldPath)
      return
    }

    output.classifiedStringValues += 1
    if (fieldPath === 'secretMedia.[]' && child.length > 0) output.secretMediaPaths.push(child)
    if (child.length === 0 || SAFE_FIELD_VALUES.get(fieldPath)?.has(child)) return
    if (policy === 'certificate-code') output.codes.push(child)
    if (policy === 'personal-text') output.texts.push(child)
  }

  visit(value)
  return output
}

function uniqueSorted(values, normalizer = (value) => value) {
  const unique = new Map()
  for (const value of values) {
    const normalized = normalizer(value)
    if (normalized && !unique.has(normalized)) unique.set(normalized, value)
  }
  return [...unique.entries()]
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([normalized, original], index) => ({
      id: index + 1,
      normalized,
      original,
    }))
}

async function loadSensitiveSources() {
  const missing = []
  let content = null
  let passwords = null
  let contentKey = null

  try {
    const contentUrl = pathToFileURL(path.join(ROOT, 'local-content/current/content.mjs'))
    const module = await import(`${contentUrl.href}?audit=${Date.now()}`)
    content = module.default ?? module
  } catch {
    missing.push('content')
  }

  try {
    const rawPasswords = await readFile(
      path.join(ROOT, 'local-content/credentials/passwords.json'),
      'utf8',
    )
    passwords = JSON.parse(rawPasswords)
  } catch {
    missing.push('passwords')
  }

  try {
    const rawKey = await readFile(path.join(ROOT, 'local-content/credentials/cek.json'), 'utf8')
    const parsedKey = JSON.parse(rawKey)
    if (typeof parsedKey?.cek !== 'string' || parsedKey.cek.length === 0)
      throw new Error('invalid key')
    contentKey = parsedKey.cek
  } catch {
    missing.push('content-key')
  }

  return { content, passwords, contentKey, missing }
}

function quotedSegments(text) {
  const found = []
  for (const pattern of QUOTED_FRAGMENT_PATTERNS) {
    pattern.lastIndex = 0
    for (const match of text.matchAll(pattern)) {
      found.push({ value: match[1], index: match.index + 1 })
    }
  }
  return found
}

function isMeaningfulContentFragment(fragment) {
  const normalized = canonicalize(fragment)
  if (normalized.length < 12) return false
  const meaningfulCharacters = [...normalized].filter((char) => /[\p{L}\p{N}]/u.test(char)).length
  return meaningfulCharacters >= 8
}

function isMeaningfulCodeFragment(fragment) {
  const normalized = fragment.trim()
  if (normalized.length < 4) return false
  return /^[\p{L}\p{N}][\p{L}\p{N}\s_.:/+@#*()\[\]-]*$/u.test(normalized)
}

function addFinding(findings, seen, repoPath, line, category, id) {
  const key = `${repoPath}\0${line}\0${category}\0${id}`
  if (seen.has(key)) return
  seen.add(key)
  findings.push({ repoPath, line, category, id })
}

function findEvery(haystack, needle) {
  const indexes = []
  if (!needle) return indexes
  let from = 0
  while (from <= haystack.length - needle.length) {
    const index = haystack.indexOf(needle, from)
    if (index < 0) break
    indexes.push(index)
    from = index + Math.max(needle.length, 1)
  }
  return indexes
}

function hasTokenBoundaries(text, index, value) {
  const before = text[index - 1] ?? ''
  const after = text[index + value.length] ?? ''
  const startsWithToken = /^[\p{L}\p{N}]/u.test(value)
  const endsWithToken = /[\p{L}\p{N}]$/u.test(value)
  if (startsWithToken && /[\p{L}\p{N}]/u.test(before)) return false
  if (endsWithToken && /[\p{L}\p{N}]/u.test(after)) return false
  return true
}

function scanText(repoPath, text, sensitive, findings, seen) {
  const fullMatchesByLine = new Set()

  for (const password of sensitive.passwords) {
    for (const index of findEvery(text, password.original)) {
      const line = lineNumberAt(text, index)
      addFinding(findings, seen, repoPath, line, 'credential', password.id)
    }
  }

  for (const contentKey of sensitive.contentKeys) {
    for (const index of findEvery(text, contentKey.original)) {
      const line = lineNumberAt(text, index)
      addFinding(findings, seen, repoPath, line, 'content-key', contentKey.id)
    }
  }

  for (const code of sensitive.codes) {
    for (const index of findEvery(text, code.original)) {
      if (!hasTokenBoundaries(text, index, code.original)) continue
      const line = lineNumberAt(text, index)
      fullMatchesByLine.add(`${line}:code:${code.id}`)
      addFinding(findings, seen, repoPath, line, 'certificate-code', code.id)
    }
  }

  const canonicalFile = canonicalize(text)
  for (const content of sensitive.texts) {
    for (const normalizedIndex of findEvery(canonicalFile, content.normalized)) {
      if (!hasTokenBoundaries(canonicalFile, normalizedIndex, content.normalized)) continue
      const sourceIndex = sourceIndexAtCanonicalOffset(text, normalizedIndex)
      const line = lineNumberAt(text, sourceIndex)
      fullMatchesByLine.add(`${line}:content:${content.id}`)
      addFinding(findings, seen, repoPath, line, 'personal-text', content.id)
    }
  }

  for (const segment of quotedSegments(text)) {
    const rawFragment = segment.value.trim()
    const normalizedFragment = canonicalize(rawFragment)
    if (!normalizedFragment) continue
    let line = null
    const getLine = () => {
      if (line === null) line = lineNumberAt(text, segment.index)
      return line
    }

    if (isMeaningfulCodeFragment(rawFragment)) {
      for (const code of sensitive.codes) {
        if (rawFragment === code.original) {
          addFinding(findings, seen, repoPath, getLine(), 'certificate-code', code.id)
          continue
        }
        const isPartial =
          rawFragment.length < code.original.length && code.original.includes(rawFragment)
        if (isPartial) {
          const matchLine = getLine()
          if (!fullMatchesByLine.has(`${matchLine}:code:${code.id}`)) {
            addFinding(findings, seen, repoPath, matchLine, 'certificate-code-fragment', code.id)
          }
        }
      }
    }

    if (isMeaningfulContentFragment(normalizedFragment)) {
      for (const content of sensitive.texts) {
        const isPartial =
          normalizedFragment.length < content.normalized.length &&
          content.normalized.includes(normalizedFragment)
        if (isPartial) {
          const matchLine = getLine()
          if (!fullMatchesByLine.has(`${matchLine}:content:${content.id}`)) {
            addFinding(findings, seen, repoPath, matchLine, 'personal-text-fragment', content.id)
          }
        }
      }
    }
  }
}

function classifyPublicEntry(repoPath, kind, plaintextMediaPaths = new Set()) {
  if (kind !== 'file') return 'public-symlink'
  const publicRelativePath = repoPath.replace(/^public\//u, '')
  if (plaintextMediaPaths.has(publicRelativePath)) return 'staged-plaintext-media'
  if (SAFE_PUBLIC_FILES.has(repoPath)) return null
  if (SAFE_VAULT_FILES.has(repoPath) || VAULT_BLOB_PATTERN.test(repoPath)) return null
  if (repoPath.startsWith('public/vault/')) return 'unexpected-vault-file'
  return 'unexpected-public-file'
}

function classifyRepositoryMedia(repoPath) {
  if (!isBinaryOrArtPath(repoPath)) return null
  if (repoPath.startsWith('public/')) return null
  if (SAFE_NON_PUBLIC_MEDIA_FILES.has(repoPath)) return null
  return 'unexpected-repository-media'
}

function formatFinding(finding, fileOrdinals) {
  const fileOrdinal = String(fileOrdinals.get(finding.repoPath)).padStart(3, '0')
  const itemOrdinal = String(finding.id).padStart(3, '0')
  const location = finding.line > 0 ? `:${finding.line}` : ''
  return `file#${fileOrdinal}${location} ${finding.category}#${itemOrdinal}`
}

function runSelfTest() {
  let checks = 0
  const check = (condition) => {
    assert.ok(condition)
    checks += 1
  }

  const fixture = {
    days: [
      {
        day: 1,
        title: 'Личный заголовок',
        category: 'coupon',
        emoji: '🎟️',
        icon: 'example',
        wish: 'Да',
        compliment: 'Ты',
        collage: 'photos/collage.webp',
        photos: ['photos/photo.webp'],
        booking: {
          background: 'booking/background.webp',
          card: 'booking/card.svg',
          when: 'Завтра',
          where: 'Дома',
        },
        cert: { banner: 'art/example.svg', codes: [{ label: 'Код', value: 'Q7' }] },
        coupon: { title: 'Отдых', desc: 'Сегодня', claim: 'Использовать' },
        meme: { photo: 'memes/meme.webp', caption: 'Привет', reaction: '🙂' },
        video: { src: 'videos/video.mp4', poster: 'videos/poster.webp' },
        bonusVideo: { src: 'videos/bonus.mp4' },
      },
    ],
    secretMedia: ['photos/photo.webp'],
  }
  const collected = collectContent(fixture)
  check(collected.unknownFieldPaths.size === 0)
  check(collected.classifiedStringValues === collected.totalStringValues)
  check(collected.codes.includes('Q7'))
  check(collected.texts.includes('Да'))
  check(collected.texts.includes('🙂'))
  check(!collected.texts.includes('booking/card.svg'))

  const generic = collectContent({ days: [{ title: 'Комплимент' }] })
  check(generic.texts.length === 0)
  const unknown = collectContent({ days: [{ surprise: 'fixture' }] })
  check(unknown.unknownFieldPaths.size === 1)

  check(classifyPublicEntry('public/icons/icon-192.png', 'file') === null)
  check(classifyPublicEntry('public/photos/fixture.jpg', 'file') === 'unexpected-public-file')
  check(
    classifyPublicEntry('public/photos/fixture.jpg', 'file', new Set(['photos/fixture.jpg'])) ===
      'staged-plaintext-media',
  )
  check(classifyPublicEntry('public/vault/fixture.jpg', 'file') === 'unexpected-vault-file')
  check(
    classifyPublicEntry('public/vault/media/m0123456789abcdef-fedcba9876543210.bin', 'file') ===
      null,
  )
  check(classifyPublicEntry('public/favicon.png', 'symlink') === 'public-symlink')
  check(classifyRepositoryMedia('fixture/private.jpg') === 'unexpected-repository-media')
  check(hasPrefix('local-content/fixture.txt', PLAINTEXT_SOURCE_PREFIXES))

  const keyFindings = []
  scanText(
    'fixture.txt',
    'fixture-content-key',
    {
      passwords: [],
      contentKeys: [{ id: 1, original: 'fixture-content-key' }],
      codes: [],
      texts: [],
    },
    keyFindings,
    new Set(),
  )
  check(keyFindings.length === 1 && keyFindings[0].category === 'content-key')

  const redacted = formatFinding(
    { repoPath: 'private/fixture-name.jpg', line: 4, category: 'fixture', id: 1 },
    new Map([['private/fixture-name.jpg', 1]]),
  )
  check(!redacted.includes('private'))
  check(!redacted.includes('fixture-name'))

  console.log(`Sensitive audit self-test: PASS (${checks} checks)`)
}

async function main() {
  const { content, passwords, contentKey, missing } = await loadSensitiveSources()
  const partial = missing.length > 0

  const contentValues = content
    ? collectContent(content)
    : {
        codes: [],
        texts: [],
        secretMediaPaths: [],
        totalStringValues: 0,
        classifiedStringValues: 0,
        unknownFieldPaths: new Set(),
      }
  const sensitive = {
    passwords: uniqueSorted(passwords ? collectPasswords(passwords) : []),
    contentKeys: uniqueSorted(contentKey ? [contentKey] : []),
    codes: uniqueSorted(contentValues.codes),
    texts: uniqueSorted(contentValues.texts, canonicalize),
  }

  let trackedFiles
  let untrackedFiles
  let distEntries
  let publicEntries
  let mediaSourceEntries
  try {
    trackedFiles = gitFileList(['ls-files', '-z']).filter((repoPath) =>
      existsSync(path.join(ROOT, repoPath)),
    )
    untrackedFiles = gitFileList(['ls-files', '--others', '--exclude-standard', '-z'])
    distEntries = await walkDirectory('dist')
    publicEntries = await walkDirectory('public')
    mediaSourceEntries = await walkDirectory('local-content/current/media')
  } catch {
    console.error('Sensitive audit: ERROR (unable to enumerate repository files)')
    process.exitCode = 2
    return
  }

  const repoFiles = [
    ...new Set([
      ...trackedFiles,
      ...untrackedFiles,
      ...distEntries.filter((entry) => entry.kind === 'file').map((entry) => entry.repoPath),
    ]),
  ].sort()
  const trackedPlaintextSources = trackedFiles
    .filter((repoPath) => hasPrefix(repoPath, PLAINTEXT_SOURCE_PREFIXES))
    .sort()

  const findings = []
  const seen = new Set()
  let inventoryId = 0
  const plaintextMediaPaths = new Set(contentValues.secretMediaPaths)
  for (const entry of mediaSourceEntries) {
    plaintextMediaPaths.add(entry.repoPath.replace(/^local-content\/current\/media\//u, ''))
  }

  for (const repoPath of trackedPlaintextSources) {
    inventoryId += 1
    addFinding(findings, seen, repoPath, 0, 'tracked-plaintext-source', inventoryId)
  }

  for (const entry of publicEntries.sort((left, right) =>
    left.repoPath.localeCompare(right.repoPath, 'en'),
  )) {
    const category = classifyPublicEntry(entry.repoPath, entry.kind, plaintextMediaPaths)
    if (!category) continue
    inventoryId += 1
    addFinding(findings, seen, entry.repoPath, 0, category, inventoryId)
  }

  for (const repoPath of [...new Set([...trackedFiles, ...untrackedFiles])].sort()) {
    const category = classifyRepositoryMedia(repoPath)
    if (!category) continue
    inventoryId += 1
    addFinding(findings, seen, repoPath, 0, category, inventoryId)
  }

  if (contentValues.unknownFieldPaths.size > 0) {
    addFinding(
      findings,
      seen,
      '@local-content-schema',
      0,
      'unclassified-content-field',
      contentValues.unknownFieldPaths.size,
    )
  }

  const files = repoFiles.filter((repoPath) => !isExcludedFromTextScan(repoPath))
  let scannedTextFiles = 0

  for (const repoPath of files) {
    let buffer
    try {
      buffer = await readFile(path.join(ROOT, repoPath))
    } catch {
      inventoryId += 1
      addFinding(findings, seen, repoPath, 0, 'unreadable-file', inventoryId)
      continue
    }
    if (!isProbablyText(buffer)) {
      inventoryId += 1
      addFinding(findings, seen, repoPath, 0, 'unexpected-binary-file', inventoryId)
      continue
    }
    scannedTextFiles += 1
    scanText(repoPath, buffer.toString('utf8'), sensitive, findings, seen)
  }

  findings.sort(
    (left, right) =>
      left.repoPath.localeCompare(right.repoPath, 'en') ||
      left.line - right.line ||
      left.category.localeCompare(right.category, 'en') ||
      left.id - right.id,
  )

  const ordinalPaths = [
    ...new Set([
      ...repoFiles,
      ...publicEntries.map((entry) => entry.repoPath),
      ...findings.map((finding) => finding.repoPath),
    ]),
  ].sort((left, right) => left.localeCompare(right, 'en'))
  const fileOrdinals = new Map(ordinalPaths.map((repoPath, index) => [repoPath, index + 1]))

  for (const finding of findings) console.error(formatFinding(finding, fileOrdinals))

  console.log(
    `Sensitive audit corpus: ${sensitive.passwords.length} unique credential(s); ` +
      `${sensitive.contentKeys.length} content key(s); ${sensitive.codes.length} unique certificate code(s); ` +
      `${sensitive.texts.length} unique personal string(s) from ${contentValues.texts.length} personal value(s)`,
  )
  console.log(
    `Sensitive audit schema: ${contentValues.classifiedStringValues}/${contentValues.totalStringValues} ` +
      `plaintext string value(s) classified`,
  )
  console.log(
    `Sensitive audit scope: ${scannedTextFiles} text file(s); ${publicEntries.length} public file(s); ` +
      `${plaintextMediaPaths.size} local media source(s); ` +
      `${trackedPlaintextSources.length} tracked plaintext source(s)`,
  )

  if (partial) {
    console.error(`Sensitive audit: PARTIAL (${missing.length} local source(s) unavailable)`)
  }

  if (findings.length > 0) {
    console.error(
      `Sensitive audit: FAIL (${findings.length} finding${findings.length === 1 ? '' : 's'})`,
    )
    process.exitCode = 1
    return
  }

  if (partial && !ALLOW_MISSING) {
    console.error(
      `Sensitive audit: FAIL (source-backed audit is incomplete across ${scannedTextFiles} text files)`,
    )
    process.exitCode = 2
    return
  }

  if (partial) {
    console.error(
      `Sensitive audit: PASS with --allow-missing (${scannedTextFiles} text files; partial source coverage)`,
    )
    return
  }

  console.log(
    `Sensitive audit: PASS (${scannedTextFiles} text files; all required local sources loaded)`,
  )
}

if (SELF_TEST) runSelfTest()
else await main()
