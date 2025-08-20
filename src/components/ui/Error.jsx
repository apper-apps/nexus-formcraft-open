import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-500" />
      </motion.div>
      
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default Error;