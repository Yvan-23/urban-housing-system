import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Monitor, 
  Moon, 
  Sun,
  Lock,
  Smartphone,
  Check,
  ChevronRight,
  Database,
  Users,
  Terminal,
  Activity
} from 'lucide-react';

const Settings = () => {
  const { role, logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('security');
  
  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Monitor },
  ];

  // Add system tab for admins
  if (role === 'System Administrator') {
    tabs.push({ id: 'system', label: 'System', icon: SettingsIcon });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <div className="space-y-6">
            <div className="card">
              <h4 className="font-bold text-lg mb-4">Password Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-sm">
                      <Lock size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Update Password</p>
                      <p className="text-xs text-secondary-500">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="text-primary-600 text-sm font-bold hover:underline">Change</button>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="font-bold text-lg mb-4">Multi-Factor Authentication</h4>
              <div className="flex items-center justify-between p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-sm">
                    <Smartphone size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Two-Step Verification</p>
                    <p className="text-xs text-secondary-500">Your account is protected by mandatory MFA</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                  <Check size={14} />
                  ACTIVE
                </div>
              </div>
              <button className="btn-secondary w-full text-sm">Manage Recovery Codes</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="card">
            <h4 className="font-bold text-lg mb-6">Notification Preferences</h4>
            <div className="space-y-6">
              {[
                { title: 'Project Updates', desc: 'Alert me when a project status changes' },
                { title: 'AI Forecast Alerts', desc: 'Notifications for significant demand shifts' },
                { title: 'Collaboration Mentions', desc: 'When team members mention you in a comment' },
                { title: 'Security Alerts', desc: 'Logins from new devices or locations' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-secondary-500">{item.desc}</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i !== 2} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="card">
            <h4 className="font-bold text-lg mb-6">Appearance Settings</h4>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex flex-col items-center gap-3 p-4 border-2 border-primary-500 rounded-2xl bg-white dark:bg-secondary-900">
                <Sun size={24} className="text-primary-600" />
                <span className="font-bold text-sm">Light Mode</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 border border-secondary-200 dark:border-secondary-800 rounded-2xl bg-secondary-50 dark:bg-secondary-950">
                <Moon size={24} className="text-secondary-400" />
                <span className="font-bold text-sm">Dark Mode</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-semibold text-secondary-500">System Language</label>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                <select className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none">
                  <option>English (United States)</option>
                  <option>English (United Kingdom)</option>
                  <option>French (France)</option>
                  <option>Spanish (Spain)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card hover:border-primary-500/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Database size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-bold">Database Health</h5>
                    <p className="text-xs text-secondary-500">Last backup: 2h ago</p>
                  </div>
                </div>
              </div>
              <div className="card hover:border-primary-500/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Activity size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-bold">API Logs</h5>
                    <p className="text-xs text-secondary-500">Avg response: 124ms</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Terminal size={18} />
                Audit Log Configuration
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retention Period</span>
                  <select className="bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 rounded-lg px-2 py-1 text-sm">
                    <option>90 Days</option>
                    <option>1 Year</option>
                    <option>Forever</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verbosity Level</span>
                  <span className="text-xs font-bold text-primary-600">HIGH</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Account Settings</h1>
        <p className="text-secondary-500">Manage your credentials, preferences, and system access.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-bold text-sm">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
          
          <div className="pt-8">
            <button 
              onClick={() => {
                logout();
                showNotification("Session terminated", "info");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm"
            >
              <Lock size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
