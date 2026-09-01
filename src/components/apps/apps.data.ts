import { CONTACT } from "../../contact.data";

/* ── Play Store app catalogue ──────────────────────────────────
   One entry per shipped Android app. Everything the /apps routes
   render — landing, support, privacy, changelog — is driven from
   here so a new app is a single object, not five new files.

   NOTE: copy is placeholder / generic for now. Swap the strings,
   not the shape.                                                  */

/** One phone screenshot. */
export interface Screen {
  /** Filename inside /apps/<slug>/, extension included. */
  file: string;
  caption: string;
}

export interface Feature {
  title: string;
  body: string;
  /** Screenshot that illustrates this feature — a file in
      /apps/<slug>/. It does not have to be one of the gallery
      `screens`; a feature may point at a screen worth showing once. */
  shot: string;
  /** Promotes the feature into the full-width alternating showcase.
      Everything else renders as a card with a cropped thumbnail. */
  featured?: boolean;
}

export interface Faq {
  q: string;
  a: string;
}

export type ChangeKind = "new" | "improved" | "fixed";

export interface ChangelogEntry {
  version: string;
  /** ISO date — formatted at render time. */
  date: string;
  /** Drives the release badge colour. */
  kind: "major" | "minor" | "patch";
  headline: string;
  changes: { kind: ChangeKind; text: string }[];
}

/** One row of the privacy policy's "what we collect" table. */
export interface DataRow {
  data: string;
  why: string;
  kept: string;
}

export type AppRoute = "overview" | "privacy" | "support" | "changelog";

/* ── Verbatim policy documents ──────────────────────────────────
   Every string below may carry inline markup: **bold**, *italic*,
   `code`, [text](href), and a bare address like privacy@nishant.click,
   which is linked automatically. See RichText.tsx.                 */

export type PolicyBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  /** Any column count. Two renders as a narrow pair table, three or
      more as the wider data table; both scroll inside their own box. */
  | { kind: "table"; head: string[]; rows: string[][] }
  /** The boxed claim a policy opens on, when it has one to make. */
  | { kind: "callout"; title: string; text: string[] };

export interface PolicySection {
  /** Anchor id, and the label in the contents rail. */
  id: string;
  label: string;
  /** Numbered as the document numbers it. The sections cross-reference
      each other, so the numbers are load-bearing, not decoration. */
  heading: string;
  blocks: PolicyBlock[];
}

export interface PolicyDoc {
  /** ISO date shown as "Last updated". */
  updated: string;
  /** Which builds it covers, e.g. "version 1.0 and later". */
  applies: string;
  /** Everything above the first section — usually a paragraph or two,
      and the callout if the policy leads with one. */
  intro: PolicyBlock[];
  /** The one-line summary the policy leads on. */
  lede: string;
  sections: PolicySection[];
  /** The line the document signs off with. */
  footer: string;
}

export interface AppMeta {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  /** Pastel card colour — same palette family as the project cards. */
  color: string;
  /** Saturated sibling of `color`, matching the accent inside the
      screenshots. Used for the glows behind the phones, where the
      pastel would be invisible against the pastel page. */
  glow: string;
  /** Second accent. The closing heading ignites its characters in
      `glow` and `glow2` alternately before they settle to the page
      ink — the same two-tone reveal the homepage finale uses. */
  glow2: string;
  /** Short right-hand meta on the listing row, like a project's contribution. */
  role: string;
  status: "live" | "beta" | "soon";

  /** Play Store listing facts, shown in the "On Google Play" band.
      `installs`, `rating` and `playUrl` only exist once the listing is
      live — a missing `playUrl` is what every page reads as "not
      published yet", and the install buttons go inert rather than
      linking nowhere. */
  release: {
    version: string;
    updated: string;
    /** Omitted when there is no published figure to quote. */
    size?: string;
    minAndroid: string;
    /** Where the app is, or will be, listed. Drives the install button's
        wording while there is nothing to link to. Defaults to Play. */
    stores?: string[];
    installs?: string;
    rating?: string;
    playUrl?: string;
  };

  hero: {
    headline: string;
    sub: string;
    /** Short proof points — these feed the hero marquee. */
    points: string[];
  };

  /** Big-number row in the "At a glance" band. */
  stats: { value: string; label: string }[];

  /** One line above the closing install button. */
  closer: string;

  /** The gallery, in order. Files live in /apps/<slug>/ and are named
      for what they show, not numbered by position — a numbered
      sequence breaks the moment a screenshot is added or dropped.

      The first three also form the hero cluster: [1] left, [0] front,
      [2] right, so put the strongest screen first. */
  screens: Screen[];

  features: Feature[];
  /** What it's built on, grouped by what each piece is for — the
      /work pages' stack band, on the product side. */
  stack: { group: string; items: string[] }[];
  /** Numbered "how it works" steps on the app page. */
  steps: { title: string; body: string }[];
  faqs: Faq[];
  /** "Before you write in" — the answers that resolve a support mail
      before it is sent. Rendered above the FAQ on the support page. */
  troubleshooting?: Faq[];

  support: {
    email: string;
    /** Copied on every support mail. */
    cc: string;
    /** Omitted by an app whose desk is email-only. */
    phone?: string;
    hours?: string;
    responseTime: string;
    address: string;
    /** The "other desks" list on the support page. An app that routes
        its mail differently overrides it — a role address only works
        while it is the right address, and listing one that does not
        apply to this app just misroutes the mail it attracts. */
    desks?: { label: string; address: string }[];
  };

  /** Feeds the shared, generated policy. Omit it when the app ships
      its own `policy` instead. */
  privacy?: {
    effective: string;
    /** The policy hero's lead — one line on the app's data posture. */
    stance: string;
    collected: DataRow[];
    /** Third parties named in the "sharing" section. */
    processors: { name: string; role: string }[];
  };

  /** A policy written for this app and reviewed against its binary.
      When present it is reproduced as written and `privacy` is unused —
      Play holds the policy to what the app actually does, so this text
      is not ours to summarise or improve. */
  policy?: PolicyDoc;

  /** Per-route <title> and description overrides. An app submitted to
      Play needs the exact strings that went into the listing. */
  seo?: Partial<Record<AppRoute, { title: string; description?: string }>>;

  /** The addresses and small print an app publishes on its own overview
      page — a store listing's footer, in the site's language. */
  overviewFooter?: {
    contacts: { label: string; address: string }[];
    /** Disclaimer, affiliation notice, anything that has to be on the
        page rather than only in the policy. */
    note?: string;
  };

  changelog: ChangelogEntry[];
}

/** Where an app's screenshot lives. */
export const shotSrc = (slug: string, file: string) => `/apps/${slug}/${file}`;

/* ─────────────────────────────────────────────────────────────── */

/** Support desk. `email` is the address people write to; `cc` is the
    general inbox, kept in copy so nothing is missed while the desk
    address is new. Both live in `contact.data` with the other desks. */
