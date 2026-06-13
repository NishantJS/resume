import { useEffect, useRef, FC } from "react";
import Intro from "./Intro";
import Paragraph from "./AboutText";
import { Skills } from "./Skills";
import VelocityMarquee from "./VelocityMarquee";
import StatsStrip from "./StatsStrip";
import Contact from "./Contact";
import { motion, useScroll, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSeo } from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

const PARAS = [
  "Hello! I am a Software Developer based in Mumbai, MH, India.",
  "I build production-grade fintech and enterprise systems — from SSE-based real-time feeds to micro-frontend architectures. I care deeply about resilience, low latency, and clean abstractions.",
  "I am currently open to new opportunities and would love to chat with you about your project — let's build something great together!",
];
const RANGES: [number, number][] = [[0, 0.33], [0.34, 0.67], [0.68, 1]];

const EXPERIENCE = [
  {
    period: "Sep 2025 – Present",
    role: "Software Engineer",
    company: "FinQuest Consulting Services",
    sub: "Client: Mirae Asset Capital Markets · Full-time · On-site",
    location: "Mumbai, Maharashtra, India",
    color: "#a855f7",
    bullets: [
      "Revamped the mStock Refer & Earn platform from legacy .NET to a modern stack (Next.js + Fastify), improving speed and scalability",
      "Built a real-time referral feed using SSE + Redis Streams, reducing delays from ~5s polling to ~1s updates",
      "Designed multi-layer caching (memory + Redis + DB) and event-driven invalidation to handle high traffic efficiently",
      "Implemented idempotent APIs and circuit breakers for safer, resilient systems",
      "Contributed to a stock advisory platform (similar to smallcase), building scalable backend services for portfolio and basket management",
    ],
  },
  {
    period: "Apr 2023 – Aug 2025",
    role: "Software Developer",
    company: "Futurescape Technology Private Limited",
    sub: "Full-time · On-site",
    location: "Navi Mumbai, Maharashtra, India",
    color: "#22d3ee",
    bullets: [
      "Built a dynamic form & table system (Nx + Next.js) powering complex, configurable workflows",
      "Designed micro-frontend architecture for modular and scalable feature delivery",
      "Led frontend for an SSO platform using Supabase + Keycloak with RBAC",
      "Maintained strong code quality with unit, integration, and E2E testing",
    ],
  },
  {
    period: "Aug 2022 – Mar 2023",
    role: "Software Developer",
    company: "Pinsout Innovation",
    sub: "Full-time · On-site",
    location: "Noida, Uttar Pradesh, India",
    color: "#f43f5e",
    bullets: [
      "Developed backend APIs for a job portal covering multiple user roles",
      "Built real-time chat using WebSockets",
      "Implemented wallet and payment systems with secure transactions",
      "Led frontend for employer workflows with focus on performance",
    ],
  },
];

const EDUCATION = [
  {
    period: "Aug 2021 – May 2023",
    degree: "Master of Computer Applications (MCA)",
    institution: "Lovely Professional University",
    score: "8.8 CGPA",
    color: "#f59e0b",
  },
];

/* Divider whose rule draws itself in as it scrolls into view. */
const SectionDivider = ({ label }: { label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const lab = el.querySelector(".sd-label");
    const line = el.querySelector(".sd-line");
    if (reduced) {
      gsap.set([lab, line], { clearProps: "all", opacity: 1 });
      return;
    }
    // Hide before the trigger fires so nothing flashes at full width.
    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      defaults: { ease: "power3.out" },
    });
    tl.fromTo(lab, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 })
      .to(line, { scaleX: 1, duration: 0.9 }, "-=0.25");
  }, { scope: ref, dependencies: [reduced] });

  return (
    <div ref={ref} className="px-6 md:px-12 xl:px-16 pt-20 pb-10 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
      <div className="flex items-center gap-5">
        <p className="sd-label mono text-xs uppercase tracking-[0.22em] text-gray-400 shrink-0 opacity-0">{label}</p>
        <div className="sd-line flex-1 h-px bg-white/10" />
      </div>
    </div>
  );
};

/* ── Timeline: shared track that draws itself as you scroll ────
   A faint rail runs down the whole section; a gradient progress
   line scrubs along it, and each entry is a glass card hanging
   off a dot on the rail. */
const TimelineSection: FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const progress = el.querySelector<HTMLElement>(".tl-progress");
    const track = el.querySelector<HTMLElement>(".tl-track");
    const dots = el.querySelectorAll<HTMLElement>(".tl-dot");
    if (reduced) {
      gsap.set(progress, { scaleY: 1 });
      dots.forEach(d => d.classList.add("on"));
      return;
    }

    // One scrubbed tween drives the gradient line AND the dots: a dot
    // lights up the moment the line's rendered edge reaches it, and goes
    // dark again when you scroll back above it. Reading the rendered
    // scaleY (not scroll progress) keeps dots in lockstep with the
    // scrub-smoothed line.
    gsap.fromTo(progress,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        ease: "none",
        onUpdate() {
          if (!track || !progress) return;
          const r = track.getBoundingClientRect();
          const lit = r.top + r.height * Number(gsap.getProperty(progress, "scaleY"));
          dots.forEach(dot => {
            const d = dot.getBoundingClientRect();
            dot.classList.toggle("on", d.top + d.height / 2 <= lit + 1);
          });
        },
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 55%", scrub: 0.6 },
      },
    );
  }, { scope: ref, dependencies: [reduced] });

  return (
    <div ref={ref} className="relative">
      <div className="tl-track" aria-hidden><div className="tl-progress" /></div>
      <div className="space-y-5 md:space-y-6">{children}</div>
    </div>
  );
};

