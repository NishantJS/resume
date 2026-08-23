import { CSSProperties, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { apps, ChangeKind, getApp, formatDate } from "./apps.data";
import { AppNav, AppNotFound, AppSection, AppTabs, CountUp, inkFor, useSectionReveal } from "./AppChrome";
import AppHero from "./AppHero";
import { useSeo } from "../../hooks/useSeo";
import "./apps.css";

const FILTERS: { key: ChangeKind | "all"; label: string }[] = [
  { key: "all",      label: "Everything" },
  { key: "new",      label: "New" },
  { key: "improved", label: "Improved" },
  { key: "fixed",    label: "Fixed" },
];

const KIND_LABEL: Record<string, string> = { major: "Major", minor: "Feature", patch: "Patch" };

/** Release history. Entries are newest-first in the data file; the filter
    narrows to one change type across every release. */
const AppChangelog = () => {
  const { app: slug } = useParams();
  const app = getApp(slug);
  const body = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<ChangeKind | "all">("all");

  useSeo({
    title: app ? `${app.name} changelog — what's new` : "App not found",
    description: app
      ? `Release notes for ${app.name}, newest first — new features, improvements and fixes in every version up to ${app.release.version}.`
      : undefined,
    path: `/apps/${slug ?? ""}/changelog`,
  });

  // A release with no change of the selected type drops out entirely
  // rather than rendering an empty entry.
  const releases = useMemo(() => {
    if (!app) return [];
    if (filter === "all") return app.changelog;
    return app.changelog
      .map(r => ({ ...r, changes: r.changes.filter(c => c.kind === filter) }))
      .filter(r => r.changes.length > 0);
  }, [app, filter]);

  useSectionReveal(body, [slug, filter]);

  if (!app) return <AppNotFound />;

  const index = apps.indexOf(app);
  const { ink, inkLow, inkDim, border } = inkFor(app.color);
  const sectionProps = { border, inkLow, inkDim };

  const totals = app.changelog.reduce(
    (acc, r) => { r.changes.forEach(c => { acc[c.kind] += 1; }); return acc; },
    { new: 0, improved: 0, fixed: 0 } as Record<ChangeKind, number>,
  );

  return (
    <motion.main
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1, transition: { duration: 0.25 } }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj"]: app.color, color: ink } as CSSProperties}
    >
      <div className="proj-grain" aria-hidden />

      <AppHero
        app={app}
        index={index}
        total={apps.length}
        title="Changelog"
        meta={`${app.name} / Changelog`}
        lead={`Every release since launch, newest first. Version ${app.release.version} shipped ${formatDate(app.release.updated)}.`}
        compact
      >
        <dl className="mono mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xs">
          {([
            ["Releases", String(app.changelog.length)],
            ["New features", String(totals.new)],
            ["Improvements", String(totals.improved)],
            ["Fixes", String(totals.fixed)],
          ] as const).map(([k, v]) => (
            <div key={k}>
              <dt className="uppercase tracking-[0.16em]" style={{ color: inkDim }}>{k}</dt>
              <dd className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums"><CountUp value={v} /></dd>
            </div>
          ))}
        </dl>
      </AppHero>

      <div className="px-6 md:px-14 xl:px-20">
        <AppTabs app={app} tab="changelog" border={border} inkLow={inkLow} />
      </div>

      <div ref={body}>
        <AppSection kicker="Releases" {...sectionProps}>
          <div className="mono flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] mb-12" role="group" aria-label="Filter changes by type">
            {FILTERS.map(f => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={on}
                  className="link nav-link pb-1 transition-opacity hover:opacity-100"
                  style={{
                    color: on ? "inherit" : inkLow,
                    borderBottom: on ? "2px solid currentColor" : "2px solid transparent",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <ol>
            {releases.map((r, i) => (
              <li
                key={r.version}
                className={`app-reveal app-release ${i === 0 && filter === "all" ? "app-release--current" : ""}`}
              >
                <span className="app-release-dot" aria-hidden />

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">v{r.version}</h3>
                  <span className="mono text-[0.6rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border" style={{ borderColor: border, color: inkLow }}>
                    {KIND_LABEL[r.kind]}
                  </span>
                  <time className="mono text-xs" dateTime={r.date} style={{ color: inkDim }}>
                    {formatDate(r.date)}
                  </time>
                  {i === 0 && filter === "all" && (
                    <span className="mono text-[0.6rem] uppercase tracking-[0.16em]">Current</span>
                  )}
                </div>

                <p className="mt-3 text-lg md:text-xl" style={{ color: inkLow }}>{r.headline}</p>

                <ul className="mt-6 space-y-3">
                  {r.changes.map(c => (
                    <li key={c.text} className="flex gap-4 items-start">
                      <span className="app-tag mono mt-0.5" style={{ borderColor: border, color: inkLow }}>
                        {c.kind}
                      </span>
                      <span className="text-base leading-relaxed" style={{ color: inkLow }}>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          {releases.length === 0 && (
            <p className="mono text-sm" style={{ color: inkLow }}>No {filter} changes in the history yet.</p>
          )}

          <p className="mono mt-4 text-xs" style={{ color: inkDim }}>
            Older builds are no longer distributed. Google Play always serves the latest release
            compatible with your device.
          </p>
        </AppSection>
      </div>

      <AppNav index={index} border={border} />
    </motion.main>
  );
};

export default AppChangelog;
