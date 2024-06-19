import { FC } from "react";
import { ProjectData } from "../home/Home";

type AboutSectionProps = {
  project: ProjectData
}

const AboutSection: FC<AboutSectionProps> = ({ project }) => {
  return (
    <section className="relative pt-12 bg-blueGray-50 min-h-screen lg:overflow-hidden lg:max-h-screen">
      <div className="items-center flex flex-wrap">
        {/* <div className="w-full md:w-4/12 ml-auto mr-auto py-10 px-2">
          <img
            alt={project.title}
            className="max-w-full rounded-lg shadow-lg"
            src={`/project/${project.title}/header.png`}
          />
        </div> */}


        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
          <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
          <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
          <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
            <img src={`/project/${project.title}/header.png`} className="w-[272px] h-[572px]" alt="" />
          </div>
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
