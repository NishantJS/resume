import { FC, useRef } from "react";
import { useSkewEffect } from "./useSkewEffect";

export const Name: FC = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  useSkewEffect(ref);

  return (
    <div className="flex justify-center items-center w-full text-center">
      <h1 className="md:text-9xl text-6xl font-bold link uppercase mix-blend-exclusion" ref={ref}>
        Nishant Chorge
      </h1>
    </div>
  );
};
