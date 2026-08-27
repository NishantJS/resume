import { CSSProperties, FC, Fragment, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { apps, AppMeta } from "./apps.data";
import {
  ArrowUpRight, CountUp, RevealWords, inkFor, isLight, markLoaded, revealOnLoad, useRevealBatch,
} from "../shared/reveal";
import { Closer, DetailSection, Inks, Statement } from "../shared/DetailChrome";
import "./apps.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* The tinted-page primitives are shared with /work — re-exported here so
   the app pages keep importing their chrome from one place. */
export { ArrowUpRight, CountUp, RevealWords, inkFor, isLight, markLoaded, revealOnLoad };
export { Accordion, FactsBand, FlowSteps, OverviewBand, SectionRail, StackGroups } from "../shared/DetailChrome";
export type { Inks, RailSection } from "../shared/DetailChrome";

/** An app page's full colour set. The two saturated glows already in
    the catalogue — chosen to match the accent inside the screenshots —
    double as the accents the heading reveals ignite in. */
export const inksFor = (app: AppMeta): Inks => ({
  ...inkFor(app.color),
  accent: app.glow,
  accent2: app.glow2,
  panel: isLight(app.color) ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.07)",
});

/* The band shell and the two display moments are the same on both
   sides of the site; /apps just keeps its historical names for them. */
export const AppSection = DetailSection;
export const AppStatement = Statement;

/** The Google Play mark — four segments, brand colours. Kept in colour
    even on a dark button, which is how the official badge renders it. */
