// День 27 — ракета готовится к старту
export default function Day27() {
  return (
    <svg className="scn s27" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s27 .rocket{transform-box:fill-box;transform-origin:50% 100%;animation:s27bob 8s ease-in-out infinite}
        .s27 .glow{transform-box:fill-box;transform-origin:center;animation:s27glow 8s ease-in-out infinite}
        .s27 .steam{transform-box:fill-box;transform-origin:center;animation:s27steam 4s ease-out infinite}
        .s27 .stR{animation-delay:-2s}
        .s27 .flame{transform-box:fill-box;transform-origin:50% 0%;animation:s27flame 1.4s ease-in-out infinite}
        .s27 .ring{transform-box:fill-box;transform-origin:center;animation:s27ring 8s ease-out infinite}
        @keyframes s27bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-7px) rotate(1.5deg)}}
        @keyframes s27glow{0%,100%{opacity:.35;transform:scaleX(.85)}50%{opacity:.8;transform:scaleX(1.1)}}
        @keyframes s27steam{0%{transform:translate(0,0) scale(.4);opacity:0}30%{opacity:.7}100%{transform:translate(var(--sx,-24px),6px) scale(1.3);opacity:0}}
        @keyframes s27flame{0%,100%{transform:scaleY(.7);opacity:.45}50%{transform:scaleY(1);opacity:.8}}
        @keyframes s27ring{0%,35%,100%{transform:scale(.4);opacity:0}50%{opacity:.35}72%{transform:scale(1.35);opacity:0}}
      `}</style>
      <rect width="430" height="260" fill="#eef4fb" />
      <path d="M0 236 Q 215 226 430 236 L430 260 L0 260 Z" fill="#d6e2ef" />
      {/* стартовая площадка */}
      <rect x="168" y="228" width="94" height="8" rx="3" fill="#9aa6b6" />
      <rect x="176" y="236" width="8" height="16" fill="#9aa6b6" />
      <rect x="246" y="236" width="8" height="16" fill="#9aa6b6" />
      {/* свечение */}
      <ellipse className="glow" cx="215" cy="230" rx="34" ry="9" fill="#ffcf7a" />
      <ellipse className="ring" cx="215" cy="232" rx="42" ry="9" fill="none" stroke="#c7d5e3" strokeWidth="2" />
      {/* пар */}
      <g fill="#ffffff">
        <circle className="steam" style={{ ['--sx' as string]: '-30px' }} cx="188" cy="226" r="7" />
        <circle className="steam stR" style={{ ['--sx' as string]: '30px' }} cx="242" cy="226" r="7" />
      </g>
      {/* ракета */}
      <g className="rocket">
        <path d="M215 132 Q 236 158 232 196 L198 196 Q 194 158 215 132 Z" fill="#f7f2ec" />
        <path d="M215 132 Q 226 148 224 166 L206 166 Q 204 148 215 132 Z" fill="#ff7a7a" />
        <circle cx="215" cy="176" r="7" fill="#7ac2ff" stroke="#cfe6f5" strokeWidth="2" />
        <path d="M198 196 Q 182 200 186 224 L200 214 Z" fill="#ff9e7a" />
        <path d="M232 196 Q 248 200 244 224 L230 214 Z" fill="#ff9e7a" />
        <rect x="200" y="196" width="30" height="6" rx="2" fill="#e6ddd2" />
        <path className="flame" d="M207 202 Q 215 224 223 202 Z" fill="#ffd45e" opacity=".7" />
      </g>
    </svg>
  )
}
