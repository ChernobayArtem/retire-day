// День 5 — бабочки над полянкой
function Bfly({ color }: { color: string }) {
  return (
    <g className="bfly">
      <path className="wingL" d="M0 0 C -18 -14 -22 6 -4 8 C -13 12 -15 22 0 14 Z" fill={color} />
      <path className="wingR" d="M0 0 C 18 -14 22 6 4 8 C 13 12 15 22 0 14 Z" fill={color} />
      <ellipse cx="0" cy="7" rx="2" ry="8" fill="var(--color-alias-illustration-mauve-625)" />
    </g>
  )
}

export default function Day5() {
  return (
    <svg
      className="scn s5"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s5 .fl{transform-box:fill-box;transform-origin:50% 100%}
        .s5 .a1{animation:s5sway 8s ease-in-out infinite}
        .s5 .a2{animation:s5sway 9s ease-in-out infinite -3s}
        .s5 .a3{animation:s5sway 8.5s ease-in-out infinite -5s}
        .s5 .bfly .wingL{transform-box:fill-box;transform-origin:100% 50%;animation:s5flap .9s ease-in-out infinite}
        .s5 .bfly .wingR{transform-box:fill-box;transform-origin:0% 50%;animation:s5flap .9s ease-in-out infinite}
        .s5 .b1{animation:s5m1 11s ease-in-out infinite}
        .s5 .b2{animation:s5m2 12s ease-in-out infinite -4s}
        .s5 .dot{animation:s5dot 5s ease-in-out infinite}
        @keyframes s5sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s5flap{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}
        @keyframes s5m1{0%,100%{transform:translate(96px,78px)}25%{transform:translate(142px,48px)}50%,62%{transform:translate(188px,104px)}78%{transform:translate(150px,62px)}}
        @keyframes s5m2{0%,100%{transform:translate(314px,66px)}30%{transform:translate(270px,102px)}60%{transform:translate(298px,50px)}}
        @keyframes s5dot{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:.8;transform:translateY(-8px)}}
      `}</style>
      <path
        d="M0 150 L40 160 L86 150 L140 162 L200 150 L260 160 L320 150 L380 162 L430 152 V260 H0 Z"
        fill="var(--color-alias-illustration-green-231)"
      />
      <g className="fl a1">
        <path d="M80 222 V148" stroke="var(--color-alias-illustration-green-872)" strokeWidth="4" />
        <circle cx="80" cy="143" r="15" fill="var(--color-alias-illustration-rose-419)" />
        <circle cx="80" cy="143" r="5" fill="var(--color-alias-illustration-orange-263)" />
      </g>
      <g className="fl a2">
        <path
          d="M215 226 V148"
          stroke="var(--color-alias-illustration-green-872)"
          strokeWidth="4"
        />
        <circle cx="215" cy="143" r="15" fill="var(--color-alias-illustration-orange-281)" />
        <circle cx="215" cy="143" r="5" fill="var(--color-alias-illustration-rose-419)" />
      </g>
      <g className="fl a3">
        <path
          d="M345 222 V148"
          stroke="var(--color-alias-illustration-green-872)"
          strokeWidth="4"
        />
        <circle cx="345" cy="143" r="15" fill="var(--color-alias-illustration-indigo-250)" />
        <circle cx="345" cy="143" r="5" fill="var(--color-alias-illustration-orange-263)" />
      </g>
      <g className="dot" fill="var(--color-alias-illustration-yellow-545)">
        <circle cx="130" cy="122" r="2" />
        <circle cx="286" cy="132" r="2.4" />
      </g>
      <g className="b1">
        <Bfly color="var(--color-alias-illustration-rose-613)" />
      </g>
      <g className="b2">
        <Bfly color="var(--color-alias-illustration-blue-569)" />
      </g>
    </svg>
  )
}
