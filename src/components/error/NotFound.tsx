import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming you're using React Router

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col items-center justify-center h-screen "
    >
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-8">Oops! The page you are looking for might have been removed or is temporarily unavailable.</p>
      <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Go Back to Home
      </Link>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-gray-600"
      >
        Or check out <Link to="/#projects" className="text-blue-500 underline">my projects</Link>.
      </motion.p>
    </motion.div>
  );
}

export default NotFound;
