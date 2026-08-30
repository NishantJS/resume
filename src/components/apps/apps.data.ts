import { CONTACT } from "../../contact.data";

/* ── Play Store app catalogue ──────────────────────────────────
   One entry per shipped Android app. Everything the /apps routes
   render — landing, support, privacy, changelog — is driven from
   here so a new app is a single object, not five new files.

   NOTE: copy is placeholder / generic for now. Swap the strings,
   not the shape.                                                  */

export interface Feature {
  title: string;
  body: string;
  /** 1-based screenshot that illustrates this feature. */
  shot: number;
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

  /** Play Store listing facts, shown in the "On Google Play" band. */
  release: {
    version: string;
    updated: string;
    size: string;
    minAndroid: string;
    installs: string;
    rating: string;
    playUrl: string;
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

  /** Phone screenshots, resolved as /apps/<slug>/shot-<n>.webp for
      n = 1..screens. These are generated placeholders for now —
      drop real 9:19.5 exports over them, keeping the same names. */
  screens: number;
  /** One caption per screenshot, shown under the shot in the rail. */
  screenCaptions: string[];

  features: Feature[];
  /** What it's built on, grouped by what each piece is for — the
      /work pages' stack band, on the product side. */
  stack: { group: string; items: string[] }[];
  /** Numbered "how it works" steps on the app page. */
  steps: { title: string; body: string }[];
  faqs: Faq[];

  support: {
    email: string;
    /** Copied on every support mail. */
    cc: string;
    phone: string;
    hours: string;
    responseTime: string;
    address: string;
  };

  privacy: {
    effective: string;
    /** The policy hero's lead — one line on the app's data posture. */
    stance: string;
    collected: DataRow[];
    /** Third parties named in the "sharing" section. */
    processors: { name: string; role: string }[];
  };

  changelog: ChangelogEntry[];
}

/* ─────────────────────────────────────────────────────────────── */

/** Support desk. `email` is the address people write to; `cc` is the
    general inbox, kept in copy so nothing is missed while the desk
    address is new. Both live in `contact.data` with the other desks. */
const SUPPORT_EMAIL = CONTACT.support;
const SUPPORT_CC    = CONTACT.hello;

/** Boilerplate every policy repeats — merged into each app below. */
const commonProcessors = [
  { name: "Google Play Services", role: "App distribution, licensing and crash reporting" },
  { name: "Firebase Crashlytics", role: "Anonymised crash and stability diagnostics" },
  { name: "Google Analytics for Firebase", role: "Aggregated, non-identifying usage statistics" },
];

export const apps: AppMeta[] = [
  /* ── PDI Pro ─────────────────────────────────────────────── */
  {
    slug: "pdi-pro",
    name: "PDI Pro",
    tagline: "Pre-delivery inspections, done on the floor.",
    blurb:
      "A checklist-driven inspection app for delivery teams. Capture photos, flag defects and sign off a report before the unit leaves the yard — online or off.",
    color: "#c2e9fb",
    glow: "#5cc8f5",
    glow2: "#6366f1",
    role: "Android · Flutter",
    status: "live",
    release: {
      version: "2.4.0",
      updated: "2026-08-04",
      size: "18.6 MB",
      minAndroid: "Android 8.0+",
      installs: "10,000+",
      rating: "4.6",
      playUrl: "https://play.google.com/store/apps/details?id=click.nishant.pdipro",
    },
    hero: {
      headline: "Every unit checked. Every defect on record.",
      sub: "Run a full pre-delivery inspection from your phone — templated checklists, photo evidence, defect severity and a signed PDF report generated the moment you finish.",
      points: ["Works fully offline", "Photo + voice evidence", "Signed PDF in one tap"],
    },
    stats: [
      { value: "40+", label: "Checklist templates" },
      { value: "8 min", label: "Median inspection" },
      { value: "100%", label: "Offline capable" },
      { value: "4.6★", label: "Play Store rating" },
    ],
    closer: "Stop chasing paper checklists around the yard.",
    screens: 5,
    screenCaptions: ["Inspection queue", "Checklist", "Photo evidence", "Defect log", "Sign off"],
    features: [
      { title: "Templated checklists", body: "Build a checklist once, reuse it across every unit type. Sections, conditional items and mandatory fields are all configurable.", shot: 1, featured: true },
      { title: "Photo evidence", body: "Attach annotated photos to any line item. Draw on the image to circle the defect — the markup is baked into the report.", shot: 3, featured: true },
      { title: "Defect severity", body: "Flag findings as critical, major or cosmetic. Critical defects block sign-off until they're cleared or explicitly waived.", shot: 2 },
      { title: "Offline-first sync", body: "Inspections are stored on-device and sync when a connection returns. No signal in the basement yard is not a problem.", shot: 4 },
      { title: "On-glass signatures", body: "Capture the inspector's and the customer's signature directly on the screen, timestamped and embedded in the PDF.", shot: 1 },
      { title: "Report export", body: "Generate a branded PDF or CSV per inspection, or export a batch for the whole shift. Share by email, Drive or WhatsApp.", shot: 5, featured: true },
    ],
    stack: [
      { group: "App", items: ["Flutter", "Dart", "Riverpod", "Material 3"] },
      { group: "On device", items: ["Drift (SQLite)", "Background sync", "Camera capture", "Shared preferences"] },
      { group: "Sync & backend", items: ["REST", "Conflict-free sync"] },
      { group: "Output", items: ["PDF generation", "Signature capture"] },
    ],
    steps: [
      { title: "Pick a template", body: "Choose the checklist that matches the unit — or start from a blank one and save it as a template for next time." },
      { title: "Walk the unit", body: "Work down the list, tapping pass or fail. Add photos, notes or a voice memo to anything that needs context." },
      { title: "Sign and send", body: "Collect signatures, generate the PDF and share it. The record syncs to your team dashboard automatically." },
    ],
    faqs: [
      { q: "Does PDI Pro work without an internet connection?", a: "Yes. Every inspection is written to local storage first. Photos, notes and signatures are all captured offline, and the app syncs in the background the next time it sees a connection. Nothing is lost if you close the app mid-inspection." },
      { q: "Can I use my own checklist?", a: "You can. Build one in the template editor — sections, item types (pass/fail, numeric, text, photo), conditional follow-ups and mandatory flags are all supported. Templates can also be imported from a CSV." },
      { q: "Who can see the inspection reports?", a: "Reports live on your device until you share them. If you turn on team sync, they also reach your organisation's dashboard, visible to the members you grant access to." },
      { q: "How do I move my data to another phone?", a: "Sign in with the same account on the new device and your synced inspections download automatically. If you never turned on sync, use Settings → Export backup to produce an archive you can restore on the new device." },
      { q: "What happens to my data if I cancel?", a: "Your reports stay available for 90 days in read-only mode, so you can export everything. After that the account and its data are permanently deleted." },
      { q: "Is there a tablet layout?", a: "Yes — on screens 7 inches and larger the checklist and the evidence panel show side by side, which is noticeably faster for long inspections." },
    ],
    support: {
      email: SUPPORT_EMAIL,
      cc: SUPPORT_CC,
      phone: "+91 62839 25737",
      hours: "Mon–Fri, 10:00–19:00 IST",
      responseTime: "Within 24 business hours",
      address: "Pune, Maharashtra, India",
    },
    privacy: {
      effective: "2026-08-01",
      stance: "PDI Pro stores your inspections on your device by default. Nothing leaves the phone until you sign in and turn on sync, or explicitly share a report.",
      collected: [
        { data: "Account details (name, email)", why: "To create your account, sync inspections and provide support", kept: "Until you delete your account" },
        { data: "Inspection content (checklists, photos, notes, signatures)", why: "To produce your reports and sync them across your devices", kept: "Until you delete it, or 90 days after account closure" },
        { data: "Device and app diagnostics", why: "To diagnose crashes and improve stability", kept: "90 days" },
        { data: "Approximate location (optional)", why: "To stamp the inspection site on a report — only if you grant the permission", kept: "With the inspection record" },
      ],
      processors: commonProcessors,
    },
    changelog: [
      {
        version: "2.4.0", date: "2026-08-04", kind: "minor",
        headline: "Batch export and a faster photo pipeline.",
        changes: [
          { kind: "new", text: "Export every inspection from a shift as a single zipped PDF bundle." },
          { kind: "new", text: "Voice memos can now be attached to any checklist item." },
          { kind: "improved", text: "Photo compression is roughly 3× faster and produces smaller files at the same quality." },
          { kind: "fixed", text: "Signatures occasionally rendered blank in the PDF on Android 14." },
        ],
      },
      {
        version: "2.3.1", date: "2026-06-19", kind: "patch",
        headline: "Sync reliability fixes.",
        changes: [
          { kind: "fixed", text: "Inspections created offline could sync twice on a flaky connection." },
          { kind: "fixed", text: "The template editor lost unsaved conditional rules when rotating the device." },
          { kind: "improved", text: "Clearer error message when a sync fails because storage is full." },
        ],
      },
      {
        version: "2.3.0", date: "2026-05-02", kind: "minor",
        headline: "Conditional checklist items.",
        changes: [
          { kind: "new", text: "Checklist items can now reveal follow-up questions based on the answer." },
          { kind: "new", text: "Defect severity levels: critical, major and cosmetic." },
          { kind: "improved", text: "Tablet layout puts the checklist and evidence panel side by side." },
        ],
      },
      {
        version: "2.0.0", date: "2026-02-11", kind: "major",
        headline: "Rebuilt around offline-first sync.",
        changes: [
          { kind: "new", text: "Full offline mode — inspections are captured and stored locally, then synced." },
          { kind: "new", text: "Shared team dashboard for reviewing inspections across a crew." },
          { kind: "improved", text: "Complete visual refresh with a larger, glove-friendly tap target grid." },
          { kind: "fixed", text: "Long inspections no longer slow down after 100+ line items." },
        ],
      },
      {
        version: "1.0.0", date: "2025-09-15", kind: "major",
        headline: "First public release.",
        changes: [
          { kind: "new", text: "Checklist templates, photo evidence and PDF report export." },
        ],
      },
    ],
  },

  /* ── InvoiceKaro ─────────────────────────────────────────── */
  {
    slug: "invoicekaro",
    name: "InvoiceKaro",
    tagline: "GST invoices in under a minute.",
    blurb:
      "Billing for Indian freelancers and small businesses. Make a compliant GST invoice, send it on WhatsApp, and watch the payment land — without opening a spreadsheet.",
    color: "#bbf7d0",
    glow: "#4ade80",
    glow2: "#14b8a6",
    role: "Android · Flutter",
    status: "live",
    release: {
      version: "3.1.2",
      updated: "2026-08-12",
      size: "22.1 MB",
      minAndroid: "Android 9.0+",
      installs: "50,000+",
      rating: "4.7",
      playUrl: "https://play.google.com/store/apps/details?id=click.nishant.invoicekaro",
    },
    hero: {
      headline: "Bill your client before they leave the call.",
      sub: "Pick a client, add line items, hit send. InvoiceKaro handles CGST/SGST/IGST splits, invoice numbering and payment reminders so you can get back to the actual work.",
      points: ["GST-compliant templates", "Share on WhatsApp", "Automatic reminders"],
    },
    stats: [
      { value: "58 sec", label: "Median time to invoice" },
      { value: "12", label: "Invoice templates" },
      { value: "₹0", label: "Per-invoice fee" },
      { value: "4.7★", label: "Play Store rating" },
    ],
    closer: "Your next invoice can be out the door in a minute.",
    screens: 5,
    screenCaptions: ["Dashboard", "Client book", "Line items", "Tax summary", "Share"],
    features: [
      { title: "GST done right", body: "CGST, SGST, IGST and cess are computed from the place of supply. HSN/SAC codes, reverse charge and composition schemes are all handled.", shot: 4, featured: true },
      { title: "Twelve templates", body: "Pick a layout, drop in your logo and signature, set your brand colour. Every template renders identically as a PDF.", shot: 3 },
      { title: "Client book", body: "Save clients with their GSTIN, billing address and payment terms. The next invoice for them is three taps.", shot: 2, featured: true },
      { title: "Recurring invoices", body: "Set a retainer to bill monthly and InvoiceKaro raises and sends it on schedule, with the right invoice number.", shot: 5 },
      { title: "Payment reminders", body: "Polite nudges go out on day 3, 7 and 15 past due. Mark an invoice paid and the reminders stop immediately.", shot: 4 },
      { title: "Reports for filing", body: "Export a GSTR-1 ready summary, a receivables ageing report or a plain CSV your accountant will not complain about.", shot: 1, featured: true },
    ],
    stack: [
      { group: "App", items: ["Flutter", "Dart", "Riverpod"] },
      { group: "On device", items: ["Drift (SQLite)", "Shared preferences"] },
      { group: "Documents", items: ["PDF generation", "GST tax engine", "Share intents"] },
      { group: "Store", items: ["Google Play Billing", "Firebase Crashlytics"] },
    ],
    steps: [
      { title: "Set up once", body: "Add your business name, GSTIN, logo and bank details. This becomes the header of every invoice you send." },
      { title: "Raise the invoice", body: "Choose a saved client, add line items from your catalogue, and the tax splits fill themselves in." },
      { title: "Send and track", body: "Share as a PDF or a WhatsApp link. The dashboard shows what's paid, what's due and what's overdue." },
    ],
    faqs: [
      { q: "Are the invoices actually GST compliant?", a: "Yes. Every template carries the fields the GST rules require — your GSTIN and the client's, place of supply, HSN/SAC per line item, the tax breakup and the invoice number series. Tax splits follow the place of supply automatically." },
      { q: "Can I bill clients outside India?", a: "You can. Set the client's country and the invoice switches to an export format with a zero-rated or LUT declaration and your chosen currency." },
      { q: "Does it connect to my bank?", a: "Not directly. You mark invoices as paid yourself, or paste a UPI/payment link into the invoice so the client can pay from the PDF. Bank reconciliation is on the roadmap." },
      { q: "What happens to my invoices if I stop paying?", a: "Nothing is deleted. Every existing invoice stays viewable and exportable, and you keep raising new ones within the free monthly allowance." },
      { q: "Can my accountant get access?", a: "Yes — add them as a read-only user and they can see and export everything without being able to edit or send invoices." },
      { q: "Is my financial data stored on your servers?", a: "Only if you turn on backup. By default invoices live in an encrypted database on your device. Backup encrypts the archive before it's uploaded, and you hold the passphrase." },
    ],
    support: {
      email: SUPPORT_EMAIL,
      cc: SUPPORT_CC,
      phone: "+91 62839 25737",
      hours: "Mon–Sat, 10:00–19:00 IST",
      responseTime: "Within 24 business hours",
      address: "Pune, Maharashtra, India",
    },
    privacy: {
      effective: "2026-08-01",
      stance: "Your invoices and client records are stored in an encrypted database on your device. Cloud backup is opt-in, and the archive is encrypted before it ever leaves the phone.",
      collected: [
        { data: "Business profile (name, GSTIN, address, logo)", why: "To render the header of the invoices you create", kept: "Until you delete your account" },
        { data: "Client and invoice records", why: "To create, store and share your invoices and reports", kept: "Until you delete them" },
        { data: "Account email", why: "To sign you in, restore backups and provide support", kept: "Until you delete your account" },
        { data: "Purchase and subscription state", why: "To honour in-app purchases, via Google Play Billing", kept: "As long as the subscription is active, plus statutory retention" },
        { data: "Device and app diagnostics", why: "To diagnose crashes and improve stability", kept: "90 days" },
      ],
      processors: [
        ...commonProcessors,
        { name: "Google Play Billing", role: "Subscription purchase and renewal handling" },
      ],
    },
    changelog: [
      {
        version: "3.1.2", date: "2026-08-12", kind: "patch",
        headline: "Rounding and reminder fixes.",
        changes: [
          { kind: "fixed", text: "Line-item discounts rounded to the wrong paisa on some IGST invoices." },
          { kind: "fixed", text: "Payment reminders continued for an invoice marked paid from the widget." },
          { kind: "improved", text: "WhatsApp share now attaches the PDF directly instead of a link on Android 13+." },
        ],
      },
      {
        version: "3.1.0", date: "2026-07-08", kind: "minor",
        headline: "Recurring invoices.",
        changes: [
          { kind: "new", text: "Retainers can be billed automatically on a monthly or quarterly schedule." },
          { kind: "new", text: "Four new invoice templates, including a minimal single-page layout." },
          { kind: "improved", text: "The client picker now searches by GSTIN as well as by name." },
        ],
      },
      {
        version: "3.0.0", date: "2026-04-21", kind: "major",
        headline: "New dashboard and GSTR-1 export.",
        changes: [
          { kind: "new", text: "A receivables dashboard showing paid, due and overdue at a glance." },
          { kind: "new", text: "GSTR-1 ready summary export for your filing." },
          { kind: "improved", text: "Invoice creation rebuilt — median time to send is down to under a minute." },
          { kind: "fixed", text: "Export invoices to a foreign currency without the GST block appearing." },
        ],
      },
      {
        version: "2.2.0", date: "2026-01-09", kind: "minor",
        headline: "Client book and catalogue.",
        changes: [
          { kind: "new", text: "Save clients and reusable line items for faster billing." },
          { kind: "improved", text: "Invoice numbering supports custom prefixes and financial-year resets." },
        ],
      },
      {
        version: "1.0.0", date: "2025-06-30", kind: "major",
        headline: "First public release.",
        changes: [
          { kind: "new", text: "GST invoice creation, PDF export and WhatsApp sharing." },
        ],
      },
    ],
  },

  /* ── Vault ───────────────────────────────────────────────── */
  {
    slug: "vault",
    name: "Vault",
    tagline: "Your secrets, encrypted on your device.",
    blurb:
      "An offline password and document vault. Everything is encrypted with a key derived from your master password — a key that never leaves the phone and that we could not read if we wanted to.",
    color: "#ddd6fe",
    glow: "#a78bfa",
    glow2: "#f472b6",
    role: "Android · Flutter",
    status: "live",
    release: {
      version: "1.8.0",
      updated: "2026-07-27",
      size: "14.3 MB",
      minAndroid: "Android 9.0+",
      installs: "25,000+",
      rating: "4.8",
      playUrl: "https://play.google.com/store/apps/details?id=click.nishant.vault",
    },
    hero: {
      headline: "Zero-knowledge, and we mean it literally.",
      sub: "Passwords, cards, notes and documents sealed behind AES-256 with an Argon2-derived key. No account required, no telemetry on your entries, and no server that can decrypt them.",
      points: ["AES-256 + Argon2id", "No account needed", "Biometric unlock"],
    },
    stats: [
      { value: "AES-256", label: "Entry encryption" },
      { value: "0", label: "Servers that can read it" },
      { value: "14 MB", label: "Install size" },
      { value: "4.8★", label: "Play Store rating" },
    ],
    closer: "Take your passwords off other people's servers.",
    screens: 5,
    screenCaptions: ["All items", "Passwords", "Generator", "Secure notes", "Settings"],
    features: [
      { title: "Zero-knowledge by design", body: "Your master password derives the key with Argon2id, on-device. It is never transmitted, never stored, and never recoverable by us.", shot: 1, featured: true },
      { title: "Biometric unlock", body: "Open the vault with a fingerprint or face after the first unlock of a session. The key stays in hardware-backed storage.", shot: 2 },
      { title: "Password generator", body: "Generate passphrases or random strings with per-site rules, and get warned when an entry reuses a password you already have.", shot: 3, featured: true },
      { title: "More than passwords", body: "Store cards, identity documents, licence keys, secure notes and file attachments in the same encrypted store.", shot: 4, featured: true },
      { title: "Encrypted export", body: "Back up to an encrypted archive you control. Move it to any drive, restore on any device, no cloud in the middle.", shot: 5 },
      { title: "Panic controls", body: "Auto-lock on a timer, block screenshots, hide entry previews from the recents screen, and wipe after N failed attempts.", shot: 1 },
    ],
    stack: [
      { group: "App", items: ["Flutter", "Dart", "Riverpod"] },
      { group: "Cryptography", items: ["AES-256-GCM", "Argon2id", "Android Keystore"] },
      { group: "On device", items: ["SQLCipher", "Autofill Service", "Biometric unlock"] },
      { group: "Backup", items: ["Encrypted archive", "Local-only export"] },
    ],
    steps: [
      { title: "Set a master password", body: "Pick one strong password. It is the only thing that unlocks the vault — and the only thing that cannot be reset." },
      { title: "Add your entries", body: "Import from a CSV or your browser's export, or add entries as you go. Autofill picks them up across apps." },
      { title: "Back it up", body: "Create an encrypted archive and keep it somewhere you trust. That archive is your recovery path." },
    ],
    faqs: [
      { q: "What happens if I forget my master password?", a: "The vault cannot be opened. This is the direct consequence of zero-knowledge encryption — the key is derived from your master password on your device, and no copy of it exists anywhere else. Keep an encrypted backup and store your master password somewhere safe." },
      { q: "Is Vault usable without an account?", a: "Entirely. The app never asks you to sign up. An account only exists so sync can move your encrypted blob between devices — and even then, the server only ever sees ciphertext." },
      { q: "How is sync end-to-end encrypted?", a: "Entries are encrypted on the device before upload, with the key derived from your master password. The sync server stores and relays opaque blobs. It has no key, so a breach of our infrastructure exposes nothing readable." },
      { q: "Can I import from another password manager?", a: "Yes — CSV exports from Chrome, Firefox, Bitwarden, 1Password and LastPass are supported. The import runs entirely on-device and the source file is shredded afterwards if you ask it to." },
      { q: "Does Vault collect analytics?", a: "Only anonymous crash reports and coarse app-open counts, and both can be turned off in Settings → Privacy. Nothing about your entries — not titles, not counts, not domains — is ever collected." },
      { q: "What is breach monitoring, and is it private?", a: "Vault checks your saved passwords against known breach corpora using k-anonymity: only the first five characters of a hash leave the device, so the service never learns which password was checked." },
    ],
    support: {
      email: SUPPORT_EMAIL,
      cc: SUPPORT_CC,
      phone: "+91 62839 25737",
      hours: "Mon–Fri, 10:00–19:00 IST",
      responseTime: "Within 24 business hours",
      address: "Pune, Maharashtra, India",
    },
    privacy: {
      effective: "2026-08-01",
      stance: "Vault is zero-knowledge. Your entries are encrypted on your device with a key derived from your master password, and that key never leaves it. We cannot read your vault, and neither can anyone who compromises our servers.",
      collected: [
        { data: "Vault contents (passwords, notes, cards, files)", why: "Never transmitted in readable form — encrypted on-device and, with sync on, relayed as ciphertext", kept: "On your device until you delete it" },
        { data: "Account email (sync only)", why: "To identify your sync account and provide support", kept: "Until you delete your account" },
        { data: "Encrypted sync blob (sync only)", why: "To move your vault between your devices — unreadable to us", kept: "Until you delete the account or disable sync" },
        { data: "Crash diagnostics (opt-out)", why: "To diagnose crashes; contains no vault data", kept: "90 days" },
      ],
      processors: [
        { name: "Google Play Services", role: "App distribution, licensing and billing" },
        { name: "Firebase Crashlytics", role: "Anonymised crash diagnostics — can be disabled in Settings" },
      ],
    },
    changelog: [
      {
        version: "1.8.0", date: "2026-07-27", kind: "minor",
        headline: "Breach monitoring and emergency access.",
        changes: [
          { kind: "new", text: "Breach monitoring using k-anonymity — no password or full hash leaves the device." },
          { kind: "new", text: "Nominate an emergency contact who can request access after a waiting period." },
          { kind: "improved", text: "Argon2id parameters tuned upward now that mid-range devices can take it." },
          { kind: "fixed", text: "Autofill occasionally missed fields in WebView-based apps." },
        ],
      },
      {
        version: "1.7.1", date: "2026-06-02", kind: "patch",
        headline: "Autofill and import fixes.",
        changes: [
          { kind: "fixed", text: "1Password CSV imports dropped the notes column." },
          { kind: "fixed", text: "Auto-lock did not trigger while a file attachment was open." },
          { kind: "improved", text: "Faster vault unlock on devices with slower storage." },
        ],
      },
      {
        version: "1.7.0", date: "2026-04-14", kind: "minor",
        headline: "File attachments.",
        changes: [
          { kind: "new", text: "Attach encrypted files — documents, keys, scans — to any entry." },
          { kind: "new", text: "Block screenshots and hide previews in the recents screen." },
          { kind: "improved", text: "The password generator now produces readable passphrases." },
        ],
      },
      {
        version: "1.5.0", date: "2026-01-23", kind: "minor",
        headline: "End-to-end encrypted sync.",
        changes: [
          { kind: "new", text: "Optional sync between your devices, with the server only ever holding ciphertext." },
          { kind: "improved", text: "Biometric unlock moved to hardware-backed key storage." },
        ],
      },
      {
        version: "1.0.0", date: "2025-08-08", kind: "major",
        headline: "First public release.",
        changes: [
          { kind: "new", text: "AES-256 encrypted local vault with biometric unlock and a password generator." },
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
