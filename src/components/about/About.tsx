import { useRef } from "react"
import Intro from "./Intro"
import AboutText from "./AboutText"
import { motion, useIsPresent } from "framer-motion";

const About = () => {
  const ref = useRef<HTMLElement>(null);
  const isPresent = useIsPresent();

  return (
    <main className="bg-black text-white relative pb-20 overflow-hidden" id="about" ref={ref}>
      <Intro />

      <div className="pb-20">
        <AboutText paragraph="Hello! I am a Frontend Developer and Designer based in Thane, MH, India." />
        <AboutText paragraph="I am passionate about creating beautiful and functional websites and applications. I am currently looking for new opportunities and would love to chat with you about your project." />
      </div>
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0, transition: { duration: 1, ease: "circOut" } }}
        exit={{ scaleX: 1, transition: { duration: 1, ease: "circOut" } }}
        style={{ originX: isPresent ? 0 : 1 }}
        className="transition-animation bg-white"
      />
    </main>
  )
}

export default About