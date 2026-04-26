import { useScroll, useSpring, motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
      style={{
        scaleX,
        originX: 0,
        background: 'linear-gradient(to right, #a855f7, #22d3ee, #f43f5e)',
      }}
    />
  );
}
