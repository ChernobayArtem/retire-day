import { useSyncExternalStore } from 'react'
import type { DayDef } from '../content/days'

const BASE = import.meta.env.BASE_URL
const SESSION_KEY = 'retire-day:session'

export type Role = 'live' | 'test'
type Status = 'loading' | 'locked' | 'ready'

interface Manifest {
  v: number
  iter: number
  keyId?: string
  wraps: { role: Role; salt: string; iv: string; ct: string }[]
  content: { iv: string }
  media: Record<string, { file: string; iv: string }>
}

interface VaultState {
  status: Status
  role: Role | null
  days: DayDef[] | null
}

let state: VaultState = { status: 'loading', role: null, days: null }
let manifest: Manifest | null = null
let cek: CryptoKey | null = null
interface CachedMedia {
  url: string
  blob: Blob
}

const mediaCache = new Map<string, CachedMedia>()
const mediaPending = new Map<string, Promise<string>>()

const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((l) => l())
}
function set(next: Partial<VaultState>) {
  state = { ...state, ...next }
  emit()
}

const subtle = () => globalThis.crypto.subtle

/**
 * The vault files could not be fetched — offline, a bad gateway, a deploy in
 * flight. Distinct from a key that cannot open them: the session is still good
 * and must survive, so this is never a reason to forget it.
 */
class VaultUnavailableError extends Error {
  // Own field rather than `cause`: the project's lib target is ES2020, where
  // Error has no cause.
  readonly reason: unknown

  constructor(reason: unknown) {
    super('vault files are unreachable')
    this.name = 'VaultUnavailableError'
    this.reason = reason
  }
}

/**
 * True when unlocking failed because the vault files could not be fetched rather
 * than because the word was wrong. The gate needs to tell those apart: one is the
 * person's mistake, the other is not.
 */
export function isVaultUnavailable(error: unknown): boolean {
  return error instanceof VaultUnavailableError
}

/**
 * A wrong password shows up as a failed AES-GCM decrypt and nothing else. Any
 * other throw is an environment or data problem and must not be mistaken for it.
 */
function isDecryptionFailure(error: unknown): boolean {
  return error instanceof Error && error.name === 'OperationError'
}

/**
 * The browser cannot do the work at all — no WebCrypto. Like an unreachable
 * vault this says nothing about the stored key, so the session must survive it.
 */
class VaultEnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VaultEnvironmentError'
  }
}

/**
 * `crypto.subtle` exists only in a secure context: https, or localhost. Over
 * plain http on a LAN address the browser withholds it, and without this guard
 * the absence surfaces as a rejected password — which is what it looked like
 * from the outside for an entire evening of testing.
 */
function requireSubtle(): void {
  if (!globalThis.crypto?.subtle) {
    throw new VaultEnvironmentError(
      'crypto.subtle is unavailable: the page must be served over https or from localhost',
    )
  }
}

/** Neither the network nor the browser is the stored key's fault. */
function isNotTheKeysFault(error: unknown): boolean {
  return error instanceof VaultUnavailableError || error instanceof VaultEnvironmentError
}

function b64ToBytes(b64: string) {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function bytesToB64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

async function getManifest(): Promise<Manifest> {
  if (!manifest) {
    try {
      const res = await fetch(`${BASE}vault/manifest.json`, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`manifest ${res.status}`)
      manifest = (await res.json()) as Manifest
    } catch (cause) {
      throw new VaultUnavailableError(cause)
    }
    requireUsableManifest(manifest)
  }
  return manifest
}

/**
 * A damaged manifest must announce itself rather than be discovered later as a
 * failing decrypt: `iterations: 0` raises the very same `OperationError` a wrong
 * password does, so a corrupted count would otherwise read as a rejected word.
 */
function requireUsableManifest(m: Manifest): void {
  const bad = (why: string) => new VaultEnvironmentError(`vault manifest is unusable: ${why}`)
  if (!Number.isInteger(m.iter) || m.iter < 1) throw bad('iteration count')
  if (!Array.isArray(m.wraps) || m.wraps.length === 0) throw bad('no password wraps')
  for (const w of m.wraps) {
    if (typeof w?.salt !== 'string' || typeof w?.iv !== 'string' || typeof w?.ct !== 'string') {
      throw bad(`wrap for role ${String(w?.role)}`)
    }
  }
  if (typeof m.content?.iv !== 'string') throw bad('content iv')
}

async function deriveKEK(pw: string, salt: BufferSource, iter: number): Promise<CryptoKey> {
  const base = await subtle().importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, [
    'deriveKey',
  ])
  return subtle().deriveKey(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

async function loadContent(key: CryptoKey): Promise<DayDef[]> {
  const m = await getManifest()
  let ct: ArrayBuffer
  try {
    const res = await fetch(`${BASE}vault/content.bin`, { cache: 'force-cache' })
    if (!res.ok) throw new Error(`content ${res.status}`)
    ct = await res.arrayBuffer()
  } catch (cause) {
    throw new VaultUnavailableError(cause)
  }
  const plain = await subtle().decrypt({ name: 'AES-GCM', iv: b64ToBytes(m.content.iv) }, key, ct)
  return JSON.parse(new TextDecoder().decode(plain)) as DayDef[]
}

/** Try the entered password against every wrapped key. Returns the unlocked role on success. */
export async function unlock(password: string): Promise<Role | null> {
  requireSubtle()
  const m = await getManifest()
  let cekRaw: ArrayBuffer | null = null
  let role: Role | null = null
  for (const w of m.wraps) {
    // Deriving the key and decoding the wrap sit OUTSIDE the catch on purpose.
    // Neither can fail because a word was wrong, and `OperationError` does not
    // distinguish them from one that was: PBKDF2 raises exactly that name for a
    // damaged iteration count. Only the decrypt below may be answered with
    // "try the next wrap".
    const kek = await deriveKEK(password, b64ToBytes(w.salt), m.iter)
    const iv = b64ToBytes(w.iv)
    const wrapped = b64ToBytes(w.ct)
    try {
      cekRaw = await subtle().decrypt({ name: 'AES-GCM', iv }, kek, wrapped)
    } catch (error) {
      if (!isDecryptionFailure(error)) throw error
      continue
    }
    role = w.role
    break
  }
  if (!cekRaw || !role) return null
  cek = await subtle().importKey('raw', cekRaw, { name: 'AES-GCM' }, true, ['decrypt'])
  const days = await loadContent(cek)
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ cek: bytesToB64(new Uint8Array(cekRaw)), role }),
    )
  } catch {
    /* storage unavailable — session just won't persist */
  }
  set({ status: 'ready', role, days })
  return role
}

