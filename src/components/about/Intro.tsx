import { FC, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Name } from "./Name";
import { ScrollButton } from "./ScrollButton";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const Intro: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The hero recedes as you scroll into the story — scale/fade on a wrapper
  // so it never fights the name's own pointer-tilt transforms.
  useGSAP(() => {
    const el = ref.current;
    const inner = el?.querySelector(".intro-inner");
    if (!el || !inner || reduced) return;
    gsap.to(inner, {
      scale: 0.94,
      yPercent: -7,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom 25%", scrub: true },
    });
  }, { scope: ref, dependencies: [reduced] });

  return (
    /* Single snap-aligned screen: just the name + scroll cue */
    <div
      ref={ref}
      className="h-screen flex flex-col items-center justify-center px-4 pt-20"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="intro-inner flex flex-col items-center will-change-transform">
        <Name />
        <div className="mt-12">
          <ScrollButton />
        </div>
      </div>
    </div>
  );
};

export default Intro;
