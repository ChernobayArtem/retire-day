// День 26 — маленький поезд
function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g className="wheel">
      <circle cx={cx} cy={cy} r={r} fill="var(--color-alias-illustration-indigo-875)" />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="var(--color-alias-illustration-purple-0)" />
      <g stroke="var(--color-alias-illustration-purple-0)" strokeWidth="1.5">
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      </g>
    </g>
  )
}

export default function Day26() {
  return (
    <svg
      className="scn s26"
      viewBox="0 0 430 260"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .s26 .train{animation:s26move 12s linear infinite}
        .s26 .wheel{transform-box:fill-box;transform-origin:center;animation:s26spin 1.4s linear infinite}
        .s26 .car{transform-box:fill-box;transform-origin:50% 100%;animation:s26sway 2.6s ease-in-out infinite}
        .s26 .cr2{animation-delay:-0.6s}
        .s26 .puff{transform-box:fill-box;transform-origin:center;animation:s26puff 2.4s ease-out infinite}
        .s26 .p2{animation-delay:-0.8s}.s26 .p3{animation-delay:-1.6s}
        .s26 .cloud{animation:s26cloud 18s ease-in-out infinite}
        @keyframes s26move{0%{transform:translateX(70px);opacity:.25}5%{opacity:1}92%{transform:translateX(310px);opacity:1}100%{transform:translateX(370px);opacity:0}}
        @keyframes s26spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes s26sway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
        @keyframes s26puff{0%{transform:translate(0,0) scale(.5);opacity:0}25%{opacity:.85}100%{transform:translate(-18px,-40px) scale(1.3);opacity:0}}
        @keyframes s26cloud{0%,100%{transform:translateX(-14px)}50%{transform:translateX(16px)}}
      `}</style>
      <rect width="430" height="260" fill="var(--color-alias-illustration-green-51)" />
      <g className="cloud" fill="var(--color-alias-illustration-neutral-0)" opacity=".85">
        <ellipse cx="300" cy="92" rx="28" ry="11" />
        <circle cx="285" cy="89" r="11" />
        <circle cx="315" cy="87" r="13" />
      </g>
      <path
        d="M0 236 Q 120 214 250 226 Q 350 234 430 218 L430 260 L0 260 Z"
        fill="var(--color-alias-illustration-green-333)"
      />
      <line
        x1="0"
        y1="238"
        x2="430"
        y2="238"
        stroke="var(--color-alias-illustration-green-897)"
        strokeWidth="3"
      />
      <g stroke="var(--color-alias-illustration-brown-444)" strokeWidth="2" opacity=".55">
        {[40, 90, 140, 190, 240, 290, 340, 390].map((x) => (
          <line key={x} x1={x} y1="234" x2={x + 8} y2="243" />
        ))}
      </g>
      <g className="train">
        {/* пар */}
        <g fill="var(--color-alias-illustration-neutral-0)">
          <circle className="puff p1" cx="62" cy="176" r="6" />
          <circle className="puff p2" cx="62" cy="176" r="7" />
          <circle className="puff p3" cx="62" cy="176" r="5" />
        </g>
        {/* вагон */}
        <g className="car cr2">
          <rect
            x="-20"
            y="198"
            width="34"
            height="20"
            rx="4"
            fill="var(--color-alias-illustration-blue-569)"
          />
          <rect
            x="-14"
            y="202"
            width="10"
            height="8"
            rx="1.5"
            fill="var(--color-alias-illustration-blue-69)"
          />
          <rect
            x="0"
            y="202"
            width="10"
            height="8"
            rx="1.5"
            fill="var(--color-alias-illustration-blue-69)"
          />
        </g>
        <Wheel cx={-10} cy={220} r={6} />
        <Wheel cx={6} cy={220} r={6} />
        <line
          x1="14"
          y1="214"
          x2="20"
          y2="214"
          stroke="var(--color-alias-illustration-neutral-652)"
          strokeWidth="2"
        />
        {/* локомотив */}
        <g className="car">
          <rect
            x="38"
            y="192"
            width="34"
            height="24"
            rx="6"
            fill="var(--color-alias-illustration-orange-754)"
          />
          <rect
            x="20"
            y="180"
            width="20"
            height="36"
            rx="4"
            fill="var(--color-alias-illustration-red-688)"
          />
          <rect
            x="24"
            y="186"
            width="12"
            height="10"
            rx="1.5"
            fill="var(--color-alias-illustration-orange-53)"
          />
          <rect
            x="58"
            y="174"
            width="8"
            height="16"
            rx="2"
            fill="var(--color-alias-illustration-red-688)"
          />
          <rect
            x="64"
            y="170"
            width="10"
            height="5"
            rx="2"
            fill="var(--color-alias-illustration-orange-667)"
          />
        </g>
        <Wheel cx={30} cy={220} r={9} />
        <Wheel cx={60} cy={220} r={9} />
      </g>
    </svg>
  )
}
