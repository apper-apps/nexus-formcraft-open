import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Form Builder", href: "/builder", icon: "FormInput" }
  ];

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-72">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="FormInput" className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                FormCraft
              </h1>
            </div>
          </div>
          
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="FormInput" className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-2 text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                FormCraft
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;