import { useEffect, useRef, FC } from "react";
import Intro from "./Intro";
import Paragraph from "./AboutText";
import { Skills } from "./Skills";
import VelocityMarquee from "./VelocityMarquee";
import StatsStrip from "./StatsStrip";
import Contact from "./Contact";
import Explore from "./Explore";
import { motion, useScroll, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSeo } from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

/* Several sections can discover a stale measurement in the same frame —
   fonts swapping in re-wraps every card on the page at once. One
   coalesced refresh per frame instead of one per section. */
let refreshQueued = 0;
const queueRefresh = () => {
  if (refreshQueued) return;
  refreshQueued = requestAnimationFrame(() => {
    refreshQueued = 0;
    ScrollTrigger.refresh();
  });
};

const PARAS = [
  "Hello! I am a Senior Software Developer based in Mumbai, MH, India.",
  "I build production-grade fintech and enterprise systems — from SSE-based real-time feeds to micro-frontend architectures. I care deeply about resilience, low latency, and clean abstractions.",
  "I am currently open to new opportunities and would love to chat with you about your project — let's build something great together!",
];
const RANGES: [number, number][] = [[0, 0.33], [0.34, 0.67], [0.68, 1]];

/* ── Timeline palette ──────────────────────────────────────────────
   One hue family per section, so the three read as different kinds of
   thing, with even hue steps inside each so consecutive entries — and
   the gradient the progress line draws between them — stay distinct.
   Every value is a Tailwind 400, which holds lightness and chroma
   roughly constant across the whole set: hue carries the meaning and
   no single dot shouts over its neighbours on the near-black page.

     Experience   violet 258° → indigo 239° → sky 199° → teal 172°
                  the site's own cool spine, oldest role coolest
     Recognition  amber 43° → rose 351°
                  warm, and near-complementary to that spine
     Education    lime 82° → emerald 160°
                  the arc left between the other two

   The previous set repeated rose across Experience and Recognition and
   gave Education two ambers a single step apart, which read as one
   colour. */
const EXPERIENCE = [
  {
    period: "Jul 2026 – Present",
    role: "Senior Software Developer",
    company: "BCT Consulting",
    companyUrl: "https://in.linkedin.com/company/bct-consulting-private-limited",
    client: "BNP Paribas",
    clientUrl: "https://www.linkedin.com/company/bnp-paribas",
    sub: "Automation team · Full-time · On-site",
    location: "Thane, Maharashtra, India",
    color: "#a78bfa",
    bullets: [],
  },
  {
    period: "Sep 2025 – Jun 2026",
    role: "Software Developer",
    company: "FinQuest Consulting Services",
    companyUrl: "https://www.linkedin.com/company/finquest-consulting-services-official",
    client: "Mirae Asset Capital Markets",
    clientUrl: "https://in.linkedin.com/company/mstockbymiraeasset",
    sub: "Martech department · Full-time · On-site",
    location: "Mumbai, Maharashtra, India",
    color: "#818cf8",
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
    companyUrl: "https://in.linkedin.com/company/futurescape-technologies",
    client: null,
    sub: "Full-time · On-site",
    location: "Navi Mumbai, Maharashtra, India",
    color: "#38bdf8",
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
    companyUrl: "https://in.linkedin.com/company/pinsoutinnovation",
    client: null,
    sub: "Full-time · On-site",
    location: "Noida, Uttar Pradesh, India",
    color: "#2dd4bf",
    bullets: [
      "Developed backend APIs for a job portal covering multiple user roles",
      "Built real-time chat using WebSockets",
      "Implemented wallet and payment systems with secure transactions",
      "Led frontend for employer workflows with focus on performance",
    ],
  },
];

/* Awards and placements. Anything with an `href` is externally
   verifiable and links out. */
const RECOGNITION = [
  {
    period: "May 2025",
    title: "3rd place — ReactJam",
    org: "ReactJam Spring 2025",
    orgUrl: null,
    sub: "Global game jam for React developers",
    href: "https://reactjam.com/winners",
    color: "#fbbf24",
  },
  {
    period: "Oct 2022",
    title: "Intern of the Month",
    org: "Pinsout Innovation",
    orgUrl: "https://in.linkedin.com/company/pinsoutinnovation",
    sub: null,
    href: null,
    color: "#fb7185",
  },
];

