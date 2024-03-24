import { useRef } from "react"
import Intro from "./Intro"
import AboutText from "./AboutText"

const About = () => {
  const ref = useRef<HTMLElement>(null);

  return (
    <main className="bg-black text-white relative pb-20 overflow-hidden" id="about" ref={ref}>
      <Intro />

      <div className="pb-20">
        <AboutText paragraph="Hello! I am a Frontend Developer and Designer based in Thane, MH, India." />
        <AboutText paragraph="I am passionate about creating beautiful and functional websites and applications. I am currently looking for new opportunities and would love to chat with you about your project." />
      </div>
    </main>
  )
}

export default About