export const PlayIcon = () => (
  <svg width="15" height="16" viewBox="0 0 512 512" aria-hidden focusable="false">
    <path fill="#4285F4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
    <path fill="#EA4335" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z" />
    <path fill="#FBBC04" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
    <path fill="#34A853" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

/** Word-by-word, char-by-char masked reveal — the project hero's title
    treatment, reused so app titles enter the same way. */
export const MaskedTitle: FC<{
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Let words wrap as a paragraph instead of one word per line.
      Block masks suit a short project name; a full sentence needs
      inline masks with real spaces between them to break naturally. */
  flow?: boolean;
}> = ({ text, className = "", style, flow = false }) => {
  const words = text.split(" ");
  const Mask = flow ? "span" : "div";
  return (
    <h1 className={className} style={style}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <Mask className={`${flow ? "tm-flow" : "block"} overflow-hidden pb-[0.06em] -mb-[0.06em]`}>
            <span className="tw inline-block whitespace-nowrap opacity-0">
              {Array.from(word).map((ch, ci) => (
                <span key={ci} className="tc inline-block will-change-transform">{ch}</span>
              ))}
            </span>
          </Mask>
          {flow && wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
};

/** Drives the .tw / .tc masked entrance plus the watermark parallax.
    Mirrors project/About.tsx so both heroes feel identical. */
export const useHeroEntrance = (
  scope: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) => {
  useGSAP(() => {
    const el = scope.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.querySelectorAll<HTMLElement>(".tw, .meta-line, .desc-col, .proj-watermark, .proj-scroll-cue")
        .forEach(e => { e.style.opacity = "1"; });
      return;
    }

    // Chars are parked below their mask before the words are unhidden, so
    // nothing flashes on first paint (useGSAP runs pre-paint).
    gsap.set(el.querySelectorAll(".tc"), { yPercent: 115, rotate: 5 });
    gsap.set(el.querySelectorAll(".tw"), { opacity: 1 });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(el.querySelectorAll<HTMLElement>(".tc"),
        { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.022 }, 0.1)
      .fromTo(el.querySelector(".proj-watermark"),
        { opacity: 0, scale: 1.12, yPercent: 6 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 1.1, ease: "power3.out" }, 0.15)
      .fromTo(el.querySelectorAll(".meta-line"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }, 0.25)
      .fromTo(el.querySelector(".desc-col"),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.4)
      .fromTo(el.querySelector(".proj-scroll-cue"),
        { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.8);

    const wm = el.querySelector(".proj-watermark");
    if (wm) {
      gsap.to(wm, {
        yPercent: 26, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }
  }, { scope, dependencies: deps });
};

/** Reveals elements as they scroll in — the same batched entrance the
    listing rows use. Covers both marks: the app pages' own `.app-reveal`
    and the `.dt-reveal` the shared detail bands emit. */
export const useSectionReveal = (
  scope: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) => useRevealBatch(scope, ".app-reveal, .dt-reveal", deps);

/** Infinite marquee of short strings — the project page's skills rail. */
export const AppMarquee: FC<{ items: string[]; ink: string; border: string }> = ({ items, ink, border }) => (
  <div className="overflow-hidden border-y py-3 md:py-4" style={{ borderColor: border }} aria-hidden>
    <div className="flex gap-8 md:gap-12 whitespace-nowrap skill-marquee" style={{ color: ink }}>
      {[...items, ...items, ...items].map((s, i) => (
        <span key={i} className="mono text-xs md:text-sm uppercase tracking-widest shrink-0 opacity-60">{s}</span>
      ))}
    </div>
  </div>
);

/* ── Sub-page navigation ───────────────────────────────────────────
   Overview / Support / Changelog / Privacy, as mono links with the
   site's sliding underline (.nav-link) rather than filled chips.     */
const TABS = [
  { key: "",          label: "Overview"  },
  { key: "support",   label: "Support"   },
  { key: "changelog", label: "Changelog" },
  { key: "privacy",   label: "Privacy"   },
];

export const AppTabs: FC<{ app: AppMeta; tab: string; border: string; inkLow: string }> = ({
  app, tab, border, inkLow,
}) => (
  <nav
    className="app-tabs mono"
    style={{ borderColor: border }}
    aria-label={`${app.name} sections`}
  >
    {TABS.map(t => {
      const active = t.key === tab;
      return (
        <Link
          key={t.key}
          to={`/apps/${app.slug}${t.key ? `/${t.key}` : ""}`}
          className="app-tab link nav-link"
          style={{ color: active ? "inherit" : inkLow }}
          aria-current={active ? "page" : undefined}
        >
          {t.label}
        </Link>
      );
    })}
  </nav>
);

/* ── Prev / next app ───────────────────────────────────────────────
   Straight reuse of the project page's footer cards.                 */
const NavApp: FC<{ index: number; direction: "prev" | "next" }> = ({ index, direction }) => {
  const app = direction === "prev"
    ? apps[index ? index - 1 : apps.length - 1]
    : apps[index < apps.length - 1 ? index + 1 : 0];
  const isNext = direction === "next";
  return (
    <Link
      to={`/apps/${app.slug}`}
      className={`link proj-nav-card group ${isNext ? "proj-nav-card--next" : ""}`}
      style={{ ["--target"]: app.color } as CSSProperties}
    >
      <span className="mono text-[0.62rem] uppercase tracking-[0.28em] opacity-45 group-hover:opacity-80 transition-opacity">
        {isNext ? "Next app" : "Previous app"}
      </span>
      <span className="proj-nav-title">
        <span className="proj-nav-arrow" aria-hidden>{isNext ? "→" : "←"}</span>
        <span className="text-xl md:text-3xl xl:text-4xl font-semibold tracking-tight">{app.name}</span>
      </span>
      <span className="mono text-xs opacity-40 group-hover:opacity-70 transition-opacity">{app.role}</span>
    </Link>
  );
};

export const AppNav: FC<{ index: number; border: string }> = ({ index, border }) => (
  <nav
    className="proj-nav grid md:grid-cols-2 border-t"
    style={{ borderColor: border, ["--nav-border"]: border } as CSSProperties}
    aria-label="App navigation"
  >
    <NavApp index={index} direction="prev" />
    <NavApp index={index} direction="next" />
  </nav>
);

/** Builds the support mailto: subject, cc and a form-style body.
    Every field we would otherwise have to write back and ask for is
    already in the draft, so the first reply can be the answer. */
export const supportMailto = (app: AppMeta) => {
  const subject = `[${app.name} ${app.release.version}] `;
  const body = [
    `Hi — I need help with ${app.name}.`,
    "",
    "WHAT'S HAPPENING",
    "(describe the problem, and what you expected instead)",
    "",
    "STEPS TO REPRODUCE",
    "1. ",
    "2. ",
    "3. ",
    "",
    "— — — please leave the details below, they save a round trip — — —",
    `App              : ${app.name}`,
    `App version      : ${app.release.version}`,
    "Device model     : (e.g. Pixel 8, Galaxy S23)",
    "Android version  : (Settings → About phone)",
    "Account email    : (only if different from this one)",
    "Happens every time: yes / no",
    "Screenshot attached: yes / no",
  ].join("\r\n");

  return `mailto:${app.support.email}`
    + `?cc=${encodeURIComponent(app.support.cc)}`
    + `&subject=${encodeURIComponent(subject)}`
    + `&body=${encodeURIComponent(body)}`;
};

/** Closing call to action. A product page should never end on a
    footnote; this is the second, larger ask. The reveal itself is the
    shared one — the same characters-ignite-and-cool treatment the
    project pages close on. */
export const AppCloser: FC<{ app: AppMeta; inks: Inks }> = ({ app, inks }) => (
  <Closer
    kicker={`Get ${app.name}`}
    text={app.closer}
    inks={inks}
    footnote={`Free to install · ${app.release.installs} installs · ${app.release.rating} ★ · ${app.release.minAndroid}`}
  >
    <a
      href={app.release.playUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="link app-cta app-cta--solid app-cta--lg mono"
      style={{ ["--btn-ink"]: inks.ink, ["--btn-fill"]: app.color, ["--btn-border"]: inks.border } as CSSProperties}
    >
      <PlayIcon />
      Get it on Google Play
    </a>
  </Closer>
);

/** Unknown slug under /apps — styled like the site's own 404. */
export const AppNotFound: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="warm-gradient relative flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center overflow-hidden"
    >
      <span
        className="mono select-none absolute font-bold leading-none pointer-events-none"
        style={{ fontSize: "clamp(9rem, 30vw, 24rem)", color: "transparent", WebkitTextStroke: "1.5px rgba(0,0,0,0.08)" }}
        aria-hidden
      >
        404
      </span>
      <p className="mono text-xs uppercase tracking-[0.3em] text-zinc-500 relative">App not found</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight relative">Nothing shipped here.</h2>
      <p className="text-zinc-500 mono relative max-w-sm text-sm">
        That app may have been renamed, or never made it to the store.
      </p>
      <Link
        to="/apps"
        className="link mt-4 px-5 py-2.5 rounded-full bg-zinc-900 text-amber-50 hover:opacity-85 transition-opacity mono text-sm relative"
      >
        ← All apps
      </Link>
    </motion.div>
  );
};
