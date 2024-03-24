import { Link, useLocation } from "react-router-dom"
import { projects } from "../home/Home"
import { useGSAP } from "@gsap/react"
import { useRef } from "react"
// import gsap from "gsap"

const Project = () => {
  const { pathname } = useLocation()
  const project = projects.find(project => project.path === pathname) || projects[0]
  const index = projects.indexOf(project)

  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

  }, {
    scope: ref
  })

  if (!project) return <div>Project not found</div>

  console.log(project)

  return (
    <main className="min-h-screen mono" ref={ref} style={{ backgroundColor: project.color }}>
      {project.title}

      <div className="flex w-full h-screen">
        <div>
          <h2>{project.contribution}</h2>
        </div>
        <div>
          <h2>{project.title}</h2>
        </div>
      </div>

      {/* pagination */}
      <div className="px-5 md:px-20 py-16 pb-32 flex justify-between md:text-4xl bg-slate-800 mix-blend-difference text-white text-xl">
        {index ? (
          <Link to={projects[index - 1].path}>
            {projects[index - 1].title}
          </Link>
        ) : (
          <Link to={projects[projects.length - 1].path}>
            {projects[projects.length - 1].title}
          </Link>
        )}

        {index < projects.length - 1 ? (
          <Link to={projects[index + 1].path}>
            {projects[index + 1].title}
          </Link>
        ) : (
          <Link to={projects[0].path}>
            {projects[0].title}
          </Link>
        )}

      </div>

    </main >
  )
}

export default Project