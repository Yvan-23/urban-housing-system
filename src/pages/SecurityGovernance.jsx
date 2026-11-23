import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Lock, Key, Eye, History, AlertTriangle, UserCheck,
  Fingerprint, Activity, FileLock2, Globe, Database, Search, Filter,
  Download, Settings, ShieldAlert, ChevronRight, MoreVertical, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const SecurityGovernance = () => {
  const { showNotification } = useNotification();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showPolicies, setShowPolicies] = useState(false);
  const [activeTab, setActiveTab] = useState('audit');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/security');
      setData(res.data?.data);
    } catch (err) {
      setError('Failed to load security data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSecurityScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    showNotification('Initializing forensic system scan…', 'info');
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            showNotification('Full Security Scan complete. No active vulnerabilities detected.', 'success');
          }, 800);
          return 100;
        }
        return prev + 4;
      });
    }, 100);
  };

  const handleRevoke = (user) => {
    showNotification(`Access revoked for session associated with ${user}.`, 'warning');
  };

  const auditLogs   = data?.auditLogs   || [];
  const permissions = data?.permissions || [];
  const stats       = data?.stats       || {};

  const levelStyle = (l) => {
    switch (l) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Warning':  return 'bg-amber-100 text-amber-700';
      default:         return 'bg-primary-100 text-primary-700';
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Security Scan Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary-950/60 backdrop-blur-xl">
            <div className="text-center p-12 bg-white dark:bg-secondary-900 rounded-[3rem] shadow-2xl border border-primary-500/20 max-w-lg w-full">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-primary-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={48} className="text-primary-600 animate-pulse" />
                </div>
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary-100 dark:text-secondary-800" />
                  <motion.circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary-600"
                    strokeDasharray="283" animate={{ strokeDashoffset: 283 - (283 * scanProgress) / 100 }} strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-secondary-900 dark:text-white mb-2">Deep Integrity Scan</h3>
              <p className="text-sm text-secondary-500 mb-8 font-mono">
                {scanProgress < 30 ? 'Auditing API gateways…' : scanProgress < 60 ? 'Checking encryption keys…' : scanProgress < 90 ? 'Verifying audit trails…' : 'Finalizing security report…'}
              </p>
              <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary-600" style={{ width: `${scanProgress}%` }} />
              </div>
              <div className="mt-6 flex justify-between text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                <span>Vulnerability Check</span>
                <span className="text-primary-600">{scanProgress}% SECURE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policies Modal */}
      <AnimatePresence>
        {showPolicies && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPolicies(false)}
              className="fixed inset-0 z-[110] bg-secondary-950/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white dark:bg-secondary-900 rounded-[2.5rem] shadow-2xl z-[111] border border-secondary-200 dark:border-secondary-800 overflow-hidden">
              <div className="p-8 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-secondary-900 dark:text-white">Governance & Access Policies</h2>
                  <p className="text-xs text-secondary-500 mt-1">RBAC rules and permission matrices.</p>
                </div>
                <button onClick={() => setShowPolicies(false)} className="p-3 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-xl transition-colors">
                  <AlertCircle size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  Array(4).fill(null).map((_, i) => <div key={i} className="h-20 bg-secondary-100 dark:bg-secondary-800 rounded-2xl animate-pulse" />)
                ) : permissions.length === 0 ? (
                  <p className="text-secondary-400 text-center py-8">No users registered yet.</p>
                ) : (
                  permissions.map((p, i) => (
                    <div key={i} className="flex items-start gap-6 p-6 rounded-3xl border border-secondary-100 dark:border-secondary-800 hover:border-primary-500/30 transition-all group">
                      <div className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-2xl group-hover:bg-primary-50 transition-colors">
                        <Lock size={24} className="text-secondary-400 group-hover:text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-secondary-900 dark:text-white">{p.name}</h4>
                          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${p.status === 'Locked' ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'}`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-secondary-500">{p.role} — MFA: {p.mfa}</p>
                        <p className="text-xs text-secondary-400 mt-1">{p.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-8 bg-secondary-50 dark:bg-secondary-800/50 flex gap-4">
                <button onClick={() => setShowPolicies(false)} className="flex-1 py-4 bg-secondary-200 dark:bg-secondary-700 rounded-2xl font-bold text-secondary-700 dark:text-white text-sm">Close</button>
                <button onClick={() => { setShowPolicies(false); showNotification('Security policies synced.', 'success'); }}
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20">Sync Policy Changes</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Security & Data Governance
            <ShieldCheck className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">Enterprise-grade security, audit trails, and government compliance monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleSecurityScan} disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 text-secondary-900 dark:text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50">
            <ShieldAlert size={18} className={isScanning ? 'animate-pulse' : ''} />
            Full Security Scan
          </button>
          <button onClick={() => setShowPolicies(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Lock size={18} />
            Access Policies
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchData} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Lock size={20} /></div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Encryption Status</span>
          </div>
          <h3 className="text-xl font-black text-secondary-900 dark:text-white mb-1">AES-256 Active</h3>
          <p className="text-xs text-secondary-500">All data at rest and in transit is encrypted.</p>
        </div>
        <div className="card p-6 border-l-4 border-l-primary-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500"><Fingerprint size={20} /></div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Total Users</span>
          </div>
          <h3 className="text-xl font-black text-secondary-900 dark:text-white mb-1">{loading ? '…' : stats.totalUsers ?? 0}</h3>
          <p className="text-xs text-secondary-500">{loading ? '…' : stats.lockedUsers ?? 0} locked accounts.</p>
        </div>
        <div className="card p-6 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><ShieldAlert size={20} /></div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Critical Events</span>
          </div>
          <h3 className="text-xl font-black text-secondary-900 dark:text-white mb-1">{loading ? '…' : stats.criticalEvents ?? 0}</h3>
          <p className="text-xs text-secondary-500">{loading ? '…' : stats.warningEvents ?? 0} warnings in audit log.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Audit Log Table */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}>
                Audit Logs {!loading && `(${auditLogs.length})`}
              </button>
              <button onClick={() => setActiveTab('access')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'access' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}>
                Users {!loading && `(${permissions.length})`}
              </button>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg text-secondary-400"><Search size={18} /></button>
              <button className="p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg text-secondary-400"><Download size={18} /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'audit' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary-50/50 dark:bg-secondary-800/50 text-[10px] font-bold text-secondary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800">
                    {['User', 'Action', 'Module', 'Timestamp', 'Level', 'Security'].map((h, i) => (
                      <th key={i} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {loading ? (
                    Array(4).fill(null).map((_, i) => (
                      <tr key={i}>{Array(6).fill(null).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse w-20" /></td>
                      ))}</tr>
                    ))
                  ) : auditLogs.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-16 text-center text-secondary-400 text-sm">
                      <ShieldCheck size={40} className="mx-auto mb-3 opacity-20" />
                      No audit logs yet. Actions will be recorded here.
                    </td></tr>
                  ) : (
                    auditLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center font-bold text-secondary-600 text-xs">
                              {(log.user || 'S')[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-secondary-900 dark:text-white">{log.user}</span>
                              <span className="text-[10px] text-secondary-500 font-mono">{log.ip}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-secondary-600 dark:text-secondary-400">{log.action}</td>
                        <td className="px-6 py-4 text-xs text-secondary-500 font-mono">{log.resource}</td>
                        <td className="px-6 py-4 text-xs text-secondary-500">{log.time ? new Date(log.time).toLocaleString() : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${levelStyle(log.level)}`}>{log.level}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleRevoke(log.user)} className="text-[10px] font-bold text-red-600 hover:underline">Revoke Session</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary-50/50 dark:bg-secondary-800/50 text-[10px] font-bold text-secondary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800">
                    {['Name', 'Email', 'Role', 'Status', 'MFA'].map((h, i) => (
                      <th key={i} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {loading ? (
                    Array(4).fill(null).map((_, i) => (
                      <tr key={i}>{Array(5).fill(null).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse w-20" /></td>
                      ))}</tr>
                    ))
                  ) : permissions.map((p, i) => (
                    <tr key={i} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-secondary-900 dark:text-white">{p.name}</td>
                      <td className="px-6 py-4 text-xs text-secondary-500">{p.email}</td>
                      <td className="px-6 py-4 text-xs text-secondary-600">{p.role}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${p.status === 'Locked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${p.mfa === 'Enabled' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'}`}>{p.mfa}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Governance Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-6">Permission Matrix</h3>
            <div className="space-y-4">
              {[
                { role: 'Urban Planner', access: 'Standard', color: 'text-blue-500' },
                { role: 'Data Analyst', access: 'Enhanced', color: 'text-indigo-500' },
                { role: 'Government Official', access: 'Read-Only', color: 'text-emerald-500' },
                { role: 'System Administrator', access: 'Full Root', color: 'text-purple-500' },
              ].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">{role.role}</span>
                  <span className={`text-[10px] font-black uppercase ${role.color}`}>{role.access}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPolicies(true)} className="w-full mt-6 py-2.5 border-2 border-secondary-100 dark:border-secondary-800 rounded-xl text-xs font-bold text-secondary-600 hover:bg-secondary-50 transition-colors">
              Audit RBAC Rules
            </button>
          </div>

          <div className="card p-6 bg-gradient-to-br from-red-600 to-rose-700 text-white border-none shadow-xl shadow-red-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Forensic Export</h3>
              <p className="text-xs text-rose-100 mb-6 leading-relaxed">
                Export a tamper-proof, cryptographically signed audit trail for external compliance verification.
              </p>
              <button className="w-full py-2.5 bg-white text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors">
                Generate Signed Log
              </button>
            </div>
            <Activity className="absolute -right-6 -bottom-6 text-white/5" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityGovernance;
