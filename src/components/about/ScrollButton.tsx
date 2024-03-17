import { useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';

export function ScrollButton() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const button = ref.current;
    if (!button) return;

    gsap.fromTo(
      button,
      {
        y: 10,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 2,
        yoyo: true,
        repeat: -1,
      }
    );

  }, []);

  return (
    <div className="flex justify-center items-center" ref={ref}>
      <svg className="w-12 h-12 link" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  );
}
