import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * These tests build a throwaway vault with the same envelope scheme the real one
 * uses — a random content key, wrapped once per password, and a content blob
 * encrypted under that content key — and then drive the actual unlock/resume
 * code against it. No real vault file, key or personal content is involved.
 *
 * The point is Lera's access path: unlocking with either password, staying
 * unlocked across reloads, and failing closed on a wrong or damaged session.
 * A future move of the encryption into the browser (multi-user authoring) must
 * not silently change any of it.
 */

const SESSION_KEY = 'retire-day:session'
// The manifest carries its own iteration count, so a low one here keeps the
// suite fast and also proves the code honours the manifest rather than a constant.
const ITER = 1000
const LIVE_PASSWORD = 'correct horse battery staple'
const TEST_PASSWORD = 'a different passphrase entirely'

// Latin fixtures on purpose: the sensitive audit rejects a test string that
// collides with real day copy, and plausible Russian titles do collide.
const DAYS = [
  { day: 1, title: 'Fixture one', body: 'synthetic body' },
  { day: 2, title: 'Fixture two', body: 'another synthetic body' },
]

// btoa rather than Buffer: this file is type-checked against the browser lib the
// app itself uses, where Node globals do not exist.
function b64(bytes: Uint8Array): string {
  let s = ''
  for (const byte of bytes) s += String.fromCharCode(byte)
  return btoa(s)
}

function rand(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n))
}

async function deriveKek(password: string, salt: BufferSource, usage: KeyUsage[]) {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  )
}

interface SyntheticVault {
  manifest: unknown
  content: Uint8Array
}

async function buildVault(): Promise<SyntheticVault> {
  const cekRaw = rand(32)
  const cek = await crypto.subtle.importKey(
    'raw',
    cekRaw as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const wraps = []
  for (const [role, password] of [
    ['live', LIVE_PASSWORD],
    ['test', TEST_PASSWORD],
  ] as const) {
    const salt = rand(16)
    const iv = rand(12)
    const kek = await deriveKek(password, salt as BufferSource, ['encrypt'])
    const ct = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        kek,
        cekRaw as BufferSource,
      ),
    )
    wraps.push({ role, salt: b64(salt), iv: b64(iv), ct: b64(ct) })
  }

  const contentIv = rand(12)
  const content = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: contentIv as BufferSource },
      cek,
      new TextEncoder().encode(JSON.stringify(DAYS)) as BufferSource,
    ),
  )

  return {
    manifest: {
      v: 1,
      iter: ITER,
      keyId: 'testkeyid0000000',
      wraps,
      content: { iv: b64(contentIv) },
      media: {},
    },
    content,
  }
}

let vault: SyntheticVault

/** Fresh module state per test: the vault module keeps the session in module scope. */
async function importVault() {
  vi.resetModules()
  return import('./vault')
}

