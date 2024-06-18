import { FC } from "react";
import { ProjectData } from "../home/Home";

type AboutSectionProps = {
  project: ProjectData
}

const AboutSection: FC<AboutSectionProps> = ({ project }) => {
  return (
    <section className="relative pt-12 bg-blueGray-50 min-h-screen lg:overflow-hidden lg:max-h-screen">
      <div className="items-center flex flex-wrap">
        <div className="w-full md:w-4/12 ml-auto mr-auto py-10 px-2">
          <img
            alt={project.title}
            className="max-w-full rounded-lg shadow-lg"
            src={`/project/${project.title}/header.png`}
          />
        </div>
        <div className="w-full md:w-5/12 ml-auto mr-auto px-4">
          <div className="md:pr-12">
            <h3 className="text-3xl font-semibold">{project.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-blueGray-500">
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
