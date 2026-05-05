import { useRef, FC } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

export interface ProjectData {
  title: string;
  displayTitle?: string;
  color: string;
  contribution: string;
  path: string;
  description: string;
  images: number;
  href?: string;
  skills: string[];
}

export const projects: ProjectData[] = [

  {
    title: "mStockReferEarn",
    displayTitle: "m.Stock Refer & Earn",
    color: "#fde68a",
    contribution: "Backend & Frontend",
    path: "/work/mstock-refer-earn/",
    description:
      "Migrated the legacy .NET Refer & Earn platform to Next.js + Fastify with SSE-based real-time feeds via Redis Streams, L1/L2/L3 caching, circuit breakers, and idempotent APIs.",
    images: 0,
    href: "https://refer.mstock.com/",
    skills: ["Next.js", "Fastify", "Node.js", "TypeScript", "Redis Streams", "SSE", "Opossum", "L1/L2/L3 Caching", "ETag + Cache-Control", "MySQL"],
  },
  {
    title: "AdvisoryBasket",
    displayTitle: "Advisory Basket",
    color: "#bbf7d0",
    contribution: "Backend (Fastify + NestJS)",
    path: "/work/advisory-basket/",
    description:
      "Smallcase-style stock advisory backend with event-driven Redis Streams cache invalidation, circuit breakers, L1/L2/L3 caching, and high-concurrency API patterns.",
    images: 0,
    href: "https://www.mstock.com/advisory/",
    skills: ["Fastify", "NestJS", "Node.js", "TypeScript", "Redis Streams", "MySQL", "Opossum", "Microservices", "Event-Driven Cache Invalidation"],
  },
  {
    title: "Qollabb",
    color: "#eebcff",
    contribution: "Backend & Frontend",
    path: "/work/qollabb/",
    description:
      "Multi-role job portal (employer, mentor, student, educator) with real-time WebSocket chat, and a full employer dashboard built in React.",
    images: 16,
    href: "https://qollabb.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "Express.js", "Sequelize", "WebSockets", "JWT", "Passport.js", "AWS EC2 & S3", "Nginx", "TypeScript"],
  },
  {
    title: "OneSociety",
    color: "#ffcab2",
    contribution: "Monorepo & Micro-Frontend",
    path: "/work/onesociety/",
    description:
      "Society management platform on a Nx monorepo with micro-frontend architecture. Built a dynamic form & table library (RJSF + MUI DataGrid) and implemented RBAC across the platform.",
    images: 7,
    href: "https://society.cubeone.in",
    skills: ["Next.js", "React.js", "TypeScript", "Nx Monorepo", "Micro-Frontend", "RJSF", "MUI DataGrid", "RBAC", "Express.js"],
  },
  {
    title: "ConsultmyAstro",
    displayTitle: "Consult my Astro",
    color: "#EFE8D3",
    contribution: "Backend & Frontend",
    path: "/work/consultmyastro/",
    description:
      "Real-time chat and call platform for astrologers. Built the Socket.io chat module, payment & wallet system with refund support, and contributed extensively to the frontend.",
    images: 11,
    href: "https://consultmyastro.com",
    skills: ["Node.js", "Express.js", "Socket.io", "PostgreSQL", "Sequelize", "JWT", "Bcrypt", "React.js", "Payment & Wallet System"],
  },
  {
    title: "OneDashboard",
    displayTitle: "One Dashboard",
    color: "#c2e9fb",
    contribution: "Backend & Frontend",
    path: "/work/onedashboard/",
    description:
      "SSO dashboard unifying access to multiple apps via Next.js + Supabase + Keycloak with SAML auth, RBAC user permissions, and Kong Gateway for API routing.",
    skills: ["Next.js", "Supabase", "Keycloak", "Kong Gateway", "SAML", "RBAC", "Redis", "TypeScript", "Material-UI"],
    images: 5,
  },
  {
    title: "Buddy",
    color: "#f2ee99",
    contribution: "Full-Stack",
    path: "/work/buddy/",
    description:
      "MERN e-commerce app with Passport + JWT auth, file uploads via Multer, and cloud hosting on AWS EC2 with S3 for storage.",
    images: 13,
    href: "https://github.com/NishantJS/Buddy-Backend",
    skills: ["React.js", "Node.js", "MongoDB", "Express.js", "JWT", "Passport.js", "Multer", "AWS EC2 & S3", "Bcrypt"],
  }
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3,  ease: [0.55, 0, 1, 0.45] as [number, number, number, number] } },
};

