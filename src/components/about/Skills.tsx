import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Skills() {
  const skillsRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    const skills = skillsRef.current;
    if (!skills) return;

    gsap.fromTo(
      skills.children,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1, delay: 1, stagger: 0.2 }
    );

  }, { scope: skillsRef });

  return (
    <ul ref={skillsRef} className="flex flex-col justify-center items-center mb-8 text-2xl lm:text-4xl lg:text-4xl mono">
      <li>Backend</li>
      <li>Frontend</li>
      <li>Full stack</li>
    </ul>
  );
}
