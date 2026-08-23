import { CSSProperties, FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { AppMeta } from "./apps.data";
import { markLoaded, revealOnLoad } from "./AppChrome";

gsap.registerPlugin(ScrollTrigger);

type Props = { app: AppMeta; ink: string; inkLow: string; inkDim: string; border: string };

/** Alternating screenshot / copy rows. This is the part of a product
    page that actually sells: one claim, one picture proving it. Only
    features that name a `shot` appear here — the rest stay in the
    compact list below. */
const AppShowcase: FC<Props> = ({ app, ink, inkLow, inkDim, border }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rows = app.features.filter(f => f.featured);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".app-case");
    if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return; }

    items.forEach(item => {
      const phone = item.querySelector<HTMLElement>(".app-case-phone");
      const copy = item.querySelector<HTMLElement>(".app-case-copy");
      gsap.fromTo([copy, phone],
        { opacity: 0, y: 44 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: item, start: "top 82%", once: true },
        });
      // A slow counter-drift on the phone gives the row some depth.
      if (phone) {
        gsap.fromTo(phone, { yPercent: 4 }, {
          yPercent: -4, ease: "none",
          scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
      }
    });
  }, { scope: ref, dependencies: [reduced, app.slug] });

  if (!rows.length) return null;

  return (
    <div ref={ref}>
      {rows.map((f, i) => (
        <section
          key={f.title}
          className={`app-case ${i % 2 ? "app-case--flip" : ""}`}
          style={{ borderTop: `1px solid ${border}` }}
        >
          <div className="app-case-copy">
            <p className="mono text-xs uppercase tracking-[0.22em] font-medium" style={{ color: inkDim }}>
              {String(i + 1).padStart(2, "0")} · {app.screenCaptions[f.shot - 1]}
            </p>
            <h3 className="mt-4 text-3xl sm:text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.05]">
              {f.title}
            </h3>
            <p className="mt-5 text-base xl:text-lg leading-relaxed max-w-lg" style={{ color: inkLow }}>
              {f.body}
            </p>
          </div>

          <div className="app-case-art">
            <span className="app-case-glow" style={{ background: app.glow }} aria-hidden />
            <div className="app-case-phone" style={{ borderColor: border, ["--ink"]: ink } as CSSProperties}>
              <img
                src={`/apps/${app.slug}/shot-${f.shot}.webp`}
                alt={`${app.name} — ${f.title}`}
                loading="lazy"
                decoding="async"
                ref={markLoaded}
                onLoad={revealOnLoad}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default AppShowcase;
