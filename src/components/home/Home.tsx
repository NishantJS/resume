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
    description: "Qollabb is a versatile job and assignment portal featuring four key modules: Teacher, Mentor, Student, and Companies. Employers can post job opportunities and assignments, while teachers assign coursework and real-world tasks to students. Students access a range of opportunities and mentorship sessions, enhancing their academic and career paths. Mentors provide invaluable guidance in virtual meetings, fostering growth and collaboration. Qollabb: Where talent meets opportunity.",
    images: 16,
    href: "https://qollabb.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "AWS", "Express.js", "TypeScript", "Sequelize", "Tailwind CSS", "Nginx"]
  },
  {
    title: "OneSociety",
    color: "#ffcab2",
    contribution: "Monorepo & Microfrontend",
    path: "/project/onesociety/",
    description: "OneSociety revolutionizes cooperative housing society management, providing a comprehensive platform for both members and society offices. With a user-friendly interface and robust functionality, it simplifies the complexities of society administration. Onesociety: Your one-stop solution to manage your housing society and maintain a comfortable living environment",
    images: 7,
    href: "https://society.cubeone.in",
    skills: ["Next.JS", "React.js", "Node.js", "Docker", "Express.js", "TypeScript", "Material-UI (MUI)", "Redis"]
  },
  {
    title: "Buddy",
    color: "#f2ee99",
    contribution: "Design & Development",
    path: "/project/buddy/",
    description: "Buddy is an online ecommerce store catering to products for your pets. Whether you're looking for pet foods, toys, treats, or other pet-related items, Buddy has you covered. With two modules - one for customers to place orders and one for sellers to manage products, inventory, and shipping - Buddy offers a seamless experience for both buyers and sellers.",
    images: 13,
    href: "https://github.com/NishantJS/Buddy-Backend",
    skills: ["React.js", "Node.js", "MongoDB", "Express.js", "MongoDB", "Bcrypt", "JWT", "Multer", "Passport.js"]
  },
  {
    title: "ConsultmyAstro",
    color: "#EFE8D3",
    contribution: "Backend & DataBase",
    path: "/project/consultmyastro/",
    description: "ConsultmyAstro is a platform connecting users with experienced astrologers for personalized chat or call sessions. Users are billed only for the time they actively spend in sessions, with automatic refunds for any inactive periods. It offers a secure and convenient way for users to seek astrological guidance at their convenience.",
    images: 11,
    href: "https://consultmyastro.com",
    skills: ["React.js", "Node.js", "PostgreSQL", "Express.js", "Sequelize", "JWT", "Bcrypt", "Socket.IO", "Live Chat and Call"]
  },
  {
    title: "OneDashboard",
    color: "#c2e9fb",
    contribution: "Backend & Frontend",
    path: "/project/onedashboard/",
    description: "OneDashboard is a comprehensive dashboard for managing multiple chsone applications. It provides a unified interface for users to access and manage their accounts, subscriptions, and services. With a user-friendly design and intuitive navigation, OneDashboard simplifies the user experience, making it easy to manage multiple applications from a single location.",
    href: "https://onedashboard.cubeone.in",
    skills: ["Next.js", "Supabase", "Kong Gateway", "TypeScript", "Material-UI (MUI)", "Redis"],
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
