import { motion, useTransform, useReducedMotion, MotionValue } from 'motion/react';
import { FC } from 'react';

// Words rendered in a distinctive accent colour once revealed
const ACCENT = new Set([
  'software', 'developer', 'fintech', 'enterprise', 'real-time',
  'micro-frontend', 'resilience', 'latency', 'opportunities', 'project',
  'systems', 'production-grade', 'mumbai',
]);

export interface ParagraphProps {
  paragraph: string;
  /** Shared MotionValue from the parent scroll container */
  progress: MotionValue<number>;
  /** [start, end] slice of the 0-1 range this paragraph owns */
  range: [number, number];
}

const Paragraph: FC<ParagraphProps> = ({ paragraph, progress, range }) => {
  const [rs, re] = range;
  const words = paragraph.split(' ');

  // Count every character (incl. spaces) for uniform range-slicing
  const total = paragraph.length;
  let cursor = 0; // running char-index through the paragraph

  return (
    <p className="mono flex flex-wrap text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl
                  px-6 md:px-12 xl:px-16 py-10 md:py-14
                  max-w-5xl 2xl:max-w-screen-xl mx-auto text-white leading-relaxed">
      {words.map((word, wi) => {
        const wordStart = cursor;
        cursor += word.length;
        const isAccent = ACCENT.has(word.replace(/[^a-z-]/gi, '').toLowerCase());
        // Advance cursor past the space after this word
        if (wi < words.length - 1) cursor += 1;

        return (
          // whitespace-nowrap keeps chars of the same word on the same line
          <span key={wi} className="inline-block whitespace-nowrap mr-3 mt-3">
            {word.split('').map((ch, ci) => {
              const i = wordStart + ci;
              const cs = rs + (i / total) * (re - rs);
              const ce = rs + ((i + 1) / total) * (re - rs);
              return (
                <Char key={ci} progress={progress} range={[cs, ce]} accent={isAccent}>
                  {ch}
                </Char>
              );
            })}
          </span>
        );
      })}
    </p>
  );
};

interface CharProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}

const Char: FC<CharProps> = ({ children, progress, range, accent }) => {
  const reduced = useReducedMotion();
  const opacity = useTransform(progress, range, reduced ? [1, 1] : [0, 1]);
  const y       = useTransform(progress, range, reduced ? [0, 0] : [10, 0]);
  return (
    <span className="relative inline-block">
      {/* Ghost keeps layout stable at 0 opacity */}
      <span className="absolute inset-0 opacity-[0.06] select-none" aria-hidden>
        {children}
      </span>
      <motion.span
        style={{ opacity, y }}
        className={accent ? 'text-purple-400' : undefined}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default Paragraph;
