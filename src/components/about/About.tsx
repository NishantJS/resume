import { useEffect, useRef, FC } from "react";
import Intro from "./Intro";
import Paragraph from "./AboutText";
import { Skills } from "./Skills";
import { motion, useScroll, useReducedMotion } from "motion/react";
import gsap from "gsap";

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

const SectionDivider = ({ label }: { label: string }) => (
  <div className="px-6 md:px-12 xl:px-16 pt-20 pb-10 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
    <div className="flex items-center gap-5">
      <p className="mono text-xs uppercase tracking-[0.22em] text-gray-400 shrink-0">{label}</p>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  </div>
);

/* Single experience card — animates when 80% in view */
const ExpCard: FC<{
  color: string;
  period: string;
  title: string;
  company: string;
  sub?: string | null;
  location: string;
  bullets?: string[];
}> = ({ color, period, title, company, sub, location, bullets }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const line    = el.querySelector<HTMLElement>(".acc-line");
    const dot     = el.querySelector<HTMLElement>(".acc-dot");
    const content = el.querySelectorAll<HTMLElement>(".acc-text");

    if (reduced) {
      gsap.set([el, line, dot, content], { clearProps: "all" });
      return;
    }

    gsap.set(el,      { opacity: 0, x: -24 });
    gsap.set(line,    { scaleY: 0, transformOrigin: "top" });
    gsap.set(dot,     { scale: 0 });
    gsap.set(content, { opacity: 0, y: 12 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(el,      { opacity: 1, x: 0,      duration: 0.5 })
          .to(line,    { scaleY: 1,              duration: 0.5 }, "-=0.3")
          .to(dot,     { scale: 1,               duration: 0.3 }, "-=0.2")
          .to(content, { opacity: 1, y: 0, stagger: 0.07, duration: 0.4 }, "-=0.2");
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={cardRef} className="flex gap-5 md:gap-8">
      {/* Accent line + dot */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div
          className="acc-line w-px flex-1 min-h-[4.5rem]"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
        <div
          className="acc-dot w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 pb-4">
        <p className="acc-text mono text-xs text-gray-500 tabular-nums mb-1.5">{period}</p>
        <p className="acc-text text-xl md:text-2xl font-semibold leading-snug">{title}</p>
        <p className="acc-text mono text-base md:text-lg mt-1 font-medium" style={{ color }}>{company}</p>
        {sub  && <p className="acc-text mono text-sm text-gray-400 mt-0.5">{sub}</p>}
        <p className="acc-text mono text-sm text-gray-500 mt-0.5">{location}</p>
        {bullets && bullets.length > 0 && (
          <ul className="acc-text mt-3 space-y-1.5 pl-0">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-400 leading-relaxed">
                <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* Single education card */
const EduCard: FC<{
  color: string;
  period: string;
  degree: string;
  institution: string;
  score: string;
}> = ({ color, period, degree, institution, score }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const line    = el.querySelector<HTMLElement>(".acc-line");
    const dot     = el.querySelector<HTMLElement>(".acc-dot");
    const content = el.querySelectorAll<HTMLElement>(".acc-text");

    if (reduced) {
      gsap.set([el, line, dot, content], { clearProps: "all" });
      return;
    }

    gsap.set(el,      { opacity: 0, x: -24 });
    gsap.set(line,    { scaleY: 0, transformOrigin: "top" });
    gsap.set(dot,     { scale: 0 });
    gsap.set(content, { opacity: 0, y: 12 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(el,      { opacity: 1, x: 0,      duration: 0.5 })
          .to(line,    { scaleY: 1,              duration: 0.5 }, "-=0.3")
          .to(dot,     { scale: 1,               duration: 0.3 }, "-=0.2")
          .to(content, { opacity: 1, y: 0, stagger: 0.07, duration: 0.4 }, "-=0.2");
      },
      { threshold: 0.75 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={cardRef} className="flex gap-5 md:gap-8">
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className="acc-line w-px flex-1 min-h-[4.5rem]" style={{ backgroundColor: color, opacity: 0.5 }} />
        <div className="acc-dot w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 pb-4">
        <p className="acc-text mono text-xs text-gray-500 tabular-nums mb-1.5">{period}</p>
        <p className="acc-text text-xl md:text-2xl font-semibold leading-snug">{degree}</p>
        <p className="acc-text mono text-base md:text-lg mt-1 font-medium" style={{ color }}>{institution}</p>
        <p className="acc-text mono text-sm text-gray-400 mt-0.5">{score}</p>
      </div>
    </div>
  );
};

const About = () => {
  const reduced = useReducedMotion();

  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = "y proximity";
    return () => { html.style.scrollSnapType = ""; };
  }, []);

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
    >
      {/* Orbs */}
      <div className="orb-pulse pointer-events-none absolute top-[8%] -left-40 w-96 h-96 rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.14), transparent 70%)" }} />
      <div className="orb-pulse pointer-events-none absolute top-[55%] -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(34,211,238,0.09), transparent 70%)", animationDelay: "3s" }} />
      <div className="orb-pulse pointer-events-none absolute top-[80%] left-1/3 w-72 h-72 rounded-full blur-3xl"
           style={{ background: "radial-gradient(circle, rgba(244,63,94,0.07), transparent 70%)", animationDelay: "6s" }} />

      {/* Screen 1: Name */}
      <Intro />

      {/* Paragraphs */}
      <div ref={textRef}>
        {PARAS.map((para, i) => (
          <Paragraph key={i} paragraph={para} progress={scrollYProgress} range={RANGES[i]} />
        ))}
      </div>

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <SectionDivider label="Skills & Tools" />
      <div className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
        <Skills />
      </div>

      {/* ── Experience ──────────────────────────────────────────────── */}
      <SectionDivider label="Experience" />
      <section className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full space-y-6">
        {EXPERIENCE.map((exp) => (
          <ExpCard
            key={exp.company}
            color={exp.color}
            period={exp.period}
            title={exp.role}
            company={exp.company}
            sub={exp.sub}
            location={exp.location}
            bullets={exp.bullets}
          />
        ))}
      </section>

      {/* ── Education ─────────────────────────────────────────────── */}
      <SectionDivider label="Education" />
      <section className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full space-y-6">
        {EDUCATION.map((edu) => (
          <EduCard
            key={edu.institution}
            color={edu.color}
            period={edu.period}
            degree={edu.degree}
            institution={edu.institution}
            score={edu.score}
          />
        ))}
      </section>

      <div className="pb-28" />
    </motion.main>
  );
};

export default About;
