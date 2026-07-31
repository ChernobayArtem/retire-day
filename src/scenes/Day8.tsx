// День 8 — воздушный змей
export default function Day8() {
  return (
    <svg className="scn s8" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s8 .rig{animation:s8drift 9s ease-in-out infinite}
        .s8 .kite{transform-box:fill-box;transform-origin:50% 50%;animation:s8kite 9s ease-in-out infinite}
        .s8 .tail{transform-box:fill-box;transform-origin:50% 0%;animation:s8tail 9s ease-in-out infinite -.4s}
        .s8 .c1{animation:s8cl 18s ease-in-out infinite}
        .s8 .blade{transform-box:fill-box;transform-origin:50% 100%;animation:s8blade 7s ease-in-out infinite}
        .s8 .bl2{animation-delay:-3s}
        @keyframes s8drift{0%,100%{transform:translate(-8px,0)}50%{transform:translate(8px,-5px)}}
        @keyframes s8kite{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
        @keyframes s8tail{0%,100%{transform:rotate(9deg)}50%{transform:rotate(-9deg)}}
        @keyframes s8cl{0%,100%{transform:translateX(-16px)}50%{transform:translateX(16px)}}
        @keyframes s8blade{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
      `}</style>
      <defs><linearGradient id="s8sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d9efff" /></linearGradient></defs>
      <rect width="430" height="260" fill="url(#s8sky)" />
      <g className="c1" fill="#ffffff"><ellipse cx="96" cy="92" rx="30" ry="14" /><circle cx="80" cy="88" r="13" /><circle cx="110" cy="86" r="16" /></g>
      <path d="M0 208 Q 110 174 220 204 Q 330 232 430 200 V260 H0 Z" fill="#bfe9a6" />
      <path d="M0 226 Q 130 202 250 224 Q 350 244 430 224 V260 H0 Z" fill="#a6df8c" />
      <g fill="#8CDb6f">
        <path className="blade" d="M60 228 q -5 -22 2 -30 q 5 12 1 30 z" />
        <path className="blade bl2" d="M362 226 q 5 -24 -2 -32 q -5 14 0 32 z" />
      </g>
      <g className="rig">
        <path d="M248 118 Q 270 164 300 216" stroke="#c9b58a" strokeWidth="1.5" fill="none" />
        <g className="kite">
          <path d="M248 84 L270 118 L248 152 L226 118 Z" fill="#ff7aa8" />
          <path d="M248 84 L248 152 M226 118 L270 118" stroke="#e0568a" strokeWidth="1.5" />
        </g>
        <g className="tail">
          <path d="M248 152 q 7 12 -3 18 q -10 6 -3 18 q 7 12 -3 18" fill="none" stroke="#cbb98f" strokeWidth="1.5" />
          <path d="M239 164 l6 6 l6 -6 l-6 -6 z" fill="#7ac2ff" />
          <path d="M239 182 l6 6 l6 -6 l-6 -6 z" fill="#b8a4ff" />
          <path d="M239 200 l6 6 l6 -6 l-6 -6 z" fill="#ffd45e" />
        </g>
      </g>
    </svg>
  )
}
