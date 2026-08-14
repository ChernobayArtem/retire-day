import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const freedomSchema = z.object({
  skyTop: zColor(),
  skyMid: zColor(),
  skyLow: zColor(),
  sunColor: zColor(),
  sunGlow: zColor(),
  hillColor: zColor(),
  meadow: zColor(),
  balloonColors: z.array(zColor()),
  heartColor: zColor(),
  sparkleColor: zColor(),
  floatIntensity: z.number().min(0).max(2),
});

export type FreedomProps = z.infer<typeof freedomSchema>;

const TAU = Math.PI * 2;

// Deterministic layouts (no Math.random — stable across frames for a clean loop).
const BALLOONS = [
  { x: 0.28, hue: 0, scale: 1.0, phase: 0.0, sway: 34 },
  { x: 0.46, hue: 1, scale: 0.82, phase: 0.4, sway: 24 },
  { x: 0.6, hue: 2, scale: 1.12, phase: 0.72, sway: 40 },
  { x: 0.72, hue: 3, scale: 0.78, phase: 0.18, sway: 22 },
  { x: 0.38, hue: 4, scale: 0.68, phase: 0.9, sway: 28 },
];

const HEARTS = Array.from({ length: 7 }, (_, i) => ({
  x: 0.16 + 0.1 * i + (i % 2 ? 0.03 : -0.02),
  scale: 0.5 + (((i * 37) % 10) / 10) * 0.6,
  phase: (i * 0.137) % 1,
  sway: 16 + (i % 3) * 8,
}));

const BOKEH = Array.from({ length: 13 }, (_, i) => ({
  x: ((i * 83 + 11) % 100) / 100,
  scale: 0.5 + ((i * 53) % 10) / 10,
  phase: (i * 0.181) % 1,
  blur: 7 + (i % 4) * 5,
  op: 0.1 + (i % 5) * 0.03,
}));

const SPARKS = Array.from({ length: 9 }, (_, i) => ({
  x: ((i * 61 + 13) % 100) / 100,
  y: 0.1 + (((i * 47) % 60) / 100) * 0.62,
  scale: 0.5 + ((i * 29) % 10) / 10,
  phase: (i * 0.11) % 1,
}));

function heartPath(s: number) {
  return `M0 ${4 * s} C ${-6 * s} ${-3 * s} ${-11 * s} ${3 * s} 0 ${11 * s} C ${11 * s} ${3 * s} ${6 * s} ${-3 * s} 0 ${4 * s} Z`;
}

function sparklePath(r: number) {
  const a = r * 0.28;
  return `M0 ${-r} L ${a} ${-a} L ${r} 0 L ${a} ${a} L 0 ${r} L ${-a} ${a} L ${-r} 0 L ${-a} ${-a} Z`;
}

