// День 11 — лепестки в воздухе
function Petal({
  x,
  y,
  dx,
  rot,
  dur,
  delay,
}: {
  x: number
  y: number
  dx: string
  rot: string
  dur: string
  delay: string
}) {
  return (
    <ellipse
      className="petal"
      cx={x}
      cy={y}
      rx="7"
      ry="4"
      fill="var(--color-alias-illustration-rose-323)"
      style={{
        ['--dx' as string]: dx,
        ['--rot' as string]: rot,
        animationDuration: dur,
        animationDelay: delay,
      }}
    />
  )
}

export default function Day11() {
  return (
    <svg
      className="scn s11"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s11 .branch{transform-box:fill-box;transform-origin:0% 0%;animation:s11br 8s ease-in-out infinite}
        .s11 .petal{transform-box:fill-box;transform-origin:center;animation-name:s11fall;animation-timing-function:linear;animation-iteration-count:infinite}
        @keyframes s11br{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes s11fall{0%{transform:translate(0,0) rotate(0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translate(var(--dx),210px) rotate(var(--rot));opacity:0}}
      `}</style>
      <g transform="translate(62 12)">
        <g className="branch">
          <path
            d="M0 44 Q 76 56 156 42"
            stroke="var(--color-alias-illustration-brown-778)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M42 49 Q 54 30 72 38"
            stroke="var(--color-alias-illustration-brown-778)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M112 48 Q 126 30 140 34"
            stroke="var(--color-alias-illustration-brown-778)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <g fill="var(--color-alias-illustration-rose-323)">
            <circle cx="30" cy="48" r="8" />
            <circle cx="24" cy="42" r="6" />
            <circle cx="37" cy="42" r="6" />
            <circle cx="76" cy="44" r="8" />
            <circle cx="70" cy="38" r="6" />
            <circle cx="83" cy="39" r="6" />
            <circle cx="126" cy="43" r="8" />
            <circle cx="120" cy="37" r="6" />
            <circle cx="133" cy="38" r="6" />
          </g>
          <g fill="var(--color-alias-illustration-orange-263)">
            <circle cx="30" cy="48" r="3" />
            <circle cx="76" cy="44" r="3" />
            <circle cx="126" cy="43" r="3" />
          </g>
        </g>
      </g>
      <Petal x={102} y={70} dx="34px" rot="220deg" dur="9s" delay="0s" />
      <Petal x={140} y={66} dx="-26px" rot="-200deg" dur="10.5s" delay="-3s" />
      <Petal x={190} y={70} dx="48px" rot="260deg" dur="9.5s" delay="-6s" />
      <Petal x={82} y={68} dx="20px" rot="-160deg" dur="11s" delay="-1.5s" />
      <Petal x={172} y={64} dx="-38px" rot="200deg" dur="10s" delay="-4.5s" />
    </svg>
  )
}
