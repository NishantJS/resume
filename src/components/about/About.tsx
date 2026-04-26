import { useEffect, useRef } from "react";
import Intro from "./Intro";
import Paragraph from "./AboutText";
import { Skills } from "./Skills";
import { motion, useScroll } from "motion/react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3,  ease: [0.55, 0, 1, 0.45]      as [number,number,number,number] } },
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

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
};

const SectionDivider = ({ label }: { label: string }) => (
  <div className="px-6 md:px-12 xl:px-16 pt-20 pb-10 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
    <div className="flex items-center gap-5">
      <p className="mono text-xs uppercase tracking-[0.22em] text-gray-400 shrink-0">{label}</p>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  </div>
);

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
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
        className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full"
      >
        <div className="space-y-10 md:space-y-14">
          {EXPERIENCE.map((exp, i) => (
            <motion.div
              key={i} variants={fadeUp}
              className="flex flex-col md:flex-row md:gap-12 md:items-start"
            >
              {/* Period — brighter so it's legible */}
              <span className="mono text-sm md:text-base text-gray-300 md:w-52 shrink-0 mb-2 md:mb-0 md:pt-1 tabular-nums">
                {exp.period}
              </span>
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-2"
                  style={{ backgroundColor: exp.color }}
                  aria-hidden
                />
                <div>
                  <p className="text-xl md:text-2xl font-semibold leading-snug">{exp.role}</p>
                  <p className="mono text-base md:text-lg mt-1 font-medium" style={{ color: exp.color }}>{exp.company}</p>
                  {exp.sub && (
                    <p className="mono text-sm md:text-base text-gray-300 mt-0.5">{exp.sub}</p>
                  )}
                  <p className="mono text-sm md:text-base text-gray-400 mt-0.5">{exp.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Education ─────────────────────────────────────────────── */}
      <SectionDivider label="Education" />
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full"
      >
        {EDUCATION.map((edu, i) => (
          <motion.div key={i} variants={fadeUp} className="flex flex-col md:flex-row md:gap-12 md:items-start">
            <span className="mono text-sm md:text-base text-gray-300 md:w-52 shrink-0 mb-2 md:mb-0 md:pt-1 tabular-nums">
              {edu.period}
            </span>
            <div className="flex items-start gap-3 flex-1">
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-2"
                style={{ backgroundColor: edu.color }}
                aria-hidden
              />
              <div>
                <p className="text-xl md:text-2xl font-semibold leading-snug">{edu.degree}</p>
                <p className="mono text-base md:text-lg mt-1 font-medium" style={{ color: edu.color }}>{edu.institution}</p>
                <p className="mono text-sm md:text-base text-gray-300 mt-0.5">{edu.score}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <div className="pb-28" />
    </motion.main>
  );
};

export default About;
