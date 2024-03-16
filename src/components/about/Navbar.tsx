import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';

const Header: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
  }, { scope: headerRef });

  return (
    <header ref={headerRef} className="fixed w-full p-8 flex justify-between items-center md:px-20">
      <Link to="/" className="font-bold text-4xl tilt -rotate-90">NC</Link>

      <nav>
        <ul className="flex space-x-4 text-2xl mono">
          <li className="text-gray-500 border-b-2 border-blue-400 cursor-pointer link">
            About
          </li>
          <li>
            <Link to="/work">Work</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
