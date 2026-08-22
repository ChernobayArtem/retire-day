// День 16 — гамак между деревьями
export default function Day16() {
  return (
    <svg
      className="scn s16"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s16 .cloth{transform-box:fill-box;transform-origin:50% 0%;animation:s16swing 8s ease-in-out infinite}
        .s16 .crown{transform-box:fill-box;transform-origin:50% 100%;animation:s16crown 9s ease-in-out infinite}
        .s16 .cr2{animation-delay:-3s}
        .s16 .leaf{transform-box:fill-box;transform-origin:center;animation:s16leaf 9s linear infinite}
        .s16 .leaf2{animation-delay:-4.5s}
        @keyframes s16swing{0%,100%{transform:translateY(0) rotate(1.4deg)}50%{transform:translateY(3px) rotate(-1.4deg)}}
        @keyframes s16crown{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes s16leaf{0%{transform:translate(0,0) rotate(0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translate(150px,44px) rotate(220deg);opacity:0}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-green-103)" />
      <path
        d="M0 236 Q 215 226 430 236 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-green-179)"
      />
      {/* стволы */}
      <rect
        x="94"
        y="120"
        width="10"
        height="118"
        rx="4"
        fill="var(--color-alias-illustration-orange-965)"
      />
      <rect
        x="326"
        y="120"
        width="10"
        height="118"
        rx="4"
        fill="var(--color-alias-illustration-orange-965)"
      />
      {/* кроны */}
      <g className="crown">
        <g fill="var(--color-alias-illustration-green-513)">
          <circle cx="99" cy="112" r="26" />
          <circle cx="78" cy="120" r="18" />
          <circle cx="120" cy="120" r="18" />
        </g>
      </g>
      <g className="crown cr2">
        <g fill="var(--color-alias-illustration-green-872)">
          <circle cx="331" cy="112" r="26" />
          <circle cx="310" cy="120" r="18" />
          <circle cx="352" cy="120" r="18" />
        </g>
      </g>
      {/* гамак */}
      <g>
        <path
          d="M104 150 Q 132 154 160 176"
          stroke="var(--color-alias-illustration-orange-895)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M326 150 Q 298 154 270 176"
          stroke="var(--color-alias-illustration-orange-895)"
          strokeWidth="2"
          fill="none"
        />
        <g className="cloth">
          <path
            d="M160 176 Q 215 214 270 176 L270 186 Q 215 226 160 186 Z"
            fill="var(--color-alias-illustration-rose-419)"
          />
          <path
            d="M160 181 Q 215 220 270 181"
            stroke="var(--color-alias-illustration-orange-263)"
            strokeWidth="3"
            fill="none"
          />
        </g>
      </g>
      <path
        className="leaf"
        d="M150 130 C 138 126 132 134 138 142 C 148 142 154 137 150 130 Z"
        fill="var(--color-alias-illustration-green-462)"
      />
      <path
        className="leaf leaf2"
        d="M276 110 C 264 106 258 114 264 122 C 274 122 280 117 276 110 Z"
        fill="var(--color-alias-illustration-green-641)"
      />
    </svg>
  )
}
