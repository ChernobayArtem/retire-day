// День 23 — пляжный мяч
const BALL_COLORS = [
  'var(--color-alias-illustration-red-813)',
  'var(--color-alias-illustration-orange-263)',
  'var(--color-alias-illustration-teal-1000)',
  'var(--color-alias-illustration-neutral-0)',
  'var(--color-alias-illustration-rose-419)',
  'var(--color-alias-illustration-blue-569)',
]
function ballWedges(cx: number, cy: number, r: number) {
  const pts: number[][] = []
  for (let i = 0; i < 7; i++) {
    const a = (-90 + i * 60) * (Math.PI / 180)
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return BALL_COLORS.map((c, i) => ({
    d: `M${cx} ${cy} L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} A${r} ${r} 0 0 1 ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)} Z`,
    c,
  }))
}

export default function Day23() {
  return (
    <svg
      className="scn s23"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s23 .ball{transform-box:fill-box;transform-origin:50% 100%;animation:s23roll 9s ease-in-out infinite}
        .s23 .wave{transform-box:fill-box;transform-origin:center;animation:s23wave 6s ease-in-out infinite}
        .s23 .shell{transform-box:fill-box;transform-origin:50% 100%;animation:s23shell 7s ease-in-out infinite}
        .s23 .cloud{animation:s23cloud 16s ease-in-out infinite}
        .s23 .foam{animation:s23foam 6s ease-in-out infinite}
        @keyframes s23roll{0%{transform:translate(-16px,0) rotate(-46deg)}45%{transform:translate(16px,0) rotate(46deg)}54%{transform:translate(16px,-14px) rotate(56deg)}63%{transform:translate(14px,0) rotate(62deg)}100%{transform:translate(-16px,0) rotate(-46deg)}}
        @keyframes s23wave{0%,100%{transform:translateX(-10px)}50%{transform:translateX(10px)}}
        @keyframes s23shell{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
        @keyframes s23cloud{0%,100%{transform:translateX(-12px)}50%{transform:translateX(14px)}}
        @keyframes s23foam{0%,100%{opacity:.25;transform:translateX(-5px)}50%{opacity:.75;transform:translateX(6px)}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-blue-69)" />
      <circle
        cx="330"
        cy="82"
        r="24"
        fill="var(--color-alias-illustration-orange-158)"
        opacity=".85"
      />
      <g className="cloud" fill="var(--color-alias-illustration-neutral-0)">
        <ellipse cx="112" cy="96" rx="28" ry="11" />
        <circle cx="98" cy="92" r="11" />
        <circle cx="126" cy="90" r="13" />
      </g>
      <rect y="150" width="430" height="60" fill="var(--color-alias-illustration-blue-333)" />
      <path
        className="wave"
        d="M-20 154 q 30 -8 60 0 q 30 8 60 0 q 30 -8 60 0 q 30 8 60 0 q 30 -8 60 0 q 30 8 60 0 q 30 -8 60 0 L470 152 L470 210 L-20 210 Z"
        fill="var(--color-alias-illustration-blue-458)"
      />
      <path
        className="foam"
        d="M70 168 q 28 -7 56 0 M276 174 q 24 -6 48 0"
        fill="none"
        stroke="var(--color-alias-illustration-neutral-0)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M0 200 Q 215 184 430 200 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-orange-123)"
      />
      {/* мяч */}
      <g className="ball">
        {ballWedges(215, 202, 26).map((w, i) => (
          <path key={i} d={w.d} fill={w.c} />
        ))}
        <circle
          cx="215"
          cy="202"
          r="26"
          fill="none"
          stroke="var(--color-alias-illustration-orange-246)"
          strokeWidth="1.5"
        />
        <circle
          cx="206"
          cy="193"
          r="6"
          fill="var(--color-alias-illustration-neutral-0)"
          opacity="0.45"
        />
      </g>
      {/* ракушка */}
      <g className="shell">
        <path
          d="M300 232 Q 300 214 316 214 Q 332 214 332 232 Z"
          fill="var(--color-alias-illustration-rose-226)"
        />
        <g stroke="var(--color-alias-illustration-rose-452)" strokeWidth="1.5" fill="none">
          <path d="M316 214 L316 232" />
          <path d="M308 216 L311 232" />
          <path d="M324 216 L321 232" />
        </g>
      </g>
    </svg>
  )
}
