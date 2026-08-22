// День 19 — кот в траве (вид со спины)
export default function Day19() {
  return (
    <svg
      className="scn s19"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s19 .tail{transform-box:fill-box;transform-origin:0% 100%;animation:s19tail 6s ease-in-out infinite}
        .s19 .head{transform-box:fill-box;transform-origin:50% 100%;animation:s19head 12s ease-in-out infinite}
        .s19 .ear{transform-box:fill-box;transform-origin:50% 100%;animation:s19ear 7s ease-in-out infinite}
        .s19 .earR{animation-delay:-0.15s}
        .s19 .blade{transform-box:fill-box;transform-origin:50% 100%;animation:s19blade 5s ease-in-out infinite}
        .s19 .bl2{animation-delay:-1.6s}.s19 .bl3{animation-delay:-3.1s}.s19 .bl4{animation-delay:-2.2s}
        .s19 .fly{transform-box:fill-box;transform-origin:center;animation:s19fly 11s linear infinite}
        .s19 .wing{transform-box:fill-box;transform-origin:100% 50%;animation:s19wing .5s ease-in-out infinite}
        @keyframes s19tail{0%,100%{transform:rotate(14deg)}50%{transform:rotate(-10deg)}}
        @keyframes s19head{0%,72%,100%{transform:rotate(0)}82%,90%{transform:rotate(-7deg)}}
        @keyframes s19ear{0%,40%,100%{transform:rotate(0)}46%{transform:rotate(-9deg)}52%{transform:rotate(0)}}
        @keyframes s19blade{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes s19fly{0%{transform:translate(34px,12px);opacity:0}12%{opacity:1}48%{transform:translate(118px,-18px)}88%{opacity:1}100%{transform:translate(220px,-30px);opacity:0}}
        @keyframes s19wing{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.4)}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-green-26)" />
      <path
        d="M0 232 Q 215 222 430 232 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-green-205)"
      />
      {/* хвост */}
      <path
        className="tail"
        d="M258 224 Q 300 214 296 178 Q 294 164 282 168 Q 292 176 284 196 Q 276 214 254 214 Z"
        fill="var(--color-alias-illustration-blue-667)"
      />
      {/* кот */}
      <g className="head">
        <path
          d="M172 232 Q 168 168 215 168 Q 262 168 258 232 Z"
          fill="var(--color-alias-illustration-blue-639)"
        />
        <g className="ear">
          <path d="M182 176 L176 150 L200 166 Z" fill="var(--color-alias-illustration-blue-639)" />
          <path d="M186 170 L184 158 L195 166 Z" fill="var(--color-alias-illustration-red-125)" />
        </g>
        <g className="ear earR">
          <path d="M248 176 L254 150 L230 166 Z" fill="var(--color-alias-illustration-blue-639)" />
          <path d="M244 170 L246 158 L235 166 Z" fill="var(--color-alias-illustration-red-125)" />
        </g>
        <path
          d="M215 168 L215 214"
          stroke="var(--color-alias-illustration-blue-736)"
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
      {/* трава спереди */}
      <g fill="var(--color-alias-illustration-green-513)">
        <path className="blade" d="M120 232 q -6 -34 3 -44 q 6 18 2 44 z" />
        <path className="blade bl2" d="M160 232 q 6 -30 -3 -40 q -6 16 0 40 z" />
        <path className="blade bl3" d="M270 232 q -6 -32 3 -42 q 6 16 2 42 z" />
        <path className="blade bl4" d="M310 232 q 6 -30 -3 -40 q -6 16 0 40 z" />
      </g>
      <g fill="var(--color-alias-illustration-orange-263)" opacity=".9">
        <circle cx="134" cy="210" r="4" />
        <circle cx="296" cy="216" r="3.5" />
      </g>
      {/* бабочка */}
      <g className="fly">
        <g className="wing">
          <ellipse cx="96" cy="150" rx="9" ry="6" fill="var(--color-alias-illustration-rose-419)" />
        </g>
        <ellipse cx="105" cy="150" rx="9" ry="6" fill="var(--color-alias-illustration-rose-323)" />
        <circle cx="101" cy="150" r="2.4" fill="var(--color-alias-illustration-mauve-438)" />
      </g>
    </svg>
  )
}
