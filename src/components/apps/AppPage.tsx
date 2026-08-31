import { CSSProperties, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { apps, getApp, formatDate } from "./apps.data";
import { appSeo } from "./apps.seo";
import {
  AppCloser, AppNav, CountUp, AppNotFound, AppSection, AppStatement, AppTabs,
  FactsBand, FlowSteps, OverviewBand, RailSection, SectionRail, StackGroups,
  inksFor, markLoaded, revealOnLoad, useSectionReveal,
} from "./AppChrome";
import AppProductHero from "./AppProductHero";
import AppShowcase from "./AppShowcase";
import AppGallery from "./AppGallery";
import { Grain } from "../shared/Grain";
import { useSeo } from "../../hooks/useSeo";
import "./apps.css";

/* Every app page has the same bands, so the rail's list is a constant —
   and a stable reference, which is what keeps it from rebuilding its
   observers on each render. */
const RAIL_SECTIONS: RailSection[] = [
  { id: "overview",  label: "Overview" },
  { id: "features", label: "Features" },
  { id: "how",      label: "How"      },
  { id: "screens",  label: "Screens"  },
  { id: "stack",    label: "Built with" },
  { id: "listing",  label: "Listing"   },
];

/** An app's main page — the /apps equivalent of a project page. */
const AppPage = () => {
  const { app: slug } = useParams();
  const app = getApp(slug);
  const body = useRef<HTMLDivElement>(null);

  const meta = app && appSeo(app, "overview");
  useSeo({
    title: meta?.title ?? "App not found",
    description: meta?.description,
    path: meta?.path ?? `/apps/${slug ?? ""}`,
  });

  useSectionReveal(body, [slug]);

  if (!app) return <AppNotFound />;

  const index = apps.indexOf(app);
  const inks = inksFor(app);
  const { ink, inkLow, inkDim, border } = inks;


  return (
    <motion.main
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj"]: app.color, color: ink } as CSSProperties}
    >
      <Grain />

      <AppProductHero app={app} />

      {/* What it is, in four words — same strip the project pages open
          with, before any of the numbers. */}
      <FactsBand
        facts={[
          ["Platform", app.role],
          ["Status", app.status === "live" ? "On Google Play" : app.status === "beta" ? "In beta" : "Coming soon"],
          ["Version", app.release.version],
          ["Requires", app.release.minAndroid],
        ]}
        inks={inks}
      />

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

      {/* Everything from here down reveals as it scrolls in. */}
      <div ref={body}>
        {/* ── What it is ───────────────────────────────────────── */}
        <AppSection
          id="overview"
          kicker="Overview"
          title="What it is, and who it's for."
          inks={inks}
        >
          <OverviewBand
            paragraphs={[app.blurb, app.hero.sub]}
            /* The strip under the hero already carries platform,
               status, version and requirements — this column takes the
               reach-and-recency side so the two don't say the same
               thing twice. */
            facts={[
              ["Last updated", formatDate(app.release.updated)],
              ...(app.release.installs ? [["Installs", app.release.installs] as [string, string]] : []),
              ...(app.release.rating ? [["Rating", `${app.release.rating} ★`] as [string, string]] : []),
            ]}
            inks={inks}
            link={app.release.playUrl ? { href: app.release.playUrl, label: "Google Play" } : undefined}
          />
        </AppSection>

        {/* One claim, one screenshot proving it. */}
        <AppShowcase app={app} ink={ink} inkLow={inkLow} inkDim={inkDim} border={border} />

        {/* ── Everything else it does ─────────────────────────── */}
        <AppSection
          id="features"
          kicker="Features"
          title="And the rest of it."
          intro={`Every screen in ${app.name} earns its place. No dashboards nobody opens.`}
          inks={inks}
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

        <AppStatement text={app.tagline} meta={`${app.name} · ${app.role}`} inks={inks} />

        {/* ── How it works ────────────────────────────────────── */}
        <AppSection
          id="how"
          kicker="How it works"
          title={app.steps.length === 3 ? "Three steps, start to finish." : "Start to finish."}
          inks={inks}
        >
          <FlowSteps steps={app.steps} inks={inks} resetKey={app.slug} />
        </AppSection>

        {/* ── Every screen ────────────────────────────────────── */}
        <AppGallery app={app} ink={ink} inkLow={inkLow} inkDim={inkDim} border={border} />

        {/* ── What it's built on ──────────────────────────────── */}
        <AppSection
          id="stack"
          kicker="Built with"
          title="What it runs on."
          intro={`Everything ${app.name} is built on, grouped by what each piece does.`}
          inks={inks}
        >
          <StackGroups groups={app.stack} inks={inks} />
        </AppSection>

        {/* ── Store facts ─────────────────────────────────────── */}
        <AppSection id="listing" kicker={app.release.playUrl ? "On Google Play" : "The build"} inks={inks}>
          <dl className="app-reveal mono flex flex-wrap gap-x-10 gap-y-5 text-xs">
            {([
              ["Version", app.release.version],
              ["Updated", formatDate(app.release.updated)],
              ...(app.release.size ? [["Size", app.release.size] as const] : []),
              ["Requires", app.release.minAndroid],
              /* Installs and rating are things a live listing produces.
                 An unpublished app has neither, and inventing them is
                 exactly the kind of claim a Play review catches. */
              ...(app.release.installs ? [["Installs", app.release.installs] as const] : []),
              ...(app.release.rating ? [["Rating", `${app.release.rating} ★`] as const] : []),
            ] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="uppercase tracking-[0.16em]" style={{ color: inkDim }}>{k}</dt>
                <dd className="mt-1.5 text-sm">{v}</dd>
              </div>
            ))}
          </dl>

          {!app.release.playUrl && (
            <p className="app-reveal mono mt-8 text-xs" style={{ color: inkDim }}>
              Not in the stores yet — there is no install count or rating to show until the
              listing goes live.
            </p>
          )}

          {/* An app that routes its own mail says so here, rather than
              making a reader find the support page to learn that a wrong
              specification and a broken build go to different places. */}
          {app.overviewFooter && (
            <div className="app-reveal mt-12 border-t pt-8" style={{ borderColor: border }}>
              <ul className="mono grid gap-x-10 gap-y-5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {app.overviewFooter.contacts.map(({ label, address }) => (
                  <li key={address}>
                    <p className="uppercase tracking-[0.16em]" style={{ color: inkDim }}>{label}</p>
                    <a
                      href={`mailto:${address}`}
                      className="link mt-1.5 inline-block break-all text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      {address}
                    </a>
                  </li>
                ))}
              </ul>
              {app.overviewFooter.note && (
                <p className="mono mt-8 max-w-2xl text-xs leading-relaxed" style={{ color: inkDim }}>
                  {app.overviewFooter.note}
                </p>
              )}
            </div>
          )}
        </AppSection>
      </div>

      <AppCloser app={app} inks={inks} />

      <AppNav index={index} border={border} />

      <SectionRail sections={RAIL_SECTIONS} accent={inks.accent} ink={ink} />
    </motion.main>
  );
};

export default AppPage;
