import { CSSProperties, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { apps, getApp, formatDate } from "./apps.data";
import {
  AppCloser, AppNav, CountUp, AppNotFound, AppSection, AppStatement, AppTabs,
  inkFor, markLoaded, revealOnLoad, useSectionReveal,
} from "./AppChrome";
import AppProductHero from "./AppProductHero";
import AppShowcase from "./AppShowcase";
import AppGallery from "./AppGallery";
import { useSeo } from "../../hooks/useSeo";
import "./apps.css";

/** An app's main page — the /apps equivalent of a project page. */
const AppPage = () => {
  const { app: slug } = useParams();
  const app = getApp(slug);
  const body = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSeo({
    title: app ? `${app.name} — ${app.tagline}` : "App not found",
    description: app?.blurb,
    path: `/apps/${slug ?? ""}`,
  });

  useSectionReveal(body, [slug]);

  if (!app) return <AppNotFound />;

  const index = apps.indexOf(app);
  const { ink, inkLow, inkDim, border } = inkFor(app.color);
  const sectionProps = { border, inkLow, inkDim };

  return (
    <motion.main
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1, transition: { duration: 0.25 } }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj"]: app.color, color: ink } as CSSProperties}
    >
      <div className="proj-grain" aria-hidden />

      <AppProductHero app={app} />

      {/* Trust strip — the numbers, straight under the fold. */}
      <dl className="app-trust" style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        {app.stats.map(st => (
          <div key={st.label} className="app-trust-cell">
            <dt className="sr-only">{st.label}</dt>
            <dd>
              <CountUp value={st.value} className="block text-3xl md:text-4xl xl:text-5xl font-semibold tracking-tight tabular-nums" />
              <span className="mono mt-2 block text-[0.65rem] uppercase tracking-[0.16em]" style={{ color: inkDim }}>
                {st.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="px-6 md:px-14 xl:px-20">
        <AppTabs app={app} tab="" border={border} inkLow={inkLow} />
      </div>

      {/* One claim, one screenshot proving it. */}
      <AppShowcase app={app} ink={ink} inkLow={inkLow} inkDim={inkDim} border={border} />

      <div ref={body}>
        {/* ── Everything else it does ─────────────────────────── */}
        <AppSection
          id="features"
          kicker="Features"
          title="And the rest of it."
          intro={`Every screen in ${app.name} earns its place. No dashboards nobody opens.`}
          {...sectionProps}
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {app.features.filter(f => !f.featured).map(f => (
              <li key={f.title} className="app-reveal app-fcard" style={{ borderColor: border }}>
                {/* The crop shows the top of the screen, where the app's
                    own chrome and content are — a whole 9:19.5 phone in
                    a card would be mostly empty. */}
                <div className="app-fcard-shot" style={{ borderColor: border }}>
                  <img
                    src={`/apps/${app.slug}/shot-${f.shot}.webp`}
                    alt={`${app.name} — ${f.title}`}
                    loading="lazy"
                    decoding="async"
                    ref={markLoaded}
                    onLoad={revealOnLoad}
                  />
                </div>
                <div className="app-fcard-body">
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed" style={{ color: inkLow }}>{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </AppSection>

        <AppStatement text={app.tagline} meta={`${app.name} · ${app.role}`} border={border} inkDim={inkDim} />

        {/* ── How it works ────────────────────────────────────── */}
        <AppSection id="how" kicker="How it works" title="Three steps, start to finish." {...sectionProps}>
          <ol className="grid gap-10 md:gap-8 md:grid-cols-3">
            {app.steps.map((st, i) => (
              <li key={st.title} className="app-reveal app-step group">
                <span className="app-step-num mono" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-lg md:text-xl font-semibold tracking-tight">{st.title}</h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: inkLow }}>{st.body}</p>
              </li>
            ))}
          </ol>
        </AppSection>

        {/* ── Every screen ────────────────────────────────────── */}
        <AppGallery app={app} ink={ink} inkLow={inkLow} inkDim={inkDim} border={border} />

        {/* ── Store facts ─────────────────────────────────────── */}
        <AppSection id="listing" kicker="On Google Play" {...sectionProps}>
          <dl className="app-reveal mono flex flex-wrap gap-x-10 gap-y-5 text-xs">
            {([
              ["Version", app.release.version],
              ["Updated", formatDate(app.release.updated)],
              ["Size", app.release.size],
              ["Requires", app.release.minAndroid],
              ["Installs", app.release.installs],
              ["Rating", `${app.release.rating} ★`],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="uppercase tracking-[0.16em]" style={{ color: inkDim }}>{k}</dt>
                <dd className="mt-1.5 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </AppSection>
      </div>

      <AppCloser app={app} ink={ink} inkLow={inkLow} inkDim={inkDim} border={border} />

      <AppNav index={index} border={border} />
    </motion.main>
  );
};

export default AppPage;
