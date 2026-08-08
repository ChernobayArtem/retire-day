import type { CSSProperties } from 'react'

interface ConfettiProps {
  x: number
  y: number
  color: string
  dx: number
  dy: number
  rotate: number
  delay: string
  shape?: 'rect' | 'circle'
}

function Confetti({ x, y, color, dx, dy, rotate, delay, shape = 'rect' }: ConfettiProps) {
  const style = {
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--rot': `${rotate}deg`,
    animationDelay: delay,
  } as CSSProperties

  return (
    <g transform={`translate(${x} ${y})`}>
      {shape === 'circle' ? (
        <circle className="conf" style={style} r="4" fill={color} />
      ) : (
        <rect className="conf" style={style} x="-4" y="-2" width="8" height="4" rx="1.5" fill={color} />
      )}
    </g>
  )
}

function Flower({ x, color, delay }: { x: number; color: string; delay: string }) {
  return (
    <g transform={`translate(${x} 229)`}>
      <g className="flower" style={{ animationDelay: delay }}>
        <path d="M0 7 C -3 -15 3 -31 0 -47" fill="none" stroke="var(--color-alias-illustration-green-795)" strokeWidth="4" strokeLinecap="round" />
        <path className="leaf leaf--left" d="M-1 -18 C -19 -25 -22 -13 -5 -8 Z" fill="var(--color-alias-illustration-green-564)" />
        <path className="leaf leaf--right" d="M1 -29 C 19 -36 21 -23 5 -18 Z" fill="var(--color-alias-illustration-green-718)" />
        <g transform="translate(0 -53)">
          <g className="petals">
            {[0, 72, 144, 216, 288].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const px = Math.cos(rad) * 10
              const py = Math.sin(rad) * 10
              return (
                <ellipse
                  key={angle}
                  cx={px}
                  cy={py}
                  rx="7"
                  ry="10"
                  fill={color}
                  transform={`rotate(${angle + 90} ${px} ${py})`}
                />
              )
            })}
            <circle r="5" fill="var(--color-alias-illustration-yellow-1000)" />
          </g>
        </g>
      </g>
    </g>
  )
}

