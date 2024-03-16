import { useRef } from "react"
import Cursor from "../router/Cursor"
import Footer from "./Footer"
import Intro from "./Intro"
import Header from "./Navbar"
import { AboutText } from "./AboutText"

const About = () => {
  const ref = useRef<HTMLElement>(null);

  return (
    <main className="bg-black text-white relative" id="about" ref={ref}>
      <Header />
      <Intro />
      <Footer />
      <AboutText />
      <Cursor classes="bg-gray-600" />
    </main>
  )
}

export default About