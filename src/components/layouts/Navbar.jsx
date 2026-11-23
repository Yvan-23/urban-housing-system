import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Grid, 
  LogOut, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  X,
  Database,
  RefreshCcw,
  BrainCircuit,
  Map as MapIcon,
  PlayCircle,
  BarChart3,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const { logout, user, role } = useAuth();
  const { showNotification, history, unreadCount, markAllAsRead, clearHistory } = useNotification();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModuleLauncher, setShowModuleLauncher] = useState(false);
  
  const notificationRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (launcherRef.current && !launcherRef.current.contains(event.target)) {
        setShowModuleLauncher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showNotification("Successfully logged out. Secure session terminated.", 'info');
    navigate('/login');
  };

  const modules = [
    { id: 'repo', label: 'Repository', icon: Database, path: '/dashboard/repository', color: 'bg-blue-500', roles: ['Urban Planner', 'Data Analyst', 'System Administrator'] },
    { id: 'intel', label: 'Intelligence', icon: Lightbulb, path: '/dashboard/intelligence', color: 'bg-amber-500', roles: ['Urban Planner', 'Government Official', 'System Administrator'] },
    { id: 'gis', label: 'GIS Map', icon: MapIcon, path: '/dashboard/gis', color: 'bg-emerald-500', roles: ['Urban Planner', 'System Administrator'] },
    { id: 'ai', label: 'Analytics', icon: BrainCircuit, path: '/dashboard/analytics', color: 'bg-indigo-500', roles: ['Urban Planner', 'Data Analyst', 'System Administrator'] },
    { id: 'scen', label: 'Simulations', icon: PlayCircle, path: '/dashboard/scenarios', color: 'bg-rose-500', roles: ['Urban Planner', 'System Administrator'] },
    { id: 'gov', label: 'Governance', icon: ShieldCheck, path: '/dashboard/security', color: 'bg-purple-500', roles: ['System Administrator'] },
  ];

  const filteredModules = modules.filter(m => !m.roles || m.roles.includes(role));

  return (
    <header className="h-20 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search datasets, reports, or policies..." 
            className="w-full bg-secondary-100 dark:bg-secondary-800 border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/50 transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowModuleLauncher(false);
            }}
            className="p-2.5 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-secondary-900 text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center bg-secondary-50/50 dark:bg-secondary-800/50">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  <div className="flex gap-2">
                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary-600 hover:underline uppercase">Mark all read</button>
                    <button onClick={clearHistory} className="text-[10px] font-bold text-secondary-400 hover:text-red-500 uppercase">Clear</button>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-secondary-200 mb-2" />
                      <p className="text-xs text-secondary-500 font-medium">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                      {history.map((n) => (
                        <div key={n.id} className={`p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                              {n.type === 'success' && <CheckCircle2 size={14} />}
                              {n.type === 'error' && <AlertCircle size={14} />}
                              {n.type === 'info' && <Info size={14} />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs leading-relaxed ${!n.read ? 'font-bold text-secondary-900 dark:text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>{n.message}</p>
                              <span className="text-[10px] text-secondary-400 mt-1 block">{n.time}</span>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2"></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Module Launcher */}
        <div className="relative" ref={launcherRef}>
          <button 
            onClick={() => {
              setShowModuleLauncher(!showModuleLauncher);
              setShowNotifications(false);
            }}
            className={`p-2.5 rounded-full transition-colors ${showModuleLauncher ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-400'}`}
          >
            <Grid size={20} />
          </button>

          <AnimatePresence>
            {showModuleLauncher && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-72 bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-800 p-4 z-50"
              >
                <h4 className="font-bold text-xs text-secondary-400 uppercase tracking-wider mb-4 px-2">Quick Launch</h4>
                <div className="grid grid-cols-3 gap-2">
                  {filteredModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        navigate(module.path);
                        setShowModuleLauncher(false);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all group"
                    >
                      <div className={`w-12 h-12 ${module.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                        <module.icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold text-secondary-600 dark:text-secondary-400">{module.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setShowModuleLauncher(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-secondary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    All System Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-secondary-200 dark:bg-secondary-800 mx-2"></div>

        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-3 cursor-pointer group relative hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">
              {user?.name || "Dr. Sarah Johnson"}
            </p>
            <p className="text-xs text-secondary-500 font-medium">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold border-2 border-white dark:border-secondary-800 shadow-sm">
            {user?.name?.split(' ').map(n => n[0]).join('') || "SJ"}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          title="Secure Logout"
          className="p-2 ml-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-400 hover:text-red-500 transition-all active:scale-90"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
