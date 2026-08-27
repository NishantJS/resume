import { Routes, Route, useLocation } from "react-router-dom"
import { Suspense, useEffect, useLayoutEffect, useRef } from "react"
import ScrollIntoView from "./ScrollIntoView"
import { useLinkTransitions } from "./useLinkTransitions"
import { notifySwap } from "./transition"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"
import { ScrollProgress } from "./ScrollProgress"
import gsap from "gsap"

import {
  About, Home, Project, Games, GamePage,
  Apps, AppPage, AppSupport, AppPrivacy, AppChangelog, NotFound,
} from "./lazyRoutes"

/* ── Subtle scroll-skew on fast scrolls ───────────────────── */
const useScrollSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    let last = window.scrollY
    let skew = 0
    let raf  = 0
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
      if (ref.current) gsap.set(ref.current, { skewY: Math.abs(skew) > 0.02 ? skew : 0 })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ref])
}

const Router = () => {
  const location   = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useScrollSkew(wrapperRef)
  useLinkTransitions()

  // Lets an in-flight view transition know the new route is on screen
  // and it is safe to take the "after" snapshot.
  useLayoutEffect(() => { notifySwap() }, [location.pathname])

  return (
    <>
      <ScrollProgress />
      <ScrollIntoView />
      <Header active={location.pathname} />
      <Cursor pathname={location.pathname} />
      <div ref={wrapperRef} style={{ willChange: "transform" }}>
        {/* The transition animates this, not the document root, so the
            header and footer are never part of it — they keep their own
            compositing (the header blends in difference mode) and stay
            put while the page changes underneath them. */}
        <div className="page-frame">
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
