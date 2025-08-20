import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-surface flex overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Menu" className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="FormInput" className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-2 text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                FormCraft
              </h1>
            </div>
            
            <div className="w-10" />
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;