/* One timeline entry — works for both experience and education. */
const TimelineCard: FC<{
  color: string;
  period: string;
  title: string;
  org: string;
  sub?: string | null;
  meta?: string | null;
  bullets?: string[];
}> = ({ color, period, title, org, sub, meta, bullets }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = cardRef.current;
    if (!el) return;
    // The dot is owned by TimelineSection — it lights with the scrubbed line.
    const card = el.querySelector<HTMLElement>(".tl-card");
    const content = el.querySelectorAll<HTMLElement>(".tl-text");

    if (reduced) {
      gsap.set([card, ...content], { clearProps: "all", opacity: 1 });
      return;
    }

    gsap.set(card, { opacity: 0, x: 32 });
    gsap.set(content, { opacity: 0, y: 12 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
      defaults: { ease: "power3.out" },
    });
    tl.to(card, { opacity: 1, x: 0, duration: 0.55 })
      .to(content, { opacity: 1, y: 0, stagger: 0.06, duration: 0.4 }, "-=0.3");
  }, { scope: cardRef, dependencies: [reduced] });

  return (
    <div ref={cardRef} className="tl-entry relative pl-9 md:pl-12">
      <span
        className="tl-dot"
        style={{ backgroundColor: color, boxShadow: `0 0 14px 1px ${color}66` }}
        aria-hidden
      />
      <div className="tl-card group" style={{ ["--tl" as string]: color } as React.CSSProperties}>
        <div className="tl-text flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
          <span
            className="mono text-[0.7rem] tabular-nums px-2.5 py-1 rounded-full border"
            style={{ color, borderColor: `${color}55`, background: `${color}14` }}
          >
            {period}
          </span>
          {meta && <span className="mono text-xs text-gray-500">{meta}</span>}
        </div>
        <p className="tl-text text-xl md:text-2xl font-semibold leading-snug">{title}</p>
        <p className="tl-text mono text-base md:text-lg mt-1 font-medium" style={{ color }}>{org}</p>
        {sub && <p className="tl-text mono text-sm text-gray-400 mt-0.5">{sub}</p>}
        {bullets && bullets.length > 0 && (
          <ul className="tl-text mt-4 space-y-2 pl-0">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-400 leading-relaxed">
                <span className="shrink-0 mt-[0.55em] w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const About = () => {
  const reduced = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);

  useSeo({
    title: "Nishant Chorge — Software Developer",
    description:
      "Software Developer building production-grade fintech and enterprise systems — SSE real-time feeds, micro-frontends, resilient APIs. Node.js · React · Next.js · Fastify · Redis · Mumbai.",
    path: "/",
  });

  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = "y proximity";
    return () => { html.style.scrollSnapType = ""; };
  }, []);

  // Orbs drift at different speeds as the page scrolls — cheap depth.
  useGSAP(() => {
    const el = mainRef.current;
    if (!el || reduced) return;
    el.querySelectorAll<HTMLElement>(".about-orb").forEach((orb, i) => {
      gsap.to(orb, {
        yPercent: 26 + i * 14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 1.2 },
      });
    });
  }, { scope: mainRef, dependencies: [reduced] });

  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.9", "end 0.9"] });

  return (
    <motion.main
      variants={reduced ? undefined : pageVariants}
      initial={reduced ? false : "initial"}
      animate={reduced ? undefined : "animate"}
      exit={reduced ? undefined : "exit"}
      className="bg-black text-white relative overflow-x-hidden"
      id="about"
      ref={mainRef}
    >
      {/* Orbs */}
      <div className="about-orb orb-pulse pointer-events-none absolute top-[8%] -left-40 w-96 h-96 rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)" }} />
      <div className="about-orb orb-pulse pointer-events-none absolute top-[55%] -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(34,211,238,0.09), transparent 70%)", animationDelay: "3s" }} />
      <div className="about-orb orb-pulse pointer-events-none absolute top-[80%] left-1/3 w-72 h-72 rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(244,63,94,0.07), transparent 70%)", animationDelay: "6s" }} />

      {/* Screen 1: Name */}
      <Intro />

      {/* Paragraphs */}
      <div ref={textRef}>
        {PARAS.map((para, i) => (
          <Paragraph key={i} paragraph={para} progress={scrollYProgress} range={RANGES[i]} />
        ))}
      </div>

      {/* ── Quick facts ────────────────────────────────────────────── */}
      <StatsStrip />

      {/* ── Velocity-reactive marquee ──────────────────────────────── */}
      <VelocityMarquee />

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <SectionDivider label="Skills & Tools" />
      <div className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
        <Skills />
      </div>

      {/* ── Experience ──────────────────────────────────────────────── */}
      <SectionDivider label="Experience" />
      <section className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
        <TimelineSection>
          {EXPERIENCE.map((exp) => (
            <TimelineCard
              key={exp.company}
              color={exp.color}
              period={exp.period}
              title={exp.role}
              org={exp.company}
              sub={exp.sub}
              meta={exp.location}
              bullets={exp.bullets}
            />
          ))}
        </TimelineSection>
      </section>

      {/* ── Education ─────────────────────────────────────────────── */}
      <SectionDivider label="Education" />
      <section className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
        <TimelineSection>
          {EDUCATION.map((edu) => (
            <TimelineCard
              key={edu.institution}
              color={edu.color}
              period={edu.period}
              title={edu.degree}
              org={edu.institution}
              meta={edu.score}
            />
          ))}
        </TimelineSection>
      </section>

      {/* ── Contact finale ─────────────────────────────────────────── */}
      <Contact />
    </motion.main>
  );
};

export default About;
