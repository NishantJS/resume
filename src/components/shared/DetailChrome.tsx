import { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { useIgnite } from "./reveal";
import "./detail.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Detail-page chrome ────────────────────────────────────────────
   The bands a tinted detail page is built from. /work/:project and
   /apps/:app are the same page in two palettes and two subjects, so
   the shell, the type scale, the facts strip, the connected flow and
   the section rail all live here, taking their colour from an Inks
   object rather than from either data model. */

/* Every band is tinted from the same six values, so they travel as one
   object rather than six repeated attributes per call site. */
export type Inks = {
  ink: string;
  inkLow: string;
  inkDim: string;
  border: string;
  accent: string;
  accent2: string;
  /** Translucent panel fill, keyed to the page ink. */
  panel: string;
};

/* ── Shared shell for every band below the project hero ────────────
   Mono kicker on the left with a hairline running out to the edge,
   then an optional masked-word heading and lede. Same rhythm as the
   app pages, so /work and /apps read as one site.                   */
export const DetailSection: FC<{
  id: string;
  kicker: string;
  title?: string;
  intro?: string;
  inks: Inks;
  children: ReactNode;
}> = ({ id, kicker, title, intro, inks, children }) => {
  const { ink, inkLow, inkDim, border, accent, accent2 } = inks;
  const ref = useRef<HTMLElement>(null);

  // Word-level and untilted — the calm cousin of the closer's reveal.
  // Plays once: a heading that re-animates every time you scroll back
  // to re-read the section under it is a distraction, not an effect.
  useIgnite(ref, ".dt-title", {
    accents: [accent, accent2],
    ink,
    unit: "words",
    scrub: false,
    tilt: 0,
    stagger: 0.05,
    start: "top 88%",
  }, [title, ink, accent]);

  return (
    <section ref={ref} id={id} className="dt-band scroll-mt-24" style={{ borderTop: `1px solid ${border}` }}>
      <div className="dt-band-head">
        <span className="dt-kicker" style={{ color: inkDim }}>{kicker}</span>
        <div className="dt-band-rule" style={{ backgroundColor: border }} />
      </div>
      {title && <h2 className="dt-title opacity-0">{title}</h2>}
      {intro && <p className="dt-reveal dt-lede" style={{ color: inkLow }}>{intro}</p>}
      <div className="mt-8 md:mt-10">{children}</div>
    </section>
  );
};

/* ── Facts band ────────────────────────────────────────────────────
   The four things somebody wants before any prose — who it was for,
   when, in what role — as a hairline strip under the hero. */
export const FactsBand: FC<{ facts: [string, string][]; inks: Inks }> = ({ facts, inks }) => {
  if (!facts.length) return null;
  return (
    <dl className="dt-facts" style={{ ["--dt-border"]: inks.border } as CSSProperties}>
      {facts.slice(0, 4).map(([label, value]) => (
        <div key={label} className="dt-fact">
          <dt className="dt-fact-label" style={{ color: inks.inkDim }}>{label}</dt>
          <dd className="dt-fact-value">{value}</dd>
        </div>
      ))}
    </dl>
  );
};

/* ── Pull quote ────────────────────────────────────────────────────
   One line of the project, set large. Scrubbed rather than played:
   the words rise and cool from the accents to the ink as the quote
   travels up the viewport, and wind back down if you scroll up — it
   reads as a thing you are scrubbing through, not a thing that fired
   once while you were looking away. */
export const Statement: FC<{ text: string; meta?: string; inks: Inks }> = ({ text, meta, inks }) => {
  const { ink, inkDim, border, accent, accent2 } = inks;
  const ref = useRef<HTMLElement>(null);

  useIgnite(ref, ".dt-statement-text", {
    accents: [accent, accent2],
    ink,
    unit: "chars",
    scrub: true,
    tilt: 40,
    stagger: 0.018,
    start: "top 88%",
    end: "top 32%",
  }, [text, ink, accent]);

  return (
    <section ref={ref} className="dt-statement" style={{ ["--dt-border"]: border } as CSSProperties}>
      <p className="dt-statement-text opacity-0">{text}</p>
      {meta && <p className="dt-statement-meta" style={{ color: inkDim }}>{meta}</p>}
    </section>
  );
};

/* ── Closing call to action ────────────────────────────────────────
   The page's loudest moment: characters rise out of a line mask with
   a 3D tilt, lit in the page's two accents, and cool to the ink as
   the heading travels up. Scrubbed, so it unwinds on the way back.
   Shares its implementation with the pull quote above. The caller
   supplies whatever the ask is — a link out, a store button. */
export const Closer: FC<{
  kicker: string;
  text: string;
  inks: Inks;
  children?: ReactNode;
  footnote?: string;
}> = ({ kicker, text, inks, children, footnote }) => {
  const { ink, inkLow, inkDim, border, accent, accent2 } = inks;
  const ref = useRef<HTMLElement>(null);

  useIgnite(ref, ".dt-closer-text", {
    accents: [accent, accent2],
    ink,
    unit: "chars",
    scrub: true,
    tilt: 75,
    stagger: 0.022,
    start: "top 85%",
    end: "top 38%",
  }, [text, ink, accent]);

  if (!text) return null;

  return (
    <section ref={ref} className="dt-closer" style={{ ["--dt-border"]: border } as CSSProperties}>
      <p className="dt-kicker" style={{ color: inkDim }}>{kicker}</p>
      <p className="dt-closer-text opacity-0">{text}</p>
      {children && (
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
      )}
      {footnote && (
        <p className="mono mt-6 text-xs" style={{ color: inkLow }}>{footnote}</p>
      )}
    </section>
  );
};

/* ── Section rail ──────────────────────────────────────────────────
   Markers down the right edge tracking the band you're reading, and a
   jump-to when you want one. Deliberately quiet: hairlines at rest,
   labels only on hover, and absent entirely unless it is useful —

     · nothing is in the reading band yet (you're still on the hero),
     · the screenshot rail is up, which runs full-bleed under it and
       carries its own counter anyway,
     · the prev/next nav is on screen, where there is nothing left to
       jump to and its right-hand card sits in the same column.

   Portalled to <body>: the router wraps every page in a will-change:
   transform div for the scroll-skew, which makes it the containing
   block for position: fixed — inside it, the rail would sit halfway
   down the document instead of halfway down the viewport. */
export type RailSection = { id: string; label: string };

export const SectionRail: FC<{
  sections: RailSection[];
  accent: string;
  ink: string;
}> = ({ sections, accent, ink }) => {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [reading, setReading] = useState(false);
  const [atNav, setAtNav] = useState(false);

  useEffect(() => {
    if (sections.length < 2) return;
    const nodes = sections
      .map(s => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    // rootMargin shrinks the root to a thin band across the middle of
    // the viewport, so "active" means the section under the eye rather
    // than whichever one happens to be poking in at the bottom. An
    // empty set means no band is in that strip at all — the hero, or
    // the footer — and the rail steps out.
    const lit = new Map<string, number>();
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) lit.set(e.target.id, e.intersectionRatio);
          else lit.delete(e.target.id);
        });
        setReading(lit.size > 0);
        if (!lit.size) return;
        setActive([...lit.entries()].sort((a, b) => b[1] - a[1])[0][0]);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] },
    );
    nodes.forEach(n => io.observe(n));

    const foot = document.querySelector(".proj-nav");
    const footIo = foot && new IntersectionObserver(
      ([e]) => setAtNav(e.isIntersecting),
      { rootMargin: "0px 0px -25% 0px" },
    );
    if (foot && footIo) footIo.observe(foot);

    return () => { io.disconnect(); footIo?.disconnect(); };
  }, [sections]);

  if (sections.length < 2) return null;

  const away = !reading || atNav || active === "screens";

  return createPortal(
    <nav
      className="dt-rail"
      style={{ ["--dt-accent"]: accent, color: ink } as CSSProperties}
      aria-label="Sections"
      aria-hidden={away || undefined}
      data-away={away || undefined}
    >
      {sections.map(s => (
        <button
          key={s.id}
          type="button"
          className="dt-rail-item link"
          tabIndex={away ? -1 : undefined}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ block: "start" })}
        >
          <span className="dt-rail-label">{s.label}</span>
          <span className="dt-rail-mark" aria-hidden />
          <span className="sr-only">Jump to {s.label}</span>
        </button>
      ))}
    </nav>,
    document.body,
  );
};

