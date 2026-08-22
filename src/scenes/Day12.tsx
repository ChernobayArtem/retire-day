// День 12 — птицы на проводе
function Bird({ x, color, className }: { x: number; color: string; className?: string }) {
  return (
    <g className={'bird ' + (className ?? '')}>
      <ellipse cx={x} cy="138" rx="15" ry="12" fill={color} />
      <g className="head">
        <circle cx={x} cy="126" r="8" fill={color} />
        <path
          d={`M${x + 7} 124 l 8 -3 l -7 6 z`}
          fill="var(--color-alias-illustration-orange-526)"
        />
        <circle cx={x + 3} cy="124" r="1.8" fill="var(--color-alias-illustration-mauve-813)" />
      </g>
      <line
        x1={x - 3}
        y1="150"
        x2={x - 3}
        y2="156"
        stroke="var(--color-alias-illustration-orange-1000)"
        strokeWidth="1.5"
      />
      <line
        x1={x + 3}
        y1="150"
        x2={x + 3}
        y2="156"
        stroke="var(--color-alias-illustration-orange-1000)"
        strokeWidth="1.5"
      />
    </g>
  )
}

export default function Day12() {
  return (
    <svg
      className="scn s12"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s12 .bird{transform-box:fill-box;transform-origin:50% 100%;animation:s12sway 4s ease-in-out infinite}
        .s12 .b2{animation-delay:-1.5s}
        .s12 .b3{animation:s12hop 6s ease-in-out infinite}
        .s12 .wire{transform-box:fill-box;transform-origin:center;animation:s12wire 6s ease-in-out infinite}
        .s12 .c1{animation:s12cl 20s ease-in-out infinite}
        @keyframes s12sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s12hop{0%,68%,100%{transform:translateY(0)}80%{transform:translateY(-11px)}90%{transform:translateY(0)}}
        @keyframes s12wire{0%,68%,100%{transform:scaleY(1)}88%{transform:scaleY(1.035)}}
        @keyframes s12cl{0%,100%{transform:translateX(-16px)}50%{transform:translateX(16px)}}
      `}</style>
      <defs>
        <linearGradient id="s12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-alias-illustration-neutral-0)" />
          <stop offset="1" stopColor="var(--color-alias-illustration-blue-97)" />
        </linearGradient>
      </defs>
      <rect width="430" height="260" fill="url(#s12sky)" />
      <g className="c1" fill="var(--color-alias-illustration-neutral-0)">
        <ellipse cx="330" cy="88" rx="30" ry="14" />
        <circle cx="314" cy="84" r="13" />
        <circle cx="344" cy="82" r="16" />
      </g>
      <path
        className="wire"
        d="M0 156 Q 215 168 430 156"
        stroke="var(--color-alias-illustration-blue-778)"
        strokeWidth="2"
        fill="none"
      />
      <Bird x={110} color="var(--color-alias-illustration-blue-819)" className="b1" />
      <Bird x={215} color="var(--color-alias-illustration-red-625)" className="b3" />
      <Bird x={315} color="var(--color-alias-illustration-blue-750)" className="b2" />
    </svg>
  )
}
