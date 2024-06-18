import { FC } from "react";
import type { ProjectData } from "../home/Home";

type ContentsProps = {
  project: ProjectData;
};

const Contents: FC<ContentsProps> = ({ project }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">

      {project?.content?.map((content) => {
        return new Array(content?.max || 0).fill(0).map((_, index) => {
          return <img
            key={index}
            src={`/project/${project.title}/${content?.key}${index}.png`}
            className="rounded-md"
            alt={`${project.title} ${content?.key}${index}`}
          />
        }
        )
      }
      )}
    </div>
  );
};

export default Contents;
