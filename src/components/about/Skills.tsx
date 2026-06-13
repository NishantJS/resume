import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

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

/* Each group: label column + a wall of chips that flip in with a stagger. */
const SkillRow = ({ group }: { group: typeof skillGroups[0] }) => {
  const rowRef = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = rowRef.current;
    if (!el) return;
    const chips = el.querySelectorAll<HTMLElement>(".skill-chip");
    const label = el.querySelector<HTMLElement>(".skill-label");

    if (reduced) {
      gsap.set([label, ...chips], { clearProps: "all", opacity: 1 });
      return;
    }

    gsap.set(label, { opacity: 0, x: -20 });
    gsap.set(chips, { opacity: 0, y: 16, rotateX: -50 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      defaults: { ease: "power3.out" },
    });
    tl.to(label, { opacity: 1, x: 0, duration: 0.5 })
      .to(chips, { opacity: 1, y: 0, rotateX: 0, duration: 0.55, stagger: 0.035 }, "-=0.3");
  }, { scope: rowRef, dependencies: [reduced] });

  return (
    <li
      ref={rowRef}
      className="flex flex-col md:flex-row md:items-start md:gap-6 mono"
      style={{ ["--chip" as string]: group.color, perspective: "600px" } as React.CSSProperties}
    >
      <span className="skill-label flex items-center gap-2 font-semibold tracking-wide uppercase text-sm md:text-base xl:text-lg text-gray-300 md:w-36 xl:w-44 shrink-0 mb-2.5 md:mb-0 md:pt-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} aria-hidden />
        {group.label}
      </span>
      <span className="flex flex-wrap gap-2 md:gap-2.5">
        {group.items.map(item => (
          <span key={item} className="skill-chip">{item}</span>
        ))}
      </span>
    </li>
  );
};

export function Skills() {
  return (
    <ul className="w-full flex flex-col gap-7 md:gap-8">
      {skillGroups.map((group) => (
        <SkillRow key={group.label} group={group} />
      ))}
    </ul>
  );
}
