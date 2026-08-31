import { Routes, Route, useLocation } from "react-router-dom"
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react"
import ScrollIntoView from "./ScrollIntoView"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"
import { ScrollProgress } from "./ScrollProgress"
import gsap from "gsap"

const About        = lazy(() => import("../about/About"))
const Home         = lazy(() => import("../home/Home"))
const Project      = lazy(() => import("../project/Project"))
const Games        = lazy(() => import("../games/Games"))
const GamePage     = lazy(() => import("../games/GamePage"))
const Apps         = lazy(() => import("../apps/Apps"))

/* An app is four pages that link to each other from a tab rail, so the
   next one is nearly always one of the other three. Each is its own
   lazy chunk, and the `key` below drops the outgoing page before the
   incoming chunk has arrived — which is the blank frame you saw moving
   between them. Fetching the siblings while the first one is being read
   means the tab is a render, not a round trip. */
const appChunks = [
  () => import("../apps/AppPage"),
  () => import("../apps/AppSupport"),
  () => import("../apps/AppPrivacy"),
  () => import("../apps/AppChangelog"),
]
const AppPage      = lazy(appChunks[0])
const AppSupport   = lazy(appChunks[1])
const AppPrivacy   = lazy(appChunks[2])
const AppChangelog = lazy(appChunks[3])
const NotFound     = lazy(() => import("../error/NotFound"))

/** Warms the other three app chunks once the browser is idle. */
const usePrefetchAppChunks = (onAppRoute: boolean) => {
  useEffect(() => {
    if (!onAppRoute) return
    let cancelled = false
    const run = () => { if (!cancelled) appChunks.forEach(load => { void load() }) }
    // requestIdleCallback is unsupported in Safari <17; the timeout is
    // the same idea with a worse guess at when idle is.
    const idle = typeof window.requestIdleCallback === "function"
    const id = idle
      ? window.requestIdleCallback(run, { timeout: 2000 })
      : window.setTimeout(run, 400)
    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [onAppRoute])
}

/* ── Subtle scroll-skew on fast scrolls ───────────────────────────
   Driven by the scroll event, not by a standing rAF loop.

   The loop used to run every frame for the entire life of the page:
   reading scrollY and writing a transform onto the wrapper that holds
   the whole document, sixty times a second, whether or not anything
   had moved. That is a permanent slice of every frame's budget spent
   on nothing, and — with `will-change: transform` pinned on in the
   JSX — a permanent re-raster hint on the largest layer on the page.
   Any other animation that wanted the compositor was queueing behind
   it, which is what the occasional stutter actually was.

   Now a scroll starts the loop and the loop stops itself once the
   skew has settled flat; `will-change` is raised and dropped with it.
   The transform goes straight to `style` — gsap.set re-parses and
   rebuilds the whole transform string on every call — and only when
   the rounded value actually changed, so a slow scroll (skew below
   the threshold the whole way) costs zero style writes.

   `skewY(0deg)` is written once at mount and never removed: a
   transform makes this element the containing block for the
   fixed-position descendants inside it, so dropping the property
   between scrolls would jump them. */
const useScrollSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Written up front so the containing block never appears or
    // disappears — only the angle inside it changes.
    el.style.transform = "skewY(0deg)"
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let last    = window.scrollY
    let skew    = 0
    let written = 0
    let idle    = 0
    let raf     = 0
    const THRESHOLD = 8
    const MAX_DEG   = 1.0

    const tick = () => {
      const cur = window.scrollY
      const vel = cur - last
      last = cur

      const target = Math.abs(vel) > THRESHOLD
        ? gsap.utils.clamp(-MAX_DEG, MAX_DEG, vel * 0.05)
        : 0
      skew += (target - skew) * 0.1

      const next = Math.abs(skew) > 0.02 ? Math.round(skew * 100) / 100 : 0
      if (next !== written) {
        written = next
        el.style.transform = `skewY(${next}deg)`
      }

      // Flat, and the page has not moved for a few frames: park the
      // loop and hand the layer back until the next scroll.
      if (next === 0 && vel === 0 && ++idle > 4) {
        raf = 0
        el.style.willChange = "auto"
        return
      }
      if (next !== 0 || vel !== 0) idle = 0
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      idle = 0
      if (raf) return
      el.style.willChange = "transform"
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
      el.style.willChange = "auto"
    }
  }, [ref])
}

/* ── Document canvas ───────────────────────────────────────────────
   index.html paints the body black so the first load of the dark
   landing page has nothing to flash against. Every other page is
   light, though, and the enter animation starts from transparent — so
   for the first frames of every navigation that black canvas was the
   only thing on screen.

   Matching it to the page that is arriving means those frames show the
   incoming page's own base tone instead, which is not a flash at all. */
const canvasFor = (pathname: string) => {
  const p = pathname.replace(/\/+$/, "") || "/"
  if (p === "/") return "#0a0a0a"                    // the landing page is black

  /* An app's four pages are washed in that app's own colour, not the
     index's cool grey — so the canvas under them has to be too, or the
     240ms enter fade reveals a near-white page underneath a pale green
     one. 35% is where .project-gradient's lightest stop sits. */
  const app = /^\/apps\/([^/]+)/.exec(p)?.[1]
  const tint = app && __APP_TINTS__[app]
  if (tint) return `color-mix(in srgb, ${tint} 35%, white)`

  if (p.startsWith("/apps")) return "#f4fafd"         // cool-gradient base
  if (p.startsWith("/games")) return "#fbf8fe"        // play-gradient base
  return "#fdf8ee"                                    // warm — /work and the 404
}

const Router = () => {
  const location   = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useScrollSkew(wrapperRef)
  usePrefetchAppChunks(location.pathname.startsWith("/apps/"))

  // Before paint, so the incoming page never fades in over the wrong colour.
  useLayoutEffect(() => {
    document.body.style.background = canvasFor(location.pathname)
  }, [location.pathname])

  return (
    <>
      <ScrollProgress />
      <ScrollIntoView />
      <Header active={location.pathname} />
      <Cursor pathname={location.pathname} />
      {/* No will-change here — useScrollSkew raises it only while a
          scroll is actually bending the page. */}
      <div ref={wrapperRef}>
        {/* Keyed on the path so the CSS fade below re-runs per route. */}
        <div className="page-enter" key={location.pathname}>
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route index                 element={<About />} />
            <Route path="/work"          element={<Home />} />
            <Route path="/work/:project" element={<Project />} />
            <Route path="/games"         element={<Games />} />
            <Route path="/games/:game"   element={<GamePage />} />
            <Route path="/apps"                    element={<Apps />} />
            <Route path="/apps/:app"               element={<AppPage />} />
            <Route path="/apps/:app/support"       element={<AppSupport />} />
            <Route path="/apps/:app/privacy"       element={<AppPrivacy />} />
            <Route path="/apps/:app/changelog"     element={<AppChangelog />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </Suspense>
        </div>
      </div>
      <Footer active={location.pathname} />
    </>
  )
}

export default Router
