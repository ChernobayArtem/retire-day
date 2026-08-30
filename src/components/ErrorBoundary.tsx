import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '../ui'
import { keepRussianShortWords } from '../lib/typography'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * Without a boundary any thrown render unmounts the whole tree and leaves a
 * blank page — no message, no way back, and nothing on screen to suggest a
 * reload. The day scenes are the likeliest source: there are dozens of them and
 * each is hand-built, so one bad reference takes the entire app down with it.
 *
 * This is deliberately the plainest possible screen. It renders after something
 * already went wrong, so it must not depend on the vault, decrypted content, or
 * anything else that might be the thing that broke.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Left in the console on purpose: this is the only trace of what happened,
    // and the alternative is a blank page with no explanation at all.
    console.error('Приложение упало при отрисовке', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="app-error" role="alert">
        <h1 className="app-error__title">{keepRussianShortWords('Что-то сломалось')}</h1>
        <p className="app-error__text">
          {keepRussianShortWords('Мы уже знаем. Попробуй обновить — обычно этого хватает.')}
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Обновить
        </Button>
      </div>
    )
  }
}