/** Restore a previous session (content key kept on-device) so the password is entered once. */
export async function resume(): Promise<void> {
  let saved: { cek: string; role: Role } | null = null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) saved = JSON.parse(raw)
  } catch {
    /* ignore */
  }
  if (!saved) {
    set({ status: 'locked' })
    return
  }
  try {
    requireSubtle()
    cek = await subtle().importKey('raw', b64ToBytes(saved.cek), { name: 'AES-GCM' }, true, [
      'decrypt',
    ])
    const days = await loadContent(cek)
    set({ status: 'ready', role: saved.role, days })
  } catch (error) {
    // Forget the session only when the stored key itself cannot open this vault.
    // Unreachable files or a browser without WebCrypto say nothing about the key:
    // dropping it for either would cost the password over a network blip or a
    // page opened on the wrong origin, and the next proper load would have worked.
    if (!isNotTheKeysFault(error)) {
      cek = null
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch {
        /* ignore */
      }
    }
    set({ status: 'locked' })
  }
}

export function logout() {
  cek = null
  mediaCache.forEach(({ url }) => URL.revokeObjectURL(url))
  mediaCache.clear()
  mediaPending.clear()
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
  set({ status: 'locked', role: null, days: null })
}

/**
 * Blobs need an explicit MIME type: an untyped blob URL is sniffed fine for
 * <img>, but Safari refuses to play a <video> whose source has no type.
 */
function mimeFor(pathRel: string): string {
  const ext = pathRel.slice(pathRel.lastIndexOf('.') + 1).toLowerCase()
  return (
    {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    }[ext] ?? 'application/octet-stream'
  )
}

/** Personal images decrypt to blob URLs; public paths pass straight through. */
export async function mediaUrl(pathRel: string): Promise<string> {
  const m = await getManifest()
  const entry = m.media[pathRel]
  if (!entry) return `${BASE}${pathRel}`
  const cached = mediaCache.get(pathRel)
  if (cached) return cached.url
  const pending = mediaPending.get(pathRel)
  if (pending) return pending
  const p = (async () => {
    const sessionKey = cek
    if (!sessionKey) throw new Error('vault locked')
    const response = await fetch(`${BASE}vault/media/${entry.file}`, { cache: 'force-cache' })
    if (!response.ok) throw new Error(`media request failed: ${response.status}`)
    const ct = await response.arrayBuffer()
    const plain = await subtle().decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(entry.iv) },
      sessionKey,
      ct,
    )
    // A logout or account switch while a large video is decrypting must not
    // repopulate the plaintext cache after it has just been cleared.
    if (cek !== sessionKey) throw new Error('vault session changed')
    const blob = new Blob([plain], { type: mimeFor(pathRel) })
    const url = URL.createObjectURL(blob)
    mediaCache.set(pathRel, { url, blob })
    return url
  })()
  mediaPending.set(pathRel, p)
  void p
    .finally(() => {
      // A rejected request must not poison this path forever. A later mount or
      // online event can then retry the download normally.
      if (mediaPending.get(pathRel) === p) mediaPending.delete(pathRel)
    })
    .catch(() => {
      // The caller receives the original rejection; this only handles the
      // promise returned by finally() itself.
    })
  return p
}

/** Return only media already decrypted in this unlocked session. */
export function cachedMediaBlob(pathRel: string): Blob | null {
  return mediaCache.get(pathRel)?.blob ?? null
}

export function dayByNumber(day: number): DayDef | undefined {
  return state.days?.find((d) => d.day === day)
}

export function useVault(): VaultState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}
