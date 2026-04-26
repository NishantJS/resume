import { useRef, useEffect } from "react";
import gsap from "gsap";

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

/* Each skill row animates independently when fully in view */
const SkillRow = ({ group }: { group: typeof skillGroups[0] }) => {
  const rowRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, x: -28 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          gsap.to(el, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
        }
      },
      { threshold: 0.9 }   // fires only when row is 90% visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={rowRef}
      className="flex flex-col md:flex-row md:items-baseline md:gap-6 mono"
    >
      <span className="flex items-center gap-2 font-semibold tracking-wide uppercase text-sm md:text-base xl:text-lg text-gray-300 md:w-36 xl:w-44 shrink-0 mb-1 md:mb-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} aria-hidden />
        {group.label}
      </span>
      <span className="text-white/80 leading-relaxed text-base md:text-xl xl:text-2xl 2xl:text-3xl">
        {group.items.join(" · ")}
      </span>
    </li>
  );
};

export function Skills() {
  return (
    <ul className="w-full flex flex-col gap-4 md:gap-5">
      {skillGroups.map((group) => (
        <SkillRow key={group.label} group={group} />
      ))}
    </ul>
  );
}