// День 1 — календарь оживает и запускает праздничный обратный отсчёт
export default function Day1() {
  return (
    <svg className="scn s1" viewBox="0 0 430 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .s1 .cloud{transform-box:fill-box;transform-origin:center}
        .s1 .cloud--left{animation:s1cloudLeft 15s ease-in-out infinite}
        .s1 .cloud--right{animation:s1cloudRight 18s ease-in-out infinite}
        .s1 .halo{transform-box:fill-box;transform-origin:center;animation:s1halo 6s ease-in-out infinite}
        .s1 .ray{transform-box:fill-box;transform-origin:center;animation:s1ray 8s ease-in-out infinite}
        .s1 .ray--2{animation-delay:-.18s}.s1 .ray--3{animation-delay:-.36s}
        .s1 .card{transform-box:fill-box;transform-origin:50% 100%;animation:s1card 5s ease-in-out infinite}
        .s1 .page{transform-box:fill-box;transform-origin:50% 0%;animation:s1page 8s cubic-bezier(.22,1,.36,1) infinite}
        .s1 .number{transform-box:fill-box;transform-origin:center;animation:s1number 8s ease-in-out infinite}
        .s1 .ring{transform-box:fill-box;transform-origin:50% 0%;animation:s1ring 4s ease-in-out infinite}
        .s1 .ring--2{animation-delay:-1.1s}
        .s1 .ribbon{transform-box:fill-box;transform-origin:center;animation:s1ribbon 6s ease-in-out infinite}
        .s1 .ribbon-text{animation:s1text 6s ease-in-out infinite}
        .s1 .trail{stroke-dasharray:9 8;animation:s1trail 8s linear infinite}
        .s1 .heart{transform-box:fill-box;transform-origin:center;animation:s1heart 4.8s ease-in-out infinite}
        .s1 .heart--2{animation-delay:-1.7s}.s1 .heart--3{animation-delay:-3.2s}
        .s1 .conf{transform-box:fill-box;transform-origin:center;animation:s1conf 8s cubic-bezier(.16,.8,.28,1) infinite}
        .s1 .flower{transform-box:fill-box;transform-origin:50% 100%;animation:s1flower 6s ease-in-out infinite}
        .s1 .petals{transform-box:fill-box;transform-origin:center;animation:s1bloom 6s ease-in-out infinite}
        .s1 .leaf{transform-box:fill-box}
        .s1 .leaf--left{transform-origin:100% 100%;animation:s1leafLeft 6s ease-in-out infinite}
        .s1 .leaf--right{transform-origin:0% 100%;animation:s1leafRight 6s ease-in-out infinite}
        .s1 .grass{transform-box:fill-box;transform-origin:50% 100%;animation:s1grass 5s ease-in-out infinite}
        .s1 .grass--2{animation-delay:-1.5s}.s1 .grass--3{animation-delay:-3s}

        @keyframes s1cloudLeft{0%,100%{transform:translateX(-14px)}50%{transform:translateX(18px)}}
        @keyframes s1cloudRight{0%,100%{transform:translateX(16px)}50%{transform:translateX(-18px)}}
        @keyframes s1halo{0%,100%{transform:scale(.94);opacity:.38}50%{transform:scale(1.08);opacity:.72}}
        @keyframes s1ray{0%,12%,100%{opacity:.1;transform:scale(.75) rotate(-5deg)}24%,62%{opacity:.65;transform:scale(1.08) rotate(4deg)}}
        @keyframes s1card{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}
        @keyframes s1page{0%,10%,100%{transform:translateY(0) scaleY(1)}16%{transform:translateY(5px) scaleY(.91)}23%{transform:translateY(-9px) scaleY(1.07)}31%{transform:translateY(0) scaleY(1)}}
        @keyframes s1number{0%,10%,100%{transform:scale(1)}19%{transform:scale(.86)}27%{transform:scale(1.14)}34%{transform:scale(1)}}
        @keyframes s1ring{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes s1ribbon{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
        @keyframes s1text{0%,100%{letter-spacing:1.6px}50%{letter-spacing:2.4px}}
        @keyframes s1trail{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-68}}
        @keyframes s1heart{0%,100%{transform:translateY(0) rotate(-7deg);opacity:.48}50%{transform:translateY(-12px) rotate(8deg);opacity:1}}
        @keyframes s1conf{
          0%,10%{transform:translate(0,14px) rotate(0) scale(.3);opacity:0}
          18%{opacity:1}
          42%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(1)}
          74%{opacity:1}
          100%{transform:translate(calc(var(--dx) * 1.18),calc(var(--dy) + 48px)) rotate(calc(var(--rot) * 1.7)) scale(.78);opacity:0}
        }
        @keyframes s1flower{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        @keyframes s1bloom{0%,8%,100%{transform:scale(.8) rotate(-8deg)}24%,78%{transform:scale(1.08) rotate(5deg)}}
        @keyframes s1leafLeft{0%,100%{transform:rotate(8deg)}50%{transform:rotate(-5deg)}}
        @keyframes s1leafRight{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(5deg)}}
        @keyframes s1grass{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
      `}</style>

      <defs>
        <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-alias-illustration-rose-0)" />
          <stop offset="0.58" stopColor="var(--color-alias-illustration-rose-65)" />
          <stop offset="1" stopColor="var(--color-alias-illustration-orange-0)" />
        </linearGradient>
        <linearGradient id="s1page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-alias-illustration-neutral-0)" />
          <stop offset="1" stopColor="var(--color-alias-illustration-rose-0)" />
        </linearGradient>
        <filter id="s1shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="var(--color-alias-illustration-rose-935)" floodOpacity=".2" />
        </filter>
      </defs>

      <rect width="430" height="260" fill="url(#s1sky)" />

      <g className="cloud cloud--left" fill="var(--color-alias-illustration-neutral-0)" opacity=".82">
        <ellipse cx="82" cy="68" rx="34" ry="13" />
        <circle cx="65" cy="64" r="13" />
        <circle cx="98" cy="61" r="17" />
      </g>
      <g className="cloud cloud--right" fill="var(--color-alias-illustration-neutral-0)" opacity=".68">
        <ellipse cx="347" cy="89" rx="29" ry="11" />
        <circle cx="332" cy="85" r="11" />
        <circle cx="361" cy="83" r="14" />
      </g>

      <circle className="halo" cx="215" cy="137" r="91" fill="var(--color-alias-illustration-rose-161)" />
      <g fill="none" strokeLinecap="round">
        <path className="ray" d="M215 43 V61" stroke="var(--color-alias-illustration-rose-613)" strokeWidth="5" />
        <path className="ray ray--2" d="M134 79 L150 91" stroke="var(--color-alias-illustration-orange-404)" strokeWidth="5" />
        <path className="ray ray--3" d="M296 79 L280 91" stroke="var(--color-alias-illustration-indigo-625)" strokeWidth="5" />
      </g>

      <path
        className="trail"
        d="M41 153 C82 112 113 112 143 134 M287 132 C321 104 357 111 393 151"
        fill="none"
        stroke="var(--color-alias-illustration-rose-387)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g className="heart" transform="translate(96 116)">
        <path d="M0 4 C-8-4-14 4 0 15 C14 4 8-4 0 4Z" fill="var(--color-alias-illustration-rose-516)" />
      </g>
      <g className="heart heart--2" transform="translate(334 130) scale(.8)">
        <path d="M0 4 C-8-4-14 4 0 15 C14 4 8-4 0 4Z" fill="var(--color-alias-illustration-indigo-500)" />
      </g>
      <g className="heart heart--3" transform="translate(365 65) scale(.58)">
        <path d="M0 4 C-8-4-14 4 0 15 C14 4 8-4 0 4Z" fill="var(--color-alias-illustration-orange-474)" />
      </g>

      <Confetti x={215} y={128} color="var(--color-alias-illustration-rose-677)" dx={-112} dy={-71} rotate={410} delay="0s" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-orange-298)" dx={-78} dy={-96} rotate={-360} delay="-.12s" shape="circle" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-blue-569)" dx={-43} dy={-79} rotate={500} delay="-.24s" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-green-538)" dx={45} dy={-88} rotate={-430} delay="-.08s" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-indigo-250)" dx={82} dy={-93} rotate={390} delay="-.2s" shape="circle" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-orange-684)" dx={112} dy={-63} rotate={-470} delay="-.32s" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-teal-1000)" dx={-128} dy={-29} rotate={440} delay="-.38s" />
      <Confetti x={215} y={128} color="var(--color-alias-illustration-rose-613)" dx={130} dy={-24} rotate={-390} delay="-.44s" />

      <ellipse cx="215" cy="225" rx="82" ry="13" fill="var(--color-alias-illustration-rose-290)" opacity=".45" />

      <g className="card" filter="url(#s1shadow)">
        <rect x="151" y="77" width="128" height="139" rx="18" fill="var(--color-alias-illustration-rose-258)" />
        <rect x="151" y="77" width="128" height="38" rx="18" fill="var(--color-alias-illustration-rose-710)" />
        <rect x="151" y="99" width="128" height="17" fill="var(--color-alias-illustration-rose-710)" />
        <g className="page">
          <rect x="158" y="110" width="114" height="99" rx="12" fill="url(#s1page)" />
          <text x="215" y="129" textAnchor="middle" fill="var(--color-alias-illustration-mauve-375)" fontSize="9" fontWeight="800" letterSpacing="2">
            АВГУСТ
          </text>
          <text className="number" x="215" y="190" textAnchor="middle" fill="var(--color-alias-illustration-red-938)" fontSize="65" fontWeight="900">
            1
          </text>
        </g>
        <g className="ring">
          <rect x="178" y="67" width="10" height="26" rx="5" fill="var(--color-alias-illustration-neutral-0)" />
          <circle cx="183" cy="93" r="4" fill="var(--color-alias-illustration-rose-903)" />
        </g>
        <g className="ring ring--2">
          <rect x="242" y="67" width="10" height="26" rx="5" fill="var(--color-alias-illustration-neutral-0)" />
          <circle cx="247" cy="93" r="4" fill="var(--color-alias-illustration-rose-903)" />
        </g>
      </g>

      <g className="ribbon">
        <path d="M151 201 H279 L267 222 H163 Z" fill="var(--color-alias-illustration-rose-613)" />
        <path d="M151 201 L132 207 L150 219 L163 213 Z" fill="var(--color-alias-illustration-rose-839)" />
        <path d="M279 201 L298 207 L280 219 L267 213 Z" fill="var(--color-alias-illustration-rose-839)" />
        <text className="ribbon-text" x="215" y="216" textAnchor="middle" fill="var(--color-alias-illustration-neutral-0)" fontSize="12" fontWeight="900">
          ПОЕХАЛИ!
        </text>
      </g>

      <path d="M0 224 Q92 205 180 225 Q270 244 430 216 V260 H0 Z" fill="var(--color-alias-illustration-green-282)" />
      <path d="M0 242 Q110 224 223 241 Q326 255 430 237 V260 H0 Z" fill="var(--color-alias-illustration-green-436)" />

      <Flower x={58} color="var(--color-alias-illustration-rose-419)" delay="0s" />
      <Flower x={365} color="var(--color-alias-illustration-indigo-250)" delay="-2.1s" />

      <g fill="var(--color-alias-illustration-green-744)">
        <path className="grass" d="M18 253 Q12 227 21 216 Q27 235 24 253 Z" />
        <path className="grass grass--2" d="M105 253 Q112 230 103 219 Q97 236 100 253 Z" />
        <path className="grass grass--3" d="M316 253 Q309 229 318 217 Q324 235 321 253 Z" />
        <path className="grass grass--2" d="M408 253 Q414 228 406 216 Q400 235 403 253 Z" />
      </g>
    </svg>
  )
}
