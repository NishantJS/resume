import { useRef } from 'react';
import { useGSAP } from "@gsap/react"
import gsap from 'gsap';
import { Link } from 'react-router-dom';

// Define interfaces for project data and modal state
export interface ProjectData {
  title: string;
  color: string;
  contribution: string;
  path: string;
  description: string;
  images: number;
  href: string;
  skills: string[];
}

export const projects: ProjectData[] = [
  {
    title: "Qollabb",
    color: "#eebcff",
    contribution: "Backend & Frontend",
    path: "/project/qollabb/",
    description: "Qollabb is an online job portal where I was solely responsible for backend development, covering all sections for employers, educators, mentors, and students. I utilized Express.js and PostgreSQL with Sequelize for the backend and developed the frontend for the employer section using React. This project involved creating a comprehensive, user-friendly platform to connect job seekers and employers efficiently.",
    images: 16,
    href: "https://qollabb.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "AWS", "Express.js", "TypeScript", "Sequelize", "Tailwind CSS", "Nginx"]
  },
  {
    title: "OneSociety",
    color: "#ffcab2",
    contribution: "Monorepo & Microfrontend",
    path: "/project/onesociety/",
    description: "The OneSociety project is a society management application where I created a comprehensive library for form and table pages using React JSON Schema Form (RJSF) for forms and Material-UI DataGrid for tables, all integrated with Next.js. This development significantly reduced the time required to create form pages to mere minutes, featuring built-in validation and a user-friendly interface. The project enhanced application scalability and maintainability through a modular codebase design.",
    images: 7,
    href: "https://society.cubeone.in",
    skills: ["Next.JS", "React.js", "Express.js", "TypeScript", "Material-UI (MUI)", "RJSF", "validator-ajv8", "Nx"]
  },
  {
    title: "Buddy",
    color: "#f2ee99",
    contribution: "Design & Development",
    path: "/project/buddy/",
    description: "Buddy is a MERN stack e-commerce web application designed to streamline online shopping experiences. The backend, developed using Node.js, Express, and MongoDB, features secure Passport and JWT authentication. The frontend, created with React, ensures a responsive and user-friendly interface. The project leverages AWS EC2 for hosting and S3 for storage, providing a scalable and robust solution for modern e-commerce needs.",
    images: 13,
    href: "https://github.com/NishantJS/Buddy-Backend",
    skills: ["React.js", "Node.js", "MongoDB", "Express.js", "MongoDB", "Bcrypt", "JWT", "Multer", "Passport.js"]
  },
  {
    title: "ConsultmyAstro",
    color: "#EFE8D3",
    contribution: "Backend & DataBase",
    path: "/project/consultmyastro/",
    description: "ConsultMyAstro is a chat and call application designed for astrologers. In this project, I handled the backend development, implementing key features like the chat module with Socket.io, a payment module, and a wallet system. Additionally, I contributed significantly to the frontend development, ensuring a seamless and engaging user experience for astrologers and their clients.",
    images: 11,
    href: "https://consultmyastro.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "Express.js", "Sequelize", "JWT", "Bcrypt", "Socket.IO", "Live Chat and Call"]
  },
  {
    title: "OneDashboard",
    color: "#c2e9fb",
    contribution: "Backend & Frontend",
    path: "/project/onedashboard/",
    description: "The OneDashboard project involved developing a Single Sign-On (SSO) dashboard using Supabase and Next.js, providing unified access to multiple applications. I implemented Role-Based Access Control (RBAC) for efficient user permissions management across sibling projects. The project enhanced security and user management through robust authentication mechanisms, ensuring a seamless user experience across all interconnected applications.",
    href: "https://onedashboard.cubeone.in",
    skills: ["Next.js", "Supabase", "Kong Gateway", "TypeScript", "Material-UI (MUI)", "Redis", "Keycloak"],
    images: 5
  }
];

const Home = () => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP()

  useGSAP(() => {
    const li = container.current?.querySelectorAll("li");
    if (!li) return

    const t1 = gsap.timeline({ defaults: { duration: 0.5 } });
    t1.from(li, {
      opacity: 0,
      rotateX: 90,
      stagger: 0.1,
      ease: "sine.in",
      delay: 0.5
    });
  });

  const handleMouseEnter = contextSafe((color: string) => {
    gsap.to(container.current, {
      backgroundColor: color,
      duration: 0.5,
      ease: "power4"
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(container.current, {
      backgroundColor: "white",
      duration: 0.5,
      ease: "power4"
    });
  });

  return (
    <main className="min-h-screen bg-white flex justify-center items-center" ref={container}>
      <ul className="w-full max-w-screen-lg divide-y divide-white">
        {projects.map((project, index) => (
          <li
            key={index}
            onMouseEnter={() => handleMouseEnter(project.color)}
            onMouseLeave={handleMouseLeave}
            className="py-4 sm:py-6 md:py-8"
          >
            <Link to={project.path} className="block link" state={{ bg: "bg-gray-100" }} data-image={`/project/${project.title}/logo.webp`}>
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold">{project.title}</h2>
                <p className="text-sm sm:text-base text-gray-600">{project.contribution}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