/* Parallax drift per row — skipped when reduced motion is preferred */
const ParallaxRow: FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const y = useSpring(rawY, { stiffness: 60, damping: 18 });
  return (
    <motion.li ref={ref} style={{ y }}>
      {children}
    </motion.li>
  );
};

const Home = () => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP();
  const reduced = useReducedMotion();

  // GSAP entrance on the inner divs (not the motion.li wrappers)
  // data-entering="true" is set on the list while rows animate in so the
  // cursor skips the data-image logo effect until entrance is fully done.
  useGSAP(() => {
    const el   = container.current;
    const rows = el?.querySelectorAll<HTMLElement>('.project-row');
    if (!rows) return;
    if (reduced) { gsap.set(rows, { opacity: 1, y: 0 }); return; }
    el?.setAttribute('data-entering', 'true');
    gsap.fromTo(rows,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: "power3.out", delay: 0.3,
        onComplete: () => el?.removeAttribute('data-entering'),
      }
    );
  }, { scope: container, dependencies: [reduced] });

  const handleMouseEnter = contextSafe((color: string) => {
    gsap.to(container.current, { backgroundColor: color, duration: 0.4, ease: "power3.out" });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(container.current, { backgroundColor: "white", duration: 0.4, ease: "power3.out" });
  });

  return (
    <motion.main
      ref={container}
      variants={reduced ? undefined : pageVariants}
      initial={reduced ? false : "initial"}
      animate={reduced ? undefined : "animate"}
      exit={reduced ? undefined : "exit"}
      className="min-h-screen bg-white flex justify-center items-start pt-28 pb-32"
    >
      <ul className="w-full max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl px-6 xl:px-12 divide-y divide-black/10">
        {projects.map((project, index) => (
          /* ParallaxRow is a plain motion.li with only the y spring — no opacity/animate */
          <ParallaxRow key={index}>
            {/* .project-row is the GSAP entrance target */}
            <div
              className="project-row py-7 md:py-9 xl:py-10 group"
              onMouseEnter={() => handleMouseEnter(project.color)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                viewTransition
                to={project.path}
                className="block link"
                data-image={`/project/${project.title}/logo.webp`}
                aria-label={`View ${project.displayTitle ?? project.title} project`}
              >
                {/* Row 1: number + title + contribution */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span
                      className="mono text-xs text-zinc-500 tabular-nums select-none shrink-0 transition-colors duration-300 group-hover:text-zinc-800"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold tracking-tight leading-tight">
                      {project.displayTitle ?? project.title}
                    </h2>
                  </div>
                  <span className="mono text-xs sm:text-sm text-zinc-500 shrink-0 ml-7 sm:ml-0 transition-colors duration-300 group-hover:text-zinc-700">
                    {project.contribution}
                  </span>
                </div>

                {/* Description — always visible */}
                <p className="mono text-sm xl:text-base text-zinc-500 mt-2 line-clamp-2 ml-7 sm:ml-8 md:ml-9 max-w-2xl xl:max-w-3xl transition-colors duration-300 group-hover:text-zinc-700">
                  {project.description}
                </p>

                {/* Skill tags — reveal on hover */}
                <div className="ml-7 sm:ml-8 md:ml-9 overflow-hidden max-h-0 group-hover:max-h-12 transition-all duration-300 ease-out">
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.skills.slice(0, 6).map(skill => (
                      <span
                        key={skill}
                        className="mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/8 text-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          </ParallaxRow>
        ))}
      </ul>
    </motion.main>
  );
};

export default Home;
