import { Routes, Route, useLocation } from "react-router-dom"
import Home from "../home/Home"
import Project from "../project/Project"
import NotFound from "../error/NotFound"
import ScrollIntoView from "./ScrollIntoView"
import About from "../about/About"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"
import { AnimatePresence } from "motion/react"
import { ScrollProgress } from "./ScrollProgress"
import { useEffect, useRef } from "react"
import gsap from "gsap"

/* Skew the page wrapper based on scroll velocity */
const useScrollSkew = (ref: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    let last = window.scrollY
    let skew = 0
    let raf = 0

    const THRESHOLD = 8  // px/frame — below this, no skew
    const MAX_DEG   = 2.5

    const tick = () => {
      const current  = window.scrollY
      const velocity = current - last
      last = current

      // Only skew on fast scrolls; otherwise decay back to 0
      const target = Math.abs(velocity) > THRESHOLD
        ? gsap.utils.clamp(-MAX_DEG, MAX_DEG, velocity * 0.12)
        : 0
      skew += (target - skew) * 0.1
      if (Math.abs(skew) > 0.02 && ref.current) gsap.set(ref.current, { skewY: skew })
      else if (ref.current && Math.abs(skew) <= 0.02) gsap.set(ref.current, { skewY: 0 })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ref])
}

const Router = () => {
  const location = useLocation()
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
          <Routes location={location} key={location.pathname}>
            <Route index element={<About />} />
            <Route path="/work" element={<Home />} />
            <Route path="/work/:project" element={<Project />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer active={location.pathname} />
    </>
  )
}

export default Router
