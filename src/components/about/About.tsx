import { useEffect, useRef, FC } from "react";
import Intro from "./Intro";
import Paragraph from "./AboutText";
import { Skills } from "./Skills";
import { motion, useScroll } from "motion/react";
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
    role: "Software Developer",
    company: "Finquest Consulting",
    sub: "Client: Mirae Asset Capital Markets",
    location: "Mumbai, MH",
    color: "#a855f7",
  },
  {
    period: "Mar 2023 – Aug 2025",
    role: "Software Developer",
    company: "Futurescape Technologies",
    sub: null,
    location: "Navi Mumbai, MH",
    color: "#22d3ee",
  },
  {
    period: "Aug 2022 – Mar 2023",
    role: "Software Developer",
    company: "Pinsout Innovations",
    sub: null,
    location: "Noida, UP",
    color: "#f43f5e",
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
}> = ({ color, period, title, company, sub, location }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const line    = el.querySelector<HTMLElement>(".acc-line");
    const dot     = el.querySelector<HTMLElement>(".acc-dot");
    const content = el.querySelectorAll<HTMLElement>(".acc-text");

    // Start hidden
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
  }, []);

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

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const line    = el.querySelector<HTMLElement>(".acc-line");
    const dot     = el.querySelector<HTMLElement>(".acc-dot");
    const content = el.querySelectorAll<HTMLElement>(".acc-text");

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
  }, []);

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
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = "y proximity";
    return () => { html.style.scrollSnapType = ""; };
  }, []);

  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.9", "end 0.9"] });

  return (
    <motion.main
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
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
