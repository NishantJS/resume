import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    className="warm-gradient relative flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center overflow-hidden"
  >
    <span
      className="mono select-none absolute font-bold leading-none pointer-events-none"
      style={{
        fontSize: 'clamp(14rem, 42vw, 34rem)',
        color: 'transparent',
        WebkitTextStroke: '1.5px rgba(0,0,0,0.08)',
      }}
      aria-hidden
    >
      404
    </span>
    <p className="mono text-xs uppercase tracking-[0.3em] text-zinc-500 relative">Page not found</p>
    <h2 className="text-4xl md:text-6xl font-bold tracking-tight relative">Nothing parked here.</h2>
    <p className="text-zinc-500 mono relative max-w-sm text-sm">
      The page you're after has driven off. Try one of these instead:
    </p>
    <div className="flex gap-3 mt-4 mono text-sm relative">
      <Link
        to="/"
        viewTransition
        className="link px-5 py-2.5 rounded-full bg-zinc-900 text-amber-50 hover:opacity-85 transition-opacity"
      >
        ← Home
      </Link>
      <Link
        to="/work"
        viewTransition
        className="link px-5 py-2.5 rounded-full border border-black/15 hover:bg-black/5 transition-colors"
      >
        View Work
      </Link>
      <Link
        to="/games"
        viewTransition
        className="link px-5 py-2.5 rounded-full border border-black/15 hover:bg-black/5 transition-colors"
      >
        Play a Game
      </Link>
    </div>
  </motion.div>
);

export default NotFound;
