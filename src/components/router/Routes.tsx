import { Routes, Route, useLocation } from "react-router-dom"
import Home from "../home/Home"
import Project from "../projects/Project"
import NotFound from "../error/NotFound"
import ScrollIntoView from "./ScrollIntoView"
import { AnimatePresence } from "framer-motion"
import About from "../about/About"

const Router = () => {
  const location = useLocation()

  return (
    <AnimatePresence
      initial={false}
      mode="sync"
    >
      <ScrollIntoView key={1} />
      <Routes location={location} key={location.pathname}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:project" element={<Project />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default Router
