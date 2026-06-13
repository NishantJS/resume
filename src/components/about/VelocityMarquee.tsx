import { FC, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  "Full-Stack",
  "Fintech",
  "Real-Time",
  "Node.js",
  "React",
  "TypeScript",
  "Microservices",
  "Open to Work",
];

/**
 * Giant outlined text strip that drifts forever and reacts to scroll:
 * scrolling fast spins it faster (and backwards when scrolling up),
 * then it eases back to its idle drift.
 */
const VelocityMarquee: FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const row = rowRef.current;
    if (!row || reduced) return;

    // Content is rendered twice, so -50% is one seamless loop.
    const drift = gsap.to(row, { xPercent: -50, ease: "none", duration: 36, repeat: -1 });

    // Scroll velocity bends the drift speed/direction…
    let settle: gsap.core.Tween | null = null;
    const st = ScrollTrigger.create({
      onUpdate(self) {
        const v = gsap.utils.clamp(-2400, 2400, self.getVelocity());
        if (Math.abs(v) < 60) return;
        const boost = gsap.utils.mapRange(-2400, 2400, -4, 4, v);
        drift.timeScale(boost);
        // …then settles back to idle drift in the direction it was pushed.
        settle?.kill();
        settle = gsap.to(drift, {
          timeScale: boost < 0 ? -1 : 1,
          duration: 1.4,
          ease: "power2.out",
        });
      },
    });

    return () => {
      st.kill();
      settle?.kill();
      drift.kill();
    };
  }, { scope: wrapRef, dependencies: [reduced] });

  const Row = (
    <>
      {ITEMS.map(item => (
        <span key={item} className="vm-item" aria-hidden>
          {item}
          <span className="vm-dot" />
        </span>
      ))}
    </>
  );

  return (
    <div ref={wrapRef} className="vm-wrap" aria-label={ITEMS.join(", ")}>
      <div ref={rowRef} className="vm-row">
        {Row}
        {Row}
      </div>
    </div>
  );
};

export default VelocityMarquee;
