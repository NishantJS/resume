import { FC, useRef } from "react";
import { useSkewEffect } from "./useSkewEffect";

export const Name: FC = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  useSkewEffect(ref);

  return (
    <div className="flex justify-center items-center w-full text-center">
      <h1 className="text-7xl lm:text-9xl lg:text-9xl font-bold tilt link uppercase  mix-blend-exclusion" ref={ref}>
        Nishant Chorge
      </h1>
    </div>
  );
};
