import { FC, useRef } from "react";
import { useSkewEffect } from "./useSkewEffect";

const WORDS = ["Nishant", "Chorge"];

export const Name: FC = () => {
  const ref = useRef<HTMLHeadingElement>(null);
  useSkewEffect(ref);

  return (
    <div className="flex justify-center items-center w-full">
      <h1
        ref={ref}
        aria-label="Nishant Chorge"
        className="font-bold link uppercase leading-[0.95] name-glow select-none text-center"
        style={{ fontSize: "clamp(3.5rem, 16vw, 16rem)" }}
      >
        {WORDS.map((word, wi) => (
          <div key={wi} className="flex justify-center" aria-hidden>
            {word.split("").map((char, ci) => (
              <span key={ci} className="inline-block overflow-hidden leading-[1.05]">
                {/* data-char is the ground-truth: immune to textContent mutations during scramble */}
                <span className="char inline-block" data-char={char}>{char}</span>
              </span>
            ))}
          </div>
        ))}
      </h1>
    </div>
  );
};
