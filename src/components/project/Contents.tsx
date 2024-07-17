import { FC } from "react";
import { ProjectData } from "../home/Home";

type ImageGalleryProps = {
  project: ProjectData
}

const ImageGallery: FC<ImageGalleryProps> = ({ project }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 p-4">
      {Array(project.images || 0).fill(0).map((_, index) => (
        <div key={index} className="w-full">
          <img
            src={`/project/${project.title}/img (${index + 1}).png`}
            className="w-full h-auto rounded-md object-contain"
            alt={`${project.title} ${index}`}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
