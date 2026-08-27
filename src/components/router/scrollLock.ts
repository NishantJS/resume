/* ── Scroll lock across a navigation ───────────────────────────────
   Clicking prev/next at the bottom of a long page usually means the
   page is still coasting under a trackpad fling, and that inertia
   lands on whatever page arrives next — it dragged the incoming one
   thousands of pixels down.

   Re-setting scrollTop every frame does not win: wheel scrolling runs
   on the compositor and overwrites it, and so does `overflow: hidden`,
   which the compositor won't see until its next commit. What does win
   is a non-passive wheel/touchmove listener — that forces the events
   onto the main thread where they can be cancelled outright. The
   overflow lock stays too, to cover the keyboard and the scrollbar,
   with the scrollbar's width paid back as padding so it costs no
   layout shift.

   The freeze starts on the click, not on the route change. The commit
   now happens inside the view transition, a couple of hundred
   milliseconds later, and the wheels that arrive in between are
   exactly the ones that used to get through.                       */

/* Short and fixed. An earlier version held the lock open for as long
   as input kept arriving, on the theory that input meant momentum —
   but a reader who lands on a page and keeps scrolling produces
   exactly the same events, so their own scrolling extended their own
   freeze, up to a second and a half. The page had arrived and simply
   would not move, which reads as the page still loading.

   All the lock has to cover is the gap between the click and the route
   committing, which is around a tenth of a second. */
const FREEZE_MS = 170;
const SETTLE_MS = 180;

/* When the reader last actually scrolled. A click with no recent
   scrolling has no momentum behind it, and freezing the document for
   half a second after it just makes the new page feel stuck. */
let lastInput = 0;
const noteInput = () => { lastInput = performance.now(); };
if (typeof window !== "undefined") {
  window.addEventListener("wheel", noteInput, { passive: true });
  window.addEventListener("touchmove", noteInput, { passive: true });
}

/** Was the page still moving when this navigation started? */
export const hasMomentum = () => performance.now() - lastInput < 500;

let active = false;
let timer = 0;
let prevOverflow = "";
let prevPad = "";

const swallow = (e: Event) => e.preventDefault();

const opts = { passive: false } as AddEventListenerOptions;

export function freezeScroll() {
  if (active) return;
  active = true;

  const doc = document.documentElement;
  const gutter = window.innerWidth - doc.clientWidth;
  prevOverflow = doc.style.overflow;
  prevPad = doc.style.paddingRight;
  doc.style.overflow = "hidden";
  if (gutter > 0) doc.style.paddingRight = `${gutter}px`;

  window.addEventListener("wheel", swallow, opts);
  window.addEventListener("touchmove", swallow, opts);

  timer = window.setTimeout(release, FREEZE_MS);
}

export function release() {
  if (!active) return;
  active = false;
  window.clearTimeout(timer);
  window.removeEventListener("wheel", swallow, opts);
  window.removeEventListener("touchmove", swallow, opts);

  const doc = document.documentElement;
  doc.style.overflow = prevOverflow;
  doc.style.paddingRight = prevPad;

  // Whatever the compositor banked while the document was frozen
  // flushes over the next few frames; the top is held through that,
  // briefly, and then the page is the reader's again.
  const settleUntil = performance.now() + SETTLE_MS;
  const settle = () => {
    const s = document.scrollingElement;
    if (s && s.scrollTop !== 0) s.scrollTo({ top: 0, behavior: "instant" });
    if (performance.now() < settleUntil) requestAnimationFrame(settle);
  };
  requestAnimationFrame(settle);
}
