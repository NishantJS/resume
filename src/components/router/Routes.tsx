import { Routes, Route, useLocation } from "react-router-dom"
import { lazy, Suspense } from "react"
import ScrollIntoView from "./ScrollIntoView"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"
import { AnimatePresence } from "motion/react"
import { ScrollProgress } from "./ScrollProgress"
import { useEffect, useRef } from "react"
import gsap from "gsap"

// Lazy-load all page components — keeps the initial bundle small
const About    = lazy(() => import("../about/About"))
const Home     = lazy(() => import("../home/Home"))
const Project  = lazy(() => import("../project/Project"))
const NotFound = lazy(() => import("../error/NotFound"))

/* Skew the page wrapper on fast scrolls only */
const useScrollSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    let last = window.scrollY
    let skew = 0
    let raf  = 0
    const THRESHOLD = 8
    const MAX_DEG   = 2.5

    const tick = () => {
      const current  = window.scrollY
      const velocity = current - last
      last = current
      const target = Math.abs(velocity) > THRESHOLD
        ? gsap.utils.clamp(-MAX_DEG, MAX_DEG, velocity * 0.12)
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

  return (
    <>
      <ScrollProgress />
      <ScrollIntoView />
      <Header active={location.pathname} />
      <Cursor pathname={location.pathname} />
      <div ref={wrapperRef} style={{ willChange: "transform" }}>
        <AnimatePresence mode="wait" initial={false}>
          <Suspense fallback={null}>
            <Routes location={location} key={location.pathname}>
              <Route index                  element={<About />} />
              <Route path="/work"           element={<Home />} />
              <Route path="/work/:project"  element={<Project />} />
              <Route path="*"               element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
      <Footer active={location.pathname} />
    </>
  )
}

export default Router
