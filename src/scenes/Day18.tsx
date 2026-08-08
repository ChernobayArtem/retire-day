// День 18 — бумажный кораблик
function wavePath(baseY: number, amp: number) {
  let d = `M-60 ${baseY}`
  let a = amp
  for (let x = -60; x <= 490; x += 30) {
    d += ` q 15 ${a} 30 0`
    a = -a
  }
  return d + ` L490 260 L-60 260 Z`
}

export default function Day18() {
  return (
    <svg className="scn s18" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s18 .boat{transform-box:fill-box;transform-origin:50% 100%;animation:s18rock 7s ease-in-out infinite}
        .s18 .waveB{animation:s18wave 9s linear infinite}
        .s18 .waveF{animation:s18wave 6s linear infinite}
        .s18 .cloud{transform-box:fill-box;transform-origin:center;animation:s18cloud 16s ease-in-out infinite}
        .s18 .cloud2{animation-delay:-6s;animation-duration:20s}
        .s18 .splash{transform-box:fill-box;transform-origin:center;animation:s18splash 7s ease-in-out infinite}
        @keyframes s18rock{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-3px) rotate(4deg)}}
        @keyframes s18wave{0%{transform:translateX(0)}100%{transform:translateX(-60px)}}
        @keyframes s18cloud{0%,100%{transform:translateX(-14px)}50%{transform:translateX(14px)}}
        @keyframes s18splash{0%,70%,100%{transform:translate(0,0) scale(.2);opacity:0}80%{transform:translate(4px,-10px) scale(1);opacity:.8}92%{transform:translate(8px,4px) scale(.6);opacity:0}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-blue-69)" />
      <g className="cloud" fill="var(--color-alias-illustration-neutral-0)"><ellipse cx="120" cy="86" rx="30" ry="13" /><circle cx="104" cy="82" r="12" /><circle cx="134" cy="80" r="15" /></g>
      <g className="cloud cloud2" fill="var(--color-alias-illustration-blue-14)" opacity=".8"><ellipse cx="324" cy="112" rx="22" ry="9" /><circle cx="312" cy="109" r="9" /><circle cx="336" cy="107" r="11" /></g>
      <path className="waveB" d={wavePath(196, -9)} fill="var(--color-alias-illustration-blue-361)" />
      {/* кораблик */}
      <g className="boat">
        <path d="M172 184 L258 184 L238 209 Q215 217 192 209 Z" fill="var(--color-alias-illustration-neutral-0)" stroke="var(--color-alias-illustration-blue-375)" strokeWidth="2.4" />
        <path d="M194 184 L215 148 L236 184 Z" fill="var(--color-alias-illustration-neutral-0)" stroke="var(--color-alias-illustration-blue-375)" strokeWidth="2.4" />
        <line x1="215" y1="150" x2="215" y2="184" stroke="var(--color-alias-illustration-blue-319)" strokeWidth="2.2" />
        <path d="M215 150 L233 182 L215 182 Z" fill="var(--color-alias-illustration-blue-28)" />
        <ellipse className="splash" cx="260" cy="188" rx="4" ry="5" fill="var(--color-alias-illustration-blue-569)" />
      </g>
      <path className="waveF" d={wavePath(206, 8)} fill="var(--color-alias-illustration-blue-556)" />
    </svg>
  )
}
