// День 6 — облака и солнце
export default function Day6() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg
      className="scn s6"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s6 .sun{transform-box:fill-box;transform-origin:center;animation:s6pulse 6s ease-in-out infinite}
        .s6 .rays{transform-box:fill-box;transform-origin:center;animation:s6rays 6s ease-in-out infinite}
        .s6 .c1{animation:s6c 18s ease-in-out infinite}
        .s6 .c2{animation:s6c2 24s ease-in-out infinite}
        .s6 .cross{animation:s6cross 12s ease-in-out infinite}
        .s6 .bird{animation:s6bird 11s ease-in-out infinite}
        @keyframes s6pulse{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.05);opacity:1}}
        @keyframes s6rays{0%,100%{opacity:.3;transform:rotate(0)}50%{opacity:.65;transform:rotate(8deg)}}
        @keyframes s6c{0%,100%{transform:translateX(-18px)}50%{transform:translateX(18px)}}
        @keyframes s6c2{0%,100%{transform:translateX(16px)}50%{transform:translateX(-16px)}}
        @keyframes s6cross{0%{transform:translateX(-50px);opacity:0}18%{opacity:1}50%{transform:translateX(56px)}82%{opacity:1}100%{transform:translateX(150px);opacity:0}}
        @keyframes s6bird{0%,100%{transform:translateX(-8px);opacity:.35}50%{transform:translateX(10px);opacity:.7}}
      `}</style>
      <defs>
        <linearGradient id="s6sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-alias-illustration-neutral-0)" />
          <stop offset="1" stopColor="var(--color-alias-illustration-blue-236)" />
        </linearGradient>
      </defs>
      <rect width="430" height="260" fill="url(#s6sky)" />
      <g transform="translate(320 98)">
        <g
          className="rays"
          stroke="var(--color-alias-illustration-orange-351)"
          strokeWidth="4"
          strokeLinecap="round"
        >
          {rays.map((a) => {
            const r = (a * Math.PI) / 180
            return (
              <line
                key={a}
                x1={Math.cos(r) * 40}
                y1={Math.sin(r) * 40}
                x2={Math.cos(r) * 52}
                y2={Math.sin(r) * 52}
              />
            )
          })}
        </g>
        <circle className="sun" r="30" fill="var(--color-alias-illustration-orange-263)" />
      </g>
      <g className="c2" fill="var(--color-alias-illustration-blue-56)">
        <ellipse cx="120" cy="186" rx="40" ry="20" />
        <circle cx="100" cy="180" r="18" />
        <circle cx="138" cy="178" r="22" />
      </g>
      <g className="c1" fill="var(--color-alias-illustration-neutral-0)">
        <ellipse cx="88" cy="112" rx="30" ry="15" />
        <circle cx="72" cy="108" r="14" />
        <circle cx="102" cy="106" r="17" />
      </g>
      <g className="cross" fill="var(--color-alias-illustration-neutral-0)">
        <ellipse cx="300" cy="98" rx="30" ry="14" />
        <circle cx="284" cy="94" r="13" />
        <circle cx="314" cy="92" r="15" />
      </g>
      <g
        className="bird"
        fill="none"
        stroke="var(--color-alias-illustration-blue-611)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M176 120 q 7 -7 14 0 q 7 -7 14 0" />
      </g>
    </svg>
  )
}
