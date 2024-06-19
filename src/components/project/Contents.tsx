import { FC } from "react";
import type { ProjectData } from "../home/Home";

type ContentsProps = {
  project: ProjectData;
};

const Contents: FC<ContentsProps> = ({ project }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 p-4">
      {Array(project.images || 0).fill(0).map((_, index) => (<img
        key={index}
        src={`/project/${project.title}/img (${index + 1}).png`}
        className="rounded-md"
        alt={`${project.title} ${index}`}
      />))
      }
    </div>
  );
};

export default Contents;
