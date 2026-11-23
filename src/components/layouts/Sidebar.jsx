import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  LayoutDashboard, 
  Database, 
  RefreshCcw, 
  BrainCircuit, 
  Lightbulb, 
  Map as MapIcon, 
  FileText, 
  PlayCircle, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Urban Planner', 'Data Analyst', 'Government Official', 'System Administrator'] },
  { icon: Database, label: 'Housing Repository', path: '/dashboard/repository', roles: ['Urban Planner', 'Data Analyst', 'System Administrator'] },
  { icon: RefreshCcw, label: 'Data Integration', path: '/dashboard/integration', roles: ['Data Analyst', 'System Administrator'] },
  { icon: BrainCircuit, label: 'AI Analytics', path: '/dashboard/analytics', roles: ['Urban Planner', 'Data Analyst', 'System Administrator'] },
  { icon: Lightbulb, label: 'Decision Intelligence', path: '/dashboard/intelligence', roles: ['Urban Planner', 'Government Official', 'System Administrator'] },
  { icon: MapIcon, label: 'GIS Visualization', path: '/dashboard/gis', roles: ['Urban Planner', 'System Administrator'] },
  { icon: FileText, label: 'Reporting', path: '/dashboard/reporting', roles: ['Government Official', 'System Administrator'] },
  { icon: PlayCircle, label: 'Scenario Planning', path: '/dashboard/scenarios', roles: ['Urban Planner', 'System Administrator'] },
  { icon: Users, label: 'Collaboration', path: '/dashboard/collaboration', roles: ['Urban Planner', 'Data Analyst', 'Government Official', 'System Administrator'] },
  { icon: BarChart3, label: 'Monitoring & Eval', path: '/dashboard/monitoring', roles: ['Data Analyst', 'Government Official', 'System Administrator'] },
  { icon: ShieldCheck, label: 'Security & Gov', path: '/dashboard/security', roles: ['System Administrator'] },
  { icon: UserCircle, label: 'Profile', path: '/dashboard/profile', roles: ['Urban Planner', 'Data Analyst', 'Government Official', 'System Administrator'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['Urban Planner', 'Data Analyst', 'Government Official', 'System Administrator'] },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { logout, role } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showNotification("Successfully logged out. Secure session terminated.", 'info');
    navigate('/login');
  };

  // Filter items based on user role
  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-secondary-900 text-secondary-300 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out border-r border-secondary-800"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-secondary-800">
        <div className="bg-primary-600 p-2 rounded-lg">
          <BrainCircuit className="text-white" size={24} />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-bold text-white text-lg tracking-tight truncate uppercase"
          >
            UrbanAI
          </motion.span>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-3 py-3 rounded-lg transition-all group relative
              ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'hover:bg-secondary-800 hover:text-white'}
            `}
          >
            <item.icon size={22} className="min-w-[22px]" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-4 font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-secondary-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-secondary-700">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Toggle Button */}
      <div className="p-4 border-t border-secondary-800 space-y-1">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-secondary-800 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span className="ml-2">Minimize</span>}
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="ml-2 text-left w-full">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
