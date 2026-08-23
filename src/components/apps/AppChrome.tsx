import { CSSProperties, FC, Fragment, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { apps, AppMeta } from "./apps.data";
import "./apps.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Same luminance test the project pages use to pick ink over a pastel. */
export function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

/** The four ink values every app page needs, derived from its pastel.
    These run darker than the project pages': a project page is carried
    by screenshots, so its copy can recede, whereas these pages are
    nothing but text and have to clear AA at body size. inkLow lands
    around 7:1 on the pastels, inkDim around 4.5:1 for the small caps
    labels it's reserved for. */
export const inkFor = (color: string) => {
  const light = isLight(color);
  return {
    ink:    light ? "#0d0d0d" : "#ffffff",
    inkLow: light ? "rgba(0,0,0,0.74)" : "rgba(255,255,255,0.82)",
    inkDim: light ? "rgba(0,0,0,0.56)" : "rgba(255,255,255,0.62)",
    border: light ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.2)",
  };
};

/** Ref callback that pairs with `onLoad` to reveal an image.
    React attaches `onLoad` after the element exists, so a cached or
    eagerly-decoded image can finish loading first and never fire it —
    leaving the shot invisible on a repeat visit. Checking `complete`
    here covers that case; `onLoad` covers the slow one. */
export const markLoaded = (el: HTMLImageElement | null) => {
  if (el?.complete) el.classList.add("is-loaded");
};

export const revealOnLoad = (e: { currentTarget: HTMLImageElement }) =>
  e.currentTarget.classList.add("is-loaded");

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

export const ArrowUpRight = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
    <path d="M1 10L10 1M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

/** Reveals `.app-reveal` elements as they scroll in — the same batched
    entrance the listing rows use. */
export const useSectionReveal = (
  scope: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) => {
  const reduced = useReducedMotion();
  useGSAP(() => {
    const items = scope.current?.querySelectorAll<HTMLElement>(".app-reveal");
    if (!items?.length) return;
    if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    gsap.set(items, { opacity: 0, y: 28 });
    ScrollTrigger.batch(items, {
      once: true,
      start: "top 92%",
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }),
    });
  }, { scope, dependencies: [reduced, ...deps] });
};

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

/** Full-bleed typographic statement — the app page's stand-in for a
    project's screenshot gallery. Words rise out of per-line masks. */
