// День 21 — звёздное небо
function Star({ x, y, r, delay }: { x: number; y: number; r: number; delay: string }) {
  return (
    <path
      className="star"
      d={`M${x} ${y - r} l ${r * 0.3} ${r * 0.7} ${r * 0.7} ${r * 0.3} -${r * 0.7} ${r * 0.3} -${r * 0.3} ${r * 0.7} -${r * 0.3} -${r * 0.7} -${r * 0.7} -${r * 0.3} ${r * 0.7} -${r * 0.3} z`}
      fill="#fdfbe6"
      style={{ animationDelay: delay }}
    />
  )
}

export default function Day21() {
  return (
    <svg className="scn s21" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s21 .star{transform-box:fill-box;transform-origin:center;animation:s21tw 5s ease-in-out infinite}
        .s21 .shoot{transform-box:fill-box;transform-origin:center;animation:s21shoot 11s ease-in infinite}
        .s21 .cloud{transform-box:fill-box;transform-origin:center;animation:s21cloud 20s ease-in-out infinite}
        .s21 .moon{transform-box:fill-box;transform-origin:center;animation:s21moon 9s ease-in-out infinite}
        @keyframes s21tw{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:1;transform:scale(1)}}
        @keyframes s21shoot{0%,76%,100%{opacity:0;transform:translate(0,0)}80%{opacity:1;transform:translate(0,0)}94%{opacity:0;transform:translate(90px,42px)}}
        @keyframes s21cloud{0%,100%{transform:translateX(-12px)}50%{transform:translateX(12px)}}
        @keyframes s21moon{0%,100%{opacity:.72;transform:translateY(0)}50%{opacity:.95;transform:translateY(-2px)}}
      `}</style>
      <defs><linearGradient id="s21sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c3cfe8" /><stop offset="0.6" stopColor="#5f6ea1" /><stop offset="1" stopColor="#3a487a" /></linearGradient></defs>
      <rect width="430" height="260" fill="url(#s21sky)" />
      <g className="moon"><circle cx="100" cy="70" r="22" fill="#fff5c7" /><circle cx="110" cy="63" r="22" fill="#a8b4d2" /></g>
      <g className="cloud" fill="#8f9cc4" opacity="0.5"><ellipse cx="130" cy="96" rx="30" ry="9" /><circle cx="150" cy="92" r="10" /></g>
      <Star x={110} y={90} r={12} delay="0s" />
      <Star x={190} y={64} r={9} delay="-1.2s" />
      <Star x={250} y={104} r={11} delay="-2.4s" />
      <Star x={300} y={72} r={8} delay="-0.6s" />
      <Star x={160} y={120} r={7} delay="-3s" />
      <g className="shoot">
        <line x1="250" y1="60" x2="278" y2="73" stroke="#fdfbe6" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="278" cy="73" r="3" fill="#fdfbe6" />
      </g>
      <path d="M0 218 Q 120 196 240 214 Q 340 228 430 210 L430 260 L0 260 Z" fill="#2c3760" />
    </svg>
  )
}
