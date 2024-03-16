import { FC } from "react";
import { Name } from "./Name";
import { Skills } from "./Skills";
import { ScrollButton } from "./ScrollButton";

const Intro: FC = () => {
  return (
    <div className="h-screen flex flex-col justify-evenly items-center ">
      <Skills />
      <Name />
      <ScrollButton />
    </div>
  );
};

export default Intro;
