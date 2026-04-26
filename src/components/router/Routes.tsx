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

const Router = () => {
  const location = useLocation()

  return (
    <>
      <ScrollProgress />
      <ScrollIntoView />
      <Header active={location.pathname} />
      <Cursor pathname={location.pathname} />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* About is now the landing page */}
          <Route index element={<About />} />
          {/* Projects list lives at /work */}
          <Route path="/work" element={<Home />} />
          <Route path="/project/:project" element={<Project />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer active={location.pathname} />
    </>
  )
}

export default Router
