/* ── Contact desks ─────────────────────────────────────────────
   Every address the site publishes, in one place. Role addresses
   rather than a personal inbox: they survive a mail move, they can
   be handed to someone else without changing a page, and a data
   deletion request never lands in the same thread as a recruiter.

   All of them forward to the same person for now — that's an
   implementation detail, not something the pages should know.      */

export const CONTACT = {
  /** General inbox — the portfolio's "get in touch", and the
      catch-all sitting behind every other desk. */
  hello: "hello@nishant.click",
  /** App support desk. The address on the Play Console listing. */
  support: "support@nishant.click",
  /** Data access, export and deletion requests. */
  privacy: "privacy@nishant.click",
  /** Legal notices, takedowns and questions about the terms. */
  legal: "legal@nishant.click",
  /** Vulnerability reports and misuse of an app. */
  abuse: "abuse@nishant.click",
  /** Subscriptions, invoices and refunds. */
  billing: "billing@nishant.click",
  /** Feature requests and everything that isn't broken. */
  feedback: "feedback@nishant.click",
} as const;
