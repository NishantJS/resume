import { FC } from "react";
import { motion } from "motion/react";
import { ProjectData } from "../home/Home";

type Props = { project: ProjectData };

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const Contents: FC<Props> = ({ project }) => {
  const total = project.images || 0;
  if (!total) return null;

  const title  = project.displayTitle ?? project.title;
  const light  = isLight(project.color);
  const inkLow = light ? "rgba(0,0,0,0.4)"  : "rgba(255,255,255,0.4)";
  const border = light ? "rgba(0,0,0,0.1)"  : "rgba(255,255,255,0.12)";

  const src = (n: number) => `/project/${project.title}/img (${n}).png`;
  const alt = (n: number) => `${title} screenshot ${n}`;

  // Pair images: [1,2], [3,4], [5,6], … last row may have 1 image
  const pairs: number[][] = [];
  for (let i = 1; i <= total; i += 2) {
    pairs.push(i + 1 <= total ? [i, i + 1] : [i]);
  }

  return (
    <div>
      {/* Section header */}
      <div
        className="px-6 md:px-14 xl:px-20 py-5 mb-6 md:mb-10 flex items-center gap-5"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <span className="mono text-xs tracking-[0.22em] uppercase" style={{ color: inkLow }}>
          Screenshots
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: border }} />
        <span className="mono text-xs tabular-nums" style={{ color: inkLow }}>
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Gallery: 2 per row on md+, 1 per row on mobile */}
      <div className="px-5 md:px-12 xl:px-20 space-y-3 md:space-y-5 pb-10">
        {pairs.map((pair, rowIdx) => (
          <motion.div
            key={rowIdx}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.75, ease }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5"
          >
            {pair.map((n) => (
              <div key={n} className="overflow-hidden rounded-xl">
                <img
                  src={src(n)}
                  alt={alt(n)}
                  loading={n <= 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-auto block"
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Contents;
