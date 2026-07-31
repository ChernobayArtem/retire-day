// День 20 — ветряная мельница
function Sail() {
  return (
    <g>
      <rect x="-4" y="-58" width="8" height="52" rx="3" fill="#f6efe2" stroke="#c9a878" strokeWidth="2" />
      <line x1="0" y1="-56" x2="0" y2="-8" stroke="#c9a878" strokeWidth="1.5" />
    </g>
  )
}

export default function Day20() {
  return (
    <svg className="scn s20" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s20 .sails{transform-box:view-box;transform-origin:215px 148px;animation:s20spin 14s linear infinite}
        .s20 .cloud{transform-box:fill-box;transform-origin:center;animation:s20cloud 18s ease-in-out infinite}
        .s20 .c2{animation-duration:22s;animation-delay:-6s}
        .s20 .blade{transform-box:fill-box;transform-origin:50% 100%;animation:s20blade 5s ease-in-out infinite}
        .s20 .bl2{animation-delay:-2s}
        .s20 .flower{transform-box:fill-box;transform-origin:50% 100%;animation:s20flower 8s ease-in-out infinite}
        .s20 .wind{animation:s20wind 8s ease-in-out infinite}
        @keyframes s20spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes s20cloud{0%,100%{transform:translateX(-16px)}50%{transform:translateX(16px)}}
        @keyframes s20blade{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes s20flower{0%,60%,100%{transform:rotate(-6deg)}80%{transform:rotate(6deg)}}
        @keyframes s20wind{0%,100%{stroke-dashoffset:20;opacity:.18}50%{stroke-dashoffset:-24;opacity:.5}}
      `}</style>
      <rect width="430" height="260" fill="#eef7fb" />
      <g className="cloud c1" fill="#ffffff"><ellipse cx="300" cy="70" rx="26" ry="11" /><circle cx="286" cy="66" r="11" /><circle cx="312" cy="64" r="13" /></g>
      <g className="cloud c2" fill="#ffffff"><ellipse cx="110" cy="98" rx="22" ry="9" /><circle cx="98" cy="94" r="9" /><circle cx="122" cy="93" r="11" /></g>
      <g className="wind" fill="none" stroke="#b7d5df" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round">
        <path d="M92 136 Q 126 124 160 136" /><path d="M274 112 Q 308 100 342 112" />
      </g>
      <path d="M0 214 Q 215 188 430 214 L430 260 L0 260 Z" fill="#9fdc86" />
      {/* башня */}
      <path d="M198 232 L232 232 L224 150 L206 150 Z" fill="#e7d9c2" />
      <path d="M204 150 L226 150 L215 132 Z" fill="#ff8f6e" />
      <rect x="208" y="207" width="14" height="25" rx="5" fill="#b98b63" />
      <circle cx="219" cy="220" r="1.5" fill="#f6df9d" />
      {/* лопасти */}
      <g className="sails">
        <g transform="translate(215 148)">
          <g transform="rotate(0)"><Sail /></g>
          <g transform="rotate(90)"><Sail /></g>
          <g transform="rotate(180)"><Sail /></g>
          <g transform="rotate(270)"><Sail /></g>
        </g>
      </g>
      <circle cx="215" cy="148" r="6" fill="#c9823f" />
      {/* трава и цветок */}
      <g fill="#7fc86a">
        <path className="blade" d="M120 226 q -6 -26 3 -34 q 6 14 2 34 z" />
        <path className="blade bl2" d="M320 220 q 6 -26 -3 -34 q -6 14 0 34 z" />
      </g>
      <g className="flower">
        <line x1="150" y1="228" x2="150" y2="206" stroke="#6ab058" strokeWidth="3" />
        <g fill="#ff9ec4"><circle cx="150" cy="200" r="5" /><circle cx="144" cy="204" r="5" /><circle cx="156" cy="204" r="5" /><circle cx="146" cy="196" r="5" /><circle cx="154" cy="196" r="5" /></g>
        <circle cx="150" cy="200" r="3" fill="#ffd45e" />
      </g>
    </svg>
  )
}