export const AppStatement: FC<{ text: string; meta?: string; border: string; inkDim: string }> = ({
  text, meta, border, inkDim,
}) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>(".app-statement-word");
    if (!words?.length) return;
    if (reduced) { gsap.set(words, { yPercent: 0 }); return; }
    gsap.fromTo(words,
      { yPercent: 110 },
      {
        yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.045,
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
  }, { scope: ref, dependencies: [reduced, text] });

  return (
    <section ref={ref} className="app-statement" style={{ borderColor: border }}>
      <p className="app-statement-text">
        {text.split(" ").map((w, i, all) => (
          <Fragment key={i}>
            <span className="app-statement-mask">
              <span className="app-statement-word">{w}</span>
            </span>
            {i < all.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
      {meta && (
        <p className="mono mt-8 text-xs uppercase tracking-[0.22em]" style={{ color: inkDim }}>
          {meta}
        </p>
      )}
    </section>
  );
};

/** Counts a stat up from zero when it scrolls into view.

    Only strings that lead with a number animate ("40+", "8 min",
    "₹499", "4.6★"); anything else ("AES-256") renders as-is. The zero
    is written in useGSAP, which runs before paint, so the real value
    never flashes first. */
export const CountUp: FC<{ value: string; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const m = /^(₹?)(\d+(?:\.\d+)?)(.*)$/.exec(value);
    if (!m) return;

    const [, prefix, num, suffix] = m;
    const target = parseFloat(num);
    const decimals = (num.split(".")[1] ?? "").length;
    if (target === 0) return;

    const counter = { v: 0 };
    const write = () => { el.textContent = prefix + counter.v.toFixed(decimals) + suffix; };
    write();

    gsap.to(counter, {
      v: target,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: write,
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  }, { dependencies: [value, reduced] });

  return <span ref={ref} className={className}>{value}</span>;
};

/** Heading whose words rise out of per-word masks as it scrolls in.
    Inline masks (not block) so the line still wraps as a paragraph. */
export const RevealWords: FC<{
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}> = ({ text, as: Tag = "h2", className = "" }) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>(".rw-word");
    if (!words?.length) return;
    if (reduced) { gsap.set(words, { yPercent: 0 }); return; }
    gsap.fromTo(words,
      { yPercent: 110 },
      {
        yPercent: 0, duration: 0.85, ease: "power4.out", stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
  }, { scope: ref, dependencies: [text, reduced] });

  return (
    <Tag ref={ref as never} className={className}>
      {text.split(" ").map((w, i, all) => (
        <Fragment key={i}>
          <span className="rw-mask"><span className="rw-word">{w}</span></span>
          {i < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
};

/* ── Section shell ─────────────────────────────────────────────────
   A titled band on the tinted surface: mono kicker on the left, content
   on the right, hairline rule above. Matches the project page's
   "Screenshots" label rhythm.                                        */
export const AppSection: FC<{
  kicker: string;
  title?: string;
  intro?: string;
  border: string;
  inkLow: string;
  inkDim: string;
  children: ReactNode;
  id?: string;
}> = ({ kicker, title, intro, border, inkLow, inkDim, children, id }) => (
  <section id={id} className="app-band scroll-mt-24" style={{ borderTop: `1px solid ${border}` }}>
    <div className="app-band-head">
      <span className="mono text-xs tracking-[0.22em] uppercase shrink-0 font-medium" style={{ color: inkDim }}>
        {kicker}
      </span>
      <div className="app-band-rule" style={{ backgroundColor: border }} />
    </div>
    {title && (
      <RevealWords
        text={title}
        className="text-3xl sm:text-4xl xl:text-5xl font-semibold tracking-tight mt-5"
      />
    )}
    {intro && (
      <p className="app-reveal text-base xl:text-lg mt-4 max-w-2xl leading-relaxed" style={{ color: inkLow }}>
        {intro}
      </p>
    )}
    <div className="mt-8 md:mt-10">{children}</div>
  </section>
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
          viewTransition
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
      viewTransition
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
    footnote; this is the second, larger ask. */
export const AppCloser: FC<{ app: AppMeta; ink: string; inkLow: string; inkDim: string; border: string }> = ({
  app, ink, inkLow, inkDim, border,
}) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  /* The homepage finale's reveal, ported. Characters rise out of their
     line mask with a 3D tilt and ignite in the app's two accents before
     settling to the page ink — and the whole thing is scrubbed to
     scroll, so it plays as the heading travels up the viewport and
     unwinds when you scroll back. */
  useGSAP(() => {
    const heading = ref.current?.querySelector<HTMLElement>(".app-closer-text");
    if (!heading) return;
    if (reduced) { gsap.set(heading, { opacity: 1 }); return; }

    // st-line-mask gets bottom padding via CSS so descenders (g, y…)
    // aren't clipped by the mask's overflow.
    const split = SplitText.create(heading, {
      type: "lines,words,chars",
      mask: "lines",
      linesClass: "st-line",
      wordsClass: "ignite-word",
    });
    gsap.set(heading, { opacity: 1 });
    gsap.set(split.chars, { transformPerspective: 500 });

    const accents = [app.glow, app.glow2];
    const tl = gsap.timeline({
      scrollTrigger: { trigger: heading, start: "top 85%", end: "top 38%", scrub: 0.6 },
    });
    tl.from(split.chars, {
      yPercent: 120,
      rotateX: -75,
      opacity: 0,
      transformOrigin: "50% 100%",
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.022,
    });
    split.chars.forEach((c, i) => {
      tl.fromTo(c,
        { color: accents[i % accents.length] },
        { color: ink, duration: 0.6, ease: "power2.out" },
        0.12 + i * 0.022,
      );
    });

    return () => split.revert();
  }, { scope: ref, dependencies: [reduced, app.slug, ink] });

  return (
  <section ref={ref} className="app-closer" style={{ borderTop: `1px solid ${border}` }}>
    <div className="app-closer-inner">
      <p className="mono text-xs uppercase tracking-[0.22em] font-medium" style={{ color: inkDim }}>
        Get {app.name}
      </p>
      <p className="app-closer-text mt-5 opacity-0">{app.closer}</p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <a
          href={app.release.playUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link app-cta app-cta--solid app-cta--lg mono"
          style={{ ["--btn-ink"]: ink, ["--btn-fill"]: app.color, ["--btn-border"]: border } as CSSProperties}
        >
          <PlayIcon />
          Get it on Google Play
        </a>
      </div>
      <p className="mono mt-6 text-xs" style={{ color: inkLow }}>
        Free to install · {app.release.installs} installs · {app.release.rating} ★ · {app.release.minAndroid}
      </p>
    </div>
  </section>
  );
};

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
        viewTransition
        className="link mt-4 px-5 py-2.5 rounded-full bg-zinc-900 text-amber-50 hover:opacity-85 transition-opacity mono text-sm relative"
      >
        ← All apps
      </Link>
    </motion.div>
  );
};
