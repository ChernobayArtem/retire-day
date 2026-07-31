// День 28 — предфинальное конфетти
function Confetti({ tx, peak, color, shape }: { tx: number; peak: number; color: string; shape: 'sq' | 'ci' | 'tr' | 'rc' }) {
  const style = { ['--tx' as string]: tx + 'px', ['--peak' as string]: peak + 'px' }
  return (
    <g className="conf" style={style}>
      {shape === 'sq' && <rect x="211" y="202" width="8" height="8" rx="1.5" fill={color} />}
      {shape === 'ci' && <circle cx="215" cy="206" r="4.5" fill={color} />}
      {shape === 'tr' && <path d="M215 200 l6 10 -12 0 z" fill={color} />}
      {shape === 'rc' && <rect x="209" y="204" width="12" height="4" rx="2" fill={color} />}
    </g>
  )
}

export default function Day28() {
  return (
    <svg className="scn s28" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s28 .conf{transform-box:fill-box;transform-origin:center;animation:s28fly 9s ease-out infinite}
        .s28 .popper{transform-box:fill-box;transform-origin:50% 100%;animation:s28pop 9s ease-out infinite}
        .s28 .burst{transform-box:fill-box;transform-origin:center;animation:s28burst 9s ease-out infinite}
        @keyframes s28fly{0%,3%{transform:translate(0,0) rotate(0);opacity:0}7%{opacity:1}38%{transform:translate(calc(var(--tx) * .55),var(--peak)) rotate(200deg)}82%{opacity:1}100%{transform:translate(var(--tx),58px) rotate(460deg);opacity:0}}
        @keyframes s28pop{0%,2%{transform:scale(1) rotate(0)}7%{transform:scale(1.12) rotate(-3deg)}24%,100%{transform:scale(1) rotate(0)}}
        @keyframes s28burst{0%,3%,100%{transform:scale(.3);opacity:0}7%{opacity:.85}28%{transform:scale(1.2);opacity:0}}
      `}</style>
      <rect width="430" height="260" fill="#fff7fb" />
      <ellipse cx="215" cy="244" rx="90" ry="8" fill="#f4e6ee" />
      <g className="burst" fill="none" stroke="#ffd45e" strokeWidth="3" strokeLinecap="round">
        <path d="M215 204 L215 178 M208 206 L194 184 M222 206 L236 184" />
      </g>
      <Confetti tx={-92} peak={-40} color="#ff6f91" shape="sq" />
      <Confetti tx={-64} peak={-78} color="#ffd45e" shape="tr" />
      <Confetti tx={-36} peak={-96} color="#7ac2ff" shape="rc" />
      <Confetti tx={-12} peak={-108} color="#8CDb6f" shape="ci" />
      <Confetti tx={16} peak={-104} color="#b8a4ff" shape="sq" />
      <Confetti tx={40} peak={-92} color="#ff9ec4" shape="tr" />
      <Confetti tx={66} peak={-70} color="#ffb15e" shape="rc" />
      <Confetti tx={92} peak={-44} color="#5cc4c4" shape="ci" />
      <Confetti tx={-78} peak={-64} color="#7ac2ff" shape="ci" />
      <Confetti tx={78} peak={-58} color="#ff6f91" shape="rc" />
      {/* хлопушка */}
      <g transform="translate(0 -5) scale(1.12 1.12)" transform-origin="215 250">
        <g className="popper">
          <path d="M215 210 L196 250 L234 250 Z" fill="#ff8f6e" />
          <path d="M215 210 L205 250 L225 250 Z" fill="#ff7a5e" opacity="0.6" />
          <ellipse cx="215" cy="210" rx="13" ry="4" fill="#ffd45e" />
        </g>
      </g>
    </svg>
  )
}
