import { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ── Magnetic button ───────────────────────────────────────────────
   The button drifts toward the cursor while it is over it and snaps
   back elastically when it leaves. Lifted out of the contact CTA so
   the primary action on a project page and an app page behave the
   same way — the site has one "this is the button" gesture, not three.

   Measured on enter rather than on every pointer event, and driven by
   a pair of long-lived quickTo tweens rather than a new gsap.to() per
   event: a high-polling-rate mouse fires mousemove far more often than
   once a frame, and the naive version reads layout and allocates a
   tween hundreds of times between two paints.

   mouseenter/mousemove never fire from a touch, so there is nothing to
   gate for phones — the button simply stays where it is. */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  { reduced = false, strength = 0.35 }: { reduced?: boolean; strength?: number } = {},
) {
  useGSAP(() => {
    const btn = ref.current;
    if (!btn || reduced) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power2.out" });

    let cx = 0, cy = 0, stale = true;
    let settle: gsap.core.Tween | null = null;

    /* The rect carries whatever drift is currently applied; subtracting
       it back out recovers the button's resting centre. */
    const measure = () => {
      const r = btn.getBoundingClientRect();
      cx = r.left + r.width / 2 - (gsap.getProperty(btn, "x") as number);
      cy = r.top + r.height / 2 - (gsap.getProperty(btn, "y") as number);
      stale = false;
    };
    // The button scrolls with the page, so a scroll invalidates the centre.
    const invalidate = () => { stale = true; };

    const onEnter = () => { settle?.kill(); settle = null; measure(); };
    const onMove = (e: MouseEvent) => {
      if (stale) measure();
      xTo((e.clientX - cx) * strength);
      yTo((e.clientY - cy) * strength);
    };
    const onLeave = () => {
      settle = gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
    };

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      settle?.kill();
    };
  }, { dependencies: [reduced, strength] });
}