const EDUCATION = [
  {
    period: "Aug 2021 – May 2023",
    degree: "Master of Computer Applications (MCA)",
    institution: "Lovely Professional University",
    institutionUrl: "https://www.linkedin.com/company/lovely-professional-university",
    score: "8.8 CGPA",
    color: "#a3e635",
  },
  {
    period: "Aug 2018 – May 2021",
    degree: "Bachelor of Computer Applications (BCA)",
    institution: "Lovely Professional University",
    institutionUrl: "https://www.linkedin.com/company/lovely-professional-university",
    score: "7.2 CGPA",
    color: "#34d399",
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

    /* Span the rail from the first dot to the last, not the whole
       section. Laid out to the container it runs on past the final dot
       — 34% of the way in Recognition, whose cards are short — so the
       line kept drawing after everything had already lit. Anchoring it
       to the dots makes the line finish exactly as the last one lights,
       whatever the cards contain. A lone dot has no span, so those
       sections keep the CSS default. */
    const layoutTrack = () => {
      if (!track || dots.length < 2) return;
      const base = el.getBoundingClientRect().top;
      const centre = (d: HTMLElement) => {
        const r = d.getBoundingClientRect();
        // Dots are scaled to 0 until lit, which collapses the rect to
        // its centre point — this reads correctly either way.
        return r.top + r.height / 2 - base;
      };
      const top = centre(dots[0]);
      track.style.top = `${top}px`;
      track.style.bottom = "auto";
      const height = Math.max(centre(dots[dots.length - 1]) - top, 0);
      track.style.height = `${height}px`;
      paintProgress(height, top, base);
    };

    /* The line is coloured by the dots it runs between, with a stop at
       each dot's own position along the rail — so the stretch between
       two entries is a blend of exactly those two colours, and the line
       arrives at each dot already carrying that dot's accent.

       The reveal is a clip, not a scaleY. Scaling squashed the whole
       gradient into whatever fraction was visible, so the very first
       inch of line showed every colour in the section at once instead
       of the first pair. Clipping leaves the gradient painted at full
       height and just uncovers it. */
    const paintProgress = (height: number, top: number, base: number) => {
      if (!progress) return;
      const first = dots[0];
      if (!first) return;
      if (dots.length < 2 || !height) {
        progress.style.background = getComputedStyle(first).backgroundColor;
        return;
      }
      const stops = Array.from(dots, d => {
        const r = d.getBoundingClientRect();
        const at = (r.top + r.height / 2 - base - top) / height;
        const pct = Math.round(Math.min(Math.max(at, 0), 1) * 1000) / 10;
        return `${getComputedStyle(d).backgroundColor} ${pct}%`;
      });
      progress.style.background = `linear-gradient(180deg, ${stops.join(", ")})`;
    };

    layoutTrack();
    ScrollTrigger.addEventListener("refreshInit", layoutTrack);

    /* The rail is measured from where the dots are, so anything that
       moves them leaves it wrong — and the classic one is the webfont.
       The first measurement happens against the fallback face; when
       Rubik swaps in, every card re-wraps, the last dot moves up, and
       the rail keeps the length it had — which is the stray tail of
       line past the final circle.

       A refresh re-runs layoutTrack (it is registered on refreshInit
       above) and then lets ScrollTrigger re-measure the scrub range
       against the corrected geometry, so the dots keep lighting at the
       right moment. The observer covers the same class of problem from
       any other source: a resize, a late image, a re-wrap. */
    let lastHeight = el.getBoundingClientRect().height;
    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      if (Math.abs(h - lastHeight) < 1) return;
      lastHeight = h;
      queueRefresh();
    });
    ro.observe(el);

    document.fonts?.ready.then(queueRefresh);

    if (reduced) {
      gsap.set(progress, { "--tl-fill": 1 });
      dots.forEach(d => d.classList.add("on"));
      return () => {
        ro.disconnect();
        ScrollTrigger.removeEventListener("refreshInit", layoutTrack);
      };
    }

    /* One scrubbed tween drives the gradient line AND the dots: a dot
       lights up the moment the line's rendered edge reaches it, and goes
       dark again when you scroll back above it. Reading the rendered
       scaleY (not scroll progress) keeps dots in lockstep with the
       scrub-smoothed line.

       The scrub runs on the track, from its top hitting mid-screen to
       its bottom hitting mid-screen — and the track spans first dot to
       last, so every dot lights exactly as it crosses the middle of the
       viewport. Driven off the section instead, the mapping depended on
       how tall that section's cards happened to be: short entries lit
       early, long ones were still dark well past centre. */
    gsap.fromTo(progress,
      { "--tl-fill": 0 },
      {
        "--tl-fill": 1,
        ease: "none",
        onUpdate() {
          if (!track || !progress) return;
          const r = track.getBoundingClientRect();
          const lit = r.top + r.height * Number(gsap.getProperty(progress, "--tl-fill"));
          /* Every dot is measured before any class is touched. Reading a
             rect after a class change on a sibling forces the browser to
             flush layout there and then, so the interleaved version paid
             one synchronous reflow per dot on every scrub frame — the
             whole section re-laid-out eight times per frame while you
             scrolled past it. The centres are invariant under `.on`
             anyway (it scales the dot about its own centre), so one read
             pass up front is exact, not an approximation. */
          const centres = dots.length
            ? Array.from(dots, d => {
                const b = d.getBoundingClientRect();
                return b.top + b.height / 2;
              })
            : [];
          dots.forEach((dot, i) => dot.classList.toggle("on", centres[i] <= lit + 1));
        },
        scrollTrigger: {
          trigger: track,
          start: "top center",
          end: "bottom center",
          /* Generous smoothing on purpose. `scrub` is not a delay — it
             is how long the playhead takes to ease to wherever the
             scroll has put it, running on GSAP's own ticker rather than
             on scroll events. At 0.6 a flick through the section
             arrived as two or three jumps: the line snapped down and
             every dot lit at once. At 1.4 the same flick still draws
             the whole rail, just over its own second and a half. */
          scrub: 1.4,
          invalidateOnRefresh: true,
        },
      },
    );

    return () => {
      ro.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", layoutTrack);
    };
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
  /** Named on its own row — on a consultancy placement the client is
      who the work was actually for. */
  client?: string | null;
  /** When set, the title becomes an outbound link. */
  href?: string | null;
  /** LinkedIn pages for the employer and, on a placement, the client.
      These read exactly as they did before — same colour, same weight,
      no underline. The affordance is the cursor: `.link` is what the
      custom cursor watches for, so it swells over them. */
  orgHref?: string | null;
  clientHref?: string | null;
}> = ({ color, period, title, org, sub, meta, bullets, client, href, orgHref, clientHref }) => {
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
        <p className="tl-text text-xl md:text-2xl font-semibold leading-snug">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="link inline-flex items-baseline gap-2 hover:opacity-80 transition-opacity"
            >
              {title}
              <span className="text-[0.6em] opacity-60" aria-hidden>↗</span>
            </a>
          ) : title}
        </p>
        <p className="tl-text mono text-base md:text-lg mt-1 font-medium" style={{ color }}>
          {orgHref ? (
            <a
              href={orgHref}
              target="_blank"
              rel="noreferrer noopener"
              className="link tl-org-link"
              aria-label={`${org} on LinkedIn`}
            >
              {org}
            </a>
          ) : org}
        </p>
        {client && (
          <p className="tl-text mt-2.5">
            <span
              className="tl-client mono inline-flex items-center gap-2 text-sm md:text-base font-medium"
              style={{ ["--tl-c" as string]: color } as React.CSSProperties}
            >
              <span className="tl-client-label">Client</span>
              {clientHref ? (
                <a
                  href={clientHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link tl-org-link"
                  aria-label={`${client} on LinkedIn`}
                >
                  {client}
                </a>
              ) : client}
            </span>
          </p>
        )}
        {sub && <p className="tl-text mono text-sm text-gray-400 mt-2">{sub}</p>}
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
    title: "Nishant Chorge — Senior Software Developer",
    description:
      "Senior Software Developer in Mumbai building production-grade fintech and enterprise systems — SSE real-time feeds, micro-frontends, resilient APIs. Currently at BCT Consulting, on the automation team for BNP Paribas. Node.js · React · Next.js · Fastify · Redis.",
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
              client={exp.client}
              meta={exp.location}
              bullets={exp.bullets}
              orgHref={exp.companyUrl}
              clientHref={exp.clientUrl}
            />
          ))}
        </TimelineSection>
      </section>

      {/* ── Recognition ───────────────────────────────────────────── */}
      <SectionDivider label="Recognition" />
      <section className="px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full">
        <TimelineSection>
          {RECOGNITION.map((item) => (
            <TimelineCard
              key={item.title}
              color={item.color}
              period={item.period}
              title={item.title}
              org={item.org}
              sub={item.sub}
              href={item.href}
              orgHref={item.orgUrl}
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
              key={edu.degree}
              color={edu.color}
              period={edu.period}
              title={edu.degree}
              org={edu.institution}
              meta={edu.score}
              orgHref={edu.institutionUrl}
            />
          ))}
        </TimelineSection>
      </section>

      {/* ── Where to go next ───────────────────────────────────────
          The three listings, at the bottom of the page the reader has
          just finished — rather than a trip back up to the nav bar. */}
      <SectionDivider label="Explore" />
      <Explore />

      {/* ── Contact finale ─────────────────────────────────────────── */}
      <Contact />
    </motion.main>
  );
};

export default About;
