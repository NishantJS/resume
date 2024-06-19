import { Routes, Route, useLocation } from "react-router-dom"
import Home from "../home/Home"
import Project from "../project/Project"
import NotFound from "../error/NotFound"
import ScrollIntoView from "./ScrollIntoView"
import About from "../about/About"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"
import { AnimatePresence } from "framer-motion"

const Router = () => {
  const location = useLocation()

  return (
    <>
      <ScrollIntoView key="scroll" />
      <Header active={location.pathname} key="header" />
      <AnimatePresence mode="wait" initial={false} key="router">
        <Routes location={location} key={location.pathname}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/project/:project" element={<Project />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Cursor key="cursor" pathname={location.pathname} />
      </AnimatePresence>
      <Footer active={location.pathname} key="footer" />
    </>
  )
}

export default Router
