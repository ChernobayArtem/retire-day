// День 3 — посылка с парашютом
export default function Day3() {
  return (
    <svg
      className="scn s3"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s3 .drop{transform-box:fill-box;transform-origin:50% 0%;animation:s3drop 11s ease-in-out infinite}
        .s3 .box{transform-box:fill-box;transform-origin:50% 100%;animation:s3rock 4s ease-in-out infinite}
        .s3 .chute{transform-box:fill-box;transform-origin:50% 100%;animation:s3rock 4s ease-in-out infinite}
        .s3 .dust{transform-box:fill-box;transform-origin:50% 100%;animation:s3dust 11s ease-in-out infinite}
        .s3 .shadow{transform-box:fill-box;transform-origin:center;animation:s3shadow 11s ease-in-out infinite}
        .s3 .cloud{animation:s3cloud 14s ease-in-out infinite}
        @keyframes s3drop{0%{transform:translateY(-74px);opacity:.2}8%{opacity:1}56%{transform:translateY(0)}84%{transform:translateY(0);opacity:1}100%{transform:translateY(-20px);opacity:0}}
        @keyframes s3rock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s3dust{0%,53%{opacity:0;transform:scale(.3)}60%{opacity:.6;transform:scale(1)}74%{opacity:0;transform:scale(1.5)}100%{opacity:0}}
        @keyframes s3shadow{0%{transform:scale(.35);opacity:.15}52%{transform:scale(.7);opacity:.3}62%,86%{transform:scale(1);opacity:.45}100%{transform:scale(.5);opacity:0}}
        @keyframes s3cloud{0%,100%{transform:translateX(-10px)}50%{transform:translateX(12px)}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-blue-0)" />
      <g className="cloud" fill="var(--color-alias-illustration-blue-83)">
        <ellipse cx="312" cy="78" rx="30" ry="12" />
        <circle cx="296" cy="75" r="12" />
        <circle cx="327" cy="73" r="15" />
      </g>
      <path
        d="M0 150 L44 160 L92 150 L150 162 L215 150 L280 162 L340 150 L392 162 L430 152 V260 H0 Z"
        fill="var(--color-alias-illustration-green-154)"
      />
      <ellipse
        className="shadow"
        cx="215"
        cy="164"
        rx="34"
        ry="7"
        fill="var(--color-alias-illustration-green-821)"
      />
      <g className="dust" fill="var(--color-alias-illustration-purple-500)">
        <circle cx="196" cy="160" r="5" />
        <circle cx="234" cy="160" r="6" />
        <circle cx="215" cy="163" r="7" />
      </g>
      <g className="drop">
        <g className="chute">
          <path
            d="M177 92 A 38 38 0 0 1 253 92 Q 234 79 215 89 Q 196 79 177 92 Z"
            fill="var(--color-alias-illustration-indigo-250)"
          />
          <path
            d="M177 92 Q 196 82 215 88 Q 234 82 253 92"
            fill="none"
            stroke="var(--color-alias-illustration-indigo-750)"
            strokeWidth="2"
          />
          <line
            x1="183"
            y1="91"
            x2="198"
            y2="126"
            stroke="var(--color-alias-illustration-indigo-0)"
            strokeWidth="1.8"
          />
          <line
            x1="215"
            y1="88"
            x2="215"
            y2="126"
            stroke="var(--color-alias-illustration-indigo-0)"
            strokeWidth="1.8"
          />
          <line
            x1="247"
            y1="91"
            x2="232"
            y2="126"
            stroke="var(--color-alias-illustration-indigo-0)"
            strokeWidth="1.8"
          />
        </g>
        <g className="box">
          <rect
            x="193"
            y="126"
            width="44"
            height="30"
            rx="6"
            fill="var(--color-alias-illustration-orange-789)"
          />
          <rect
            x="193"
            y="126"
            width="44"
            height="10"
            rx="5"
            fill="var(--color-alias-illustration-orange-509)"
          />
          <rect
            x="211"
            y="126"
            width="8"
            height="30"
            fill="var(--color-alias-illustration-orange-860)"
          />
          <path
            d="M211 126 q -11 -10 -16 0 q 8 5 20 4 q 12 1 20 -4 q -5 -10 -16 0"
            fill="var(--color-alias-illustration-orange-263)"
          />
        </g>
      </g>
    </svg>
  )
}
