import { FC, Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ── Shared page primitives ────────────────────────────────────────
   The /work and /apps detail pages are the same design in two
   palettes, so the ink maths, the image-load handshake and the three
   scroll reveals live here rather than in either folder. Nothing in
   this file owns CSS beyond .rw-mask / .rw-word (in index.css), so it
   can be imported from any page without dragging a stylesheet along. */

/** Luminance test used to pick ink over a pastel card colour. */
export function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

/** The four ink values a tinted detail page needs, derived from its
    pastel. inkLow lands around 7:1 on the pastels, inkDim around 4.5:1
    for the small-caps labels it's reserved for. */
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

export const ArrowUpRight = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
    <path d="M1 10L10 1M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Batched entrance for elements matching `selector` inside `scope` —
    each rises as it scrolls in, rather than the whole page at once. */
export const useRevealBatch = (
  scope: React.RefObject<HTMLElement | null>,
  selector: string,
  deps: unknown[] = [],
) => {
  const reduced = useReducedMotion();
  useGSAP(() => {
    const items = scope.current?.querySelectorAll<HTMLElement>(selector);
    if (!items?.length) return;
    if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    gsap.set(items, { opacity: 0, y: 28 });
    ScrollTrigger.batch(items, {
      once: true,
      start: "top 92%",
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }),
      // A fast scroll can put a dozen items over the line in one frame.
      // Batching them into one tween per 120 ms keeps that a stagger
      // rather than a dozen tweens starting together.
      batchMax: 8,
      interval: 0.12,
    });
  }, { scope, dependencies: [reduced, selector, ...deps] });
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

/* ── Ignite reveal ─────────────────────────────────────────────────
   The homepage finale's treatment, generalised. Text rises out of
   per-line masks and each unit lands already lit in one of two accent
   colours, cooling to the page ink a beat later — so a heading arrives
   coloured and settles rather than fading in flat.

   `scrub` ties the whole thing to scroll position, which means it
   unwinds when you scroll back up. Reserved for the page's display
   moments; body copy plays once and stays put, because re-animating
   text somebody is trying to re-read is just noise.

   Two things have to be true before splitting, or the masks clip rows
   that aren't there any more:

     · the webfont is in. A heading split against the fallback keeps
       the fallback's line breaks, and Rubik 600 is not preloaded.
     · the line count is current. A resize re-wraps the text, so the
       split is torn down and rebuilt off ScrollTrigger's own
       (debounced) refresh, but only when the heading actually changed
       width — the screenshot rail refreshes on every image it loads.

   SplitText's `autoSplit` covers the same ground, but it re-splits on
   its own schedule underneath a scrubbed timeline, and the rebuilt
   tween ended up owning only part of the new character list — the
   back half of a heading would sit at rest while the front half
   animated. Doing it by hand keeps split and timeline in step. */
export type IgniteOpts = {
  /** [first, second] — units alternate between them. */
  accents: [string, string];
  /** The colour every unit settles to. */
  ink: string;
  /** Animate per character, or per whole word (calmer). */
  unit?: "chars" | "words";
  /** Scrub to scroll — the effect reverses on the way back up. */
  scrub?: boolean;
  start?: string;
  end?: string;
  /** Degrees of X-tilt on the way in. 0 is a straight rise. */
  tilt?: number;
  stagger?: number;
};

