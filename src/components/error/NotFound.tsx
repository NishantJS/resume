import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center"
  >
    <h2 className="text-5xl font-bold tracking-tight">404</h2>
    <p className="text-gray-500 mono">This page doesn't exist.</p>
    <div className="flex gap-6 mt-4 mono text-sm">
      <Link to="/" viewTransition className="link underline underline-offset-4">← Home</Link>
      <Link to="/work" viewTransition className="link underline underline-offset-4">View Work</Link>
    </div>
  </motion.div>
);

export default NotFound;
