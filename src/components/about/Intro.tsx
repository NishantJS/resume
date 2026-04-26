import { FC } from "react";
import { Name } from "./Name";
import { ScrollButton } from "./ScrollButton";

const Intro: FC = () => (
  /* Single snap-aligned screen: just the name + scroll cue */
  <div
    className="h-screen flex flex-col items-center justify-center px-4 pt-20"
    style={{ scrollSnapAlign: "start" }}
  >
    <Name />
    <div className="mt-12">
      <ScrollButton />
    </div>
  </div>
);

export default Intro;
