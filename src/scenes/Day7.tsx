// День 7 — чашка кофе
export default function Day7() {
  return (
    <svg className="scn s7" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s7 .cup{transform-box:fill-box;transform-origin:50% 100%;animation:s7bounce 8s ease-in-out infinite}
        .s7 .steam{transform-box:fill-box;transform-origin:50% 100%}
        .s7 .st1{animation:s7steam 4.2s ease-in-out infinite}
        .s7 .st2{animation:s7steam 4.2s ease-in-out infinite -1.4s}
        .s7 .st3{animation:s7steam 4.2s ease-in-out infinite -2.8s}
        .s7 .leaf{transform-box:fill-box;transform-origin:50% 100%;animation:s7leaf 6s ease-in-out infinite}
        .s7 .lf2{animation-duration:7s;animation-delay:-2s}
        .s7 .coffee{transform-box:fill-box;transform-origin:center;animation:s7coffee 5s ease-in-out infinite}
        .s7 .shine{animation:s7shine 5s ease-in-out infinite}
        @keyframes s7bounce{0%,84%,100%{transform:translateY(0)}90%{transform:translateY(-4px)}95%{transform:translateY(0)}}
        @keyframes s7steam{0%{transform:translateY(0) scaleY(.7);opacity:0}25%{opacity:.5}100%{transform:translateY(-46px) scaleY(1.15);opacity:0}}
        @keyframes s7leaf{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes s7coffee{0%,100%{transform:scaleX(.96)}50%{transform:scaleX(1.03)}}
        @keyframes s7shine{0%,100%{opacity:.15}50%{opacity:.55}}
      `}</style>
      <ellipse cx="215" cy="222" rx="150" ry="15" fill="var(--color-alias-illustration-orange-105)" />
      <ellipse cx="215" cy="218" rx="50" ry="8" fill="var(--color-alias-illustration-brown-111)" opacity=".55" />
      <g fill="none" stroke="var(--color-alias-illustration-brown-222)" strokeWidth="4" strokeLinecap="round">
        <path className="steam st1" d="M199 150 q -8 -11 0 -22 q 8 -11 0 -22" />
        <path className="steam st2" d="M215 146 q -8 -11 0 -22 q 8 -11 0 -22" />
        <path className="steam st3" d="M231 150 q -8 -11 0 -22 q 8 -11 0 -22" />
      </g>
      <g className="leaf"><path d="M150 216 C 132 206 132 193 150 191 C 158 201 158 211 150 216 Z" fill="var(--color-alias-illustration-green-872)" /></g>
      <g className="leaf lf2"><path d="M282 216 C 300 206 300 193 282 191 C 274 201 274 211 282 216 Z" fill="var(--color-alias-illustration-green-513)" /></g>
      <g className="cup">
        <path d="M244 178 q 22 0 20 22 q -2 16 -22 12" fill="none" stroke="var(--color-alias-illustration-orange-789)" strokeWidth="8" />
        <path d="M186 170 L244 170 L237 214 Q 215 222 193 214 Z" fill="var(--color-alias-illustration-orange-789)" />
        <ellipse className="coffee" cx="215" cy="170" rx="29" ry="8" fill="var(--color-alias-illustration-brown-1000)" />
        <path className="shine" d="M197 168 Q 207 164 217 167" fill="none" stroke="var(--color-alias-illustration-orange-912)" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="215" cy="170" rx="29" ry="8" fill="none" stroke="var(--color-alias-illustration-orange-509)" strokeWidth="3" />
      </g>
    </svg>
  )
}
