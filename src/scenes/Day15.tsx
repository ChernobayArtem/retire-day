// День 15 — светлячки вечером
function Firefly({
  x,
  y,
  dx,
  dy,
  dur,
  delay,
}: {
  x: number
  y: number
  dx: string
  dy: string
  dur: string
  delay: string
}) {
  return (
    <g
      className="fly"
      style={{
        ['--dx' as string]: dx,
        ['--dy' as string]: dy,
        animationDuration: dur,
        animationDelay: delay,
      }}
    >
      <circle cx={x} cy={y} r="12" fill="var(--color-alias-illustration-green-77)" opacity="0.2" />
      <circle
        cx={x}
        cy={y}
        r="5.5"
        fill="var(--color-alias-illustration-yellow-182)"
        opacity="0.34"
      />
      <circle cx={x} cy={y} r="2.8" fill="var(--color-alias-illustration-yellow-0)" />
    </g>
  )
}

export default function Day15() {
  return (
    <svg
      className="scn s15"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s15 .fly{transform-box:fill-box;transform-origin:center;animation-name:s15fly;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
        .s15 .blade{transform-box:fill-box;transform-origin:50% 100%;animation:s15blade 6s ease-in-out infinite}
        .s15 .bl2{animation-delay:-2s}.s15 .bl3{animation-delay:-4s}
        .s15 .star{transform-box:fill-box;transform-origin:center;animation:s15star 5s ease-in-out infinite}
        .s15 .moon{transform-box:fill-box;transform-origin:center;animation:s15moon 10s ease-in-out infinite}
        @keyframes s15fly{0%,100%{transform:translate(0,0);opacity:.35}50%{transform:translate(var(--dx),var(--dy));opacity:1}}
        @keyframes s15blade{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
        @keyframes s15star{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
        @keyframes s15moon{0%,100%{opacity:.72;transform:translateY(0)}50%{opacity:.9;transform:translateY(-2px)}}
      `}</style>
      <defs>
        <linearGradient id="s15sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-alias-illustration-blue-194)" />
          <stop offset="0.55" stopColor="var(--color-alias-illustration-blue-764)" />
          <stop offset="1" stopColor="var(--color-alias-illustration-blue-917)" />
        </linearGradient>
      </defs>
      <rect width="430" height="260" fill="url(#s15sky)" />
      <g className="moon">
        <circle
          cx="112"
          cy="86"
          r="22"
          fill="var(--color-alias-illustration-yellow-364)"
          opacity=".82"
        />
        <circle cx="122" cy="79" r="22" fill="var(--color-alias-illustration-blue-583)" />
      </g>
      <path
        className="star"
        d="M320 70 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"
        fill="var(--color-alias-illustration-yellow-91)"
      />
      <Firefly x={130} y={150} dx="24px" dy="-20px" dur="7s" delay="0s" />
      <Firefly x={210} y={130} dx="-20px" dy="18px" dur="9s" delay="-2s" />
      <Firefly x={280} y={165} dx="18px" dy="-24px" dur="8s" delay="-4s" />
      <Firefly x={175} y={175} dx="-16px" dy="-16px" dur="10s" delay="-1s" />
      <Firefly x={330} y={132} dx="-22px" dy="20px" dur="9.5s" delay="-6s" />
      <Firefly x={92} y={182} dx="20px" dy="-18px" dur="8.5s" delay="-3s" />
      <path
        d="M0 214 Q 215 226 430 214 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-blue-986)"
      />
      <g fill="var(--color-alias-illustration-blue-944)">
        <path className="blade" d="M70 214 q -6 -26 2 -34 q 6 14 2 34 z" />
        <path className="blade bl2" d="M200 214 q 6 -30 -2 -38 q -6 16 0 38 z" />
        <path className="blade bl3" d="M330 214 q -6 -28 2 -36 q 6 14 2 36 z" />
      </g>
    </svg>
  )
}
