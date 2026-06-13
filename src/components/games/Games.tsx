import { useRef, FC } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import { games } from "./games.data";

gsap.registerPlugin(ScrollTrigger, SplitText);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3,  ease: [0.55, 0, 1, 0.45] as [number, number, number, number] } },
};

const ParallaxRow: FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const y = useSpring(rawY, { stiffness: 60, damping: 18 });
  return (
    <motion.li ref={ref} style={{ y }}>
      {children}
    </motion.li>
  );
};

const Games = () => {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP();
  const reduced = useReducedMotion();

  // Heading: SplitText masked char reveal. Rows reveal as they enter view.
  useGSAP(() => {
    const el = container.current;
    if (!el) return;
    const h1 = el.querySelector<HTMLElement>("h1");
    const rows = el.querySelectorAll<HTMLElement>(".game-row");
    if (reduced) {
      if (h1) gsap.set(h1, { opacity: 1 });
      gsap.set(rows, { opacity: 1, y: 0 });
      return;
    }

    let split: SplitText | undefined;
    if (h1) {
      // st-char-mask gets bottom padding via CSS so descenders aren't clipped.
      split = SplitText.create(h1, { type: "chars", mask: "chars", charsClass: "st-char" });
      gsap.set(h1, { opacity: 1 });
      gsap.from(split.chars, { yPercent: 115, duration: 0.7, ease: "power4.out", stagger: 0.012, delay: 0.15 });
    }

    gsap.set(rows, { opacity: 0, y: 30 });
    ScrollTrigger.batch(rows, {
      once: true,
      start: "top 92%",
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: "power3.out" }),
    });

    return () => split?.revert();
  }, { scope: container, dependencies: [reduced] });

  // The hover fill blends the game's accent colour at ~60% so the warm gradient
  // shows through underneath rather than being completely replaced.
  const handleMouseEnter = contextSafe((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    gsap.to(overlay.current, { backgroundColor: `rgba(${r},${g},${b},0.6)`, duration: 0.4, ease: "power3.out" });
  });
  const handleMouseLeave = contextSafe(() => {
    gsap.to(overlay.current, { backgroundColor: "rgba(255,255,255,0)", duration: 0.4, ease: "power3.out" });
  });

  return (
    <motion.main
      ref={container}
      variants={reduced ? undefined : pageVariants}
      initial={reduced ? false : "initial"}
      animate={reduced ? undefined : "animate"}
      exit={reduced ? undefined : "exit"}
      className="warm-gradient relative min-h-screen flex justify-center items-start pt-28 pb-32"
      aria-labelledby="games-heading"
    >
      <div ref={overlay} className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0)" }} aria-hidden />
      <div className="relative z-10 w-full max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl px-6 xl:px-12">
        <header className="mb-10 md:mb-14">
          <p className="mono text-xs uppercase tracking-[0.2em] text-zinc-500">/ games</p>
          <h1
            id="games-heading"
            className="mt-2 text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight opacity-0"
          >
            Cool little games to play in your browser.
          </h1>
          <p className="mono text-sm xl:text-base text-zinc-500 mt-3 max-w-2xl">
            Each game loads only when you open it — nothing weighs down the rest of the site.
          </p>
        </header>

        <ul className="divide-y divide-black/10">
          {games.map((game, index) => {
            const interactive = game.status === "playable";
            const Inner = (
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="mono text-xs text-zinc-500 tabular-nums select-none shrink-0 transition-colors duration-300 group-hover:text-zinc-800" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight leading-tight">
                    {game.title}
                  </h2>
                </div>
                <span className="mono text-xs sm:text-sm text-zinc-500 shrink-0 ml-7 sm:ml-0 transition-colors duration-300 group-hover:text-zinc-700">
                  {game.status === "playable" ? "Play →" : "Coming soon"}
                </span>
              </div>
            );

            const Sub = (
              <>
                <p className="mono text-sm xl:text-base text-zinc-500 mt-2 ml-7 sm:ml-8 md:ml-9 max-w-2xl xl:max-w-3xl transition-colors duration-300 group-hover:text-zinc-700">
                  {game.description}
                </p>
                <p className="mono text-xs uppercase tracking-widest text-zinc-400 mt-3 ml-7 sm:ml-8 md:ml-9 transition-colors duration-300 group-hover:text-zinc-600">
                  {game.tagline}
                </p>
              </>
            );

            return (
              <ParallaxRow key={game.slug}>
                <div
                  className="game-row py-7 md:py-9 xl:py-10 group"
                  style={{ ["--row" as string]: game.color } as React.CSSProperties}
                  onMouseEnter={() => handleMouseEnter(game.color)}
                  onMouseLeave={handleMouseLeave}
                >
                  {interactive ? (
                    <Link
                      viewTransition
                      to={`/games/${game.slug}`}
                      className="block link"
                      data-cursor-color={game.color}
                      aria-label={`Play ${game.title}`}
                    >
                      {Inner}
                      {Sub}
                    </Link>
                  ) : (
                    <div className="block opacity-70">
                      {Inner}
                      {Sub}
                    </div>
                  )}
                </div>
              </ParallaxRow>
            );
          })}
        </ul>
      </div>
    </motion.main>
  );
};

export default Games;