async function serveVault(input: string) {
  const url = String(input)
  if (url.endsWith('manifest.json')) {
    return new Response(JSON.stringify(vault.manifest), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (url.endsWith('content.bin')) {
    return new Response(vault.content as unknown as BodyInit)
  }
  throw new Error(`unexpected fetch: ${url}`)
}

beforeEach(async () => {
  localStorage.removeItem(SESSION_KEY)
  vault = await buildVault()
  vi.stubGlobal('fetch', serveVault)
})

describe('unlock', () => {
  it('accepts the live password and reports that role', async () => {
    const { unlock } = await importVault()
    await expect(unlock(LIVE_PASSWORD)).resolves.toBe('live')
  })

  it('accepts the second password and distinguishes it as the test role', async () => {
    const { unlock } = await importVault()
    await expect(unlock(TEST_PASSWORD)).resolves.toBe('test')
  })

  it('rejects a wrong password without unlocking anything', async () => {
    const { unlock, dayByNumber } = await importVault()
    await expect(unlock('not the password')).resolves.toBeNull()
    expect(dayByNumber(1)).toBeUndefined()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('decrypts the day content on success', async () => {
    const { unlock, dayByNumber } = await importVault()
    await unlock(LIVE_PASSWORD)
    expect(dayByNumber(2)).toMatchObject({ day: 2, title: 'Fixture two' })
  })

  it('persists the session so the password is asked for once', async () => {
    const { unlock } = await importVault()
    await unlock(LIVE_PASSWORD)
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    expect(saved).toMatchObject({ role: 'live' })
    expect(typeof saved.cek).toBe('string')
  })
})

describe('resume', () => {
  it('restores an unlocked session without the password', async () => {
    const first = await importVault()
    await first.unlock(LIVE_PASSWORD)

    // A fresh module is the same as a fresh page load: only localStorage carries over.
    const { resume, dayByNumber } = await importVault()
    await resume()
    expect(dayByNumber(1)).toMatchObject({ day: 1 })
  })

  it('stays locked when there is no session', async () => {
    const { resume, dayByNumber } = await importVault()
    await resume()
    expect(dayByNumber(1)).toBeUndefined()
  })

  it('keeps the session when the vault files are unreachable', async () => {
    // A network blip must not cost her the stored key: the next load should
    // resume without the password. Only a key that cannot open the vault is a
    // reason to forget it.
    const first = await importVault()
    await first.unlock(LIVE_PASSWORD)
    const savedBefore = localStorage.getItem(SESSION_KEY)

    vi.stubGlobal('fetch', async () => {
      throw new TypeError('network down')
    })
    const offline = await importVault()
    await offline.resume()
    expect(offline.dayByNumber(1)).toBeUndefined()
    expect(localStorage.getItem(SESSION_KEY)).toBe(savedBefore)
  })

  it('resumes normally once the files are reachable again', async () => {
    const first = await importVault()
    await first.unlock(LIVE_PASSWORD)

    vi.stubGlobal('fetch', async () => {
      throw new TypeError('network down')
    })
    await (await importVault()).resume()

    // Restore the working transport and try again, as a later launch would.
    vi.stubGlobal('fetch', serveVault)
    const back = await importVault()
    await back.resume()
    expect(back.dayByNumber(1)).toMatchObject({ day: 1 })
  })

  it('fails closed and clears a damaged session rather than half-opening', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ cek: 'bm90LWEta2V5', role: 'live' }))
    const { resume, dayByNumber } = await importVault()
    await resume()
    expect(dayByNumber(1)).toBeUndefined()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})

describe('a broken environment is not a wrong password', () => {
  /** Runs `fn` with crypto.subtle missing, as it is over plain http on a LAN. */
  async function withoutSubtle<T>(fn: () => Promise<T>): Promise<T> {
    const real = globalThis.crypto
    // Keep getRandomValues so anything else in the run still works; only the
    // part a secure context gates is taken away.
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) })
    try {
      return await fn()
    } finally {
      vi.stubGlobal('crypto', real)
    }
  }

  it('reports a missing crypto.subtle instead of rejecting the word', async () => {
    // The wrap loop used to swallow this and return null, which the gate showed
    // as "wrong password" — the exact confusion that cost an evening of testing.
    const { unlock } = await importVault()
    await withoutSubtle(async () => {
      await expect(unlock(LIVE_PASSWORD)).rejects.toThrow(/crypto\.subtle/)
    })
  })

  it('reports damaged manifest data instead of rejecting the word', async () => {
    // A truncated download or a bad deploy can leave a wrap unreadable. The loop
    // that tries each password used to swallow that too and return null, so
    // corrupt data and a mistyped word were indistinguishable on screen.
    const manifest = vault.manifest as { wraps: { salt: string }[] }
    manifest.wraps[0].salt = 'not-valid-base64!!'

    const { unlock } = await importVault()
    await expect(unlock(LIVE_PASSWORD)).rejects.toThrow()
  })

  it('keeps the session when the browser cannot do the work', async () => {
    const first = await importVault()
    await first.unlock(LIVE_PASSWORD)
    const savedBefore = localStorage.getItem(SESSION_KEY)

    const { resume, dayByNumber } = await importVault()
    await withoutSubtle(async () => {
      await resume()
    })
    expect(dayByNumber(1)).toBeUndefined()
    // The stored key is fine; the page was simply opened where it cannot be used.
    expect(localStorage.getItem(SESSION_KEY)).toBe(savedBefore)
  })
})

describe('logout', () => {
  it('drops the content and the stored session', async () => {
    const { unlock, logout, dayByNumber } = await importVault()
    await unlock(LIVE_PASSWORD)
    expect(dayByNumber(1)).toBeDefined()

    logout()
    expect(dayByNumber(1)).toBeUndefined()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
