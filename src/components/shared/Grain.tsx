import { createPortal } from "react-dom";

/* ── Film grain ────────────────────────────────────────────────────
   Rendered into <body>, not into the page.

   `position: fixed` only means "relative to the viewport" when nothing
   above it has a transform, a filter, or a view-transition-name — and
   the page sits inside both a will-change: transform wrapper (for the
   scroll skew) and the transition's page frame. Inside those, this
   stretched to the full height of the document: on a long project page
   a fifteen-thousand-pixel layer in multiply blend, re-composited on
   every scroll. It cost 27ms a frame, half the budget, all by itself.

   Portalled out to the body it covers exactly the viewport, which is
   all it ever needed to — grain is a texture on the glass, not part of
   the page that scrolls behind it. */
export const Grain = () => createPortal(<div className="proj-grain" aria-hidden />, document.body);
