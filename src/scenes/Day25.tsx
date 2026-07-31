// День 25 — листья кружатся
function Leaf({ x, color, dur, delay }: { x: number; color: string; dur: string; delay: string }) {
  return (
    <g transform={`translate(${x} 60)`}>
      <g className="leaf" style={{ animationDuration: dur, animationDelay: delay }}>
        <path d="M0 -12 C 10 -8 10 8 0 12 C -10 8 -10 -8 0 -12 Z" fill={color} />
        <path d="M0 -10 L0 10" stroke="rgba(0,0,0,0.12)" strokeWidth="1.4" />
      </g>
    </g>
  )
}

export default function Day25() {
  return (
    <svg className="scn s25" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s25 .leaf{transform-box:fill-box;transform-origin:center;animation-name:s25drift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
        .s25 .wind{animation:s25wind 9s ease-in-out infinite}
        @keyframes s25drift{
          0%{transform:translate(0,0) rotate(0) scale(.85);opacity:0}
          10%{opacity:1}
          30%{transform:translate(34px,44px) rotate(80deg) scale(1.08)}
          55%{transform:translate(-14px,100px) rotate(165deg) scale(.92)}
          80%{transform:translate(34px,150px) rotate(250deg) scale(1.12)}
          90%{opacity:1}
          100%{transform:translate(0,196px) rotate(330deg) scale(.85);opacity:0}
        }
        @keyframes s25wind{0%,100%{stroke-dashoffset:30;opacity:.12}50%{stroke-dashoffset:-28;opacity:.42}}
      `}</style>
      <rect width="430" height="260" fill="#fff6ec" />
      <g className="wind" fill="none" stroke="#e8b982" strokeWidth="2" strokeDasharray="10 9" strokeLinecap="round">
        <path d="M92 112 Q 160 82 228 112" /><path d="M210 170 Q 270 145 332 170" />
      </g>
      <Leaf x={110} color="#ff9e5e" dur="10s" delay="0s" />
      <Leaf x={190} color="#ffbf5e" dur="11s" delay="-3s" />
      <Leaf x={250} color="#ff7a5e" dur="9.5s" delay="-6s" />
      <Leaf x={310} color="#e6944a" dur="10.5s" delay="-1.5s" />
      <Leaf x={155} color="#ffd06e" dur="11.5s" delay="-8s" />
      <path d="M0 246 Q 215 236 430 246 L430 260 L0 260 Z" fill="#f7e6d1" />
      <g opacity=".8"><ellipse cx="176" cy="242" rx="15" ry="5" fill="#ffb15e" transform="rotate(10 176 242)" /><ellipse cx="248" cy="244" rx="14" ry="5" fill="#e6944a" transform="rotate(-12 248 244)" /></g>
    </svg>
  )
}
