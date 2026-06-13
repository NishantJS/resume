import { useEffect } from "react";

const SITE = "https://www.nishant.click";

export interface SeoInput {
  /** Full <title> text. */
  title: string;
  /** Meta description (also mirrored to OG / Twitter). */
  description?: string;
  /** Route path, e.g. "/work" — used for canonical + og:url. */
  path: string;
  /** Absolute or site-relative preview image. */
  image?: string;
}

/** Find-or-create a <meta> by name/property and set its content. */
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Keeps title / description / canonical / OG+Twitter tags in sync with the
 * current route. Tags are updated in place (no duplicates with the static
 * defaults in index.html). This is a client-rendered SPA, so this helps the
 * browser tab, history, and JS-executing crawlers; static index.html still
 * covers social scrapers that don't run JS.
 */
export function useSeo({ title, description, path, image }: SeoInput) {
  useEffect(() => {
    const url = SITE + path;
    document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("property", "og:url", url);

    if (image) {
      const abs = image.startsWith("http") ? image : SITE + image;
      upsertMeta("property", "og:image", abs);
      upsertMeta("name", "twitter:image", abs);
    }

    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = url;
  }, [title, description, path, image]);
}
