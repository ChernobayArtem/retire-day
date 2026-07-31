// День 14 — подарочная коробка
export default function Day14() {
  return (
    <svg className="scn s14" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s14 .lid{transform-box:fill-box;transform-origin:50% 100%;animation:s14lid 9s ease-in-out infinite}
        .s14 .bow{transform-box:fill-box;transform-origin:50% 100%;animation:s14bow 9s ease-in-out infinite}
        .s14 .spark{transform-box:fill-box;transform-origin:center;animation:s14spark 9s ease-in-out infinite}
        .s14 .glow{transform-box:fill-box;transform-origin:center;animation:s14glow 9s ease-in-out infinite}
        .s14 .k2{animation-delay:-0.4s}
        .s14 .k3{animation-delay:-0.8s}
        .s14 .k4{animation-delay:-1.2s}
        @keyframes s14lid{0%,20%{transform:translateY(0) rotate(0)}42%,64%{transform:translateY(-9px) rotate(-2deg)}86%,100%{transform:translateY(0) rotate(0)}}
        @keyframes s14bow{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s14spark{0%,24%{transform:translateY(0) scale(.2);opacity:0}40%{opacity:1}58%{transform:translateY(-30px) scale(1)}70%{opacity:0}100%{opacity:0}}
        @keyframes s14glow{0%,22%,100%{opacity:0;transform:scale(.7)}42%,62%{opacity:.48;transform:scale(1.12)}}
      `}</style>
      <ellipse cx="215" cy="238" rx="120" ry="12" fill="#f3e7ef" />
      <ellipse className="glow" cx="215" cy="164" rx="54" ry="24" fill="#fff0a6" />
      {/* искры/звёздочки */}
      <g fill="#ffd45e">
        <circle className="spark k1" cx="196" cy="150" r="4" />
        <circle className="spark k3" cx="234" cy="150" r="4" fill="#ff9ec4" />
        <path className="spark k2" d="M215 140 l3 5 5 1 -5 3 -3 5 -3 -5 -5 -3 5 -1 z" />
        <circle className="spark k4" cx="215" cy="150" r="3.5" fill="#b8a4ff" />
        <path className="spark k3" d="M183 150 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#7ac2ff" />
        <path className="spark k1" d="M246 148 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#ff9ec4" />
      </g>
      {/* коробка */}
      <rect x="168" y="176" width="94" height="58" rx="6" fill="#ff8fae" />
      <rect x="207" y="176" width="16" height="58" fill="#ffd45e" />
      {/* крышка */}
      <g className="lid">
        <rect x="160" y="158" width="110" height="22" rx="6" fill="#ff7aa0" />
        <rect x="207" y="158" width="16" height="22" fill="#ffd45e" />
        <g className="bow">
          <path d="M215 158 C 198 140 186 156 204 158 Z" fill="#ffd45e" />
          <path d="M215 158 C 232 140 244 156 226 158 Z" fill="#ffd45e" />
          <circle cx="215" cy="157" r="5" fill="#ffe08a" />
        </g>
      </g>
    </svg>
  )
}
