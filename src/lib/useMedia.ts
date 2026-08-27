import { useEffect, useState } from 'react'
import { mediaUrl } from './vault'

/** Resolve a media path (encrypted or public) to a usable URL. */
export function useMedia(path: string | undefined | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    let attempts = 0
    let retryTimer: number | undefined
    // Reset before resolving: without it the previous day's photo stays on
    // screen until the new one decrypts, showing the wrong memory for a frame.
    // The reset belongs with the timers and listeners set up below, so it stays
    // in the effect rather than moving to a render-phase adjustment.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(null)
    if (!path) return

    function resolve() {
      mediaUrl(path!)
        .then((u) => {
          if (alive) setUrl(u)
        })
        .catch(() => {
          if (!alive || attempts >= 2) return
          attempts += 1
          retryTimer = window.setTimeout(resolve, attempts * 600)
        })
    }

    function handleOnline() {
      attempts = 0
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      resolve()
    }

    resolve()
    window.addEventListener('online', handleOnline)
    return () => {
      alive = false
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      window.removeEventListener('online', handleOnline)
    }
  }, [path])
  return url
}
