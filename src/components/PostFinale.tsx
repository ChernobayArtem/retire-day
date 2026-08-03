import { forwardRef } from 'react'
import ProgressBar from './ProgressBar'

interface Props {
  chapterDay: number
  onRandom: () => void
  onArchive: () => void
}

const PostFinale = forwardRef<HTMLButtonElement, Props>(function PostFinale(
  { chapterDay, onRandom, onArchive },
  archiveButtonRef,
) {
  return (
    <section className="post-finale" aria-labelledby="post-finale-title">
      <ProgressBar passed={29} />

      <div className="post-finale__content">
        <h1 className="post-finale__title" id="post-finale-title">
          Ты официально
          <br />
          в декрете <span aria-hidden="true">❤️</span>
        </h1>

        <div className="post-finale__counter" aria-label={`${chapterDay}-й день новой главы`}>
          <strong>{chapterDay}-й день</strong>
          <span>новой главы</span>
          <small>с 30 августа</small>
        </div>

        <p className="post-finale__text">
          Отсчёт закончился,
          <br />
          но все сюрпризы остались здесь.
        </p>

        <div className="post-finale__actions">
          <button className="post-finale__action" onClick={onRandom}>
            <span className="post-finale__action-icon" aria-hidden="true">✦</span>
            Случайный сюрприз
          </button>
          <button
            ref={archiveButtonRef}
            className="post-finale__action"
            onClick={onArchive}
          >
            <span className="post-finale__action-icon post-finale__action-icon--grid" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Все воспоминания
          </button>
        </div>
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
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#fff3e8" />
            <stop offset="1" stopColor="#ffd7bb" />
          </linearGradient>
          <radialGradient id="finale-halo">
            <stop offset="0" stopColor="#fff0a1" stopOpacity="0.88" />
            <stop offset="0.58" stopColor="#ffd58e" stopOpacity="0.34" />
            <stop offset="1" stopColor="#ffd58e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="finale-sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff58a" />
            <stop offset="1" stopColor="#ffad66" />
          </linearGradient>
          <linearGradient id="finale-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9be48b" />
            <stop offset="1" stopColor="#73ca72" />
          </linearGradient>
        </defs>

        <rect width="430" height="280" fill="url(#finale-sky)" />

        <g className="finale-scene__sparkles">
          <path d="M54 73v12M48 79h12" />
          <path d="M359 54v10M354 59h10" />
          <circle cx="92" cy="47" r="2.5" />
          <circle cx="337" cy="96" r="2" />
        </g>

        <g transform="translate(33 112)">
          <g className="finale-scene__cloud finale-scene__cloud--left">
            <ellipse cx="31" cy="12" rx="31" ry="11" fill="#fff" fillOpacity="0.76" />
            <circle cx="20" cy="7" r="12" fill="#fff" fillOpacity="0.76" />
            <circle cx="38" cy="4" r="16" fill="#fff" fillOpacity="0.76" />
          </g>
        </g>
        <g transform="translate(337 91)">
          <g className="finale-scene__cloud finale-scene__cloud--right">
            <ellipse cx="31" cy="12" rx="31" ry="11" fill="#fff" fillOpacity="0.7" />
            <circle cx="21" cy="8" r="12" fill="#fff" fillOpacity="0.7" />
            <circle cx="39" cy="5" r="15" fill="#fff" fillOpacity="0.7" />
          </g>
        </g>

        <g transform="translate(215 151)">
          <g className="finale-scene__sun-rise">
            <circle r="88" fill="url(#finale-halo)" />
            <g className="finale-scene__rays" stroke="#ffc76c" strokeWidth="5" strokeLinecap="round">
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
              d="M0 13C-18 2-21-10-12-16-5-21 0-15 0-10c0-5 5-11 12-6 9 6 6 18-12 29Z"
            />
          </g>
        </g>

        <path
          d="M0 215Q78 172 174 211Q277 160 430 208V280H0Z"
          fill="#b9eea5"
        />
        <path
          d="M0 243Q106 190 218 235Q323 186 430 224V280H0Z"
          fill="url(#finale-hill-near)"
        />

        <g transform="translate(67 265)">
          <g className="finale-scene__plant finale-scene__plant--left">
            <path d="M0 0C-4-29-14-52-31-69" fill="none" stroke="#427f43" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="-26" cy="-62" rx="16" ry="9" fill="#4e9650" transform="rotate(33 -26 -62)" />
            <ellipse cx="-7" cy="-29" rx="15" ry="8" fill="#3f8444" transform="rotate(-37 -7 -29)" />
          </g>
        </g>
        <g transform="translate(372 272)">
          <g className="finale-scene__plant finale-scene__plant--right">
            <path d="M0 0C2-31 13-52 31-72" fill="none" stroke="#427f43" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="27" cy="-65" rx="17" ry="9" fill="#4e9650" transform="rotate(-30 27 -65)" />
            <ellipse cx="8" cy="-34" rx="15" ry="8" fill="#3f8444" transform="rotate(35 8 -34)" />
          </g>
        </g>
      </svg>
    </div>
  )
}
