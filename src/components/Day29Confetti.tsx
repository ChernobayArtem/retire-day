import type { CSSProperties } from 'react'

const COLORS = ['var(--color-alias-illustration-rose-774)', 'var(--color-alias-illustration-orange-263)', 'var(--color-alias-illustration-blue-653)', 'var(--color-alias-illustration-green-615)', 'var(--color-alias-illustration-indigo-375)', 'var(--color-alias-illustration-orange-719)', 'var(--color-alias-illustration-teal-500)']

const PIECES = Array.from({ length: 64 }, (_, index) => {
  const fromLeft = index % 2 === 0
  const travel = 54 + ((index * 47) % 290)
  const direction = fromLeft ? 1 : -1
  const rotation = direction * (420 + ((index * 83) % 620))

  return {
    color: COLORS[index % COLORS.length],
    delay: (index % 10) * 0.025,
    duration: 2.25 + (index % 8) * 0.11,
    endX: direction * (travel + 28 + (index % 4) * 12),
    fromLeft,
    height: index % 5 === 0 ? 8 : 13 + (index % 3) * 2,
    midRotation: rotation * 0.54,
    peak: -(190 + ((index * 61) % 470)),
    rotation,
    travel: direction * travel,
    width: index % 5 === 0 ? 8 : 5 + (index % 3),
  }
})

export default function Day29Confetti() {
  return (
    <div className="day29-confetti" aria-hidden="true">
      <span className="day29-confetti__flash" />
      {PIECES.map((piece, index) => {
        const style = {
          '--confetti-color': piece.color,
          '--confetti-delay': `${piece.delay}s`,
          '--confetti-duration': `${piece.duration}s`,
          '--confetti-end-x': `${piece.endX}px`,
          '--confetti-height': `${piece.height}px`,
          '--confetti-mid-rotation': `${piece.midRotation}deg`,
          '--confetti-peak': `${piece.peak}px`,
          '--confetti-rotation': `${piece.rotation}deg`,
          '--confetti-start-x': piece.fromLeft ? '7%' : '93%',
          '--confetti-travel': `${piece.travel}px`,
          '--confetti-width': `${piece.width}px`,
        } as CSSProperties

        return (
          <span
            className={
              'day29-confetti__piece' +
              (index % 5 === 0 ? ' day29-confetti__piece--round' : '')
            }
            key={index}
            style={style}
          />
        )
      })}
    </div>
  )
}
