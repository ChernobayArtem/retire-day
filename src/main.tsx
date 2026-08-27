import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { initAnalytics } from './lib/analytics'
import './styles/fonts.css'
import './ui/tokens/index.css'
import './styles/global.css'
import './styles/app.css'
import './ui/ui.css'

type LegacyOrientationWindow = Window & { orientation?: number }
type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: 'portrait') => Promise<void>
}

function lockViewportZoom() {
  const guardedWindow = window as Window & { __redayPinchLock?: boolean }
  if (guardedWindow.__redayPinchLock) return
  guardedWindow.__redayPinchLock = true

  const preventGesture = (event: Event) => event.preventDefault()
  document.addEventListener('gesturestart', preventGesture, { passive: false, capture: true })
  document.addEventListener('gesturechange', preventGesture, { passive: false, capture: true })
}

function isTouchDeviceInLandscape(): boolean {
  const touchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
  if (!touchDevice) return false

  const orientationType = window.screen.orientation?.type
  if (orientationType) return orientationType.startsWith('landscape')

  // iOS exposes the physical device angle even while the keyboard changes the
  // visual viewport. Prefer it over a width/height check so opening the password
  // keyboard in portrait cannot accidentally trigger the landscape guard.
  const legacyAngle = (window as LegacyOrientationWindow).orientation
  if (typeof legacyAngle === 'number') return Math.abs(legacyAngle) === 90

  return window.matchMedia('(orientation: landscape)').matches
}

function requestPortraitOrientation() {
  const orientation = window.screen.orientation as LockableScreenOrientation | undefined
  if (!orientation?.lock) return

  // Android standalone PWAs can honour this. Safari currently rejects the
  // request, so the visual guard below is the reliable iOS fallback.
  void orientation.lock('portrait').catch(() => {})
}

/* eslint-disable-next-line react-refresh/only-export-components --
   This is the entry module: it bootstraps the app and registers the service
   worker, so it will always hold non-component code alongside this guard. */
function OrientationGuard() {
  const [landscape, setLandscape] = React.useState(isTouchDeviceInLandscape)

  React.useEffect(() => {
    const syncOrientation = () => {
      setLandscape(isTouchDeviceInLandscape())
      requestPortraitOrientation()
    }

    syncOrientation()
    window.addEventListener('orientationchange', syncOrientation)
    window.addEventListener('pageshow', syncOrientation)
    window.addEventListener('resize', syncOrientation)
    window.screen.orientation?.addEventListener('change', syncOrientation)
    // Some browsers only allow orientation locking after a user gesture.
    window.addEventListener('pointerup', requestPortraitOrientation, { once: true, passive: true })

    return () => {
      window.removeEventListener('orientationchange', syncOrientation)
      window.removeEventListener('pageshow', syncOrientation)
      window.removeEventListener('resize', syncOrientation)
      window.screen.orientation?.removeEventListener('change', syncOrientation)
      window.removeEventListener('pointerup', requestPortraitOrientation)
    }
  }, [])

  if (!landscape) return null

  return (
    <aside className="orientation-guard" role="alert" aria-live="assertive">
      <div className="orientation-guard__phone" aria-hidden="true">
        <span />
      </div>
      <strong>Поверни телефон вертикально</strong>
      <p>Так всё останется на своих местах 🌸</p>
    </aside>
  )
}

// iOS can ignore viewport zoom limits for native pinch gestures in a PWA.
lockViewportZoom()

// Initializes once at module level, so React StrictMode cannot duplicate it.
initAnalytics()

// Content ships throughout August while the app is already installed, so a new
// build must apply itself. Check for updates on load and every 30 min.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    setInterval(() => void registration.update(), 30 * 60 * 1000)
  },
})

// Reload when a NEW worker takes control (a real update) — but not on the
// initial claim of the very first visit, which would cause a needless flash.
let reloading = false
const hadController = !!navigator.serviceWorker?.controller
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!hadController || reloading) return
  reloading = true
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <OrientationGuard />
  </React.StrictMode>,
)