/* ── Connected steps ───────────────────────────────────────────────
   The path in n steps, strung along a rule that fills as the band
   scrolls in — horizontal on desktop, vertical down the left on a
   phone.

   One scrubbed tween drives the rule and the dots together: a dot
   lights the moment the line's *rendered* edge reaches it, and goes
   dark again on the way back up. Reading the rendered scale rather
   than raw scroll progress is what keeps them in lockstep with the
   scrub's smoothing.

   matchMedia rather than a one-off measurement of the track: the rule
   is horizontal above 900px and vertical below, and a resize across
   that line has to rebuild the tween on the other axis. Measured once
   at mount, a phone rotated to landscape kept scrubbing the wrong
   property and the line never moved.

   The end is a fixed fraction of the viewport, not the section's own
   height. Tied to the section, the desktop row — barely 200px tall —
   burned through the whole animation in a flick of the wheel. */
export const FlowSteps: FC<{
  steps: { title: string; body: string }[];
  inks: Inks;
  /** Re-runs the build when the page's subject changes. */
  resetKey?: string;
}> = ({ steps, inks, resetKey }) => {
  const { inkLow, inkDim, border, accent, accent2 } = inks;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* The horizontal rail gives each step a column. Up to six that still
     leaves a column wide enough to read; a nine-step sequence would get
     a ninth of the width each, narrower than a sentence. So seven or
     more stays the vertical timeline at every width, with the number
     and title beside the body — the right shape for a long sequence
     anyway. Below seven, desktop gets the rail and mobile keeps the
     stack, as before. */
  const stack = steps.length >= 7;
  /* Five and six columns are tighter than the four this was drawn for,
     so the type steps down rather than the grid wrapping. */
  const tight = !stack && steps.length > 4;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const track = el.querySelector<HTMLElement>(".dt-flow-track");
    const fill  = el.querySelector<HTMLElement>(".dt-flow-fill");
    const items = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".dt-step"));
    const dots  = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".dt-step-dot"));
    if (!track || !fill || !items.length) return;

    if (reduced) {
      gsap.set(fill, { "--dt-fill": 1 });
      items.forEach(s => s.classList.add("is-on"));
      return;
    }

    const mm = gsap.matchMedia(ref);

    const build = (horizontal: boolean) => () => {
      // Read every dot, then write every class. Toggling `is-on` on a
      // step invalidates layout for the ones after it, so measuring in
      // the same pass forced a synchronous reflow per step on every
      // scrub frame.
      const paint = () => {
        const r = track.getBoundingClientRect();
        const p = Number(gsap.getProperty(fill, "--dt-fill"));
        const edge = horizontal ? r.left + r.width * p : r.top + r.height * p;
        const centres = dots.map(dot => {
          const b = dot.getBoundingClientRect();
          return horizontal ? b.left + b.width / 2 : b.top + b.height / 2;
        });
        centres.forEach((centre, i) => {
          items[i]?.classList.toggle("is-on", centre <= edge + 2);
        });
      };

      // Clipped, not scaled: a transform squashes the whole gradient
      // into the visible fraction, so the first stretch of rule showed
      // both accents at once instead of easing from the first to the
      // second.
      gsap.fromTo(fill, { "--dt-fill": 0 }, {
        "--dt-fill": 1,
        ease: "none",
        onUpdate: paint,
        scrollTrigger: {
          trigger: el,
          start: horizontal ? "top 80%" : "top 78%",
          end: horizontal ? "+=60%" : "bottom 62%",
          // Same reasoning as the About timeline: enough smoothing that
          // a flick past the section still draws the rule and lights
          // the steps in order instead of snapping to the end.
          scrub: 1.2,
          invalidateOnRefresh: true,
          // Scrubbing back past the start leaves the tween parked at 0
          // without a final onUpdate, so the last dot could stay lit.
          onLeaveBack: () => items.forEach(s => s.classList.remove("is-on")),
        },
      });
    };

    if (stack) {
      // Stacked at every width, so there is one orientation to scrub.
      build(false)();
    } else {
      mm.add("(min-width: 900px)", build(true));
      mm.add("(max-width: 899px)", build(false));
    }

    return () => mm.revert();
  }, { scope: ref, dependencies: [reduced, resetKey, stack] });

  return (
    <div
      ref={ref}
      className={`dt-flow${stack ? " dt-flow--stack" : ""}${tight ? " dt-flow--tight" : ""}`}
      style={{
        ["--dt-border"]: border,
        ["--dt-accent"]: accent,
        ["--dt-accent2"]: accent2,
        ...(stack ? {} : { ["--dt-flow-cols"]: steps.length }),
      } as CSSProperties}
    >
      <div className="dt-flow-track" aria-hidden><div className="dt-flow-fill" /></div>
      {steps.map((s, i) => (
        <div key={s.title} className="dt-step">
          <span className="dt-step-dot" aria-hidden />
          <span className="dt-step-num" style={{ color: inkDim }}>Step {String(i + 1).padStart(2, "0")}</span>
          <h3 className="dt-step-title">{s.title}</h3>
          <p className="mt-2.5 text-[0.95rem] leading-relaxed" style={{ color: inkLow }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
};

/* ── Grouped stack ─────────────────────────────────────────────────
   A flat tech list regrouped by what each thing is for — the version
   that answers "what is this built on" in one look. */
export const StackGroups: FC<{ groups: { group: string; items: string[] }[]; inks: Inks }> = ({
  groups, inks,
}) => (
  <div
    className="dt-stack"
    style={{ ["--dt-border"]: inks.border, ["--dt-accent"]: inks.accent } as CSSProperties}
  >
    {groups.map(g => (
      <div key={g.group} className="dt-reveal">
        <span className="dt-stack-label" style={{ color: inks.inkDim }}>{g.group}</span>
        <div className="dt-stack-items">
          {g.items.map(item => <span key={item} className="dt-chip">{item}</span>)}
        </div>
      </div>
    ))}
  </div>
);

/* ── Overview ──────────────────────────────────────────────────────
   The lede and the context around it, with the flat facts and the
   link out pulled into a column beside it on desktop. The first
   paragraph is set a step larger — it is meant to be read at a
   glance, not studied. */
export const OverviewBand: FC<{
  paragraphs: string[];
  facts: [string, string][];
  inks: Inks;
  link?: { href: string; label: string };
}> = ({ paragraphs, facts, inks, link }) => {
  const { inkLow, inkDim, border, accent } = inks;
  return (
    <div className="dt-overview" style={{ ["--dt-border"]: border } as CSSProperties}>
      <div className="dt-overview-body dt-reveal" style={{ color: inkLow }}>
        {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
      </div>

      <dl className="dt-reveal self-start w-full">
        {facts.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 py-3.5" style={{ borderTop: `1px solid ${border}` }}>
            <dt className="dt-fact-label" style={{ color: inkDim }}>{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
        {link && (
          <div className="flex flex-col gap-1 py-3.5" style={{ borderTop: `1px solid ${border}` }}>
            <dt className="dt-fact-label" style={{ color: inkDim }}>Link</dt>
            <dd className="text-sm font-medium">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link footer-link"
                style={{ color: accent }}
              >
                <span className="footer-link-label">{link.label}</span>
                <span className="footer-link-icon" aria-hidden>↗</span>
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};

/* ── Accordion ─────────────────────────────────────────────────────
   Not a <details>. Chrome renders a closed one's contents inside
   ::details-content with content-visibility: hidden, so tweening the
   height of anything inside it moves nothing on screen — the panel
   measured the same height open or closed. A button and a panel we own
   outright animate in both directions, everywhere.

   Height is tweened from the panel's measured scrollHeight and then
   released back to auto, so a long answer can still re-wrap on resize
   instead of staying pinned at the height it opened with. `inert`
   keeps the closed panel out of the tab order and off the screen
   reader, which the zero height alone would not do. */
export const Accordion: FC<{
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  inkLow: string;
}> = ({ summary, children, defaultOpen = false, className = "", inkLow }) => {
  const [open, setOpen] = useState(defaultOpen);
  const panel = useRef<HTMLDivElement>(null);
  const anim = useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotion();

  const toggle = () => {
    const body = panel.current;
    if (!body) return;
    const next = !open;
    setOpen(next);

    if (reduced) {
      gsap.set(body, { height: next ? "auto" : 0, opacity: next ? 1 : 0 });
      return;
    }

    anim.current?.kill();
    anim.current = next
      ? gsap.fromTo(body,
          { height: 0, opacity: 0 },
          {
            height: body.scrollHeight,
            opacity: 1,
            duration: 0.44,
            ease: "power2.out",
            onComplete: () => { gsap.set(body, { height: "auto" }); ScrollTrigger.refresh(); },
          })
      : gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.34,
          ease: "power2.in",
          onComplete: () => ScrollTrigger.refresh(),
        });
  };

  return (
    <div className={className} data-open={open || undefined}>
      <button type="button" className="link dt-faq-summary" aria-expanded={open} onClick={toggle}>
        {summary}
        <span className="dt-faq-sign" aria-hidden>+</span>
      </button>
      <div
        ref={panel}
        className="dt-faq-panel"
        style={{ height: defaultOpen ? "auto" : 0, opacity: defaultOpen ? 1 : 0 }}
        inert={!open}
      >
        <div className="dt-faq-a" style={{ color: inkLow }}>{children}</div>
      </div>
    </div>
  );
};
