import { FC, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';

const links = [
  {
    name: "About",
    path: "/about"
  },
  {
    name: "Work",
    path: "/"
  }
]

type HeaderProps = {
  active: string;
}

const Header: FC<HeaderProps> = ({ active = "/" }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
  }, { scope: headerRef, revertOnUpdate: false });

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.to(header, { color: "white", mixBlendMode: 'difference', duration: 2 });
  }, [active]);

  return (
    <header ref={headerRef} className="fixed w-full p-8 flex justify-between items-center md:px-20 z-20">
      <Link to="/" className="font-bold text-4xl -rotate-90">NC</Link>

      <nav>
        <ul className="flex space-x-4 text-2xl mono">
          {links.map((link, index) => (
            <li key={index} className={`cursor-pointer link ${active === link.path ? "text-gray-500 border-b-2 border-purple-600" : ""}`}>
              <Link to={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
