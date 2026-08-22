// День 17 — воздушные шарики
function Balloon({ cx, cy, color, cls }: { cx: number; cy: number; color: string; cls: string }) {
  return (
    <g className={'balloon ' + cls}>
      <path
        d={`M210 236 Q ${(cx + 210) / 2 + 8} ${(cy + 236) / 2} ${cx} ${cy + 26}`}
        stroke="var(--color-alias-illustration-brown-333)"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse cx={cx} cy={cy} rx="20" ry="24" fill={color} />
      <path d={`M${cx - 4} ${cy + 23} l4 6 4 -6 z`} fill={color} />
      <ellipse
        cx={cx - 6}
        cy={cy - 8}
        rx="5"
        ry="7"
        fill="var(--color-alias-illustration-neutral-0)"
        opacity="0.5"
      />
    </g>
  )
}

export default function Day17() {
  return (
    <svg
      className="scn s17"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s17 .balloon{transform-box:fill-box;transform-origin:50% 100%;animation:s17sway 8s ease-in-out infinite}
        .s17 .b2{animation-delay:-2s}.s17 .b3{animation-delay:-4s}
        .s17 .b4{animation:s17lift 9s ease-in-out infinite}
        .s17 .cloud{animation:s17cloud 16s ease-in-out infinite}
        .s17 .weight{transform-box:fill-box;transform-origin:center;animation:s17weight 8s ease-in-out infinite}
        @keyframes s17sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s17lift{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes s17cloud{0%,100%{transform:translateX(-12px)}50%{transform:translateX(14px)}}
        @keyframes s17weight{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-green-0)" />
      <g className="cloud" fill="var(--color-alias-illustration-neutral-0)" opacity=".8">
        <ellipse cx="306" cy="86" rx="28" ry="10" />
        <circle cx="291" cy="83" r="10" />
        <circle cx="320" cy="81" r="13" />
      </g>
      <path
        d="M0 240 Q 215 232 430 240 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-green-179)"
      />
      <Balloon cx={168} cy={124} color="var(--color-alias-illustration-rose-419)" cls="b1" />
      <Balloon cx={252} cy={128} color="var(--color-alias-illustration-blue-569)" cls="b2" />
      <Balloon cx={210} cy={104} color="var(--color-alias-illustration-orange-281)" cls="b3" />
      <Balloon cx={198} cy={152} color="var(--color-alias-illustration-indigo-250)" cls="b4" />
      <g className="weight">
        <ellipse
          cx="210"
          cy="238"
          rx="16"
          ry="7"
          fill="var(--color-alias-illustration-orange-807)"
        />
        <circle cx="210" cy="234" r="4" fill="var(--color-alias-illustration-brown-556)" />
      </g>
    </svg>
  )
}
