import { useState } from 'react'
import { keepRussianShortWords } from '../lib/typography'
import gateLogo from '../assets/gate-logo.png'
import { unlock } from '../lib/vault'
import { trackGoal } from '../lib/analytics'

export default function Gate() {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || busy) return
    setBusy(true)
    const role = await unlock(value.trim())
    setBusy(false)
    if (role === 'live') {
      trackGoal('login_success')
    } else if (!role) {
      setError(true)
      setValue('')
    }
    // on success the vault flips to "ready" and App swaps in <Home/>
  }

  return (
    <div className="gate">
      <div className="gate__brand" aria-hidden="true">
        <img className="gate__brand-image" src={gateLogo} alt="" />
      </div>
      <div className="gate__card">
        <h1 className="gate__title">{keepRussianShortWords('Только для киселечка')}</h1>
        <p className="gate__sub">Введи секретное слово 🤫</p>
        <form className="gate__form" onSubmit={submit}>
          <input
            className={'gate__input ym-disable-keys ym-disable-clickmap' + (error ? ' gate__input--error' : '')}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            placeholder="секретное слово"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
          />
          <button className="gate__btn" disabled={busy || !value.trim()}>
            {busy ? 'Открываю…' : 'Войти'}
          </button>
        </form>
        {error && <p className="gate__err">Не-а, попробуй ещё 😼</p>}
      </div>
    </div>
  )
}
