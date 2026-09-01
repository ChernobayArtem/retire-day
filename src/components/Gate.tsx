import { useState } from 'react'
import { keepRussianShortWords } from '../lib/typography'
import gateLogo from '../assets/gate-logo.png'
import { isVaultUnavailable, unlock, type Role } from '../lib/vault'
import { trackGoal } from '../lib/analytics'
import { Button, TextField } from '../ui'

/** A wrong word is the person's mistake; the other two are not. Saying the same
 *  thing for all of them sends someone hunting for a typo that is not there —
 *  and advising "check your internet" for a fault that has nothing to do with
 *  the network sends them somewhere just as useless. */
type Failure = null | 'password' | 'unavailable' | 'unknown'

const FAILURE_TEXT: Record<Exclude<Failure, null>, string> = {
  password: 'Не-а, попробуй ещё 😼',
  unavailable: 'Не получилось загрузить. Проверь интернет и попробуй ещё раз',
  unknown: 'Не получилось войти. Попробуй ещё раз',
}

export default function Gate() {
  const [value, setValue] = useState('')
  const [failure, setFailure] = useState<Failure>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || busy) return
    // Drop the previous answer before asking again, so a stale line is never read
    // as the verdict on this attempt.
    setFailure(null)
    setBusy(true)
    let role: Role | null = null
    let thrown: Failure = null
    try {
      role = await unlock(value.trim())
    } catch (error) {
      // Anything thrown lands here rather than escaping: without the finally below
      // `busy` never clears and the button spins for good.
      if (isVaultUnavailable(error)) {
        thrown = 'unavailable'
      } else {
        thrown = 'unknown'
        console.error('Не удалось открыть сейф', error)
      }
    } finally {
      setBusy(false)
    }
    if (role === 'live') {
      trackGoal('login_success')
    } else if (thrown) {
      // Keep what was typed: the word may well have been right.
      setFailure(thrown)
    } else if (!role) {
      setFailure('password')
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
          {/* eslint-disable jsx-a11y/no-autofocus -- single-field gate screen: focusing the only input on mount is the intended behaviour, not a disorienting focus jump */}
          <TextField
            className={failure === 'password' ? 'gate__field gate__field--error' : 'gate__field'}
            inputClassName="gate__input ym-disable-keys ym-disable-clickmap"
            aria-label="Секретное слово"
            aria-invalid={failure === 'password' ? true : undefined}
            aria-describedby={failure === 'password' ? 'gate-error' : undefined}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setFailure(null)
            }}
            placeholder="секретное слово"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            fullWidth
          />
          {/* eslint-enable jsx-a11y/no-autofocus */}
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
        {/* Always mounted: a live region added together with its text is
            unreliably announced. `:empty` keeps it from taking space. */}
        <p className="gate__err" id="gate-error" role="status">
          {failure ? FAILURE_TEXT[failure] : ''}
        </p>
      </div>
    </div>
  )
}
