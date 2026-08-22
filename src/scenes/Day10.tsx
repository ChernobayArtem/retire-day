// День 10 — улитка идёт к финишу
export default function Day10() {
  return (
    <svg
      className="scn s10"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s10 .snail{animation:s10move 12s ease-in-out infinite}
        .s10 .trail{animation:s10trail 12s ease-in-out infinite}
        .s10 .body{transform-box:fill-box;transform-origin:0% 100%;animation:s10squash 1.7s ease-in-out infinite}
        .s10 .eye{transform-box:fill-box;transform-origin:50% 100%;animation:s10eye 3s ease-in-out infinite}
        .s10 .blade{transform-box:fill-box;transform-origin:50% 100%;animation:s10blade 6s ease-in-out infinite}
        .s10 .bl2{animation-delay:-3s}
        @keyframes s10move{0%{transform:translateX(68px);opacity:.35}6%{opacity:1}88%{transform:translateX(236px);opacity:1}96%,100%{transform:translateX(264px);opacity:0}}
        @keyframes s10trail{0%,100%{opacity:.15}50%{opacity:.55}}
        @keyframes s10squash{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.07)}}
        @keyframes s10eye{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        @keyframes s10blade{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
      `}</style>
      <path
        d="M0 158 L40 168 L86 158 L140 170 L200 158 L260 168 L320 158 L380 170 L430 160 V260 H0 Z"
        fill="var(--color-alias-illustration-green-231)"
      />
      <g>
        <line
          x1="330"
          y1="130"
          x2="330"
          y2="180"
          stroke="var(--color-alias-illustration-brown-889)"
          strokeWidth="3"
        />
        <path d="M330 132 l24 8 l-24 8 z" fill="var(--color-alias-illustration-rose-613)" />
      </g>
      <g fill="var(--color-alias-illustration-green-513)">
        <path className="blade" d="M120 210 q -5 -22 2 -30 q 5 12 1 30 z" />
        <path className="blade bl2" d="M300 208 q 5 -24 -2 -32 q -5 14 0 32 z" />
      </g>
      <g className="snail">
        <line
          className="trail"
          x1="-12"
          y1="196"
          x2="30"
          y2="196"
          stroke="var(--color-alias-illustration-green-128)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="3 6"
        />
        <g
          className="eye"
          stroke="var(--color-alias-illustration-mauve-563)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="56" y1="184" x2="60" y2="166" />
          <line x1="50" y1="185" x2="46" y2="168" />
        </g>
        <circle cx="60" cy="165" r="2.6" fill="var(--color-alias-illustration-mauve-563)" />
        <circle cx="46" cy="167" r="2.6" fill="var(--color-alias-illustration-mauve-563)" />
        <g className="body">
          <path
            d="M14 196 Q 12 182 30 181 L 46 182 Q 62 184 60 192 Q 60 196 54 196 Z"
            fill="var(--color-alias-illustration-orange-368)"
          />
        </g>
        <circle cx="33" cy="178" r="15" fill="var(--color-alias-illustration-orange-825)" />
        <circle cx="33" cy="178" r="9" fill="var(--color-alias-illustration-orange-491)" />
        <path
          d="M33 178 a 6 6 0 1 0 5 3"
          fill="none"
          stroke="var(--color-alias-illustration-orange-947)"
          strokeWidth="2.5"
        />
        <path
          d="M53 188 q 5 4 9 0"
          fill="none"
          stroke="var(--color-alias-illustration-orange-982)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
