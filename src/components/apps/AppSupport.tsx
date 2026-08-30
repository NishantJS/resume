import { CSSProperties, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { apps, getApp, formatDate } from "./apps.data";
import {
  Accordion, AppNav, AppNotFound, AppSection, AppTabs, ArrowUpRight, inksFor, supportMailto,
  useSectionReveal,
} from "./AppChrome";
import AppHero from "./AppHero";
import { Grain } from "../shared/Grain";
import { useSeo } from "../../hooks/useSeo";
import { CONTACT } from "../../contact.data";
import "./apps.css";

const JUMPS = [
  { id: "contact",  label: "Contact"  },
  { id: "faq",      label: "FAQ"      },
  { id: "features", label: "Features" },
];

/** Support desk — the URL that goes in the Play Console's support field. */
const AppSupport = () => {
  const { app: slug } = useParams();
  const app = getApp(slug);
  const body = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useSeo({
    title: app ? `${app.name} support — help, FAQ and contact` : "App not found",
    description: app
      ? `Get help with ${app.name}: answers to common questions, the full feature list, and how to reach support directly.`
      : undefined,
    path: `/apps/${slug ?? ""}/support`,
  });

  useSectionReveal(body, [slug]);

  if (!app) return <AppNotFound />;

  const index = apps.indexOf(app);
  const inks = inksFor(app);
  const { ink, inkLow, inkDim, border } = inks;
  
  const { support } = app;

  const mailto = supportMailto(app);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(support.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context / denied) — the mailto
      // link is still right there, so fail quietly.
    }
  };

  const pill = "link mono inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border transition-opacity hover:opacity-70";

  return (
    <motion.main
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj"]: app.color, color: ink } as CSSProperties}
    >
      <Grain />

      <AppHero
        app={app}
        index={index}
        total={apps.length}
        title="Support"
        meta={`${app.name} / Support`}
        lead={`Most questions are answered below. If yours isn't, write to us — a human reads every message, usually ${support.responseTime.toLowerCase()}.`}
        compact
      >
        <nav className="mono mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em]" aria-label="Jump to section">
          {JUMPS.map(j => (
            <a key={j.id} href={`#${j.id}`} className="link nav-link pb-1" style={{ color: inkLow }}>
              {j.label}
            </a>
          ))}
        </nav>
      </AppHero>

      <div className="px-6 md:px-14 xl:px-20">
        <AppTabs app={app} tab="support" border={border} inkLow={inkLow} />
      </div>

      <div ref={body}>
        {/* ── Contact ─────────────────────────────────────────── */}
        <AppSection id="contact" kicker="Contact" title="Reach a person." inks={inks}>
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
            <div className="app-reveal">
              <p className="mono text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: inkDim }}>
                Email support
              </p>
              <p className="mt-3 text-xl md:text-2xl xl:text-3xl font-semibold tracking-tight break-all">
                {support.email}
              </p>
              <p className="mt-3 text-base leading-relaxed max-w-md" style={{ color: inkLow }}>
                Writing in opens a pre-filled report — fill the blanks and send. Copied to{" "}
                <span className="mono text-[0.85em]">{support.cc}</span>.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={mailto} className={pill} style={{ borderColor: border }}>
                  Write to support
                  <ArrowUpRight />
                </a>
                <button type="button" onClick={copyEmail} className={pill} style={{ borderColor: border }}>
                  {copied ? "Copied ✓" : "Copy address"}
                </button>
              </div>
            </div>

            <dl className="app-reveal mono text-sm space-y-6">
              {([
                ["Phone", <a key="p" href={`tel:${support.phone.replace(/\s/g, "")}`} className="link underline underline-offset-4 hover:opacity-70 transition-opacity">{support.phone}</a>],
                ["Hours", support.hours],
                ["Response time", support.responseTime],
                ["Registered address", support.address],
              ] as const).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: inkDim }}>{k}</dt>
                  <dd className="mt-1.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Not every message is a bug report. Naming the desks keeps a
              refund from queueing behind a crash, and gives the policy
              pages a real address to point at. */}
          <div className="app-reveal mt-14 border-t pt-8" style={{ borderColor: border }}>
            <p className="mono text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: inkDim }}>
              Other desks
            </p>
            <ul className="mono mt-5 grid gap-x-10 gap-y-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {([
                ["Billing and refunds", CONTACT.billing],
                ["Feature requests", CONTACT.feedback],
                ["Data and privacy", CONTACT.privacy],
                ["Security and abuse", CONTACT.abuse],
                ["Legal notices", CONTACT.legal],
              ] as const).map(([label, address]) => (
                <li key={address}>
                  <p className="text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: inkDim }}>{label}</p>
                  <a
                    href={`mailto:${address}`}
                    className="link mt-1.5 inline-block break-all underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    {address}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="app-reveal mono mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: inkDim }}>
            <span>Running v{app.release.version}, updated {formatDate(app.release.updated)}.</span>
            <Link to={`/apps/${app.slug}/changelog`} className="link underline underline-offset-4 hover:opacity-70 transition-opacity">
              What changed?
            </Link>
            <Link to={`/apps/${app.slug}/privacy`} className="link underline underline-offset-4 hover:opacity-70 transition-opacity">
              Data and privacy
            </Link>
          </p>
        </AppSection>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <AppSection
          id="faq"
          kicker="FAQ"
          title="Common questions."
          intro="The things people write in about most often."
          inks={inks}
        >
          <div style={{ ["--dt-border"]: border, ["--dt-accent"]: inks.accent } as CSSProperties}>
            {app.faqs.map(f => (
              <Accordion
                key={f.q}
                className="dt-reveal dt-faq"
                inkLow={inkLow}
                summary={<span className="dt-faq-q">{f.q}</span>}
              >
                {f.a}
              </Accordion>
            ))}
          </div>
        </AppSection>

        {/* ── Refunds ─────────────────────────────────────────── */}
        <AppSection
          id="refunds"
          kicker="Billing"
          title="Refunds and cancellation."
          inks={inks}
        >
          <p className="app-reveal text-base leading-relaxed max-w-3xl" style={{ color: inkLow }}>
            Every purchase goes through Google Play, so Play's refund window applies. Inside 48 hours
            you can request a refund from the Play Store directly. After that, write to{" "}
            <a href={mailto} className="link underline underline-offset-4">{support.email}</a> and
            we'll look at it case by case. Cancelling stops the next renewal — anything you've already
            paid for stays active until the end of that period.
          </p>
        </AppSection>
      </div>

      <AppNav index={index} border={border} />
    </motion.main>
  );
};

export default AppSupport;
