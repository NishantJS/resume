import { Routes, Route, useLocation } from "react-router-dom"
import Home from "../home/Home"
import Project from "../project/Project"
import NotFound from "../error/NotFound"
import ScrollIntoView from "./ScrollIntoView"
import About from "../about/About"
import Header from "../header/Header"
import Footer from "../footer/Footer"
import Cursor from "./Cursor"

const Router = () => {
  const location = useLocation()

  return (
    <>
      <ScrollIntoView key="scroll" />
      <Header active={location.pathname} key="header" />
      <Routes location={location} key={location.pathname}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:project" element={<Project />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer active={location.pathname} key="footer" />
      <Cursor key="cursor" pathname={location.pathname} />
    </>
  )
}

export default Router
