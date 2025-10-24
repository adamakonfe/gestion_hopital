import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, activeSection, setActiveSection, showSidebar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && (
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      )}
      
      {/* Main Content Area */}
      <div className={showSidebar ? "lg:pl-64" : ""}>
        {/* Top Bar - Only show if sidebar is enabled */}
        {showSidebar && (
          <div className="sticky top-0 z-30 bg-white shadow-md">
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 lg:hidden">Gestion Hospitalière</h1>
              <div className="hidden lg:block w-full">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className={showSidebar ? "p-4 lg:p-8" : ""}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
