// День 22 — дождь и зонтик
function Drop({ x, y, delay }: { x: number; y: number; delay: string }) {
  return <line className="drop" x1={x} y1={y} x2={x} y2={y + 10} stroke="#8fb8e6" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: delay }} />
}

export default function Day22() {
  return (
    <svg className="scn s22" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s22 .rain{animation:s22ease 10s ease-in-out infinite}
        .s22 .drop{transform-box:fill-box;animation:s22drop 1.4s linear infinite}
        .s22 .dB{animation-delay:-0.5s}.s22 .dC{animation-delay:-0.9s}.s22 .dD{animation-delay:-0.3s}.s22 .dE{animation-delay:-1.1s}
        .s22 .umbrella{transform-box:fill-box;transform-origin:50% 100%;animation:s22sway 7s ease-in-out infinite}
        .s22 .cloud{transform-box:fill-box;transform-origin:center;animation:s22cloud 16s ease-in-out infinite}
        .s22 .c2{animation-duration:20s;animation-delay:-5s}
        .s22 .ripple{transform-box:fill-box;transform-origin:center;animation:s22ripple 3s ease-out infinite}
        .s22 .rp2{animation-delay:-1.5s}
        .s22 .shine{animation:s22shine 7s ease-in-out infinite}
        @keyframes s22drop{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(64px);opacity:0}}
        @keyframes s22ease{0%,100%{opacity:1}45%,60%{opacity:.35}}
        @keyframes s22sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s22cloud{0%,100%{transform:translateX(-14px)}50%{transform:translateX(14px)}}
        @keyframes s22ripple{0%{transform:scale(.3);opacity:.7}100%{transform:scale(1.3);opacity:0}}
        @keyframes s22shine{0%,100%{opacity:.18}50%{opacity:.55}}
      `}</style>
      <rect width="430" height="260" fill="#eef3f8" />
      <g className="cloud c1" fill="#cdd8e6"><ellipse cx="150" cy="70" rx="34" ry="14" /><circle cx="132" cy="66" r="14" /><circle cx="168" cy="64" r="16" /></g>
      <g className="cloud c2" fill="#dce4ee"><ellipse cx="300" cy="92" rx="26" ry="10" /><circle cx="288" cy="88" r="10" /><circle cx="312" cy="87" r="12" /></g>
      <g className="rain">
        <Drop x={150} y={120} delay="0s" />
        <Drop x={168} y={102} delay="-1.2s" />
        <Drop x={185} y={140} delay="-0.5s" />
        <Drop x={255} y={128} delay="-0.9s" />
        <Drop x={285} y={150} delay="-0.3s" />
        <Drop x={268} y={96} delay="-.75s" />
        <Drop x={215} y={110} delay="-1.1s" />
      </g>
      {/* зонт */}
      <g className="umbrella">
        <line x1="215" y1="168" x2="215" y2="224" stroke="#9a8a7a" strokeWidth="3" />
        <path d="M215 224 q -10 2 -8 -8" fill="none" stroke="#9a8a7a" strokeWidth="3" strokeLinecap="round" />
        <path d="M165 172 Q 175 146 215 144 Q 255 146 265 172 Q 240 162 227 172 Q 220 160 215 172 Q 210 160 203 172 Q 190 162 165 172 Z" fill="#ff7a90" />
        <path className="shine" d="M185 160 Q 205 146 225 151" fill="none" stroke="#ffb2c0" strokeWidth="3" strokeLinecap="round" />
        <path d="M165 172 Q 175 146 215 144 Q 255 146 265 172" fill="none" stroke="#ff5f7a" strokeWidth="2" />
        <circle cx="215" cy="143" r="3" fill="#ff5f7a" />
      </g>
      {/* лужа */}
      <ellipse cx="215" cy="240" rx="70" ry="9" fill="#cfe0f0" />
      <ellipse cx="215" cy="238" rx="44" ry="4" fill="#e9f5fb" opacity=".75" />
      <ellipse className="ripple rp1" cx="200" cy="240" rx="14" ry="4" fill="none" stroke="#a9c8e6" strokeWidth="1.5" />
      <ellipse className="ripple rp2" cx="235" cy="241" rx="14" ry="4" fill="none" stroke="#a9c8e6" strokeWidth="1.5" />
    </svg>
  )
}
