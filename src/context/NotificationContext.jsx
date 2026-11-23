import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('urban_notification_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, message: 'Welcome to UrbanAI Intelligence', type: 'info', time: 'Just now', read: false },
      { id: 2, message: 'Security scan completed successfully', type: 'success', time: '2h ago', read: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('urban_notification_history', JSON.stringify(history));
  }, [history]);

  const showNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    // Show Toast
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Add to History
    setHistory((prev) => [
      { id, message, type, time: 'Just now', read: false },
      ...prev.slice(0, 49) // Keep last 50
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAllAsRead = () => {
    setHistory((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const unreadCount = history.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ showNotification, history, unreadCount, markAllAsRead, clearHistory }}>
      {children}
      
      {/* Toast Overlay */}
      <div className="fixed top-24 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl
                ${n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
                  n.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 
                  'bg-secondary-900/95 border-white/10 text-white'}
              `}>
                {n.type === 'success' && <CheckCircle2 size={20} />}
                {n.type === 'error' && <AlertCircle size={20} />}
                {n.type === 'info' && <Info size={20} />}
                <span className="text-sm font-bold tracking-tight">{n.message}</span>
                <button 
                  onClick={() => removeToast(n.id)}
                  className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
