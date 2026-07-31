import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { initAnalytics } from './lib/analytics'
import './styles/global.css'
import './styles/app.css'

function lockViewportZoom() {
  const guardedWindow = window as Window & { __retireDayPinchLock?: boolean }
  if (guardedWindow.__retireDayPinchLock) return
  guardedWindow.__retireDayPinchLock = true

  const preventGesture = (event: Event) => event.preventDefault()
  document.addEventListener('gesturestart', preventGesture, { passive: false, capture: true })
  document.addEventListener('gesturechange', preventGesture, { passive: false, capture: true })
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
  </React.StrictMode>,
)
