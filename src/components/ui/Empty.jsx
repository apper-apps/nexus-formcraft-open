import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by creating your first item", 
  actionLabel = "Get Started",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ApperIcon name={icon} className="w-10 h-10 text-primary-600" />
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-display font-bold text-gray-900 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 mb-8 max-w-md leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {description}
      </motion.p>
      
      {onAction && (
        <motion.button
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default Empty;