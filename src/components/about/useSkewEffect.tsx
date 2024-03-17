import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function useSkewEffect(ref: React.RefObject<HTMLHeadingElement>) {
  useGSAP(() => {
    const name = ref.current;
    if (!name) return;

    let throttled = false;

    gsap.fromTo(
      name,
      // yoyo effect
      {
        scaleY: 0
      },
      {
        duration: 2,
        scale: 1,
        ease: "elastic.out(1, 0.3)",
        delay: 1.5
      }
    );

    const handleMouseMove = (e: MouseEvent) => {
      if (!throttled) {
        throttled = true;
        setTimeout(() => {
          throttled = false;
        }, 50); // Adjust the throttle delay as needed
        const { clientX, clientY } = e;
        const { left, top, width, height } = name.getBoundingClientRect();
        const offsetX = clientX - left - width / 2;
        const offsetY = clientY - top - height / 2;
        const skewX = offsetX / 10;
        const skewY = offsetY / 10;
        gsap.to(name, { skewX, skewY, duration: 0.5 });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(name, { skewX: 0, skewY: 0, duration: 0.5 });
    };

    name.addEventListener("mousemove", handleMouseMove);
    name.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      name.removeEventListener("mousemove", handleMouseMove);
      name.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: ref });
}
