import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { FC, useRef } from 'react';

interface ParagraphProps {
  paragraph: string;
}

const specialWords = ['Frontend', 'Developer', 'Designer', 'chat', 'project', 'opportunities'];

const Paragraph: FC<ParagraphProps> = ({ paragraph }) => {
  const container = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.7", "end 0.9"]
  });

  const words: string[] = paragraph.split(" ");
  return (
    <p
      ref={container}
      className="mono flex flex-wrap text-4xl p-10 max-w-7xl text-white"
    >
      {words.map((word: string, i: number) => {
        const start: number = i / words.length;
        const end: number = start + (1 / words.length);
        return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>;
      })}
    </p>
  );
};

interface WordProps {
  children: string;
  progress: MotionValue<number>; // Change type to MotionValue<number>
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className={`relative mr-3 mt-3 ${specialWords.includes(children) && "link"}`}>
      <span className='absolute opacity-10'>{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

export default Paragraph;
