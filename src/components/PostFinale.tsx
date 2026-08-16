import { forwardRef } from 'react'
import type { NewChapterPeriod } from '../lib/dates'
import { keepRussianShortWords } from '../lib/typography'
import { Button, Icons, Surface } from '../ui'

interface Props {
  period: NewChapterPeriod
  onRandom: () => void
  onArchive: () => void
}

const PostFinale = forwardRef<HTMLButtonElement, Props>(function PostFinale(
  { period, onRandom, onArchive },
  archiveButtonRef,
) {
  return (
    <section className="post-finale" aria-labelledby="post-finale-title">
      <div className="post-finale__content">
        <div className="post-finale__hero">
          <h1 className="post-finale__title" id="post-finale-title">
            Ты официально
            <br />
            в декрете <span aria-hidden="true">❤️</span>
          </h1>
          <p className="post-finale__period">{period.label}</p>
          <p className="post-finale__since">с 30 августа 2026</p>
        </div>

        <Surface
          as="section"
          className="post-finale__memories"
          variant="subtle"
          aria-labelledby="post-finale-memories-title"
        >
          <h2 id="post-finale-memories-title">29 сюрпризов — всегда рядом</h2>
          <p>{keepRussianShortWords('Можно открыть любой ещё раз или доверить выбор случаю.')}</p>
          <div className="post-finale__actions">
            <Button
              className="post-finale__action"
              variant="outline"
              leadingIcon={<Icons.Sparkle />}
              fullWidth
              onClick={onRandom}
            >
              Случайный сюрприз
            </Button>
            <Button
              ref={archiveButtonRef}
              className="post-finale__action"
              variant="outline"
              leadingIcon={<Icons.Grid />}
              fullWidth
              onClick={onArchive}
            >
              Все воспоминания
            </Button>
          </div>
        </Surface>
      </div>

      <DawnScene />
    </section>
  )
})

export default PostFinale

function DawnScene() {
  return (
    <div className="finale-scene" aria-hidden="true">
      <svg viewBox="0 0 430 280" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="finale-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-alias-illustration-neutral-0)" />
            <stop offset="0.55" stopColor="var(--color-alias-illustration-orange-35)" />
            <stop offset="1" stopColor="var(--color-alias-illustration-orange-193)" />
          </linearGradient>
          <radialGradient id="finale-halo">
            <stop offset="0" stopColor="var(--color-alias-illustration-yellow-818)" stopOpacity="0.88" />
            <stop offset="0.58" stopColor="var(--color-alias-illustration-orange-211)" stopOpacity="0.34" />
            <stop offset="1" stopColor="var(--color-alias-illustration-orange-211)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="finale-sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-alias-illustration-yellow-455)" />
            <stop offset="1" stopColor="var(--color-alias-illustration-orange-561)" />
          </linearGradient>
          <linearGradient id="finale-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-alias-illustration-green-359)" />
            <stop offset="1" stopColor="var(--color-alias-illustration-green-667)" />
          </linearGradient>
        </defs>

        <rect width="430" height="280" fill="url(#finale-sky)" />

        <g transform="translate(33 112)">
          <g className="finale-scene__cloud finale-scene__cloud--left">
            <ellipse cx="31" cy="12" rx="31" ry="11" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.76" />
            <circle cx="20" cy="7" r="12" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.76" />
            <circle cx="38" cy="4" r="16" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.76" />
          </g>
        </g>
        <g transform="translate(337 91)">
          <g className="finale-scene__cloud finale-scene__cloud--right">
            <ellipse cx="31" cy="12" rx="31" ry="11" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.7" />
            <circle cx="21" cy="8" r="12" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.7" />
            <circle cx="39" cy="5" r="15" fill="var(--color-alias-illustration-neutral-0)" fillOpacity="0.7" />
          </g>
        </g>

        <g transform="translate(215 151)">
          <g className="finale-scene__sun-rise">
            <circle r="88" fill="url(#finale-halo)" />
            <g className="finale-scene__rays" stroke="var(--color-alias-illustration-orange-386)" strokeWidth="5" strokeLinecap="round">
              {Array.from({ length: 12 }, (_, index) => (
                <line
                  key={index}
                  x1="0"
                  y1="-56"
                  x2="0"
                  y2="-72"
                  transform={`rotate(${index * 30})`}
                />
              ))}
            </g>
            <circle className="finale-scene__sun" r="42" fill="url(#finale-sun)" />
            <path
              className="finale-scene__heart"
              fill="var(--color-alias-illustration-finale-heart)"
              d="M0 13C-18 2-21-10-12-16-5-21 0-15 0-10c0-5 5-11 12-6 9 6 6 18-12 29Z"
            />
          </g>
        </g>

        <path
          d="M0 215Q78 172 174 211Q277 160 430 208V280H0Z"
          fill="var(--color-alias-illustration-green-256)"
        />
        <path
          d="M0 243Q106 190 218 235Q323 186 430 224V280H0Z"
          fill="url(#finale-hill-near)"
        />

        <g transform="translate(67 265)">
          <g className="finale-scene__plant finale-scene__plant--left">
            <path d="M0 0C-4-29-14-52-31-69" fill="none" stroke="var(--color-alias-illustration-green-1000)" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="-26" cy="-62" rx="16" ry="9" fill="var(--color-alias-illustration-green-949)" transform="rotate(33 -26 -62)" />
            <ellipse cx="-7" cy="-29" rx="15" ry="8" fill="var(--color-alias-illustration-green-974)" transform="rotate(-37 -7 -29)" />
          </g>
        </g>
        <g transform="translate(372 272)">
          <g className="finale-scene__plant finale-scene__plant--right">
            <path d="M0 0C2-31 13-52 31-72" fill="none" stroke="var(--color-alias-illustration-green-1000)" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="27" cy="-65" rx="17" ry="9" fill="var(--color-alias-illustration-green-949)" transform="rotate(-30 27 -65)" />
            <ellipse cx="8" cy="-34" rx="15" ry="8" fill="var(--color-alias-illustration-green-974)" transform="rotate(35 8 -34)" />
          </g>
        </g>
      </svg>
    </div>
  )
}
