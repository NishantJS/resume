import { FC } from "react";
import { ProjectData } from "../home/Home";

type AboutSectionProps = {
  project: ProjectData
}

const AboutSection: FC<AboutSectionProps> = ({ project }) => {
  return (
    <section className="relative pt-12 min-h-screen lg:overflow-hidden lg:max-h-screen">
      <div className="flex flex-wrap items-center lg:space-x-8 mt-16 md:mt-0">
        {/* project title and description */}
        <div className="w-full lg:w-5/12 ml-auto mr-auto px-4 mb-8 lg:mb-0">
          <div className="lg:pr-12">
            <h3 className="text-3xl font-semibold">{project.title}</h3>
            <a href={project.href} target="_blank" rel="noopener noreferrer" className="text-blue-800 underline mt-2">
              Visit Project
            </a>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span key={index} className="border border-blue-800 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-4 text-lg leading-relaxed text-blueGray-500 lg:leading-loose lg:mt-6">
              {project.description}
            </p>
          </div>
        </div>

        {/* mobile prototype with project image */}
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] lg:mt-0 mt-8 lg:ml-0">
          <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
          <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
          <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
            <img src={`/project/${project.title}/header.png`} className="w-[272px] h-[572px]" alt={`${project.title} header`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
