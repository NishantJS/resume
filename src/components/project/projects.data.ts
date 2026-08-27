/* ── Work catalogue ────────────────────────────────────────────
   One entry per shipped project. Everything /work and /work/:project
   render is driven from here, so adding a project is a single object
   rather than a new page.

   The detail fields (`meta` … `closer`) are all optional: a project
   page renders only the sections it has data for, so a thin entry
   still produces a coherent page.                                   */

export interface ProjectMeta {
  role: string;
  /** Absolute, e.g. "Sep 2025 – Jun 2026". Omitted for undated side work. */
  period?: string;
  /** Employer. For personal work, the word "Personal project". */
  company: string;
  /** Who the work was actually for, on a consultancy placement. */
  client?: string;
  /** "Client project" | "Product" | "Personal project" … */
  type: string;
  /** Where it lives now — "Live", "Internal", "Open source". */
  status?: string;
}

/** One numbered entry in the "What I built" list. */
export interface Highlight {
  title: string;
  body: string;
  /** Short tech tags shown under the body. */
  tags?: string[];
}

/** A step in the "How it works" flow. */
export interface FlowStep {
  title: string;
  body: string;
}

/** Problem → approach pair, rendered as an accordion row. */
export interface Challenge {
  problem: string;
  solution: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface ProjectData {
  title: string;
  displayTitle?: string;
  color: string;
  contribution: string;
  path: string;
  description: string;
  images: number;
  href?: string;
  skills: string[];

  /* ── Detail-page content (all optional) ────────────────────── */

  /** Saturated sibling of `color`, used for the closing heading's
      two-tone ignite reveal — the pastel would be invisible there. */
  accent?: string;
  accent2?: string;
  /** Role facts, shown as a band under the hero. */
  meta?: ProjectMeta;
  /** Long-form context: what it is, who it's for, what was broken. */
  overview?: string[];
  /** Big-number band under the overview. */
  stats?: { value: string; label: string }[];
  highlights?: Highlight[];
  flow?: FlowStep[];
  challenges?: Challenge[];
  /** Grouped stack — supersedes the flat `skills` list on the page. */
  stack?: StackGroup[];
  /** Full-bleed pull quote between sections. */
  statement?: string;
  /** One line above the closing link out. */
  closer?: string;
}

export const projects: ProjectData[] = [

  {
    title: "mStockReferEarn",
    displayTitle: "m.Stock Refer & Earn",
    color: "#fde68a",
    accent: "#d97706",
    accent2: "#b45309",
    contribution: "Backend & Frontend",
    path: "/work/mstock-refer-earn/",
    description:
      "Migrated the legacy .NET Refer & Earn platform to Next.js + Fastify with SSE-based real-time feeds via Redis Streams, L1/L2/L3 caching, circuit breakers, and idempotent APIs.",
    images: 0,
    href: "https://refer.mstock.com/",
    skills: ["Next.js", "Fastify", "Node.js", "TypeScript", "Redis Streams", "SSE", "Opossum", "L1/L2/L3 Caching", "ETag + Cache-Control", "MySQL"],

    meta: {
      role: "Backend & Frontend",
      period: "Sep 2025 – Jun 2026",
      company: "FinQuest Consulting Services",
      client: "Mirae Asset Capital Markets (m.Stock)",
      type: "Client project",
      status: "Live",
    },
    overview: [
      "Refer & Earn is m.Stock's customer referral programme — where an existing investor invites a friend, follows that invite through KYC and first trade, and collects the reward for it. It ran on a legacy .NET stack that polled for updates and strained whenever a campaign pushed traffic at it.",
      "I rebuilt it as a Next.js front end over a Fastify API. The referral feed became a live push instead of a five-second poll, reads moved behind three layers of cache with event-driven invalidation, and every reward endpoint was made idempotent so a retry can never pay twice.",
    ],
    stats: [
      { value: "5s → ~1s", label: "Referral feed latency" },
      { value: "3", label: "Cache tiers on the read path" },
      { value: ".NET → Node", label: "Platform migration" },
      { value: "Idempotent", label: "Reward & payout writes" },
    ],
    highlights: [
      {
        title: "A referral feed that pushes",
        body: "Referral events land on a Redis Stream and are pushed to the browser over SSE. A five-second poll that re-asked for unchanged data on every open tab became one long-lived connection per user, with status changes surfacing in about a second.",
        tags: ["SSE", "Redis Streams"],
      },
      {
        title: "Three-tier read path",
        body: "An in-process LRU (L1) fronts Redis (L2), which fronts MySQL (L3), with ETag and Cache-Control carrying the same freshness out to the browser. The dashboard's hot queries mostly never reach the database at all.",
        tags: ["Redis", "ETag + Cache-Control", "MySQL"],
      },
      {
        title: "Event-driven invalidation",
        body: "Writes publish invalidation events onto a stream every API instance consumes, so a reward credited on one node clears the stale copy on the rest instead of waiting out a TTL.",
        tags: ["Redis Streams", "Consumer groups"],
      },
      {
        title: "Money endpoints that survive a retry",
        body: "Reward and payout calls carry an idempotency key persisted alongside the result. A repeat — network blip, impatient tap, upstream retry — replays the original outcome rather than crediting a second time.",
        tags: ["Idempotency keys"],
      },
      {
        title: "Circuit breakers around the legacy edge",
        body: "Calls into the remaining .NET services and third-party dependencies run through Opossum breakers with cached fallbacks, so one slow upstream degrades a single panel instead of taking the page down.",
        tags: ["Opossum"],
      },
      {
        title: "A migration nobody had to schedule downtime for",
        body: "Surfaces moved across one at a time behind the same URLs, with the old platform continuing to serve whatever had not been ported yet — a strangler cutover rather than a big-bang release.",
        tags: ["Next.js", "Fastify"],
      },
    ],
    flow: [
      { title: "Request", body: "Next.js renders the dashboard shell; data calls hit Fastify carrying the ETag from the last response." },
      { title: "Cache ladder", body: "The in-process LRU answers first and Redis second — only a genuine miss reaches MySQL." },
      { title: "Write & publish", body: "A referral state change writes to MySQL and publishes an event onto a Redis Stream." },
      { title: "Invalidate & push", body: "Every instance consumes the stream: stale keys are dropped and the change is pushed to connected clients over SSE." },
    ],
    challenges: [
      {
        problem: "The feed was a five-second poll.",
        solution: "Every open tab kept re-asking for data that had not changed, and a campaign multiplied that by its whole audience. Replacing the poll with SSE over Redis Streams turned N requests per user per minute into one connection, and cut the perceived update delay to roughly a second.",
      },
      {
        problem: "Cached rewards could go stale across instances.",
        solution: "With TTL-only expiry, one node could still be serving a reward as pending after another had credited it. Moving invalidation onto the event stream made the drop simultaneous across every instance, so two users never see different states of the same referral.",
      },
      {
        problem: "A retried payout must not pay twice.",
        solution: "Reward writes take an idempotency key that is stored with the result of the first execution. A repeat of the same key returns that stored response instead of running the write again — which is what makes retries safe to do at all.",
      },
      {
        problem: "One slow dependency took the whole page with it.",
        solution: "Opossum breakers with per-dependency thresholds and cached fallbacks keep a failing upstream contained. The panel that needs it degrades; everything else on the page still renders.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "React", "TypeScript"] },
      { group: "Backend", items: ["Fastify", "Node.js", "TypeScript"] },
      { group: "Data & cache", items: ["MySQL", "Redis Streams", "L1/L2/L3 caching", "ETag + Cache-Control"] },
      { group: "Resilience", items: ["SSE", "Opossum", "Idempotent APIs"] },
    ],
    statement: "A referral you can watch clear in real time, on a stack that no longer flinches at a campaign.",
    closer: "See it running in production.",
  },

  {
    title: "AdvisoryBasket",
    displayTitle: "Advisory Basket",
    color: "#bbf7d0",
    accent: "#059669",
    accent2: "#047857",
    contribution: "Backend (Fastify + NestJS)",
    path: "/work/advisory-basket/",
    description:
      "Smallcase-style stock advisory backend with event-driven Redis Streams cache invalidation, circuit breakers, L1/L2/L3 caching, and high-concurrency API patterns.",
    images: 0,
    href: "https://www.mstock.com/advisory/",
    skills: ["Fastify", "NestJS", "Node.js", "TypeScript", "Redis Streams", "MySQL", "Opossum", "Microservices", "Event-Driven Cache Invalidation"],

    meta: {
      role: "Backend",
      period: "Sep 2025 – Jun 2026",
      company: "FinQuest Consulting Services",
      client: "Mirae Asset Capital Markets (m.Stock)",
      type: "Client project",
      status: "Live",
    },
    overview: [
      "Advisory Basket is m.Stock's answer to smallcase: research-backed baskets of stocks a customer can subscribe to, fund in one go, and rebalance when the advisory updates its weights.",
      "I worked the backend — the services behind baskets, subscriptions and portfolio state. The interesting problem there isn't the CRUD, it's the read path: market hours turn a handful of basket and price queries into the entire workload, all at once, for everyone.",
    ],
    stats: [
      { value: "3", label: "Cache tiers on the read path" },
      { value: "9:15–15:30", label: "The window that sets the load" },
      { value: "Event-driven", label: "Cache invalidation" },
      { value: "Breakered", label: "Every upstream call" },
    ],
    highlights: [
      {
        title: "Basket, subscription and portfolio services",
        body: "Fastify and NestJS services covering basket composition, subscription state, and a customer's holdings measured against the advisory's current weights — each owning its own data and talking over explicit contracts.",
        tags: ["Fastify", "NestJS", "Microservices"],
      },
      {
        title: "A read path built for market open",
        body: "The same basket and price reads spike hard the moment the market opens. An in-process cache fronts Redis, which fronts MySQL, so the spike that matters is absorbed in memory before the database ever sees it.",
        tags: ["L1/L2/L3 caching", "Redis", "MySQL"],
      },
      {
        title: "Rebalances that land everywhere at once",
        body: "A weight change publishes onto a Redis Stream; every instance consumes it and drops the affected keys together, so subscribers see the new basket at the same moment rather than drifting apart on independent TTLs.",
        tags: ["Redis Streams", "Consumer groups"],
      },
      {
        title: "Breakers on every hop",
        body: "Opossum wraps the calls into pricing and advisory upstreams with per-dependency thresholds and fallbacks, so a slow feed sheds load instead of queueing requests until the service runs out of sockets.",
        tags: ["Opossum"],
      },
    ],
    flow: [
      { title: "Advisory publishes", body: "A basket's weights change; the write lands in MySQL and an event goes onto the stream." },
      { title: "Fan-out", body: "Every service instance consumes the event and drops the cache keys it touches." },
      { title: "Refill", body: "The next read repopulates L1 and L2 from MySQL — once, not once per instance per request." },
      { title: "Serve", body: "Subscribers get consistent weights and holdings from a read path that mostly never reaches the database." },
    ],
    challenges: [
      {
        problem: "Everyone asks for the same basket at the same second.",
        solution: "Market open collapses the workload onto a few very hot keys. Tiering the cache — process memory, then Redis, then MySQL — meant the majority of that burst is answered in-process, and the database only ever sees the misses.",
      },
      {
        problem: "A rebalance must not be half-visible.",
        solution: "TTL expiry staggers across instances, which means two customers can briefly see different weights for the same basket. Publishing invalidation as an event made the drop simultaneous, so the new composition appears everywhere together.",
      },
      {
        problem: "A degraded price feed shouldn't be a degraded platform.",
        solution: "Circuit breakers with cached fallbacks let the affected view fail fast and render stale-but-labelled data, rather than every request queueing behind an upstream that has stopped answering.",
      },
    ],
    stack: [
      { group: "Backend", items: ["Fastify", "NestJS", "Node.js", "TypeScript"] },
      { group: "Data & cache", items: ["MySQL", "Redis Streams", "L1/L2/L3 caching"] },
      { group: "Architecture", items: ["Microservices", "Event-driven invalidation", "Opossum"] },
    ],
    statement: "Rebalances that land everywhere at once, on a read path that barely touches the database.",
    closer: "See Advisory Basket on m.Stock.",
  },

  {
    title: "Qollabb",
    color: "#eebcff",
    accent: "#9333ea",
    accent2: "#7c3aed",
    contribution: "Backend & Frontend",
    path: "/work/qollabb/",
    description:
      "Multi-role job portal (employer, mentor, student, educator) with real-time WebSocket chat, and a full employer dashboard built in React.",
    images: 16,
    href: "https://qollabb.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "Express.js", "Sequelize", "WebSockets", "JWT", "Passport.js", "AWS EC2 & S3", "Nginx", "TypeScript"],

    meta: {
      role: "Backend & Frontend",
      period: "Aug 2022 – Mar 2023",
      company: "Pinsout Innovation",
      type: "Client project",
      status: "Live",
    },
    overview: [
      "Qollabb connects students with employers through projects, internships and jobs — with mentors and educators alongside them. Four audiences, four different products, one platform underneath.",
      "I worked across the stack: the Express and Sequelize APIs behind all four roles, a WebSocket chat that lets an employer and a candidate talk without leaving the flow, and the React employer dashboard where postings, applicants and hiring stages actually get managed.",
    ],
    stats: [
      { value: "4", label: "User roles on one platform" },
      { value: "16", label: "Screens in the gallery" },
      { value: "Real-time", label: "Chat over WebSockets" },
      { value: "AWS", label: "EC2 + S3 behind Nginx" },
    ],
    highlights: [
      {
        title: "Four roles, one core",
        body: "Employer, student, mentor and educator each get their own navigation, permissions and data scope over a shared Express and Sequelize core — so a new surface inherits the rules instead of restating them.",
        tags: ["Express.js", "Sequelize", "PostgreSQL"],
      },
      {
        title: "Chat that stays with the work",
        body: "A WebSocket layer carries conversations between employers and candidates in-product. Messages are persisted before they're broadcast, so a refresh or a dropped connection resumes the thread rather than losing it.",
        tags: ["WebSockets", "PostgreSQL"],
      },
      {
        title: "The employer dashboard",
        body: "Postings, applicant pipelines and shortlisting, built in React against the same APIs — the surface an employer spends their whole day in, and the one that had to be fast.",
        tags: ["React.js", "TypeScript"],
      },
      {
        title: "Auth sized for four audiences",
        body: "Passport strategies issuing JWTs whose role claims are checked at the route layer, so a student's token can never reach an employer endpoint even if it finds the URL.",
        tags: ["JWT", "Passport.js"],
      },
      {
        title: "Deployed, not demoed",
        body: "EC2 behind Nginx, with resumes, logos and project attachments going straight to S3 — which keeps the app servers stateless and disposable.",
        tags: ["AWS EC2 & S3", "Nginx"],
      },
    ],
    flow: [
      { title: "Post", body: "An employer publishes a project, internship or job against their verified company profile." },
      { title: "Apply", body: "Students apply directly; educators and mentors can put forward candidates from their cohort." },
      { title: "Shortlist", body: "The employer dashboard moves applicants through hiring stages, with every view scoped by role." },
      { title: "Talk", body: "Chat opens over WebSockets between the two sides — no email thread, no leaving the platform." },
    ],
    challenges: [
      {
        problem: "Four roles in one codebase is where portals rot.",
        solution: "Permissions are resolved once at the route layer from the token's claims rather than re-checked ad hoc in handlers. Adding a surface means declaring who it belongs to, not copying a fan of checks into another controller.",
      },
      {
        problem: "Chat had to survive a refresh.",
        solution: "Messages are written to PostgreSQL before they are broadcast, and a reconnecting socket replays from the last acknowledged id — so the transcript is what the database says it is, not what a client still happens to hold in memory.",
      },
      {
        problem: "Uploads on an app server don't scale.",
        solution: "Resumes and attachments go directly to S3, with the API only ever issuing signed access. The EC2 instances stay stateless, which is what makes them safe to replace.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["React.js", "TypeScript"] },
      { group: "Backend", items: ["Node.js", "Express.js", "Sequelize", "WebSockets"] },
      { group: "Data", items: ["PostgreSQL"] },
      { group: "Auth", items: ["JWT", "Passport.js"] },
      { group: "Infrastructure", items: ["AWS EC2 & S3", "Nginx"] },
    ],
    statement: "One platform, four audiences, and a chat window that keeps the conversation where the work is.",
    closer: "Take a look at Qollabb.",
  },

  {
    title: "OneSociety",
    color: "#ffcab2",
    accent: "#ea580c",
    accent2: "#c2410c",
    contribution: "Monorepo & Micro-Frontend",
    path: "/work/onesociety/",
    description:
      "Society management platform on a Nx monorepo with micro-frontend architecture. Built a dynamic form & table library (RJSF + MUI DataGrid) and implemented RBAC across the platform.",
    images: 7,
    href: "https://society.cubeone.in",
    skills: ["Next.js", "React.js", "TypeScript", "Nx Monorepo", "Micro-Frontend", "RJSF", "MUI DataGrid", "RBAC", "Express.js"],

    meta: {
      role: "Monorepo & Micro-Frontend",
      period: "Apr 2023 – Aug 2025",
      company: "Futurescape Technology",
      type: "Client project",
      status: "Live",
    },
    overview: [
      "OneSociety is housing-society management — residents, billing, complaints, facilities, and the committee workflows layered on top of them. Every module wants forms and tables, and no two want quite the same ones.",
      "So rather than hand-build each screen, I built the system the modules render themselves from: JSON Schema through RJSF for input, MUI DataGrid for output, both packaged as shared libraries in an Nx monorepo where each module ships as its own micro-frontend.",
    ],
    stats: [
      { value: "1", label: "Form engine, every module" },
      { value: "7", label: "Screens in the gallery" },
      { value: "Nx", label: "Monorepo, affected-only builds" },
      { value: "RBAC", label: "Enforced UI and API side" },
    ],
    highlights: [
      {
        title: "A schema-driven form engine",
        body: "Modules describe a form as JSON Schema plus a UI schema, and RJSF renders it with the platform's own widgets and validation. A new workflow ships as configuration, not as another bespoke form component nobody else can reuse.",
        tags: ["RJSF", "JSON Schema"],
      },
      {
        title: "Tables as a library, not a page",
        body: "One DataGrid wrapper owns columns, server-side paging, filtering and row actions, so every module's list view behaves identically — and a fix to sorting is a fix everywhere at once.",
        tags: ["MUI DataGrid"],
      },
      {
        title: "An Nx monorepo that actually helps",
        body: "Shared libraries, enforced module boundaries and affected-only pipelines — the difference between a monorepo that speeds a team up and one that just makes CI slower for everyone.",
        tags: ["Nx", "TypeScript"],
      },
      {
        title: "Micro-frontend delivery",
        body: "Modules build and deploy independently and compose at runtime, so a billing release doesn't sit in a queue behind a complaints release.",
        tags: ["Micro-frontend", "Next.js"],
      },
      {
        title: "RBAC through the stack",
        body: "Roles resolve to a permission set once, and both the route guards and the rendered UI read from it — so there is no screen offering an action the API is going to refuse.",
        tags: ["RBAC", "Express.js"],
      },
    ],
    flow: [
      { title: "Describe", body: "A module declares its screen as a JSON Schema and a UI schema." },
      { title: "Render", body: "RJSF and the shared DataGrid wrapper turn that into a form or a list, using the platform's widgets." },
      { title: "Guard", body: "RBAC resolves the current role's permissions; anything out of scope is neither shown nor served." },
      { title: "Ship", body: "Nx rebuilds only what changed, and the module deploys on its own into the runtime shell." },
    ],
    challenges: [
      {
        problem: "Every module wanted its own forms.",
        solution: "Bespoke forms multiply until validation, layout and error handling have quietly drifted apart across the product. Moving to schema-driven rendering turned 'add a field' into a config change and kept behaviour identical everywhere by construction.",
      },
      {
        problem: "One repo, many teams, slow CI.",
        solution: "Nx project boundaries plus affected-only pipelines meant a change inside one module stopped triggering rebuilds of the others — and the boundaries themselves stopped accidental cross-imports before review had to catch them.",
      },
      {
        problem: "Permission checks drifted between UI and API.",
        solution: "Both now read the same resolved permission set. What the interface offers and what the backend allows can't disagree, because there is only one answer to ask.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "React.js", "TypeScript", "Material-UI"] },
      { group: "Systems", items: ["Nx Monorepo", "Micro-frontend"] },
      { group: "Building blocks", items: ["RJSF", "MUI DataGrid"] },
      { group: "Backend", items: ["Express.js", "RBAC"] },
    ],
    statement: "The modules don't build screens — they describe them, and the platform renders the rest.",
    closer: "See OneSociety in production.",
  },

  {
    title: "ConsultmyAstro",
    displayTitle: "Consult my Astro",
    color: "#EFE8D3",
    accent: "#a16207",
    accent2: "#854d0e",
    contribution: "Backend & Frontend",
    path: "/work/consultmyastro/",
    description:
      "Real-time chat and call platform for astrologers. Built the Socket.io chat module, payment & wallet system with refund support, and contributed extensively to the frontend.",
    images: 11,
    href: "https://consultmyastro.com",
    skills: ["Node.js", "Express.js", "Socket.io", "PostgreSQL", "Sequelize", "JWT", "Bcrypt", "React.js", "Payment & Wallet System"],

    meta: {
      role: "Backend & Frontend",
      period: "Aug 2022 – Mar 2023",
      company: "Pinsout Innovation",
      type: "Client project",
      status: "Live",
    },
    overview: [
      "Consult my Astro is a marketplace for astrology consultations: a customer picks an astrologer, funds a wallet, and starts a chat or a call — with the session and the money running against each other in real time.",
      "I built the Socket.io chat module and the money behind it — wallet balances, payment capture and refunds — and contributed heavily to the React frontend customers actually see.",
    ],
    stats: [
      { value: "11", label: "Screens in the gallery" },
      { value: "Socket.io", label: "Real-time transport" },
      { value: "Ledger", label: "Wallet, payments, refunds" },
      { value: "Live", label: "Astrologer availability" },
    ],
    highlights: [
      {
        title: "The chat module",
        body: "Socket.io rooms per consultation with presence and delivery state, and history persisted in PostgreSQL — so neither side loses the thread when a phone drops off the network mid-session.",
        tags: ["Socket.io", "PostgreSQL"],
      },
      {
        title: "A wallet that reconciles",
        body: "Top-ups, holds and debits are recorded as ledger entries rather than as edits to a single mutable number. That is the difference between a balance you can explain and one you can only assert.",
        tags: ["Payments", "Sequelize"],
      },
      {
        title: "Refunds that don't rewrite history",
        body: "A refund posts a reversing entry instead of editing the original, so the wallet and the payment provider's record can always be walked back to the same total when a session is disputed.",
        tags: ["Refunds", "PostgreSQL"],
      },
      {
        title: "Availability, pushed",
        body: "Astrologer online state and session status travel over the same socket layer as the chat, so the listing a customer is looking at reflects who can actually take a consultation right now.",
        tags: ["Socket.io"],
      },
      {
        title: "Frontend work",
        body: "A large share of the customer-facing React screens — listing, astrologer profile, live session and wallet — built against the APIs on the other side of the same desk.",
        tags: ["React.js"],
      },
    ],
    flow: [
      { title: "Top up", body: "The customer funds their wallet; the payment is captured and written to the ledger." },
      { title: "Connect", body: "An available astrologer is chosen and a Socket.io room opens for the session." },
      { title: "Consult", body: "Messages flow over the socket and are persisted as they go, with the session checked against the running balance." },
      { title: "Settle", body: "The session closes and the ledger is debited — and a disputed session can be reversed without editing what already happened." },
    ],
    challenges: [
      {
        problem: "A balance is not a number.",
        solution: "Storing a mutable balance makes every dispute unanswerable — you can see what it is, never how it got there. Recording top-ups, debits and refunds as ledger entries means the balance is derived, and any figure can be reconstructed from the entries behind it.",
      },
      {
        problem: "Connections drop mid-consultation.",
        solution: "Messages are persisted before broadcast and rooms are rejoinable, so a reconnect resumes the same session with its full transcript instead of opening a new one and billing for it.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["React.js"] },
      { group: "Backend", items: ["Node.js", "Express.js", "Socket.io"] },
      { group: "Data", items: ["PostgreSQL", "Sequelize"] },
      { group: "Auth & money", items: ["JWT", "Bcrypt", "Payment & wallet system"] },
    ],
    statement: "Real-time consultations, with the money behind them written as a ledger you can actually audit.",
    closer: "Visit Consult my Astro.",
  },

  {
    title: "OneDashboard",
    displayTitle: "One Dashboard",
    color: "#c2e9fb",
    accent: "#0284c7",
    accent2: "#0369a1",
    contribution: "Backend & Frontend",
    path: "/work/onedashboard/",
    description:
      "SSO dashboard unifying access to multiple apps via Next.js + Supabase + Keycloak with SAML auth, RBAC user permissions, and Kong Gateway for API routing.",
    skills: ["Next.js", "Supabase", "Keycloak", "Kong Gateway", "SAML", "RBAC", "Redis", "TypeScript", "Material-UI"],
    images: 5,

    meta: {
      role: "Backend & Frontend",
      period: "Apr 2023 – Aug 2025",
      company: "Futurescape Technology",
      type: "Client project",
      status: "Internal",
    },
    overview: [
      "One Dashboard is the front door to a suite of products: sign in once, see the apps you're entitled to, and move between them without meeting another login screen.",
      "I led the frontend and the identity plumbing behind it — Keycloak federating SAML from the corporate identity provider, Supabase holding application data, Kong routing the APIs, and an RBAC model deciding what a given user can even see.",
    ],
    stats: [
      { value: "1", label: "Sign-in for every app" },
      { value: "SAML", label: "Federated through Keycloak" },
      { value: "Kong", label: "Gateway in front of the APIs" },
      { value: "RBAC", label: "Entitlements per user" },
    ],
    highlights: [
      {
        title: "Single sign-on with Keycloak",
        body: "SAML federation against the corporate identity provider, with Keycloak issuing the tokens every downstream app trusts. One login, one session, and no per-application credentials to rotate or forget.",
        tags: ["Keycloak", "SAML"],
      },
      {
        title: "An entitlement-driven launcher",
        body: "The dashboard renders only the apps a user's roles entitle them to — and the same permission set is what the gateway enforces on the way through, so the launcher is a view of the rules rather than a second copy of them.",
        tags: ["RBAC", "Next.js"],
      },
      {
        title: "Kong as the front door",
        body: "Routing, auth enforcement and rate limiting live at the gateway, which means individual services aren't each re-implementing the same three concerns slightly differently.",
        tags: ["Kong Gateway"],
      },
      {
        title: "Supabase for application data",
        body: "Row-level policies keep entitlement checks next to the data instead of scattered across handlers, so a missed check in one code path can't quietly widen access.",
        tags: ["Supabase", "Postgres"],
      },
      {
        title: "Sessions that survive the hop",
        body: "Redis-backed session state, so a refresh — or moving between two apps in the suite — doesn't bounce the user back out to the identity provider.",
        tags: ["Redis"],
      },
    ],
    flow: [
      { title: "Authenticate", body: "The user reaches the dashboard; Keycloak federates the SAML assertion from the corporate IdP." },
      { title: "Resolve", body: "Roles resolve into an entitlement set — which applications, and which actions inside them." },
      { title: "Route", body: "Calls travel through Kong, which enforces those claims before anything reaches a service." },
      { title: "Launch", body: "The launcher shows only entitled apps and hands the live session across when one is opened." },
    ],
    challenges: [
      {
        problem: "Every app had its own login.",
        solution: "Federating through Keycloak collapsed them into a single session, and made deprovisioning one action at the identity provider instead of an audit across every application in the suite.",
      },
      {
        problem: "Entitlements were being enforced in too many places.",
        solution: "One resolved permission set, read by both the launcher UI and the gateway. What is shown and what is allowed cannot drift apart, because they are the same answer read twice.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "TypeScript", "Material-UI"] },
      { group: "Identity", items: ["Keycloak", "SAML", "RBAC"] },
      { group: "Platform", items: ["Kong Gateway", "Supabase", "Redis"] },
    ],
    statement: "One sign-in, one entitlement model, and a gateway that enforces it before a request reaches a service.",
    closer: "Built behind the login.",
  },

  {
    title: "Buddy",
    color: "#f2ee99",
    accent: "#ca8a04",
    accent2: "#4d7c0f",
    contribution: "Full-Stack",
    path: "/work/buddy/",
    description:
      "MERN e-commerce app with Passport + JWT auth, file uploads via Multer, and cloud hosting on AWS EC2 with S3 for storage.",
    images: 13,
    href: "https://github.com/NishantJS/Buddy-Backend",
    skills: ["React.js", "Node.js", "MongoDB", "Express.js", "JWT", "Passport.js", "Multer", "AWS EC2 & S3", "Bcrypt"],

    meta: {
      role: "Full-stack",
      company: "Personal project",
      type: "Personal project",
      status: "Open source",
    },
    overview: [
      "Buddy is a MERN e-commerce app I built end to end — catalogue, cart and checkout on one side, and the seller tools that put products into it on the other.",
      "It's the project where I worked out the pieces every later app reused: auth that isn't hand-rolled, uploads that don't live on the app server, and a deployment that isn't a laptop.",
    ],
    stats: [
      { value: "13", label: "Screens in the gallery" },
      { value: "MERN", label: "Built front to back" },
      { value: "2", label: "Account types: buyer, seller" },
      { value: "AWS", label: "EC2 + S3 deployment" },
    ],
    highlights: [
      {
        title: "Storefront and cart",
        body: "Catalogue, product pages, cart and checkout in React against an Express API, with MongoDB behind it and the cart surviving a session rather than a page.",
        tags: ["React.js", "Express.js", "MongoDB"],
      },
      {
        title: "Two sides of a marketplace",
        body: "Buyer and seller accounts with different capabilities over the same catalogue — which is where the permission modelling in my later work started.",
        tags: ["Roles"],
      },
      {
        title: "Auth done properly",
        body: "Passport strategies with short-lived JWTs and bcrypt-hashed credentials, rather than the hand-rolled session that every tutorial reaches for first.",
        tags: ["JWT", "Passport.js", "Bcrypt"],
      },
      {
        title: "Uploads that outlive a deploy",
        body: "Multer handles the multipart, but the file lands in S3 — so the app server stays stateless and a redeploy never takes the product images with it.",
        tags: ["Multer", "AWS S3"],
      },
    ],
    challenges: [
      {
        problem: "Images on the app server disappear on redeploy.",
        solution: "Moving uploads to S3 and serving them through signed URLs made the server disposable — which is the property that makes any of the rest of it deployable more than once.",
      },
      {
        problem: "Auth is the easiest thing to quietly get wrong.",
        solution: "Passport with bcrypt-hashed credentials and short-lived tokens, so nothing reversible is ever stored and a leaked token has a deadline on it.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["React.js"] },
      { group: "Backend", items: ["Node.js", "Express.js", "Multer"] },
      { group: "Data", items: ["MongoDB"] },
      { group: "Auth", items: ["JWT", "Passport.js", "Bcrypt"] },
      { group: "Infrastructure", items: ["AWS EC2 & S3"] },
    ],
    statement: "The project where shipping it mattered as much as building it.",
    closer: "Read the code on GitHub.",
  },
];

/** Resolve a project from a pathname, ignoring a trailing slash so
    /work/qollabb and /work/qollabb/ both land on the same entry. */
export const getProject = (pathname: string) => {
  const norm = (s: string) => s.replace(/\/+$/, "");
  return projects.find(p => norm(p.path) === norm(pathname));
};
