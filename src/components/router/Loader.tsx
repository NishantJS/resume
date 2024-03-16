import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import "./loader.css";

const Preloader = ({ children }: { children: React.ReactNode }) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const verticalBlocksRef = useRef<HTMLDivElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power1.out' } });

    // Animation for counter
    tl.fromTo(
      counterRef.current!,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 1, delay: 0.5, ease: 'power1.inOut' } // Using 'power1.inOut' easing for smoother animation
    );

    // Simulating loading process
    let counter = 0;
    const updateCounter = () => {
      counter++;
      counterRef.current!.textContent = `${counter}%`;

      if (counter < 100) {
        setTimeout(updateCounter, 30); // Adjust timing for smoother animation
      } else {
        // Countdown ends, hide counter and animate blocks
        tl.to(counterRef.current!, { opacity: 0, duration: 0.5 });
        animateBlocks(0);
      }
    };

    const animateBlocks = (index: number) => {
      if (index < verticalBlocksRef.current.length) {
        const blockTween = gsap.to(verticalBlocksRef.current[index], {
          y: '-100%',
          duration: 0.5,
          ease: 'power2.out',
        });

        blockTween.then(() => animateBlocks(index + 1))
      } else {
        setIsLoaded(true);
      }
    };

    updateCounter();

    () => {
      setIsLoaded(true);
    }
  }, []);

  if (isLoaded) {
    return children;
  }

  return (
    <div className="preloader">
      <div ref={counterRef} className="counter">0%</div>
      {[...Array(5)].map((_, index) => (
        <div key={index} ref={el => verticalBlocksRef.current[index] = el!} className="block"></div>
      ))}
    </div>
  );
};

export default Preloader;
