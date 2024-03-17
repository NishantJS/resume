import { FC, Dispatch, SetStateAction } from 'react';

interface ProjectProps {
  index: number;
  title: string;
  setModal: Dispatch<SetStateAction<{ active: boolean; index: number; }>>;
}

const Project: FC<ProjectProps> = ({ index, title, setModal }) => {
  return (
    <div
      onMouseEnter={() => { setModal({ active: true, index }) }}
      onMouseLeave={() => { setModal({ active: false, index }) }}
    >
      <h2>{title}</h2>
      <p>Design & Development</p>
    </div>
  );
}

export default Project;
