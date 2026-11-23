import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300 relative">
      {/* Persistent Background Photo (Subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
        <img 
          src="/city_planning_landing_hero_1778334541072.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <motion.div 
        animate={{ marginLeft: isCollapsed ? '80px' : '280px' }}
        className="min-h-screen flex flex-col transition-all duration-300 ease-in-out"
      >
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="flex-1 p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="px-8 py-6 border-t border-secondary-200 dark:border-secondary-800 text-center text-sm text-secondary-500">
          <p>© 2024 UrbanAI Intelligence System. All rights reserved. Government Policy Support Division.</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
