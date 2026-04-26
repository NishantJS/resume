import { useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function ScrollButton() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const button = ref.current;
    if (!button) return;
    if (reduced) { gsap.set(button, { opacity: 1, y: 0 }); return; }

    gsap.fromTo(
      button,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.8, yoyo: true, repeat: -1, ease: "power2.inOut" }
    );
  }, [reduced]);

  return (
    <div className="flex justify-center items-center" ref={ref}>
      <svg
        className="w-10 h-10 link"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-label="Scroll down to read more"
        role="img"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}
