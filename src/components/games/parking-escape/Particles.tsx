import { FC, useEffect, useState } from "react";

interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
  vector: { dx: number; dy: number };
}

interface ParticlesProps {
  bursts: Burst[];
  /** Called when a burst's animation completes so the parent can drop it. */
  onComplete: (id: number) => void;
}

/**
 * Particle field rendered on top of the board. Each burst spawns ~16 confetti
 * dots flying outward from the exit point with a slight bias toward the exit
 * direction. Uses RAF — no Motion overhead per particle.
 */
const Particles: FC<ParticlesProps> = ({ bursts, onComplete }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {bursts.map(b => (
        <BurstView key={b.id} burst={b} onComplete={onComplete} />
      ))}
    </div>
  );
};

const PARTICLE_COUNT = 18;
const DURATION = 900;

const BurstView: FC<{ burst: Burst; onComplete: (id: number) => void }> = ({ burst, onComplete }) => {
  const [particles] = useState(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.6;
      const speed = 40 + Math.random() * 80;
      const biasX = burst.vector.dx * 80;
      const biasY = burst.vector.dy * 80;
      const size = 5 + Math.random() * 6;
      const hue = pickHue(burst.color, i);
      return {
        dx: Math.cos(angle) * speed + biasX,
        dy: Math.sin(angle) * speed + biasY,
        size,
        color: hue,
        rot: Math.random() * 360,
        delay: Math.random() * 60,
      };
    });
  });

  useEffect(() => {
    const t = window.setTimeout(() => onComplete(burst.id), DURATION + 80);
    return () => window.clearTimeout(t);
  }, [burst.id, onComplete]);

  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="pe-particle"
          style={{
            left: burst.x,
            top: burst.y,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `pe-particle-${burst.id}-${i} ${DURATION}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style>
        {particles
          .map(
            (p, i) => `
@keyframes pe-particle-${burst.id}-${i} {
  0%   { transform: translate(-50%, -50%) scale(0.4) rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translate(calc(-50% + ${p.dx.toFixed(1)}px), calc(-50% + ${(p.dy + 60).toFixed(1)}px)) scale(0.6) rotate(${p.rot}deg); opacity: 0; }
}`,
          )
          .join("\n")}
      </style>
    </>
  );
};

/** Pick a contrasty/complementary palette around the vehicle's color. */
function pickHue(base: string, i: number): string {
  // Light palette of confetti hues — rotates so each burst looks varied.
  const palette = [
    "#fde68a", "#fbbf24", "#f97316", "#ef4444",
    "#ec4899", "#a855f7", "#3b82f6", "#22c55e",
    "#14b8a6", "#facc15", "#ffffff",
  ];
  // Bias toward the base color every few particles.
  if (i % 4 === 0) return base;
  return palette[(i * 7) % palette.length];
}

export type { Burst };
export default Particles;
