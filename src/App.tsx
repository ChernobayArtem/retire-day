import { useEffect } from 'react'
import { useVault, resume } from './lib/vault'
import { identifyAudience, trackAppOpen, trackView } from './lib/analytics'
import { getNow, isAfterTarget } from './lib/dates'
import { recordJourneyAppOpen } from './lib/journey'
import Gate from './components/Gate'
import Home from './components/Home'
import Splash from './components/Splash'

let resumeStarted = false

export default function App() {
  const { status, role } = useVault()

  useEffect(() => {
    if (!resumeStarted) {
      resumeStarted = true
      resume()
    }
  }, [])

  useEffect(() => {
    if (status === 'locked') trackView('login', 'Вход')
    if (status === 'ready' && role) {
      identifyAudience(role === 'live' ? 'primary' : 'tester')
    }
    if (status === 'ready' && role === 'live') {
      const now = getNow(null)
      const postFinale = isAfterTarget(now)
      trackView(postFinale ? 'new-chapter' : 'calendar', postFinale ? 'Новая глава' : 'Календарь')
      trackAppOpen()
    }
  }, [role, status])

  useEffect(() => {
    if (status !== 'ready' || role !== 'live') return

    function recordVisibleLaunch() {
      if (document.visibilityState === 'visible') recordJourneyAppOpen(getNow(null))
    }

    recordVisibleLaunch()
    window.addEventListener('pageshow', recordVisibleLaunch)
    document.addEventListener('visibilitychange', recordVisibleLaunch)
    return () => {
      window.removeEventListener('pageshow', recordVisibleLaunch)
      document.removeEventListener('visibilitychange', recordVisibleLaunch)
    }
  }, [role, status])

  if (status === 'loading') return <Splash />
  if (status === 'locked') return <Gate />

  const testMode = role === 'test'
  const dateOverride = testMode ? new URLSearchParams(window.location.search).get('date') : null
  return <Home testMode={testMode} dateOverride={dateOverride} />
}
