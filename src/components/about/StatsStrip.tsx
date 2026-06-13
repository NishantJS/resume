import { FC, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CAREER_START = new Date(2022, 7, 1); // 1 Aug 2022 — first full-time role

/** Whole years + remaining months since `start`. */
function experienceSince(start: Date, now = new Date()): { years: number; months: number } {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** Quick facts that count up from zero the first time they scroll into view. */
const StatsStrip: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const exp = experienceSince(CAREER_START);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const cells = el.querySelectorAll<HTMLElement>(".stat-cell");
    const nums = el.querySelectorAll<HTMLElement>(".stat-num");

    if (reduced) {
      gsap.set(cells, { clearProps: "all", opacity: 1 });
      nums.forEach(n => { n.textContent = n.dataset.value ?? "0"; });
      return;
    }

    gsap.set(cells, { opacity: 0, y: 22 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 82%", once: true },
    });
    tl.to(cells, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 });
    nums.forEach((num, i) => {
      const target = Number(num.dataset.value ?? 0);
      const counter = { v: 0 };
      tl.to(counter, {
        v: target,
        duration: 1.4,
        ease: "power2.out",
        snap: { v: 1 },
        onUpdate: () => { num.textContent = String(Math.round(counter.v)); },
      }, 0.15 + i * 0.1);
    });
  }, { scope: ref, dependencies: [reduced] });

  const numStyle = { fontSize: "clamp(2.2rem, 5vw, 3.6rem)" };

  return (
    <div
      ref={ref}
      className="px-6 md:px-12 xl:px-16 pt-16 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full"
    >
      <dl className="grid grid-cols-1 sm:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden">
        <div className="stat-cell flex flex-col items-center gap-1.5 py-7 md:py-9 px-3 text-center border-white/10 border-b sm:border-b-0 sm:border-r">
          <dd className="font-bold tabular-nums leading-none" style={numStyle}>
            <span className="stat-num" data-value={exp.years}>0</span>
            <span className="text-purple-400">y</span>
            {exp.months > 0 && (
              <>
                {" "}
                <span className="stat-num" data-value={exp.months}>0</span>
                <span className="text-purple-400">m</span>
              </>
            )}
          </dd>
          <dt className="mono text-[0.68rem] md:text-xs uppercase tracking-[0.18em] text-gray-500">
            Experience
          </dt>
        </div>

        <div className="stat-cell flex flex-col items-center gap-1.5 py-7 md:py-9 px-3 text-center border-white/10 border-b sm:border-b-0 sm:border-r">
          <dd className="font-bold tabular-nums leading-none" style={numStyle}>
            <span className="stat-num" data-value={10}>0</span>
            <span className="text-purple-400">+</span>
          </dd>
          <dt className="mono text-[0.68rem] md:text-xs uppercase tracking-[0.18em] text-gray-500">
            Products shipped
          </dt>
        </div>

        <div className="stat-cell flex flex-col items-center gap-1.5 py-7 md:py-9 px-3 text-center">
          <dd className="font-bold tabular-nums leading-none" style={numStyle}>
            <span className="stat-num" data-value={30}>0</span>
            <span className="text-purple-400">+</span>
          </dd>
          <dt className="mono text-[0.68rem] md:text-xs uppercase tracking-[0.18em] text-gray-500">
            Technologies
          </dt>
        </div>
      </dl>
    </div>
  );
};

export default StatsStrip;