export const useIgnite = (
  scope: React.RefObject<HTMLElement | null>,
  selector: string,
  opts: IgniteOpts,
  deps: unknown[] = [],
) => {
  const reduced = useReducedMotion();

  useGSAP(() => {
    const heading = scope.current?.querySelector<HTMLElement>(selector);
    if (!heading) return;
    if (reduced) { gsap.set(heading, { opacity: 1 }); return; }

    const {
      accents, ink, unit = "chars", scrub = true,
      start = "top 85%", end = "top 38%", tilt = 75, stagger = 0.022,
    } = opts;

    let split: SplitText | null = null;
    let tl: gsap.core.Timeline | null = null;
    let width = 0;
    let cancelled = false;

    const teardown = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      split?.revert();
      tl = null;
      split = null;
    };

    const build = () => {
      if (cancelled || !heading.isConnected) return;
      teardown();
      width = heading.offsetWidth;

      // st-line-mask gets its clip from the line box; the pages that use
      // this zero out the descender padding index.css adds, so a
      // half-risen character can't show above the line below it.
      split = SplitText.create(heading, {
        // Only split as deep as the animation needs. Section titles
        // animate per word, and splitting those to characters as well
        // was building several hundred extra elements per heading for
        // nothing — five of the seven headings on a detail page.
        type: unit === "chars" ? "lines,words,chars" : "lines,words",
        mask: "lines",
        linesClass: "st-line",
        wordsClass: "ignite-word",
      });

      const units = unit === "chars" ? split.chars : split.words;
      gsap.set(heading, { opacity: 1 });
      gsap.set(units, { transformPerspective: 500 });

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: heading,
          start,
          end,
          /* `scrub` is a smoothing time, not a delay: the playhead
             eases to wherever the scroll put it, on GSAP's ticker
             rather than on scroll events — which fire in bursts, and
             more coarsely than the display refreshes. At 0.6 a fast
             scroll dragged the playhead through a hundred characters in
             two or three steps, which reads as a stutter and then a
             heading that is already finished. Longer, and the same
             scroll still plays the whole reveal, in its own time. */
          scrub: scrub ? 1.2 : false,
          once: !scrub,
          invalidateOnRefresh: true,
        },
      });
      // One tween per unit, positioned by hand, rather than a single
      // staggered tween over all of them. Inside a scrubbed timeline
      // the staggered version only rendered start values for the
      // targets near the playhead — the tail of a long heading stayed
      // sitting at its final position instead of waiting below the
      // mask, so the reveal visibly skipped its last few words.
      units.forEach((u, i) => {
        const at = i * stagger;
        tl!.from(u, {
          yPercent: 120,
          rotateX: -tilt,
          opacity: 0,
          transformOrigin: "50% 100%",
          duration: 0.7,
          ease: "power3.out",
          // A from() placed past position 0 in a timeline defaults to
          // immediateRender: false, so the unit sits at its final
          // position until its own tween starts — the heading is fully
          // legible before it is supposed to arrive, then jumps down to
          // animate up again. Forced on, every unit parks below its
          // mask from the moment the timeline is built.
          immediateRender: true,
        }, at);
        tl!.fromTo(u,
          { color: accents[i % accents.length] },
          { color: ink, duration: 0.6, ease: "power2.out" },
          at + 0.12,
        );
      });
    };

    const onRefresh = () => {
      if (!cancelled && heading.isConnected && heading.offsetWidth !== width) build();
    };

    const splitNow = () => {
      const fonts = document.fonts;
      if (!fonts || fonts.status === "loaded") build();
      else fonts.ready.then(build);
    };

    /* Splitting is not cheap — it replaces a heading with one element
       per character — and a detail page has seven of these. Doing them
       all synchronously at mount put a third of a second of work on the
       main thread at exactly the moment the page was arriving.

       Deferring each until its heading nears the viewport was worse:
       the work simply moved into the scroll, where a stall is far more
       obvious than one during a page transition. Idle time is the right
       home for it — off the critical path, done well before anyone has
       scrolled, with a short timeout so a heading is never left
       waiting invisibly behind its own reveal. */
    const idle = window.requestIdleCallback?.(splitNow, { timeout: 400 })
      ?? window.setTimeout(splitNow, 60);

    ScrollTrigger.addEventListener("refreshInit", onRefresh);

    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
      ScrollTrigger.removeEventListener("refreshInit", onRefresh);
      teardown();
    };
  }, { scope, dependencies: [reduced, selector, ...deps] });
};
