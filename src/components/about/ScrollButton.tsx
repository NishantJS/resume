import { useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function ScrollButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(el, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.9, ease: "power2.out" });
  }, [reduced]);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.92, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={scrollDown}
      className="scroll-cue link"
      aria-label="Scroll down to read more"
    >
      <span className="scroll-cue-mouse" aria-hidden>
        <span className="scroll-cue-dot" />
      </span>
      <span className="scroll-cue-label mono" aria-hidden>Scroll</span>
    </button>
  );
}