const SUPPORT_EMAIL = CONTACT.support;
const SUPPORT_CC    = CONTACT.hello;

export const apps: AppMeta[] = [
  /* ── PDI Pro ─────────────────────────────────────────────────
     Copy verified against the app's source, via store/web/SITE_BRIEF.md
     in the PDI Pro repo. The figures in `stats` and in the feature copy
     are load-bearing — §4 of that brief names the file each one is
     derived from, so regenerate them from the app rather than editing
     them here.

     Not in either store yet, so there is no playUrl, install count or
     rating. It is also the one app here that ships on iOS, which is why
     `minAndroid` carries both floors.                                */
  {
    slug: "pdi-pro",
    name: "PDI Pro",
    tagline: "Inspect. Score. Decide.",
    blurb:
      "A guided pre-delivery inspection for Indian car buyers. It knows which variant you are taking delivery of, asks only about the things that variant actually has, tells you what each answer means, and turns the session into a scored PDF report you can put in front of the dealer.",
    color: "#c2e9fb",
    glow: "#5cc8f5",
    glow2: "#6366f1",
    role: "Android & iOS · Flutter",
    status: "live",
    release: {
      version: "1.0",
      updated: "2026-09-01",
      /* No published install size — the brief quotes none, and the only
         honest thing to say is that photographs dominate it. */
      minAndroid: "Android 5.0+ · iOS 13+",
      stores: ["Google Play", "the App Store"],
      playUrl: "https://play.google.com/store/apps/details?id=click.nishant.pdipro",
    },
    hero: {
      headline: "One chance to inspect a new car. This walks you through it.",
      sub: "You get one chance to inspect a new car, usually in a hurry, usually with someone waiting for a signature. PDI Pro generates its questions from your car's own specification, interprets what you record, and produces a report the dealer cannot argue with.",
      points: ["Works offline", "No account", "No analytics", "Free at launch"],
    },
    stats: [
      { value: "377", label: "Variants covered" },
      { value: "32", label: "Model families" },
      { value: "~120", label: "Checks per car" },
      { value: "8", label: "Zones, one lap" },
    ],
    closer: "The half hour that decides the next ten years.",
    screens: [
      { file: "home.webp",                    caption: "Home" },
      { file: "walk-the-car.webp",            caption: "Walk the car" },
      { file: "instrument-readings.webp",     caption: "Instrument readings" },
      { file: "identity-checks.webp",         caption: "Identity and papers" },
      { file: "high-issues.webp",             caption: "What to do about it" },
      { file: "where-problems-are.webp",      caption: "Where the problems are" },
      { file: "analysis-recommendation.webp", caption: "Score and verdict" },
      { file: "verdict-do-not-accept.webp",   caption: "When to refuse the car" },
      { file: "report.webp",                  caption: "The report" },
      { file: "report-evidence.webp",         caption: "Before and after" },
      { file: "report-preview.webp",          caption: "The PDF" },
      { file: "follow-ups.webp",              caption: "Follow-ups" },
    ],
    features: [
      {
        title: "Knows your exact variant",
        body: "32 model families and 377 variants across seven manufacturers — Maruti Suzuki, Tata, Hyundai, Mahindra, Kia, Toyota and MG — the best-selling cars in India plus every mainstream EV. Checks are generated from that variant's own specification, down to the trim ladder. The free generic inspection works on any car at all.",
        shot: "home.webp", featured: true,
      },
      {
        title: "Walks the car once",
        body: "Checks are grouped by where you physically stand, not by engineering system: at the desk, around the car, at the charger, under the bonnet, inside, in the boot, on the drive, and back at the desk. Eight zones, one lap, instead of six trips round the car.",
        shot: "walk-the-car.webp", featured: true,
      },
      {
        title: "Scores honestly",
        body: "Findings come off the score as an absolute penalty, so a car with a dozen defects lands in the sixties rather than the high nineties. High findings count fully, medium at 40%, low at 15%. Critical safety and identity problems are kept out of the score entirely and reported as blockers, so a high number can never paper over a VIN mismatch.",
        shot: "analysis-recommendation.webp", featured: true,
      },
      {
        title: "Proves you got the right car",
        body: "Being handed the trim below the one you paid for is the most expensive mistake at delivery. Generated from the trim ladder: exactly what your variant has that the one below it does not, item by item, on the car in front of you.",
        shot: "variant-proof.webp",
      },
      {
        title: "Records what the instruments say",
        body: "Paint thickness, tread depth, pressures against the placard, battery voltage, moisture — on a keypad built for standing in a yard with a gauge in your other hand. The app compares every reading against every other, which is where a refinished panel or a swapped tyre gives itself away.",
        shot: "instrument-readings.webp",
      },
      {
        title: "Reads plates and odometers",
        body: "Photograph a VIN, an odometer or a tyre date code and the number is extracted for you. Recognition runs on-device with a bundled model; the image never leaves the phone, and it works in aeroplane mode.",
        shot: "identity-checks.webp",
      },
      {
        title: "Cross-checks facts from two places",
        body: "Glass date codes across every pane, seatbelt webbing dates against the build, and with a scanner: module distance against the dashboard, ignition cycle count, battery state of health. These do not find a scratch — they find history somebody would rather you did not have.",
        shot: "by-system.webp",
      },
      {
        title: "Keeps evidence",
        body: "Photographs filed against their check, with the reason they were taken — and before/after pairs when something is put right on a return visit.",
        shot: "report-evidence.webp",
      },
      {
        title: "Produces a report",
        body: "A clean PDF with your details, the score, every finding, what you asked for, and the photographs. Every report carries a reference like PDI-0824-K7RM, so a dealer conversation has something to quote.",
        shot: "report.webp",
      },
      {
        title: "Chases what the dealer promised",
        body: "\"We'll fix that at first service\" is worth nothing unless it is written down with a name and a date against it. Every undertaking is recorded with who gave it and by when; one tap composes the message, and closing one asks for a photograph of the work.",
        shot: "follow-ups.webp",
      },
      {
        title: "Tracks what delivery started",
        body: "The temporary registration expires in a month, and driving past it is a ₹5,000–10,000 offence nobody warns you about. The RC, the first service, the battery warranty and the own-damage cover are all counted down.",
        shot: "after-delivery.webp",
      },
      {
        title: "Works for buyers and inspectors",
        body: "Guided mode explains every check for someone who has never done this. Professional mode drops the coaching and turns the report into your document — your firm, your logo, your contact details, your kit assumed every morning.",
        shot: "score-good.webp",
      },
      {
        title: "Tells you how to get access",
        body: "Every other checklist assumes you are already standing next to the car — the hardest step is often being allowed to. The prep brief covers what to bring, when to arrive, what light you need, and what to say when you are told the car is sealed or the yard is off limits.",
        shot: "find-a-check.webp",
      },
      {
        title: "Backs everything up",
        body: "Every inspection into one file, photographs included, restorable on another device. Your evidence should not die with your phone.",
        shot: "report-preview.webp",
      },
    ],
    stack: [
      { group: "Framework", items: ["Flutter 3.44", "Dart 3.12", "Sound null safety", "Riverpod 2"] },
      { group: "Design", items: ["Material 3", "Dynamic colour", "Bundled Roboto"] },
      { group: "On device", items: ["shared_preferences", "App documents directory", "Sessions as JSON", "Photos on disk"] },
      { group: "Capture & reading", items: ["ML Kit, bundled model", "image_picker", "gal"] },
      { group: "Reporting", items: ["pdf + printing", "share_plus", "file_picker", "url_launcher"] },
      { group: "Deliberately absent", items: ["No backend", "No auth", "No cloud storage", "No analytics", "No crash reporting"] },
    ],
    steps: [
      { title: "Set up once.", body: "Five short questions: why you are here, whether you are buying or inspecting for someone else, which car, which variant, and the details that go at the top of a report. Buyer-or-inspector is asked first, because it decides whose car \"your car\" is." },
      { title: "Declare your toolkit.", body: "Tick the instruments you will actually have — a paint gauge, a tread depth gauge, a pressure gauge, an OBD scanner, a multimeter, a moisture meter — and the checks they make possible appear. Borrow a gauge from the dealer and you get exactly what a paid inspector carrying one gets." },
      { title: "Read the prep brief before you go.", body: "What to bring, when to arrive, what light you need, and what to say. \"If they say no\" covers what you will be told, what is actually behind each one, and the sentence that answers it." },
      { title: "Walk the car once.", body: "Eight zones in the order you physically move. The app advances by itself after an answer that closed the question, and stays put whenever one opens a follow-up or needs a photograph." },
      { title: "Photograph anything you raise.", body: "Evidence is filed against its check with what you recorded and why it matters. Some checks — the VIN plate, the odometer, a charging session — always want a picture; most ask only once something is flagged." },
      { title: "Enter the instrument readings.", body: "Panel by panel, corner by corner, on a numeric keypad. The app does the part the instrument cannot: comparing each reading against the car's own median, the placard figure, or the band true of every car." },
      { title: "Read the analysis.", body: "A weighted score, the blockers listed separately, and a verdict in plain words. Below 85% coverage the verdict is marked provisional, and the app says how much is still unlooked-at." },
      { title: "Record what they promised.", body: "Against the check it belongs to: what, who said it, and by when. It goes into the report and into a follow-up list that tells you what is overdue." },
      { title: "Generate and share the report.", body: "A PDF with a quotable reference, shared from your phone before you sign. Then the deadlines start counting down, and the follow-up list starts chasing." },
    ],
    faqs: [
      { q: "What do the three verdicts mean?", a: "ACCEPT — take delivery. ACCEPT AFTER RESOLUTION — get it fixed first, then take delivery. DO NOT ACCEPT — refuse delivery of this specific car. Anything still outstanding caps the wording at \"Good\", because \"Excellent\" printed above a list of things to fix reads as an app not reading its own findings." },
      { q: "Why can the score fall so far?", a: "Most inspection scores are a weighted average, which measures how much of the car was fine — and on a pack of a hundred-odd checks, that is nearly all of it however bad the car is. PDI Pro takes findings off the overall score as an absolute penalty on top of the section-weighted average, so a car with a dozen defects lands in the sixties rather than the high nineties." },
      { q: "What if I only get through part of the car?", a: "Below 15% inspected, or fewer than five answers, the app refuses to show a score at all rather than showing a flattering one. Below 85% the verdict is labelled provisional and the app says how much is still unlooked-at." },
      { q: "Does it need a network connection?", a: "Not for anything. The app is fully functional in aeroplane mode, which is often what a basement delivery bay amounts to. Text recognition uses a model bundled inside the app, so even reading a VIN off a photo needs no connection." },
      { q: "Is my car covered?", a: "32 model families and 377 variants across seven manufacturers — the best-selling cars in India plus every mainstream EV, modelled as generations, trim ladders, powertrain options and offer windows. Superseded variants stay in the app, because leftover stock is precisely what needs inspecting. The free generic inspection works on any car at all." },
      { q: "What does it cost?", a: "Every variant pack is free in this release. No subscription, no trial, no account, and no ads. If paid packs are introduced later, the app will say so plainly and the transaction will be handled entirely by Google Play or the App Store." },
    ],
    troubleshooting: [
      { q: "My car is not in the list.", a: "The free generic inspection works on any car at all. Tell us the make, model and variant and it may be added." },
      { q: "A specification looks wrong.", a: "Every car shows where its figures came from. The brochure for your build month is the authority — send the discrepancy and it will be corrected." },
      { q: "I lost my inspections.", a: "If you exported a backup, restore it from Backup → Restore. Without one, there is no copy: nothing is stored off your device." },
      { q: "The camera or text scan is not working.", a: "Check the app has camera permission in system settings. Text recognition runs on-device and needs no connection." },
    ],
    support: {
      email: SUPPORT_EMAIL,
      cc: SUPPORT_CC,
      /* Rendered as "…a human reads every message, usually {this}." —
         so it is a bare duration, not a sentence. */
      responseTime: "Within a few working days",
      address: "Independent developer, India",
      /* The brief routes this app's mail deliberately and leaves abuse@
         off: it is a site-wide infrastructure address with nothing to do
         with a car inspection app, and listing it here misroutes mail. */
      desks: [
        { label: "A car is missing, or a spec is wrong", address: CONTACT.feedback },
        { label: "Your data or the privacy policy", address: CONTACT.privacy },
        { label: "Billing", address: CONTACT.billing },
      ],
    },
    overviewFooter: {
      contacts: [
        { label: "Something not working?", address: CONTACT.support },
        { label: "A car missing, or a spec wrong?", address: CONTACT.feedback },
        { label: "Anything else", address: CONTACT.hello },
      ],
      note: "Not affiliated with, endorsed by, or connected to any vehicle manufacturer or dealership. PDI Pro is an inspection aid, not a mechanical certification or legal advice.",
    },
    seo: {
      overview: {
        title: "PDI Pro — Inspect. Score. Decide.",
        description: "A guided pre-delivery inspection for Indian car buyers. Knows your exact variant, walks the car once, scores honestly, and produces a report the dealer cannot argue with. Works offline.",
      },
      privacy: {
        title: "Privacy Policy — PDI Pro",
        description: "PDI Pro collects no data. No account, no server, no analytics. Everything you record during an inspection stays on your device.",
      },
      support: {
        title: "Support — PDI Pro",
        description: "Help with PDI Pro: missing cars, specifications, backups, camera and text scanning, and where to write.",
      },
      changelog: {
        title: "Changelog — PDI Pro",
        description: "Release notes for PDI Pro, newest first — what changed for the person inspecting a car, version by version.",
      },
    },
    policy: {
      updated: "2026-08-31",
      applies: "PDI Pro 1.0 on Android and iOS",
      lede: "There is no account, no login, and no server. Everything you record during an inspection is written to storage on your own device and stays there.",
      intro: [
        {
          kind: "callout",
          title: "PDI Pro does not collect your data.",
          text: [
            "There is no account, no login, and no server. Everything you record during an inspection — your answers, your notes, your photographs, the buyer and dealer details you type in — is written to storage on your own device and stays there.",
            "We cannot see your inspections. Nobody can, unless you choose to share a report.",
          ],
        },
        { kind: "p", text: "PDI Pro is a pre-delivery vehicle inspection assistant, published by Nishant Chorge ([www.nishant.click](https://www.nishant.click)). This policy explains what the app stores, what it never does, and what control you have. It is short because the app does very little with your data." },
      ],
      sections: [
        {
          id: "stores", label: "What it stores", heading: "What the app stores on your device",
          blocks: [
            { kind: "table",
              head: ["What", "Why", "Where"],
              rows: [
                ["Inspection answers, notes and scores", "To let you pause an inspection and resume it later", "App-private storage"],
                ["Photographs you take as evidence", "To attach proof to a finding and include it in your report", "App-private storage"],
                ["Instrument readings — paint thickness, tread depth, tyre pressures, battery voltage, moisture", "To compare readings across the car and flag the one that does not belong", "App-private storage"],
                ["Buyer or client name, dealer name, booking reference, registration number, VIN", "They appear at the top of the report you generate", "App-private storage"],
                ["Dealer commitments — what was promised, by whom, by when", "To chase them in your follow-up list", "App-private storage"],
                ["Inspector profile — firm name, logo, contact details", "To put them on reports, if you inspect cars professionally", "App-private storage"],
                ["Your settings — which packs are unlocked, your toolkit, appearance preference", "To remember them between launches", "App-private storage"],
              ],
            },
            { kind: "p", text: "Uninstalling PDI Pro deletes all of it. There is no copy anywhere else." },
          ],
        },
        {
          id: "never", label: "What it never does", heading: "What the app never does",
          blocks: [
            { kind: "ul", items: [
              "**No account.** You are never asked for an email address, a phone number or a password, because there is nothing to sign in to.",
              "**No server.** The app has no backend. It makes no network request that carries anything you recorded.",
              "**No analytics.** No analytics SDK, no advertising SDK, no crash reporting that transmits off the device, no tracking identifiers, no advertising ID.",
              "**No background sync and no automatic upload.** Nothing leaves your device unless you tap something that says it will.",
              "**No profile.** The app does not build a picture of you, and has nothing to sell.",
            ] },
          ],
        },
        {
          id: "permissions", label: "Permissions", heading: "Permissions, and exactly what they are for",
          blocks: [
            { kind: "ul", items: [
              "**Camera** — only to photograph the car during an inspection, and only when you tap the camera button. Photographs are saved to the app's own storage and are never uploaded. You can decline camera access and still complete an entire inspection.",
              "**Photo library (read)** — only when you choose to attach a picture you already took to a finding.",
              "**Photo library (add)** — only when you choose \"Save to photos\" in the Evidence gallery, so a copy lands in your own gallery.",
              "**Files** — only when you pick a backup file to restore.",
            ] },
            { kind: "p", text: "The app requests no location, no contacts, no microphone, no calendar and no call or message access. It declares no restricted permissions — no all-files access, no package querying, no background location." },
          ],
        },
        {
          id: "recognition", label: "Text recognition", heading: "On-device text recognition",
          blocks: [
            { kind: "p", text: "When you photograph a VIN plate, an odometer or a tyre date code, PDI Pro reads the characters from the picture so you do not have to type them. That recognition runs **entirely on your device**, using Google ML Kit's on-device text recognition with the model bundled inside the app. The image is not uploaded, the extracted text is not transmitted, and the feature works with the phone in aeroplane mode." },
          ],
        },
        {
          id: "sharing", label: "Sharing and backups", heading: "Sharing and backups",
          blocks: [
            { kind: "p", text: "Sharing is always something you start, one file at a time:" },
            { kind: "ul", items: [
              "**Share a report or a photograph** hands the file to your phone's share sheet. What happens next is between you and whichever app you pick.",
              "**Save to photos** writes a copy into your own gallery.",
              "**Export a backup** writes a single file containing your inspections and the photographs inside them, and hands it to the share sheet. Where it goes — a cloud drive, a laptop, a message to yourself — is entirely your choice. PDI Pro does not upload it and does not know where you put it.",
              "**Restore a backup** reads a file you choose from your device.",
            ] },
            { kind: "p", text: "Once a report or backup leaves the app, the privacy policy of whichever service you sent it to applies, not this one. A PDF report contains the details you entered, including a VIN and a registration number if you recorded them, so share it deliberately." },
          ],
        },
        {
          id: "links", label: "Links out", heading: "Links out of the app",
          blocks: [
            { kind: "p", text: "A few screens link to this website — the overview page, support, the changelog and this policy. Tapping one opens your own browser. The app sends no identifier with the request, and nothing about your inspection travels with it. The website does not set advertising cookies or run cross-site trackers." },
          ],
        },
        {
          id: "payments", label: "Payments", heading: "Payments",
          blocks: [
            { kind: "p", text: "Version 1.0 charges nothing. Every inspection pack is free, and the app says so wherever a price appears. If paid packs are introduced later, the transaction will be handled entirely by the store you installed from — Google Play or the Apple App Store — and PDI Pro will never see or store your card details. Refunds and billing are handled by that store under its own policy; if something is wrong on our side, write to billing@nishant.click." },
          ],
        },
        {
          id: "children", label: "Children", heading: "Children",
          blocks: [
            { kind: "p", text: "PDI Pro is intended for adults buying or professionally inspecting a motor vehicle. It is not directed at children, is not listed in any families programme, and collects nothing from anyone regardless of age." },
          ],
        },
        {
          id: "specs", label: "Vehicle specifications", heading: "Vehicle specifications in the app",
          blocks: [
            { kind: "p", text: "The app carries published specifications for a number of models so it can compare what you observe against what the manufacturer states. These are drawn from manufacturer material and public listings. Each car in the app shows where its figures came from and how well corroborated they are, and where published sources disagree the app says so rather than guessing. They are provided for guidance: the brochure for your build month is the authority, and the app carries a check that says exactly that." },
            { kind: "p", text: "PDI Pro is an inspection aid, not a mechanical certification, a valuation, or legal advice. The verdict it produces is a summary of what you recorded." },
          ],
        },
        {
          id: "rights", label: "Your rights", heading: "Your rights",
          blocks: [
            { kind: "p", text: "Because nothing leaves your device, there is no account to access, no data for us to export, and nothing for us to delete on your behalf — we hold none of it." },
            { kind: "ul", items: [
              "**To see everything the app holds**, open it: every inspection, photograph and note is listed there.",
              "**To export it**, use Backup → Export.",
              "**To erase it**, delete an individual inspection inside the app, or uninstall the app to remove all of it at once.",
            ] },
            { kind: "p", text: "If you are covered by the GDPR, the UK GDPR, India's Digital Personal Data Protection Act, or a similar law, note that we are not a data controller or processor for anything you record in PDI Pro: it never reaches us. You remain in sole control of it on your own device. Questions about this are welcome at privacy@nishant.click; formal notices can be sent to legal@nishant.click." },
          ],
        },
        {
          id: "security", label: "Security", heading: "Security",
          blocks: [
            { kind: "p", text: "Inspection data is held in your device's app-private storage, which the operating system isolates from other apps and protects with your device passcode and platform encryption. Keeping a device lock enabled is the most useful thing you can do to protect it. Backup files you export are ordinary files, unencrypted so that they can be read back on another device — store them somewhere you trust." },
          ],
        },
        {
          id: "changes", label: "Changes", heading: "Changes to this policy",
          blocks: [
            { kind: "p", text: "Material changes will be published on this page with a new \"last updated\" date, and noted in the app's release notes at [the changelog](/apps/pdi-pro/changelog). Because the app collects nothing, no change can retroactively affect data already recorded on your device." },
          ],
        },
        {
          id: "contact", label: "Contact", heading: "Contact",
          blocks: [
            { kind: "p", text: "Nishant Chorge — [www.nishant.click](https://www.nishant.click)" },
            { kind: "table",
              head: ["For", "Write to"],
              rows: [
                ["This policy, your data, or a privacy question", "privacy@nishant.click"],
                ["Formal or legal notices", "legal@nishant.click"],
                ["A problem with the app", "support@nishant.click"],
              ],
            },
            { kind: "ul", items: [
              "About the app: [nishant.click/apps/pdi-pro](/apps/pdi-pro)",
              "Support: [nishant.click/apps/pdi-pro/support](/apps/pdi-pro/support)",
            ] },
            { kind: "p", text: "Privacy mail is answered by a person, not a ticketing system, and nothing you send is added to any list." },
          ],
        },
      ],
      footer: "© 2026 Nishant Chorge. PDI Pro is not affiliated with, endorsed by, or connected to any vehicle manufacturer or dealership. PDI Pro is an inspection aid, not a mechanical certification or legal advice.",
    },
    changelog: [
      {
        version: "1.0", date: "2026-09-01", kind: "major",
        headline: "First public release.",
        changes: [
          { kind: "new", text: "32 model families and 377 variants across seven manufacturers, plus a generic pack that works on any car at all." },
          { kind: "new", text: "Guided mode for first-time buyers and professional mode for inspectors, with your firm, logo and contact details on the report." },
          { kind: "new", text: "Eight zones walked in the order you physically move around the car." },
          { kind: "new", text: "Instrument readings compared against the car's own median, the placard figure, or the band true of every car." },
          { kind: "new", text: "Evidence photographs filed against their check, with before/after pairs on a return visit." },
          { kind: "new", text: "On-device text recognition for VINs, odometers and tyre date codes." },
          { kind: "new", text: "Commitment tracking, so what the dealer promised has a name and a date against it." },
          { kind: "new", text: "Delivery deadlines counted down — temporary registration, RC, first service, battery warranty and own-damage cover." },
          { kind: "new", text: "PDF reports with a quotable reference, and full backup and restore." },
        ],
      },
    ],
  },

  /* ── InvoiceKaro ─────────────────────────────────────────────
     Copy verified line by line against the app's own source, via
     store/web/website-brief.md in the InvoiceKaro repo. Nothing here
     describes behaviour the binary does not have: cloud backup, sync,
     multi-user and e-invoicing appear only as paid features that
     cannot currently be bought, which is the framing the brief fixes.

     The app is not on Play yet, so there is no playUrl, no install
     count and no rating — see the `release` comment on AppMeta.      */
  {
    slug: "invoicekaro",
    name: "InvoiceKaro",
    tagline: "GST invoicing that never leaves your phone.",
    blurb:
      "An offline-first billing app for Indian shopkeepers, freelancers and small businesses. Your customers, your prices, your invoices and your books live in a database on your phone — there is no sign-up, no subscription to start, and no server anywhere holding your business.",
    color: "#bbf7d0",
    glow: "#4ade80",
    glow2: "#14b8a6",
    role: "Android · Flutter",
    status: "live",
    release: {
      version: "1.0.0",
      updated: "2026-09-01",
      size: "~93 MB installed",
      minAndroid: "Android 7.0+",
      stores: ["Google Play"],
      playUrl: "https://play.google.com/store/apps/details?id=click.nishant.invoice",
    },
    hero: {
      headline: "GST invoicing that works without the internet.",
      sub: "Make a professional GST invoice in about a minute, send it on WhatsApp, and know exactly who still owes you money. Built for Indian shopkeepers, freelancers and small businesses — not for accountants.",
      points: ["No account, ever", "No internet permission", "English, हिंदी, मराठी"],
    },
    stats: [
      { value: "0", label: "Servers holding your data" },
      { value: "₹0", label: "To invoice, forever" },
      { value: "3", label: "Languages, app and invoice" },
      { value: "9", label: "Document types" },
    ],
    closer: "Billing that is just as fast in a basement shop, on a train, or on a phone with no data left.",
    screens: [
      { file: "home.webp",                              caption: "Home" },
      { file: "quick-bill-6a95ebe8cf087.webp",          caption: "Quick bill" },
      { file: "new-invoice-6a95ebe751985.webp",         caption: "New invoice" },
      { file: "sku-search-6a95ebfd83ed5.webp",          caption: "Pick what you sold" },
      { file: "invoice-preview-6a95ebe19e63f.webp",     caption: "Invoice and share" },
      { file: "invoices.webp",                          caption: "Every invoice, by status" },
      { file: "money-owned-6a95ebe60b83c.webp",         caption: "Money owed" },
      { file: "reminder-6a95ebed183d8.webp",            caption: "Payment reminders" },
      { file: "items-6a95ebe48c9b0.webp",               caption: "Your catalogue" },
      { file: "day-book-6a95ebde3f1fd.webp",            caption: "Day book" },
      { file: "reports-numerals-6a95ebf96ad7e.webp",    caption: "Reports" },
    ],
    features: [
      {
        title: "Quick bill",
        body: "A counter-shop grid for billing at speed when someone is standing in front of you. The second invoice to the same customer takes seconds — everything is remembered.",
        shot: "quick-bill-6a95ebe8cf087.webp", featured: true,
      },
      {
        title: "GST, done properly",
        body: "CGST, SGST, IGST and UTGST worked out from the place of supply, using the GST state code on the GSTIN. HSN and SAC codes, rate-wise tax break-up, amount in words and reverse charge. GSTIN validation catches a typo before the invoice goes out.",
        shot: "add-item-6a95ebda27411.webp", featured: true,
      },
      {
        title: "Money owed",
        body: "Who is late, and by how many days. Record part payments and see the balance on every invoice, then send a WhatsApp reminder in your own wording — from your number, edited by you before it goes.",
        shot: "money-owned-6a95ebe60b83c.webp", featured: true,
      },
      {
        title: "Nine document types",
        body: "GST invoices, proforma invoices, quotes, estimates, credit and debit notes, delivery challans, payment receipts and purchase bills. Quotes convert to invoices without retyping anything.",
        shot: "settings-6a95ebfb86211.webp",
      },
      {
        title: "A UPI QR on the invoice",
        body: "Drawn on your phone from your own UPI id, with your bank details beside it for customers who would rather transfer. InvoiceKaro is not part of the payment and never sees it.",
        shot: "invoice-preview-6a95ebe19e63f.webp",
      },
      {
        title: "Barcode scanning, offline",
        body: "Uses a recogniser bundled inside the app rather than one downloaded on demand, so scanning a packet works with no network at all.",
        shot: "stock-management-6a95ebff243e9.webp",
      },
      {
        title: "Stock, only if you sell goods",
        body: "Stock levels, batches, storage locations and low-stock warnings — off by default, because plenty of businesses do not sell goods. Turn it on per item and every sale and purchase adjusts the count.",
        shot: "items-6a95ebe48c9b0.webp",
      },
      {
        title: "Expenses and purchases",
        body: "Expenses with input tax credit tracked, and purchase bills sitting beside what customers owe you — so what you are owed and what you owe are one screen apart.",
        shot: "expense-tracker-6a95ebdf070d7.webp",
      },
      {
        title: "Customers, remembered",
        body: "Customers and suppliers with GSTIN, billing and shipping addresses, credit terms and per-customer prices. Import one from your phone's contacts in a tap; the GSTIN decides the tax treatment from then on.",
        shot: "add-customer-6a95ebd9ea208.webp",
      },
      {
        title: "Repeating invoices",
        body: "The customers you bill every month raise themselves. The same invoice goes out on schedule, with the next number in your series.",
        shot: "repeat-invoice-6a95ebf03624e.webp",
      },
      {
        title: "Reminders in your words",
        body: "Reminder wording is yours to write, with the customer, invoice number, amount and due date filled in for you. WhatsApp opens with it ready — you read it, then send it.",
        shot: "customize-reminder-wording-6a95ebdb9da7a.webp",
      },
      {
        title: "Reports your accountant will take",
        body: "Day book, receivables ageing, profit, best customers and best-selling items, month by month. GSTR-1 and GSTR-3B summaries, plus CSV exports.",
        shot: "reports-by-hsn-6a95ebf2e8dfd.webp",
      },
      {
        title: "English, हिंदी and मराठी",
        body: "The whole app, including the printed invoice. Devanagari fonts are bundled, so a name in Hindi prints correctly even offline. Light and dark themes, and adjustable text size for reading a phone at arm's length in a shop.",
        shot: "invoice-preview-6a95ebe19e63f.webp",
      },
    ],
    stack: [
      { group: "App", items: ["Flutter 3.44", "Dart 3.12", "Riverpod 3", "go_router", "Material 3"] },
      { group: "Data", items: ["SQLite via Drift", "Scaled integers + decimal", "Versioned migrations (v7)", "Gzipped .ikbak backup"] },
      { group: "Documents", items: ["pdf + printing", "Noto Sans Devanagari", "UPI QR via barcode", "mobile_scanner, bundled model"] },
      { group: "Localisation", items: ["flutter_localizations", "ARB + intl", "Lakh / crore formatting"] },
      { group: "Deliberately absent", items: ["No backend", "No auth service", "No analytics SDK", "No crash reporter", "No ad library"] },
    ],
    steps: [
      { title: "Set up your business — once.", body: "Name, address, GSTIN if you have one, logo, bank details and UPI id. Two minutes, and it never has to be done again." },
      { title: "Add a customer, or import one.", body: "Type the details, or pull a name and number straight from your contacts. The GSTIN decides the tax treatment from then on." },
      { title: "Raise the bill.", body: "Pick the customer, pick what you sold — scan a barcode, search, or tap it out on the quick-bill grid. Tax, totals and the amount in words are worked out as you go." },
      { title: "Send it.", body: "WhatsApp, email, SMS, print, or the share sheet. The PDF goes to the customer you already selected, with a UPI QR code on it." },
      { title: "Get paid, and chase what you are owed.", body: "Record payments as they land. The money-owed screen shows who is late, and a reminder goes out on WhatsApp in one tap." },
    ],
    faqs: [
      { q: "Does it work without the internet?", a: "Entirely. It has no internet permission, so it has never depended on one." },
      { q: "Where is my data?", a: "In private storage on your phone, and nowhere else. Take a backup before you change phones." },
      { q: "Can I use it if I am not GST registered?", a: "Yes. Turn registration off and every tax field disappears. You are never offered a rate you are not allowed to charge." },
      { q: "Can I use it for more than one business?", a: "That is a paid feature, and purchases are not live yet in version 1.0." },
      { q: "What happens if I lose my phone?", a: "Whatever is in your last backup is what you keep. Take one regularly and save it somewhere you control — the app reminds you if it has been a while." },
      { q: "Is there a desktop or web version?", a: "No. It is an Android app. The codebase is cross-platform, so iOS is possible later, but it is not released." },
    ],
    troubleshooting: [
      { q: "My data disappeared, or I changed phones.", a: "InvoiceKaro stores everything on your phone and nowhere else. If you have a backup file, More → Backup & restore will bring it all back. If you do not, the records are gone — there is no copy, because the app never sends one." },
      { q: "Take a backup now if you have not.", a: "More → Backup & restore → Create backup, then save the file somewhere off the phone. Do this before you change phones, factory reset, or uninstall." },
      { q: "The app is asking for my contacts or camera.", a: "Only when you tap Import from contacts or the barcode scan button. Decline either and everything still works — you type the details instead." },
      { q: "I am not registered for GST.", a: "Turn GST registration off in your business profile and every tax field disappears." },
      { q: "My invoice numbers are wrong.", a: "More → Numbering. Drafts do not take a number until you issue them, so a deleted draft never leaves a gap." },
      { q: "A paid feature is locked.", a: "Purchases are not available yet in version 1.0. Nothing can be bought, and nothing is charged." },
    ],
    support: {
      email: SUPPORT_EMAIL,
      cc: SUPPORT_CC,
      responseTime: "Within a few working days",
      address: "Independent developer, India",
      desks: [
        { label: "Feature requests", address: CONTACT.feedback },
        { label: "Your data or the privacy policy", address: CONTACT.privacy },
        { label: "Billing and refunds", address: CONTACT.billing },
      ],
    },
    overviewFooter: {
      contacts: [
        { label: "Help with the app", address: CONTACT.support },
        { label: "Anything else", address: CONTACT.hello },
      ],
      note: "Invoicing itself is free with no limits and no expiry. The paid features — more than one business, custom invoice templates and numbering, per-customer price lists, batch and multi-location stock, report export and automatic sending — are not on sale in version 1.0: tapping one explains this and charges nothing. Cloud backup is not built at all, and the app says so rather than pretending.",
    },
    seo: {
      overview: {
        title: "InvoiceKaro — Offline GST Invoicing for Indian Businesses",
        description: "Make a GST invoice in a minute, send it on WhatsApp, and see who still owes you. Works fully offline. No account, no server, no internet permission.",
      },
      privacy: {
        title: "Privacy Policy — InvoiceKaro",
        description: "InvoiceKaro collects nothing. The app has no account, no server and no internet permission, so your business data never leaves your phone.",
      },
      support: {
        title: "Support — InvoiceKaro",
        description: "Help with InvoiceKaro: backups, GST settings, sending invoices, and how to reach the developer.",
      },
      changelog: {
        title: "Changelog — InvoiceKaro",
        description: "Release notes for InvoiceKaro, newest first — what changed for the person raising the bill, version by version.",
      },
    },
    policy: {
      updated: "2026-08-31",
      applies: "InvoiceKaro for Android, version 1.0 and later",
      /* The hero prints `lede` as plain text, so it carries no markup —
         the document's own emphasised version of the same sentence is
         the second intro paragraph, where RichText can render it. */
      lede: "Your business data never leaves your phone. The app has no account, no server, and no internet permission. We could not read your invoices if we wanted to — there is nothing on our side to read.",
      intro: [
        {
          kind: "callout",
          title: "InvoiceKaro collects nothing.",
          text: [
            "Your business data never leaves your phone. The app has no account, no server, and no internet permission. We could not read your invoices if we wanted to — there is nothing on our side to read.",
          ],
        },
        { kind: "p", text: "InvoiceKaro is a GST invoicing app for Indian freelancers, shopkeepers and small businesses. This policy explains what the app does with your information." },
      ],
      sections: [
        {
          id: "who", label: "Who it is from", heading: "1. Who this policy is from",
          blocks: [
            { kind: "p", text: "InvoiceKaro is built and published by **Nishant Chorge**, an independent developer in India." },
            { kind: "p", text: "Write to us at:" },
            { kind: "ul", items: [
              "**Privacy questions and grievances** — privacy@nishant.click",
              "**Formal legal notices** — legal@nishant.click",
              "**Help using the app** — support@nishant.click",
            ] },
            { kind: "p", text: "A privacy grievance goes to privacy@nishant.click and reaches the developer directly; there is nobody else in the chain. We aim to answer within 7 working days." },
          ],
        },
        {
          id: "collect", label: "What we collect", heading: "2. What we collect",
          blocks: [
            { kind: "p", text: "**Nothing.**" },
            { kind: "ul", items: [
              "No sign-up, no login, no account.",
              "No analytics, crash reporting, advertising or tracking SDKs.",
              "No device identifiers, no location, no contact list upload.",
              "No servers of ours that the app talks to, because the app cannot talk to any server at all (see section 5).",
            ] },
            { kind: "p", text: "Because we collect no personal data, we are not a \"Data Fiduciary\" processing your personal data under India's Digital Personal Data Protection Act, 2023. You remain in sole control of the records you keep in the app." },
          ],
        },
        {
          id: "stores", label: "What it stores", heading: "3. What the app stores on your device",
          blocks: [
            { kind: "p", text: "Everything you enter is written to a private database inside the app's own storage, readable only by this app on this phone:" },
            { kind: "table",
              head: ["What", "What it holds", "Where"],
              rows: [
                ["Your business", "Name, address, GSTIN, PAN, phone, email, website, bank account details, UPI id, logo and signature image, invoice numbering series.", "On your phone"],
                ["Your customers and suppliers", "Names, phone numbers, email addresses, billing and shipping addresses, GSTINs, credit terms and agreed prices.", "On your phone"],
                ["Your catalogue", "Items and services, prices, HSN/SAC codes, tax rates, units, barcodes, stock levels, batches and storage locations.", "On your phone"],
                ["Your documents", "Invoices, proforma invoices, quotes, estimates, credit and debit notes, delivery challans, payment receipts and purchase bills, along with their line items and tax break-ups.", "On your phone"],
                ["Your money", "Payments received and made, expenses, and what is outstanding.", "On your phone"],
                ["Your automation", "Repeating invoice schedules and payment reminder wording.", "On your phone"],
                ["Your settings", "Language, theme, and which optional features you have switched on.", "On your phone"],
              ],
            },
            { kind: "p", text: "None of this is transmitted anywhere. It exists in one place: your phone." },
          ],
        },
        {
          id: "permissions", label: "Permissions", heading: "4. Permissions the app asks for",
          blocks: [
            { kind: "p", text: "InvoiceKaro asks for two permissions, both only at the moment you use the feature that needs them, never at launch. Declining either leaves the app fully usable." },
            { kind: "p", text: "**Contacts (`READ_CONTACTS`)** — requested when you tap *Import from contacts* on the customer form. It copies one contact's name, phone number, email address and company into a new customer record. The app reads only the contact you pick, never writes to your address book, and never uploads anything. Decline it and you type the customer's details instead." },
            { kind: "p", text: "**Camera (`CAMERA`)** — requested when you tap the scan button to read a barcode off a packet or label. The frame is decoded on your phone and matched against your own item list. No photograph is saved and no image is sent anywhere. Decline it and you can still search for or type the item. The app declares the camera as optional hardware, so it installs on phones without one." },
            { kind: "p", text: "**Notifications** — if you turn on the daily \"due today\" reminder, the app schedules one local notification each morning summarising what is due. It is generated on your phone by your phone. Nothing is sent to a customer and no push service is involved." },
          ],
        },
        {
          id: "enforced", label: "Enforced, not promised", heading: "5. Why \"no data collected\" is enforced, not promised",
          blocks: [
            { kind: "p", text: "The Android app ships with **no `INTERNET` permission**. Android will not let it open a network connection, so it is not technically capable of sending your data anywhere — to us or to anyone else." },
            { kind: "p", text: "This is deliberate down to the details. The barcode scanner uses a recognition model bundled inside the app rather than one downloaded on demand, and the network permissions that library would otherwise declare are stripped from the final app, specifically so this guarantee holds." },
            { kind: "p", text: "If a future version ever needs the network — an optional cloud backup, for example — it will be an opt-in feature, this policy will be updated before it ships, and the Play Store data safety section will change to match." },
          ],
        },
        {
          id: "leaves", label: "When it leaves", heading: "6. When information leaves your phone",
          blocks: [
            { kind: "p", text: "Only when you deliberately send it, and only to the app or person you choose:" },
            { kind: "ul", items: [
              "**Sending a document** hands the PDF to WhatsApp, your email app, your messaging app, a printer, or whatever you pick from the share sheet. What happens to it next is governed by that app's privacy policy, not this one.",
              "**A payment reminder** opens WhatsApp with a message you can read and edit before you press send. Nothing goes out on its own.",
              "**A backup or a CSV / GSTR export** writes a file and hands it to the app you choose — your files app, a cloud drive, email. Where it ends up is your decision.",
              "**A UPI QR code** on your invoice is drawn on your phone from the UPI id you entered. Scanning it starts a payment between your customer's bank and yours. InvoiceKaro is not part of that transaction and never sees it.",
            ] },
            { kind: "p", text: "We have no access to any of this and no copy of it." },
          ],
        },
        {
          id: "backups", label: "Backups are yours", heading: "7. Backups and exports are your responsibility",
          blocks: [
            { kind: "p", text: "A backup file (`.ikbak`) contains your whole business — customers, prices, invoices, bank details. It is compressed but **not encrypted or password protected**. Anyone who obtains the file can read it." },
            { kind: "p", text: "Keep backups somewhere you control, and treat one like you would treat your ledger book. The same applies to CSV exports and to any PDF you send." },
          ],
        },
        {
          id: "payments", label: "Payments", heading: "8. Payments and paid features",
          blocks: [
            { kind: "p", text: "InvoiceKaro is free to use for invoicing, with no limit on invoices, customers or items." },
            { kind: "p", text: "Some features are marked as paid and are **not currently available to buy** — tapping them explains this and charges nothing. If in-app purchases are introduced, payment will be handled by **Google Play Billing**. Google, not us, processes the payment; we never see or store your card, UPI or bank credentials. Google's own privacy policy governs that transaction." },
            { kind: "p", text: "If purchases do go live, anything to do with one — a charge you do not recognise, or a refund — goes to billing@nishant.click. Refunds for anything bought through Google Play are handled under Google Play's own refund policy." },
            { kind: "p", text: "There are no advertisements in the app." },
          ],
        },
        {
          id: "third-parties", label: "Third parties", heading: "9. Third parties",
          blocks: [
            { kind: "p", text: "The app contains no advertising networks, no analytics services and no third-party SDK that collects data. The open-source libraries it is built from run entirely on your device." },
            { kind: "p", text: "The app is distributed through **Google Play**. Google collects its own information about installs and any purchases, under [Google's Privacy Policy](https://policies.google.com/privacy). That is separate from this app and outside our control." },
            { kind: "p", text: "Links in the app to our website, or to WhatsApp, your email app or your bank's UPI app, take you to services with their own policies." },
          ],
        },
        {
          id: "children", label: "Children", heading: "10. Children",
          blocks: [
            { kind: "p", text: "InvoiceKaro is a business tool intended for adults running a business. It is not directed at children under 13, and it collects nothing from anyone." },
          ],
        },
        {
          id: "control", label: "Your control", heading: "11. Your control over your data",
          blocks: [
            { kind: "p", text: "Because your data is on your device, you do not need to ask us for it:" },
            { kind: "ul", items: [
              "**Read or correct it** — open the app; every record is editable.",
              "**Export it** — More → Backup & restore for a full backup, or Reports for CSV and GST exports.",
              "**Delete a record** — delete it in the app.",
              "**Delete everything** — uninstall the app, or clear its data from Android Settings → Apps → InvoiceKaro → Storage. This removes the database and everything in it permanently. Make a backup first if you want to keep your records, because there is no copy anywhere else and we cannot restore it for you.",
            ] },
          ],
        },
        {
          id: "security", label: "Security", heading: "12. Security",
          blocks: [
            { kind: "p", text: "Your data sits in app-private storage that other apps on the phone cannot read. The strongest protection for it is the phone itself: use a screen lock, keep Android updated, and be careful where you save backups." },
            { kind: "p", text: "We hold no copy of your data, so there is no server of ours that can be breached." },
          ],
        },
        {
          id: "changes", label: "Changes", heading: "13. Changes to this policy",
          blocks: [
            { kind: "p", text: "If this policy changes, the updated version will be published at this address with a new date at the top. Material changes — particularly anything that alters what leaves your device — will be called out in the app's release notes before the version that makes the change ships." },
          ],
        },
        {
          id: "contact", label: "Contact", heading: "14. Contact",
          blocks: [
            { kind: "table",
              head: ["What you are writing about", "Where to write"],
              rows: [
                ["A privacy question or grievance", "privacy@nishant.click"],
                ["A formal legal notice", "legal@nishant.click"],
                ["Help using the app, or a bug", "support@nishant.click"],
                ["Anything about a purchase", "billing@nishant.click"],
              ],
            },
            { kind: "p", text: "All of these reach the same person." },
          ],
        },
      ],
      footer: "InvoiceKaro · Independent developer · India",
    },
    changelog: [
      {
        version: "1.0.0", date: "2026-09-01", kind: "major",
        headline: "The first public version of InvoiceKaro.",
        changes: [
          { kind: "new", text: "GST invoices, quotes, estimates, proforma invoices, credit and debit notes, delivery challans, payment receipts and purchase bills." },
          { kind: "new", text: "CGST, SGST, IGST and UTGST worked out from the place of supply." },
          { kind: "new", text: "Quick bill, for billing across a counter at speed." },
          { kind: "new", text: "Send on WhatsApp, by email, by SMS, or to a printer." },
          { kind: "new", text: "UPI QR code and bank details on the invoice." },
          { kind: "new", text: "Money owed, payment recording, and WhatsApp reminders in your own words." },
          { kind: "new", text: "Customers, suppliers, items, HSN/SAC codes, barcodes and stock." },
          { kind: "new", text: "Expenses, purchases, day book, receivables ageing, GSTR-1 and GSTR-3B summaries, and CSV exports." },
          { kind: "new", text: "Repeating invoices." },
          { kind: "new", text: "Backup and restore to a file you keep." },
          { kind: "new", text: "English, हिंदी and मराठी, including the printed invoice." },
          { kind: "new", text: "Works fully offline. No account, no server, no internet permission." },
        ],
      },
    ],
  },

];

/** Slug → app, for route params. */
export const getApp = (slug?: string) => apps.find(a => a.slug === slug);

/** "2026-08-04" → "4 Aug 2026". Dates in the data are ISO for sorting. */
export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
