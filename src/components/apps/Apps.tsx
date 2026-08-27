import { useRef, FC } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import { apps } from "./apps.data";
import { useSeo } from "../../hooks/useSeo";
import "./apps.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Parallax drift per row — skipped when reduced motion is preferred. */
const ParallaxRow: FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const y = useSpring(rawY, { stiffness: 60, damping: 18 });
  return <motion.li ref={ref} style={{ y }}>{children}</motion.li>;
};

const Apps = () => {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSeo({
    title: "Apps — Nishant Chorge",
    description:
      "Android apps built and published by Nishant Chorge — PDI Pro for field inspections, InvoiceKaro for GST billing, and Vault, an offline zero-knowledge password manager.",
    path: "/apps",
  });

  // Heading: SplitText masked char reveal. Rows reveal as they enter view.
  useGSAP(() => {
    const el = container.current;
    if (!el) return;
    const h1 = el.querySelector<HTMLElement>("h1");
    const rows = el.querySelectorAll<HTMLElement>(".app-row");
    if (reduced) {
      if (h1) gsap.set(h1, { opacity: 1 });
      gsap.set(rows, { opacity: 1, y: 0 });
      rows.forEach(r => r.classList.add("is-in"));
      return;
    }

    let split: SplitText | undefined;
    if (h1) {
      // st-char-mask gets bottom padding via CSS so descenders aren't clipped.
      split = SplitText.create(h1, { type: "chars", mask: "chars", charsClass: "st-char" });
      gsap.set(h1, { opacity: 1 });
      gsap.from(split.chars, { yPercent: 115, duration: 0.7, ease: "power4.out", stagger: 0.02, delay: 0.15 });
    }

    gsap.set(rows, { opacity: 0, y: 30 });
    ScrollTrigger.batch(rows, {
      once: true,
      start: "top 92%",
      onEnter: batch => {
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: "power3.out" });
        // The rule sweeps in just behind its row.
        batch.forEach((el, i) =>
          window.setTimeout(() => el.classList.add("is-in"), 140 + i * 90));
      },
    });

    return () => split?.revert();
  }, { scope: container, dependencies: [reduced] });

  // Hover blends the app's accent at ~60% so the warm gradient still
  // shows through underneath, exactly as /work and /games do.

  return (
    <motion.main
      ref={container}
      className="cool-gradient relative min-h-screen flex justify-center items-start pt-28 pb-32"
      aria-labelledby="apps-heading"
    >
      <div className="relative z-10 w-full max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl px-6 xl:px-12">
        <header className="mb-10 md:mb-14">
          <p className="mono text-xs uppercase tracking-[0.2em] text-zinc-600">/ apps</p>
          <h1
            id="apps-heading"
            className="mt-2 text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight opacity-0"
          >
            Apps I've shipped to the Play Store.
          </h1>
          <p className="mono text-sm xl:text-base text-zinc-600 mt-3 max-w-2xl">
            Small, focused Android tools — each with its own support desk, changelog and privacy policy.
          </p>
        </header>

        <ul>
          {apps.map((app, index) => (
            <ParallaxRow key={app.slug}>
              <div
                className="app-row app-row--ruled py-7 md:py-9 xl:py-10 group"
                style={{ ["--row" as string]: app.color } as React.CSSProperties}
              >
                <Link
                  to={`/apps/${app.slug}`}
                  className="block link"
                  aria-label={`View ${app.name}`}
                >
                  {/* Row 1: number + name + role */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                    <div className="flex items-baseline gap-3 sm:gap-4">
                      <span
                        className="mono text-xs text-zinc-600 tabular-nums select-none shrink-0 transition-colors duration-300 group-hover:text-zinc-800"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 data-morph-source className="text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight leading-tight">
                        {app.name}
                      </h2>
                    </div>
                    <span className="mono text-xs sm:text-sm text-zinc-600 shrink-0 ml-7 sm:ml-0 transition-colors duration-300 group-hover:text-zinc-700">
                      {app.role}
                    </span>
                  </div>

                  <p className="mono text-sm xl:text-base text-zinc-600 mt-2 line-clamp-2 ml-7 sm:ml-8 md:ml-9 max-w-2xl xl:max-w-3xl transition-colors duration-300 group-hover:text-zinc-700">
                    {app.blurb}
                  </p>

                  <p className="mono text-xs uppercase tracking-widest text-zinc-500 mt-3 ml-7 sm:ml-8 md:ml-9 transition-colors duration-300 group-hover:text-zinc-600">
                    {app.tagline}
                  </p>

                  {/* Release facts — hover-revealed on desktop, always shown
                      on mobile where there's no hover to reveal them. */}
                  <div className="ml-7 sm:ml-8 md:ml-9 overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-300 ease-out max-md:!max-h-none max-md:!overflow-visible">
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(app.status === "live"
                        ? [
                            `v${app.release.version}`,
                            `${app.release.installs} installs`,
                            `${app.release.rating} ★`,
                            app.release.minAndroid,
                            app.release.size,
                          ]
                        : [app.status === "beta" ? "Open beta" : "Coming soon"]
                      ).map(fact => (
                        <span
                          key={fact}
                          className="mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 text-zinc-800"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            </ParallaxRow>
          ))}
        </ul>

      </div>
    </motion.main>
  );
};

export default Apps;
