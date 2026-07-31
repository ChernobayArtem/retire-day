// День 4 — бумажный самолётик
export default function Day4() {
  return (
    <svg className="scn s4" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s4 .plane{transform-box:fill-box;transform-origin:center;animation:s4fly 9s ease-in-out infinite}
        .s4 .trail{animation:s4trail 9s ease-in-out infinite}
        .s4 .c1{animation:s4cl 16s ease-in-out infinite}
        .s4 .c2{animation:s4cr 20s ease-in-out infinite}
        @keyframes s4fly{0%{transform:translate(78px,154px) rotate(-5deg);opacity:.35}6%{opacity:1}28%{transform:translate(142px,112px) rotate(4deg)}52%{transform:translate(218px,145px) rotate(-3deg)}76%{transform:translate(292px,105px) rotate(4deg)}94%{opacity:1}100%{transform:translate(340px,132px) rotate(-4deg);opacity:.25}}
        @keyframes s4trail{0%,4%,100%{opacity:0;stroke-dashoffset:32}18%,82%{opacity:.65}94%{opacity:0;stroke-dashoffset:-24}}
        @keyframes s4cl{0%,100%{transform:translateX(-16px)}50%{transform:translateX(16px)}}
        @keyframes s4cr{0%,100%{transform:translateX(14px)}50%{transform:translateX(-14px)}}
      `}</style>
      <defs>
        <linearGradient id="s4sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6ecff" />
        </linearGradient>
      </defs>
      <rect width="430" height="260" fill="url(#s4sky)" />
      <g className="c1" fill="#ffffff">
        <ellipse cx="90" cy="150" rx="34" ry="18" />
        <circle cx="72" cy="146" r="16" />
        <circle cx="104" cy="142" r="20" />
      </g>
      <g className="c2" fill="#eef6ff">
        <ellipse cx="320" cy="198" rx="40" ry="20" />
        <circle cx="300" cy="192" r="18" />
        <circle cx="336" cy="190" r="22" />
      </g>
      <g className="plane">
        <polyline className="trail" points="-58,11 -7,11" stroke="#a9cbe5" strokeWidth="2" strokeDasharray="4 5" fill="none" />
        <path d="M0 0 L42 11 L0 23 L11 11 Z" fill="#ffffff" stroke="#bfd7e9" strokeWidth="1.4" />
        <path d="M0 0 L9 11 L0 22 Z" fill="#e9f2fb" />
        <path d="M10 11 L35 11" stroke="#d6e5f1" strokeWidth="1.2" />
      </g>
    </svg>
  )
}
