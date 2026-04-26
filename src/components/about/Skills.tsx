import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const skillGroups: { label: string; color: string; items: string[] }[] = [
  {
    label: "Backend",
    color: "#a855f7",
    items: ["Node.js", "NestJS", "Express", "Fastify", "Passport.js", "MongoDB", "PostgreSQL", "Sequelize", "Microservices"],
  },
  {
    label: "Frontend",
    color: "#22d3ee",
    items: ["React.js", "Next.js", "Redux", "MUI", "Tailwind", "GSAP", "Framer Motion", "Socket.io", "SCSS"],
  },
  {
    label: "Testing",
    color: "#10b981",
    items: ["Jest", "RTL", "Playwright"],
  },
  {
    label: "Other",
    color: "#f59e0b",
    items: ["Redis", "Nx Monorepo", "Micro-Frontend", "Docker", "Strapi", "SAML", "JS", "TS", "Git", "Electron.js", "AWS S3 & EC2", "Nginx"],
  },
];

export function Skills() {
  const skillsRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = skillsRef.current;
      if (!el) return;

      // Start hidden — fire on scroll into view, not on mount
      gsap.set(el.children, { opacity: 0, x: -24 });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            gsap.to(el.children, {
              opacity: 1, x: 0, duration: 0.55, stagger: 0.1, ease: "power3.out",
            });
          }
        },
        { threshold: 0.15 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    },
    { scope: skillsRef }
  );

  return (
    <ul
      ref={skillsRef}
      className="mono w-full flex flex-col gap-4 md:gap-5 text-base md:text-xl xl:text-2xl 2xl:text-3xl"
    >
      {skillGroups.map((group) => (
        <li
          key={group.label}
          className="flex flex-col md:flex-row md:items-baseline md:gap-6"
        >
          <span className="flex items-center gap-2 font-semibold tracking-wide uppercase text-sm md:text-base xl:text-lg text-gray-300 md:w-36 xl:w-44 shrink-0 mb-1 md:mb-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} aria-hidden />
            {group.label}
          </span>
          <span className="text-white/80 leading-relaxed">{group.items.join(" · ")}</span>
        </li>
      ))}
    </ul>
  );
}
