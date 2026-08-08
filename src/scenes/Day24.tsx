// День 24 — огни города
function Windows({ x, y, cols, rows, cls }: { x: number; y: number; cols: number; rows: number; cls: string }) {
  const w = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) w.push([x + c * 12, y + r * 14, (r + c) % 3])
  return (
    <g fill="var(--color-alias-illustration-orange-158)">
      {w.map(([wx, wy, k], i) => (
        <rect key={i} className={'win ' + cls + ' k' + k} x={wx} y={wy} width="6" height="7" rx="1" />
      ))}
    </g>
  )
}

export default function Day24() {
  return (
    <svg className="scn s24" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s24 .win{animation:s24win 6s ease-in-out infinite}
        .s24 .k0{animation-delay:0s}.s24 .k1{animation-delay:-2s}.s24 .k2{animation-delay:-4s}
        .s24 .cloud{transform-box:fill-box;transform-origin:center;animation:s24cloud 20s ease-in-out infinite}
        .s24 .car{animation:s24car 11s linear infinite}
        .s24 .moon{transform-box:fill-box;transform-origin:center;animation:s24moon 8s ease-in-out infinite}
        @keyframes s24win{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes s24cloud{0%,100%{transform:translateX(-14px)}50%{transform:translateX(14px)}}
        @keyframes s24car{0%{transform:translateX(-70px);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(430px);opacity:0}}
        @keyframes s24moon{0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:.85;transform:scale(1)}}
      `}</style>
      <defs><linearGradient id="s24sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--color-alias-illustration-blue-292)" /><stop offset="1" stopColor="var(--color-alias-illustration-blue-694)" /></linearGradient></defs>
      <rect width="430" height="260" fill="url(#s24sky)" />
      <circle className="moon" cx="324" cy="66" r="18" fill="var(--color-alias-illustration-yellow-636)" />
      <g className="cloud" fill="var(--color-alias-illustration-blue-500)" opacity="0.6"><ellipse cx="120" cy="72" rx="30" ry="10" /><circle cx="140" cy="68" r="11" /></g>
      {/* здания */}
      <rect x="72" y="150" width="58" height="90" rx="6" fill="var(--color-alias-illustration-blue-875)" />
      <rect x="138" y="120" width="52" height="120" rx="6" fill="var(--color-alias-illustration-blue-833)" />
      <rect x="198" y="140" width="60" height="100" rx="6" fill="var(--color-alias-illustration-blue-903)" />
      <rect x="266" y="108" width="50" height="132" rx="6" fill="var(--color-alias-illustration-blue-847)" />
      <line x1="291" y1="108" x2="291" y2="92" stroke="var(--color-alias-illustration-blue-847)" strokeWidth="2" />
      <circle cx="291" cy="90" r="2.5" fill="var(--color-alias-illustration-red-313)" />
      <rect x="324" y="152" width="46" height="88" rx="6" fill="var(--color-alias-illustration-blue-889)" />
      <Windows x={82} y={162} cols={3} rows={5} cls="wA" />
      <Windows x={148} y={132} cols={3} rows={7} cls="wB" />
      <Windows x={208} y={152} cols={4} rows={6} cls="wC" />
      <Windows x={276} y={120} cols={3} rows={8} cls="wD" />
      <Windows x={334} y={164} cols={2} rows={5} cls="wE" />
      {/* дорога и машина */}
      <rect y="240" width="430" height="20" fill="var(--color-alias-illustration-blue-972)" />
      <g className="car"><rect x="18" y="244" width="20" height="6" rx="3" fill="var(--color-alias-illustration-blue-806)" /><circle cx="20" cy="248" r="3.5" fill="var(--color-alias-illustration-yellow-636)" /><circle cx="36" cy="248" r="3.5" fill="var(--color-alias-illustration-red-375)" /></g>
    </svg>
  )
}
