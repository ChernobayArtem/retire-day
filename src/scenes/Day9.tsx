// День 9 — мыльные пузыри
function Bubble({
  cx,
  r,
  color,
  dur,
  delay,
  pop,
}: {
  cx: number
  r: number
  color: string
  dur: string
  delay: string
  pop?: boolean
}) {
  return (
    <g
      className={'bub' + (pop ? ' pop' : '')}
      style={{ animationDuration: dur, animationDelay: delay }}
    >
      <circle cx={cx} cy="240" r={r} fill={color} fillOpacity="0.26" />
      <circle
        cx={cx}
        cy="240"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />
      <circle
        cx={cx - r * 0.34}
        cy={240 - r * 0.34}
        r={r * 0.22}
        fill="var(--color-alias-illustration-neutral-0)"
        fillOpacity="0.75"
      />
    </g>
  )
}

export default function Day9() {
  return (
    <svg
      className="scn s9"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s9 .bub{transform-box:fill-box;transform-origin:center;animation-name:s9rise;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
        .s9 .bub.pop{animation-name:s9pop}
        .s9 .ring{transform-box:fill-box;transform-origin:center;animation:s9ring 9s ease-out infinite}
        .s9 .r2{animation-delay:-4.5s}
        @keyframes s9rise{0%{transform:translate(0,0);opacity:0}12%{opacity:.9}50%{transform:translate(12px,-95px)}88%{opacity:.9}100%{transform:translate(-8px,-195px);opacity:0}}
        @keyframes s9pop{0%{transform:translate(0,0) scale(1);opacity:0}12%{opacity:.9}70%{transform:translate(8px,-120px) scale(1);opacity:.9}80%{transform:translate(8px,-128px) scale(1.25);opacity:0}100%{opacity:0}}
        @keyframes s9ring{0%,64%,100%{transform:scale(.35);opacity:0}70%{opacity:.55}82%{transform:scale(1.5);opacity:0}}
      `}</style>
      <Bubble
        cx={90}
        r={20}
        color="var(--color-alias-illustration-indigo-250)"
        dur="10s"
        delay="0s"
      />
      <Bubble
        cx={170}
        r={13}
        color="var(--color-alias-illustration-rose-419)"
        dur="8.5s"
        delay="-3s"
        pop
      />
      <Bubble
        cx={240}
        r={24}
        color="var(--color-alias-illustration-blue-569)"
        dur="11s"
        delay="-5.5s"
      />
      <Bubble
        cx={310}
        r={16}
        color="var(--color-alias-illustration-green-513)"
        dur="9s"
        delay="-1.5s"
      />
      <Bubble
        cx={360}
        r={12}
        color="var(--color-alias-illustration-orange-281)"
        dur="9.5s"
        delay="-7s"
        pop
      />
      <circle
        className="ring"
        cx="178"
        cy="108"
        r="9"
        fill="none"
        stroke="var(--color-alias-illustration-rose-355)"
        strokeWidth="1.5"
      />
      <circle
        className="ring r2"
        cx="338"
        cy="92"
        r="8"
        fill="none"
        stroke="var(--color-alias-illustration-blue-431)"
        strokeWidth="1.5"
      />
    </svg>
  )
}
