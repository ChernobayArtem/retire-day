// День 13 — лейка и росток
export default function Day13() {
  return (
    <svg
      className="scn s13"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s13 .can{transform-box:fill-box;transform-origin:50% 100%;animation:s13pour 10s ease-in-out infinite}
        .s13 .sprout{transform-box:fill-box;transform-origin:50% 100%;animation:s13grow 10s ease-in-out infinite}
        .s13 .leafL{transform-box:fill-box;transform-origin:100% 100%;animation:s13leafL 10s ease-in-out infinite}
        .s13 .leafR{transform-box:fill-box;transform-origin:0% 100%;animation:s13leafR 10s ease-in-out infinite}
        .s13 .drop{transform-box:fill-box;animation:s13drop 10s ease-in infinite}
        .s13 .d2{animation-delay:-.35s}
        .s13 .d3{animation-delay:-.7s}
        .s13 .soilring{transform-box:fill-box;transform-origin:center;animation:s13soil 10s ease-out infinite}
        @keyframes s13pour{0%,14%{transform:rotate(0)}38%,68%{transform:rotate(-8deg)}90%,100%{transform:rotate(0)}}
        @keyframes s13grow{0%{transform:scaleY(.82)}40%{transform:scaleY(1)}84%{transform:scaleY(1)}100%{transform:scaleY(.82)}}
        @keyframes s13leafL{0%,100%{transform:rotate(6deg)}45%,84%{transform:rotate(-4deg)}}
        @keyframes s13leafR{0%,100%{transform:rotate(-6deg)}45%,84%{transform:rotate(4deg)}}
        @keyframes s13drop{0%,29%{transform:translate(0,0);opacity:0}34%{opacity:.9}54%{transform:translate(6px,64px);opacity:0}100%{opacity:0}}
        @keyframes s13soil{0%,44%,100%{transform:scale(.3);opacity:0}54%{opacity:.5}70%{transform:scale(1.2);opacity:0}}
      `}</style>
      <ellipse
        cx="215"
        cy="234"
        rx="128"
        ry="16"
        fill="var(--color-alias-illustration-orange-421)"
      />
      <ellipse
        cx="215"
        cy="230"
        rx="96"
        ry="11"
        fill="var(--color-alias-illustration-orange-614)"
      />
      <ellipse
        className="soilring"
        cx="208"
        cy="231"
        rx="22"
        ry="5"
        fill="none"
        stroke="var(--color-alias-illustration-orange-877)"
        strokeWidth="1.5"
      />
      {/* росток */}
      <g className="sprout">
        <path
          d="M208 232 L208 190"
          stroke="var(--color-alias-illustration-green-923)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <g className="leafL">
          <path
            d="M208 200 C 190 196 182 204 186 214 C 200 214 208 208 208 200 Z"
            fill="var(--color-alias-illustration-green-513)"
          />
        </g>
        <g className="leafR">
          <path
            d="M208 194 C 226 188 236 196 232 206 C 218 208 208 202 208 194 Z"
            fill="var(--color-alias-illustration-green-872)"
          />
        </g>
      </g>
      {/* капли */}
      <g fill="var(--color-alias-illustration-blue-569)">
        <ellipse className="drop d1" cx="192" cy="158" rx="3" ry="4.5" />
        <ellipse className="drop d2" cx="196" cy="158" rx="3" ry="4.5" />
        <ellipse className="drop d3" cx="188" cy="158" rx="3" ry="4.5" />
      </g>
      {/* лейка */}
      <g className="can">
        <path
          d="M108 148 Q 124 128 140 148"
          fill="none"
          stroke="var(--color-alias-illustration-orange-667)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M96 150 L152 150 L146 192 Q 124 200 102 192 Z"
          fill="var(--color-alias-illustration-orange-667)"
        />
        <ellipse
          cx="124"
          cy="150"
          rx="28"
          ry="6"
          fill="var(--color-alias-illustration-orange-456)"
        />
        <path
          d="M150 158 L188 146 L192 154 L154 170 Z"
          fill="var(--color-alias-illustration-orange-667)"
        />
        <ellipse
          cx="189"
          cy="150"
          rx="5"
          ry="7"
          fill="var(--color-alias-illustration-orange-456)"
          transform="rotate(-18 189 150)"
        />
      </g>
    </svg>
  )
}
