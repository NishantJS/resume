import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import "./loader.css";
import { useGSAP } from '@gsap/react';

const Preloader = ({ children }: { children: React.ReactNode }) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useGSAP(() => {
    if (!counterRef.current || isLoaded) return
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
      counter = Math.floor(Math.min(counter + Math.random() * 10, 100)) // Increment counter by random value
      if (counterRef.current) { // Check if counterRef.current is not null
        counterRef.current.textContent = `${counter}`;

        if (counter < 100) {
          setTimeout(updateCounter, 200); // Adjust timing for smoother animation
        } else {
          // Countdown ends, hide counter and animate blocks
          tl.to(counterRef.current, { opacity: 0, duration: 0.5 });
          setIsLoaded(true);
        }
      }
    };

    setTimeout(updateCounter, 10); // Call updateCounter after initial mount
  }, {
    scope: counterRef,
  });

  if (isLoaded) {
    return children;
  }

  return (
    <div className="bg-gray-800 text-orange-500 mono h-screen w-screen flex justify-center items-center">
      <div ref={counterRef} className="absolute top-auto left-auto text-9xl">0</div>
    </div>
  );
};

export default Preloader;
