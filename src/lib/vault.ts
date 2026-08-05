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
    manifest = (await (await fetch(`${BASE}vault/manifest.json`, { cache: 'force-cache' })).json()) as Manifest
  }
  return manifest
}

async function deriveKEK(pw: string, salt: BufferSource, iter: number): Promise<CryptoKey> {
  const base = await subtle().importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
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
  const ct = await (await fetch(`${BASE}vault/content.bin`, { cache: 'force-cache' })).arrayBuffer()
  const plain = await subtle().decrypt({ name: 'AES-GCM', iv: b64ToBytes(m.content.iv) }, key, ct)
  return JSON.parse(new TextDecoder().decode(plain)) as DayDef[]
}

/** Try the entered password against every wrapped key. Returns the unlocked role on success. */
export async function unlock(password: string): Promise<Role | null> {
  const m = await getManifest()
  let cekRaw: ArrayBuffer | null = null
  let role: Role | null = null
  for (const w of m.wraps) {
    try {
      const kek = await deriveKEK(password, b64ToBytes(w.salt), m.iter)
      cekRaw = await subtle().decrypt({ name: 'AES-GCM', iv: b64ToBytes(w.iv) }, kek, b64ToBytes(w.ct))
      role = w.role
      break
    } catch {
      /* wrong password for this wrap — try the next */
    }
  }
  if (!cekRaw || !role) return null
  cek = await subtle().importKey('raw', cekRaw, { name: 'AES-GCM' }, true, ['decrypt'])
  const days = await loadContent(cek)
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ cek: bytesToB64(new Uint8Array(cekRaw)), role }))
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
    cek = await subtle().importKey('raw', b64ToBytes(saved.cek), { name: 'AES-GCM' }, true, ['decrypt'])
    const days = await loadContent(cek)
    set({ status: 'ready', role: saved.role, days })
  } catch {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
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
    { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }[
      ext
    ] ?? 'application/octet-stream'
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
  void p.finally(() => {
    // A rejected request must not poison this path forever. A later mount or
    // online event can then retry the download normally.
    if (mediaPending.get(pathRel) === p) mediaPending.delete(pathRel)
  }).catch(() => {
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
