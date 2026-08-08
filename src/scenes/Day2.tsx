// День 2 — цветы просыпаются
function Flower({ x, petal, center, className }: { x: number; petal: string; center: string; className?: string }) {
  const base = 250
  const cy = 120
  const petals = [0, 72, 144, 216, 288]
  return (
    <g className={'fl ' + (className ?? '')} style={{ transformOrigin: `${x}px ${base}px` }}>
      <path className="stem" d={`M${x} ${base} C ${x - 6} ${base - 40}, ${x + 6} ${cy + 50}, ${x} ${cy + 20}`} stroke="var(--color-alias-illustration-green-872)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g className="petals" style={{ transformOrigin: `${x}px ${cy}px` }}>
        {petals.map((a) => {
          const rad = (a * Math.PI) / 180
          return <ellipse key={a} cx={x + Math.cos(rad) * 15} cy={cy + Math.sin(rad) * 15} rx="11" ry="15" fill={petal} transform={`rotate(${a} ${x + Math.cos(rad) * 15} ${cy + Math.sin(rad) * 15})`} />
        })}
        <circle cx={x} cy={cy} r="10" fill={center} />
      </g>
    </g>
  )
}

export default function Day2() {
  return (
    <svg className="scn s2" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s2 .fl .stem{transform-box:fill-box;transform-origin:50% 100%}
        .s2 .f1{animation:s2sway 8s ease-in-out infinite}
        .s2 .f2{animation:s2turn 9.5s ease-in-out infinite -2s}
        .s2 .f3{animation:s2sway 8.8s ease-in-out infinite -4s}
        .s2 .f1 .petals{animation:s2open 9s ease-in-out infinite}
        .s2 .f2 .petals{animation:s2open 8.6s ease-in-out infinite -1.8s}
        .s2 .f3 .petals{animation:s2open 10s ease-in-out infinite -3.5s}
        .s2 .pollen{animation:s2pollen 7s ease-in-out infinite}
        .s2 .pol2{animation-delay:-3.5s}
        .s2 .pol3{animation-delay:-5s}
        .s2 .leaf{transform-box:fill-box;transform-origin:50% 100%;animation:s2leaf 7s ease-in-out infinite}
        .s2 .leaf2{animation-delay:-3s}
        @keyframes s2sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes s2turn{0%,100%{transform:rotate(-2deg)}45%,62%{transform:rotate(4deg)}}
        @keyframes s2open{0%,100%{transform:scale(.92) rotate(-1deg)}45%,60%{transform:scale(1.06) rotate(1deg)}}
        @keyframes s2pollen{0%{transform:translate(0,0);opacity:0}22%{opacity:.8}55%{transform:translate(5px,-23px);opacity:.65}100%{transform:translate(-4px,-44px);opacity:0}}
        @keyframes s2leaf{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
      `}</style>
      <path d="M0 150 L40 160 L86 150 L140 162 L200 150 L260 160 L320 150 L380 162 L430 152 V260 H0 Z" fill="var(--color-alias-illustration-green-154)" />
      <Flower x={92} petal="var(--color-alias-illustration-rose-419)" center="var(--color-alias-illustration-orange-263)" className="f1" />
      <Flower x={215} petal="var(--color-alias-illustration-indigo-250)" center="var(--color-alias-illustration-orange-263)" className="f2" />
      <Flower x={338} petal="var(--color-alias-illustration-orange-281)" center="var(--color-alias-illustration-red-750)" className="f3" />
      <g fill="var(--color-alias-illustration-green-769)">
        <path className="leaf" d="M162 224 C 145 217 143 204 160 202 C 169 210 170 219 162 224 Z" />
        <path className="leaf leaf2" d="M274 232 C 290 222 292 210 276 208 C 268 217 267 226 274 232 Z" />
      </g>
      <g fill="var(--color-alias-illustration-orange-263)">
        <circle className="pollen" cx="92" cy="110" r="2.4" />
        <circle className="pollen pol2" cx="220" cy="112" r="2" />
        <circle className="pollen pol3" cx="332" cy="108" r="2.6" />
      </g>
    </svg>
  )
}
