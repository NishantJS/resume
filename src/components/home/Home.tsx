import { useRef, FC } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { useSeo } from '../../hooks/useSeo';
import { projects } from '../project/projects.data';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Parallax drift per row — skipped when reduced motion is preferred */
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

const Home = () => {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSeo({
    title: "Work — Nishant Chorge",
    description:
      "Selected full-stack products by Nishant Chorge — real-time fintech platforms, multi-role portals, micro-frontend architectures and more, built with Node.js, React, Next.js and Fastify.",
    path: "/work",
  });

  // Heading: SplitText masked char reveal. Rows: ScrollTrigger batches so
  // each animates as it scrolls into view (not all at once on load).
  // data-entering="true" is set on the list while rows animate in so the
  // cursor skips the data-image logo effect until entrance is fully done.
  useGSAP(() => {
    const el = container.current;
    if (!el) return;
    const h1   = el.querySelector<HTMLElement>('h1');
    const rows = el.querySelectorAll<HTMLElement>('.project-row');
    if (reduced) {
      if (h1) gsap.set(h1, { opacity: 1 });
      gsap.set(rows, { opacity: 1, y: 0 });
      return;
    }

    let split: SplitText | undefined;
    if (h1) {
      // st-char-mask gets bottom padding via CSS so descenders aren't clipped.
      split = SplitText.create(h1, { type: 'chars', mask: 'chars', charsClass: 'st-char' });
      gsap.set(h1, { opacity: 1 });
      gsap.from(split.chars, { yPercent: 115, duration: 0.7, ease: 'power4.out', stagger: 0.02, delay: 0.15 });
    }

    el.setAttribute('data-entering', 'true');
    gsap.set(rows, { opacity: 0, y: 30 });
    ScrollTrigger.batch(rows, {
      once: true,
      start: 'top 92%',
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: 'power3.out' }),
    });
    const entering = window.setTimeout(() => el.removeAttribute('data-entering'), 1500);

    return () => {
      window.clearTimeout(entering);
      split?.revert();
    };
  }, { scope: container, dependencies: [reduced] });

  // Hover — blend the project's accent at ~60 % so the warm gradient shows
  // through underneath (parse the hex to an rgba so opacity can be controlled).


  return (
    <motion.main
      ref={container}
      className="warm-gradient relative min-h-screen flex justify-center items-start pt-28 pb-32"
    >
      <div className="relative z-10 w-full max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl px-6 xl:px-12">
        <header className="mb-10 md:mb-14">
          <p className="mono text-xs uppercase tracking-[0.2em] text-zinc-500">/ work</p>
          <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight opacity-0">
            Things I've built.
          </h1>
          <p className="mono text-sm xl:text-base text-zinc-500 mt-3 max-w-2xl">
            A selection of full-stack products I've shipped — from real-time fintech platforms to multi-role portals.
          </p>
        </header>
        <ul className="divide-y divide-black/10">
        {projects.map((project, index) => (
          /* ParallaxRow is a plain motion.li with only the y spring — no opacity/animate */
          <ParallaxRow key={index}>
            {/* .project-row is the GSAP entrance target */}
            <div
              className="project-row py-7 md:py-9 xl:py-10 group"
              style={{ ["--row" as string]: project.color } as React.CSSProperties}
            >
              <Link
                to={project.path}
                className="block link"
                data-image={`/project/${project.title}/logo.webp`}
                aria-label={`View ${project.displayTitle ?? project.title} project`}
              >
                {/* Row 1: number + title + contribution */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span
                      className="mono text-xs text-zinc-500 tabular-nums select-none shrink-0 transition-colors duration-300 group-hover:text-zinc-800"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 data-morph-source className="text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight leading-tight">
                      {project.displayTitle ?? project.title}
                    </h2>
                  </div>
                  <span className="mono text-xs sm:text-sm text-zinc-500 shrink-0 ml-7 sm:ml-0 transition-colors duration-300 group-hover:text-zinc-700">
                    {project.contribution}
                  </span>
                </div>

                {/* Description — always visible */}
                <p className="mono text-sm xl:text-base text-zinc-500 mt-2 line-clamp-2 ml-7 sm:ml-8 md:ml-9 max-w-2xl xl:max-w-3xl transition-colors duration-300 group-hover:text-zinc-700">
                  {project.description}
                </p>

                {/* Skill tags — hover-revealed on desktop; always fully visible
                    on mobile (≤767px), where two wrapped rows used to be clipped. */}
                <div className="ml-7 sm:ml-8 md:ml-9 overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-300 ease-out max-md:!max-h-none max-md:!overflow-visible">
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.skills.slice(0, 6).map(skill => (
                      <span
                        key={skill}
                        className="mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/8 text-zinc-700"
                      >
                        {skill}
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

export default Home;
