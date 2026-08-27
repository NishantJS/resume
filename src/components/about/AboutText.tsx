import { useMotionValueEvent, useReducedMotion, MotionValue } from 'motion/react';
import { FC, useCallback, useEffect, useRef } from 'react';

// Words rendered in a distinctive accent colour once revealed
const ACCENT = new Set([
  'senior', 'software', 'developer', 'fintech', 'enterprise', 'real-time',
  'micro-frontend', 'resilience', 'latency', 'opportunities', 'project',
  'systems', 'production-grade', 'mumbai',
]);

export interface ParagraphProps {
  paragraph: string;
  /** Shared MotionValue from the parent scroll container */
  progress: MotionValue<number>;
  /** [start, end] slice of the 0-1 range this paragraph owns */
  range: [number, number];
}

/** How far each character lifts before it lands, in px. */
const RISE = 10;

/* ── Scroll-revealed paragraph ─────────────────────────────────────
   Every character fades and rises on its own slice of the scroll, and
   that is worth keeping — but it used to be built out of React and
   MotionValues: one component and two useTransform subscriptions per
   character. Three paragraphs is about three hundred characters, so
   the page carried ~300 components and ~600 derived motion values, and
   every one of them recomputed and wrote style on every scroll frame.
   Six hundred style writes a frame is not something a browser hides.

   The slices are contiguous and non-overlapping, though, which means
   at any scroll position exactly ONE character is mid-fade: everything
   before it is fully in, everything after is fully out. So a paragraph
   needs at most a handful of writes per frame — the character in
   flight, plus any the edge swept past since the last one. That is what
   this does: one subscription per paragraph, plain spans, and a write
   only where something actually changed.

   Slices are indexed against the paragraph *string*, spaces included,
   so the tiny pause at each word boundary survives. Spaces have no
   element of their own, hence the sparse slot array. */
const Paragraph: FC<ParagraphProps> = ({ paragraph, progress, range }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const slots = useRef<(HTMLElement | null)[]>([]);
  const edge = useRef(-1);
  const reduced = useReducedMotion();

  const [rs, re] = range;
  const total = paragraph.length;

  /* `p` is the shared 0-1 scroll progress. Rescaled to a position along
     this paragraph measured in characters, its integer part is the
     character currently fading and its fraction is how far in it is. */
  const paint = useCallback((p: number) => {
    const els = slots.current;
    if (!els.length) return;

    const at = ((p - rs) / (re - rs)) * total;
    const idx = Math.floor(at);
    const was = edge.current;

    // Everything the edge crossed since the last frame, plus the
    // character it is sitting on now. Scrolling back up sweeps the same
    // span the other way, so one loop covers both directions.
    const lo = Math.max(0, Math.min(was, idx));
    const hi = Math.min(total - 1, Math.max(was, idx));
    for (let i = lo; i <= hi; i++) {
      const el = els[i];
      if (!el) continue;                       // a space: no element
      const d = at - i;
      const v = d < 0 ? 0 : d > 1 ? 1 : d;
      if (v >= 1) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      } else {
        el.style.opacity = v.toFixed(3);
        el.style.transform = `translateY(${(RISE * (1 - v)).toFixed(2)}px)`;
      }
    }
    edge.current = idx;
  }, [rs, re, total]);

  useEffect(() => {
    const found = ref.current?.querySelectorAll<HTMLElement>('.at-char') ?? [];
    const next: (HTMLElement | null)[] = new Array(total).fill(null);
    found.forEach(el => {
      const i = Number(el.dataset.i);
      if (i >= 0 && i < total) next[i] = el;
    });
    slots.current = next;
    edge.current = -1;

    if (reduced) {
      next.forEach(el => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
      return;
    }
    // Covers a reload that lands mid-paragraph: the sweep from -1 to the
    // current edge settles everything already behind it.
    paint(progress.get());
  }, [paragraph, total, reduced, progress, paint]);

  useMotionValueEvent(progress, 'change', v => { if (!reduced) paint(v); });

  const words = paragraph.split(' ');
  let cursor = 0; // running char-index through the paragraph

  return (
    <p
      ref={ref}
      className="mono flex flex-wrap text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl
                  px-6 md:px-12 xl:px-16 py-10 md:py-14
                  max-w-5xl 2xl:max-w-screen-xl mx-auto text-white leading-relaxed"
    >
      {words.map((word, wi) => {
        const wordStart = cursor;
        const isAccent = ACCENT.has(word.replace(/[^a-z-]/gi, '').toLowerCase());
        // Past this word, and past the space that follows it
        cursor += word.length + (wi < words.length - 1 ? 1 : 0);

        return (
          /* whitespace-nowrap keeps chars of the same word on the same
             line. The accent words also carry `link`, which is what the
             custom cursor watches — so the inverting disc swells over
             them the way it does over a real link. The class has no
             styles of its own; it is purely the cursor's hook. */
          <span
            key={wi}
            className={isAccent
              ? "link inline-block whitespace-nowrap mr-3 mt-3"
              : "inline-block whitespace-nowrap mr-3 mt-3"}
          >
            {word.split('').map((ch, ci) => (
              <span key={ci} className="relative inline-block">
                {/* Ghost keeps the unread text faintly visible behind it */}
                <span className="absolute inset-0 opacity-[0.06] select-none" aria-hidden>
                  {ch}
                </span>
                <span
                  className={isAccent ? 'at-char inline-block text-purple-400' : 'at-char inline-block'}
                  data-i={wordStart + ci}
                  style={{ opacity: 0, transform: `translateY(${RISE}px)` }}
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </p>
  );
};

export default Paragraph;
