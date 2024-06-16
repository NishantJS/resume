import { FC, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';

const darkModeOn = "/about"

type FooterProps = {
  active: string;
}

const Footer: FC<FooterProps> = ({ active = "" }) => {
  const footerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const footer = footerRef.current;
    if (!footer) return;

    gsap.fromTo(footer, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
  }, { scope: footerRef });

  useGSAP(() => {
    const footer = footerRef.current;
    if (!footer) return;

    gsap.to(footer, { color: darkModeOn === active ? "white" : "black", duration: 2 });
  }, [active]);

  return (
    <footer ref={footerRef} className="fixed bottom-0 w-full flex justify-between items-center mono text-lg px-4 py-0">
      <div className='flex flex-col'>
        <a href="https://www.linkedin.com/in/nishant-chorge/" target="_blank" rel="noreferrer" >
          LinkedIn
        </a>
        <a href='https://www.github.com/NishantJS' target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href='https://www.twitter.com/nishantchorge' target="_blank" rel="noreferrer" download={true}>
          Resume
        </a>
      </div>
      <div className='flex flex-col'>
        <a href="mailto:contact@nishant.codes" target="_blank" rel="noreferrer">
          Email
        </a>
        <a href="tel:+916283925737" target="_blank" rel="noreferrer">
          Phone
        </a>
      </div>
    </footer>
  );
}

export default Footer;
