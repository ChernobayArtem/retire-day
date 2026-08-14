#!/usr/bin/env node

// Integration test for the vault writer. It runs the real encrypt script only
// inside a disposable dummy project and never reads or mutates personal data.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sandbox = await mkdtemp(path.join(tmpdir(), 'retire-day-encrypt-test-'))
const encryptScript = path.join(sandbox, 'scripts/encrypt.mjs')
const contentPath = path.join(sandbox, 'local-content/current/content.mjs')
const mediaPath = path.join(sandbox, 'local-content/current/media/days/1/photo.webp')
const credentialsDir = path.join(sandbox, 'local-content/credentials')
const cekPath = path.join(credentialsDir, 'cek.json')
const passwordsPath = path.join(credentialsDir, 'passwords.json')
const vaultDir = path.join(sandbox, 'public/vault')

const validContent = [
  "export const days = [{ day: 1, title: 'Demo' }]",
  "export const secretMedia = ['days/1/photo.webp']",
  '',
].join('\n')
const validPasswords = JSON.stringify({ live: 'demo-live-password', test: 'demo-test-password' })
const validCek = JSON.stringify({ cek: Buffer.alloc(32, 7).toString('base64') })

function runEncrypt(expectedSuccess) {
  const result = spawnSync(process.execPath, [encryptScript], {
    cwd: sandbox,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  assert.equal(
    result.status === 0,
    expectedSuccess,
    expectedSuccess ? 'dummy encryption should succeed' : 'invalid dummy input should fail closed',
  )
}

async function treeDigest(directory) {
  const hash = createHash('sha256')
  async function visit(current, relative = '') {
    const entries = await readdir(current, { withFileTypes: true })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const nextRelative = path.posix.join(relative, entry.name)
      const target = path.join(current, entry.name)
      hash.update(nextRelative)
      if (entry.isDirectory()) await visit(target, nextRelative)
      else hash.update(await readFile(target))
    }
  }
  await visit(directory)
  return hash.digest('hex')
}

try {
  await mkdir(path.dirname(encryptScript), { recursive: true })
  await mkdir(path.dirname(contentPath), { recursive: true })
  await mkdir(path.dirname(mediaPath), { recursive: true })
  await mkdir(credentialsDir, { recursive: true })
  await mkdir(path.join(sandbox, 'public'), { recursive: true })
  await copyFile(path.join(projectRoot, 'scripts/encrypt.mjs'), encryptScript)
  await writeFile(contentPath, validContent)
  await writeFile(mediaPath, Buffer.from('dummy-media'))
  await writeFile(cekPath, validCek, { mode: 0o600 })
  await writeFile(passwordsPath, validPasswords, { mode: 0o600 })

  runEncrypt(true)
  const initialManifest = JSON.parse(await readFile(path.join(vaultDir, 'manifest.json'), 'utf8'))
  const stableKeyId = initialManifest.keyId
  const stableDigest = await treeDigest(vaultDir)

  await rename(cekPath, `${cekPath}.held`)
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), stableDigest)
  await rename(`${cekPath}.held`, cekPath)

  await writeFile(cekPath, JSON.stringify({ cek: Buffer.alloc(32, 8).toString('base64') }))
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), stableDigest)
  await writeFile(cekPath, validCek)

  await writeFile(contentPath, "export const days = undefined\nexport const secretMedia = []\n")
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), stableDigest)
  await writeFile(contentPath, validContent)

  await writeFile(passwordsPath, JSON.stringify({ live: 'same', test: 'same' }))
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), stableDigest)
  await writeFile(passwordsPath, validPasswords)

  await rename(mediaPath, `${mediaPath}.held`)
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), stableDigest)
  await rename(`${mediaPath}.held`, mediaPath)

  const manifestPath = path.join(vaultDir, 'manifest.json')
  const validManifest = await readFile(manifestPath)
  await writeFile(manifestPath, JSON.stringify({ v: 1, keyId: stableKeyId, media: null }))
  const malformedDigest = await treeDigest(vaultDir)
  runEncrypt(false)
  assert.equal(await treeDigest(vaultDir), malformedDigest)
  await writeFile(manifestPath, validManifest)

  const backup = path.join(sandbox, 'public/.vault-backup-111-111')
  const pending = path.join(sandbox, 'public/.vault-next-111-111')
  await rename(vaultDir, backup)
  await mkdir(pending)
  await writeFile(path.join(pending, 'incomplete.bin'), Buffer.from('dummy'))
  runEncrypt(true)
  const recoveredManifest = JSON.parse(await readFile(path.join(vaultDir, 'manifest.json'), 'utf8'))
  assert.equal(recoveredManifest.keyId, stableKeyId)
  assert.equal(recoveredManifest.media['days/1/photo.webp'].sha.length, 16)

  console.log('encrypt integration test: PASS (dummy project only)')
} finally {
  await rm(sandbox, { recursive: true, force: true })
}