export const FreedomSunrise: React.FC<FreedomProps> = ({
  skyTop,
  skyMid,
  skyLow,
  sunColor,
  sunGlow,
  hillColor,
  meadow,
  balloonColors,
  heartColor,
  sparkleColor,
  floatIntensity,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = (frame / durationInFrames) % 1; // periodic 0..1 → seamless loop

  const sunCx = width * 0.5;
  const sunCy = height * 0.66 + Math.sin(TAU * t) * 12 * floatIntensity;
  const glowPulse = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(TAU * t));
  const rayAngle = 360 * t;

  // A rising element's vertical progress + opacity envelope, periodic over the loop.
  const rise = (phase: number, speed = 1) => {
    const p = (t * speed + phase) % 1;
    const y = height + 140 - p * (height + 300);
    const op = interpolate(p, [0, 0.14, 0.82, 1], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { p, y, op };
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 46%, ${skyLow} 100%)`,
      }}
    >
      {/* мягкое солнечное свечение */}
      <div
        style={{
          position: "absolute",
          left: sunCx,
          top: sunCy,
          width: width * 1.15,
          height: width * 1.15,
          transform: `translate(-50%, -50%) scale(${glowPulse})`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${sunGlow} 0%, rgba(255,231,180,0.45) 32%, rgba(255,231,180,0) 66%)`,
          filter: "blur(6px)",
        }}
      />

      {/* лучи-«god rays» */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <g transform={`translate(${sunCx} ${sunCy}) rotate(${rayAngle})`} opacity={0.14}>
          {Array.from({ length: 12 }).map((_, i) => (
            <polygon
              key={i}
              points={`0,0 ${width * 0.9},-46 ${width * 0.9},46`}
              fill={sunGlow}
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>
      </svg>

      {/* солнце */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <circle cx={sunCx} cy={sunCy} r={118} fill={sunColor} opacity={0.35} />
        <circle cx={sunCx} cy={sunCy} r={92} fill={sunColor} />

        {/* дальние холмы */}
        <path
          d={`M0 ${height * 0.78} Q ${width * 0.3} ${height * 0.72} ${width * 0.55} ${height * 0.77} T ${width} ${height * 0.76} L ${width} ${height} L 0 ${height} Z`}
          fill={hillColor}
          opacity={0.55}
        />
      </svg>

      {/* боке — тёплые размытые огоньки поднимаются вверх */}
      {BOKEH.map((b, i) => {
        const r = rise(b.phase, 0.85);
        const x = b.x * width + Math.sin(TAU * (r.p * 1.4 + b.phase)) * 40;
        const d = 34 * b.scale;
        return (
          <div
            key={`bk-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: r.y,
              width: d,
              height: d,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: sunGlow,
              opacity: r.op * b.op,
              filter: `blur(${b.blur}px)`,
            }}
          />
        );
      })}

      {/* шарики */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {BALLOONS.map((b, i) => {
          const r = rise(b.phase, 0.72);
          const x = b.x * width + Math.sin(TAU * (r.p * 1.2 + b.phase)) * b.sway;
          const rot = Math.sin(TAU * (r.p + b.phase)) * 5;
          const color = balloonColors[b.hue % balloonColors.length];
          const rx = 42 * b.scale;
          const ry = 50 * b.scale;
          const knotY = ry + 4 * b.scale;
          return (
            <g key={`bl-${i}`} transform={`translate(${x} ${r.y}) rotate(${rot})`} opacity={r.op}>
              <path
                d={`M0 ${knotY} C ${18 * b.scale} ${knotY + 90 * b.scale} ${-18 * b.scale} ${knotY + 150 * b.scale} 0 ${knotY + 230 * b.scale}`}
                stroke="rgba(120,90,70,0.4)"
                strokeWidth={1.6}
                fill="none"
              />
              <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={color} />
              <path d={`M${-5 * b.scale} ${knotY - 2} l${5 * b.scale} ${9 * b.scale} l${5 * b.scale} ${-9 * b.scale} z`} fill={color} />
              <ellipse cx={-rx * 0.32} cy={-ry * 0.34} rx={rx * 0.2} ry={ry * 0.26} fill="#ffffff" opacity={0.5} />
            </g>
          );
        })}
      </svg>

      {/* сердечки */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {HEARTS.map((h, i) => {
          const r = rise(h.phase, 0.95);
          const x = h.x * width + Math.sin(TAU * (r.p * 1.6 + h.phase)) * h.sway;
          const rot = Math.sin(TAU * (r.p * 2 + h.phase)) * 14;
          const s = 2.2 * h.scale;
          return (
            <g key={`ht-${i}`} transform={`translate(${x} ${r.y}) rotate(${rot})`} opacity={r.op * 0.9}>
              <path d={heartPath(s)} fill={heartColor} />
            </g>
          );
        })}
      </svg>

      {/* передний луг */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={`M0 ${height * 0.86} Q ${width * 0.25} ${height * 0.82} ${width * 0.5} ${height * 0.855} T ${width} ${height * 0.85} L ${width} ${height} L 0 ${height} Z`}
          fill={meadow}
        />
        {/* травяная бахрома по краю луга */}
        {Array.from({ length: 30 }).map((_, i) => {
          const gx = (i + 0.5) * (width / 30);
          const rootY = height * 0.868 + Math.sin((gx / width) * TAU) * height * 0.006;
          const h = 22 + (i % 5) * 7;
          const lean = (((i * 7) % 5) - 2) * 8;
          const sway = Math.sin(TAU * (t + i * 0.08)) * 5 + lean;
          return (
            <path
              key={`gr-${i}`}
              d={`M${gx} ${rootY} q ${sway} ${-h * 0.62} ${sway * 0.55} ${-h}`}
              stroke="#7cc064"
              strokeWidth={4.5}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
          );
        })}
        {/* цветки на лугу */}
        {[
          { x: 0.19, c: "#ff9ec4" },
          { x: 0.53, c: "#ffc16e" },
          { x: 0.83, c: "#b8a4ff" },
        ].map((f, i) => {
          const fx = f.x * width;
          const baseY = height * 0.9;
          const rot = Math.sin(TAU * (t + i * 0.22)) * 6;
          return (
            <g key={`fl-${i}`} transform={`translate(${fx} ${baseY}) rotate(${rot})`}>
              <path d="M0 0 L0 -42" stroke="#6fae57" strokeWidth={4} strokeLinecap="round" />
              <g transform="translate(0 -48)">
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle
                    key={a}
                    cx={Math.cos((a * Math.PI) / 180) * 8}
                    cy={Math.sin((a * Math.PI) / 180) * 8}
                    r={7}
                    fill={f.c}
                  />
                ))}
                <circle r={5} fill="#ffe08a" />
              </g>
            </g>
          );
        })}
      </svg>

      {/* искры */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {SPARKS.map((s, i) => {
          const tw = 0.5 + 0.5 * Math.sin(TAU * (t * 2 + s.phase));
          return (
            <path
              key={`sp-${i}`}
              d={sparklePath(9 * s.scale)}
              transform={`translate(${s.x * width} ${s.y * height}) scale(${0.6 + tw * 0.6})`}
              fill={sparkleColor}
              opacity={0.25 + tw * 0.75}
            />
          );
        })}
      </svg>

      {/* тёплая подложка + виньетка */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 62%, rgba(255,240,210,0.12) 0%, rgba(255,180,150,0) 55%, rgba(120,70,60,0.16) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};
