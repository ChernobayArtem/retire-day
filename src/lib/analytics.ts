const COUNTER_ID = 111198016
const PRODUCTION_HOST = 'chernobayartem.github.io'

export type AnalyticsGoal =
  | 'app_open'
  | 'login_success'
  | 'archive_open'
  | 'archive_category_select'
  | 'day_open'
  | 'video_play'
  | 'photo_open'
  | 'coupon_copy'
  | 'certificate_copy'

export type AnalyticsParams = Record<string, string | number | boolean>

type YmFunction = {
  (...args: unknown[]): void
  a?: unknown[][]
  l?: number
}

declare global {
  interface Window {
    ym?: YmFunction
    __retireDayMetrika?: boolean
  }
}

let enabled = false
let lastVirtualUrl: string | null = null
let appOpenTracked = false

function isProductionSite(): boolean {
  return (
    import.meta.env.PROD &&
    window.location.hostname === PRODUCTION_HOST &&
    window.location.pathname.startsWith(import.meta.env.BASE_URL)
  )
}

function ensureQueue(): YmFunction {
  if (window.ym) return window.ym

  const queued = ((...args: unknown[]) => {
    const calls = queued.a ?? []
    calls.push(args)
    queued.a = calls
  }) as YmFunction
  queued.l = Date.now()
  window.ym = queued
  return queued
}

function displayMode(): 'standalone' | 'browser' {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone
    ? 'standalone'
    : 'browser'
}

/**
 * Load Yandex Metrica once, before React mounts. `defer: true` lets the app
 * report its state-driven screens as virtual SPA page views instead of
 * counting the same physical URL for every screen.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || !isProductionSite() || window.__retireDayMetrika) return

  window.__retireDayMetrika = true
  enabled = true

  const ym = ensureQueue()
  const scriptSrc = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`
  if (!document.querySelector(`script[data-metrika-counter="${COUNTER_ID}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = scriptSrc
    script.dataset.metrikaCounter = String(COUNTER_ID)
    document.head.appendChild(script)
  }

  ym(COUNTER_ID, 'init', {
    defer: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
    sendTitle: false,
    ecommerce: false,
    trackHash: false,
  })

}

/** Count one real-account launch per physical app load, after its first screen hit. */
export function trackAppOpen(): void {
  if (appOpenTracked) return
  appOpenTracked = true
  trackGoal('app_open', { display_mode: displayMode() })
}

/** Report a safe virtual SPA screen. No surprise titles or personal text. */
export function trackView(slug: string, title: string): void {
  if (!enabled || !window.ym) return

  const cleanSlug = slug.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href
  const url = `${baseUrl}#${cleanSlug}`
  if (url === lastVirtualUrl) return

  const referer = lastVirtualUrl ?? document.referrer
  window.ym(COUNTER_ID, 'hit', url, { title, referer })
  lastVirtualUrl = url
}

/** Send only deliberately small, non-personal parameters. */
export function trackGoal(goal: AnalyticsGoal, params: AnalyticsParams = {}): void {
  if (!enabled || !window.ym) return
  window.ym(COUNTER_ID, 'reachGoal', goal, params)
}
