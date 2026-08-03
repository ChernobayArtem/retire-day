import { useState } from 'react'
import { keepRussianShortWords } from '../lib/typography'
import gateLogo from '../assets/gate-logo.png'
import { unlock } from '../lib/vault'
import { trackGoal } from '../lib/analytics'
import { Button, TextField } from '../ui'

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
          <TextField
            className={error ? 'gate__field gate__field--error' : 'gate__field'}
            inputClassName="gate__input ym-disable-keys ym-disable-clickmap"
            aria-label="Секретное слово"
            aria-invalid={error || undefined}
            aria-describedby={error ? 'gate-error' : undefined}
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
            fullWidth
          />
          <Button
            className="gate__submit"
            type="submit"
            variant="primary"
            fullWidth
            loading={busy}
            disabled={!value.trim()}
          >
            Войти
          </Button>
        </form>
        {error && <p className="gate__err" id="gate-error">Не-а, попробуй ещё 😼</p>}
      </div>
    </div>
  )
}
