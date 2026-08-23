import { CSSProperties, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { apps, getApp, formatDate } from "./apps.data";
import { AppNav, AppNotFound, AppSection, AppTabs, inkFor, useSectionReveal } from "./AppChrome";
import AppHero from "./AppHero";
import { useSeo } from "../../hooks/useSeo";
import "./apps.css";

/* Section ids double as the contents rail. Keep in sync with the
   <section>s below. */
const SECTIONS = [
  { id: "summary",   label: "In short" },
  { id: "collect",   label: "What we collect" },
  { id: "use",       label: "How it's used" },
  { id: "sharing",   label: "Sharing" },
  { id: "security",  label: "Security" },
  { id: "retention", label: "Retention" },
  { id: "rights",    label: "Your rights" },
  { id: "children",  label: "Children" },
  { id: "changes",   label: "Changes" },
  { id: "contact",   label: "Contact" },
];

/** Privacy policy — the URL that goes in the Play Console listing. The
    boilerplate is shared; the data table and stance come from the app. */
const AppPrivacy = () => {
  const { app: slug } = useParams();
  const app = getApp(slug);
  const body = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSeo({
    title: app ? `${app.name} privacy policy` : "App not found",
    description: app
      ? `How ${app.name} handles your data: what is collected, why, who it is shared with, how long it is kept, and how to have it deleted.`
      : undefined,
    path: `/apps/${slug ?? ""}/privacy`,
  });

  useSectionReveal(body, [slug]);

  if (!app) return <AppNotFound />;

  const index = apps.indexOf(app);
  const { ink, inkLow, inkDim, border } = inkFor(app.color);
  const { privacy, support, name } = app;

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
        title="Privacy policy"
        meta={`${name} / Privacy`}
        lead={privacy.stance}
        compact
      >
        <p className="mono mt-6 text-xs uppercase tracking-[0.18em]" style={{ color: inkDim }}>
          Effective {formatDate(privacy.effective)} · Version {app.release.version}
        </p>
      </AppHero>

      <div className="px-6 md:px-14 xl:px-20">
        <AppTabs app={app} tab="privacy" border={border} inkLow={inkLow} />
      </div>

      <div ref={body}>
        <AppSection kicker="The policy" border={border} inkLow={inkLow} inkDim={inkDim}>
          <div className="grid gap-12 lg:grid-cols-[190px_1fr] lg:gap-16">
            {/* Contents rail — sticky on desktop, a plain list on mobile. */}
            <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="Policy contents">
              <p className="mono text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: inkDim }}>Contents</p>
              <ol className="mono mt-4 space-y-2 text-xs">
                {SECTIONS.map((s, i) => (
                  <li key={s.id} className="flex gap-2.5">
                    <span className="tabular-nums" style={{ color: inkDim }}>{String(i + 1).padStart(2, "0")}</span>
                    <a href={`#${s.id}`} className="link hover:opacity-100 transition-opacity" style={{ color: inkLow }}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="app-prose min-w-0 max-w-3xl" style={{ color: inkLow, borderColor: border }}>
              <section id="summary" className="app-reveal">
                <h2 style={{ color: ink }}>1. In short</h2>
                <p>
                  This policy explains what {name} does with your information. It applies to the Android
                  app published on Google Play and to any of its supporting services. We have tried to
                  write it in plain language — where a section is a legal requirement rather than a
                  real-world behaviour, it says so.
                </p>
                <ul>
                  <li>We collect the minimum needed to make the app work, and nothing to sell.</li>
                  <li>We never sell your personal data, and we don't run third-party ad networks.</li>
                  <li>You can request an export or a full deletion of your data at any time.</li>
                </ul>
              </section>

              <section id="collect" className="app-reveal">
                <h2 style={{ color: ink }}>2. What we collect</h2>
                <p>
                  The table below is the complete list of what {name} handles, why it is handled, and how
                  long it is kept.
                </p>
                <p className="mono text-[0.68rem] sm:hidden" style={{ color: inkDim }} aria-hidden>
                  Scroll the table sideways →
                </p>
                <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: border }}>
                  <table className="app-table" style={{ borderColor: border }}>
                    <colgroup><col /><col /><col /></colgroup>
                    <thead>
                      <tr>
                        <th scope="col">Data</th>
                        <th scope="col">Why</th>
                        <th scope="col">Kept for</th>
                      </tr>
                    </thead>
                    <tbody>
                      {privacy.collected.map(row => (
                        <tr key={row.data}>
                          <th scope="row" style={{ color: ink }}>{row.data}</th>
                          <td>{row.why}</td>
                          <td>{row.kept}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  We do not collect your contacts, your call logs, your SMS messages, or precise
                  background location. Permissions the app requests are asked for at the moment they are
                  needed, and declining one only disables the feature that needs it.
                </p>
              </section>

              <section id="use" className="app-reveal">
                <h2 style={{ color: ink }}>3. How it's used</h2>
                <p>Information collected by {name} is used only to:</p>
                <ul>
                  <li>Operate the features you asked for and keep your data in sync across your devices.</li>
                  <li>Authenticate you and protect the account from unauthorised access.</li>
                  <li>Diagnose crashes and performance problems, using aggregated diagnostics.</li>
                  <li>Respond to your support requests.</li>
                  <li>Meet legal, tax and accounting obligations for paid plans.</li>
                </ul>
                <p>
                  We do not use your content to train machine-learning models, and we do not profile you
                  for advertising.
                </p>
              </section>

              <section id="sharing" className="app-reveal">
                <h2 style={{ color: ink }}>4. Sharing and processors</h2>
                <p>
                  We do not sell personal data. We share the minimum necessary with the service providers
                  below, each bound by a data processing agreement:
                </p>
                <ul>
                  {privacy.processors.map(p => (
                    <li key={p.name}>
                      <strong className="font-medium" style={{ color: ink }}>{p.name}</strong> — {p.role}
                    </li>
                  ))}
                </ul>
                <p>
                  We may also disclose information where we are legally compelled to — a valid court order
                  or a binding request from a competent authority. Where the law allows it, we will tell
                  you first.
                </p>
              </section>

              <section id="security" className="app-reveal">
                <h2 style={{ color: ink }}>5. Security</h2>
                <p>
                  Data in transit is protected with TLS 1.2 or better. Data at rest on our infrastructure
                  is encrypted with AES-256. Access to production systems is limited to the people who
                  need it, requires multi-factor authentication, and is logged.
                </p>
                <p>
                  No system is perfectly secure. If a breach affects your personal data, we will notify
                  affected users and the relevant authority within 72 hours of becoming aware of it, as
                  required under applicable law.
                </p>
              </section>

              <section id="retention" className="app-reveal">
                <h2 style={{ color: ink }}>6. How long we keep it</h2>
                <p>
                  Retention periods are listed per data type in section 2. In general, content you create
                  is kept until you delete it or close your account; diagnostics are kept for 90 days; and
                  billing records are kept for as long as tax law requires, currently eight years in
                  India. Backups are purged on a rolling 35-day cycle, so deleted data can persist in
                  backups for up to 35 days after deletion.
                </p>
              </section>

              <section id="rights" className="app-reveal">
                <h2 style={{ color: ink }}>7. Your rights</h2>
                <p>
                  Depending on where you live — under the GDPR, the India DPDP Act, the CCPA and similar
                  laws — you have the right to:
                </p>
                <ul>
                  <li>Access the personal data we hold about you, and get a machine-readable copy.</li>
                  <li>Correct anything inaccurate.</li>
                  <li>Delete your account and the data attached to it.</li>
                  <li>Object to, or restrict, particular kinds of processing.</li>
                  <li>Withdraw consent you previously gave, without affecting past processing.</li>
                  <li>Lodge a complaint with your data protection authority.</li>
                </ul>
                <p>
                  In-app, use <em>Settings → Account → Export data</em> or <em>Delete account</em>.
                  Deletion is immediate and irreversible. You can also email{" "}
                  <a href={`mailto:${support.email}`}>{support.email}</a> and we will action the request
                  within 30 days.
                </p>
              </section>

              <section id="children" className="app-reveal">
                <h2 style={{ color: ink }}>8. Children</h2>
                <p>
                  {name} is not directed at children under 13 (or under 16 in the EEA), and we do not
                  knowingly collect their personal data. If you believe a child has given us information,
                  write to us and we will delete it.
                </p>
              </section>

              <section id="changes" className="app-reveal">
                <h2 style={{ color: ink }}>9. Changes to this policy</h2>
                <p>
                  We will update this page when the app's data handling changes. Material changes are
                  announced in the app before they take effect and noted in the{" "}
                  <a href={`/apps/${app.slug}/changelog`}>changelog</a>. The effective date at the top of
                  this page always reflects the current version.
                </p>
              </section>

              <section id="contact" className="app-reveal">
                <h2 style={{ color: ink }}>10. Contact</h2>
                <p>Questions about this policy, or about the data we hold, go to the same place as everything else:</p>
                <ul>
                  <li>Email — <a href={`mailto:${support.email}`}>{support.email}</a></li>
                  <li>Phone — {support.phone} ({support.hours})</li>
                  <li>Post — {support.address}</li>
                </ul>
                <p className="mono text-xs mt-8" style={{ color: inkDim }}>
                  This policy is provided as a general template and is not legal advice. Have counsel
                  review it before you rely on it for a production listing.
                </p>
              </section>
            </div>
          </div>
        </AppSection>
      </div>

      <AppNav index={index} border={border} />
    </motion.main>
  );
};

export default AppPrivacy;
