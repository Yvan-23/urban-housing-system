import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, TrendingUp, Zap, Activity, RefreshCcw,
  Download, HelpCircle, Play, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const AIAnalytics = () => {
  const { showNotification } = useNotification();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeFactor, setActiveFactor] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/ai');
      setData(res.data?.data);
    } catch (err) {
      setError('Failed to load analytics data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRetrain = () => {
    if (isRetraining) return;
    setIsRetraining(true);
    setRetrainProgress(0);
    showNotification('Initializing ML retraining sequence…', 'info');
    const interval = setInterval(() => {
      setRetrainProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRetraining(false);
            showNotification('Model retraining complete.', 'success');
            fetchData();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const demandSeries  = data?.demandSeries  || [];
  const priceTrends   = data?.priceTrends   || [];
  const impactFactors = data?.impactFactors || [];
  const modelStats    = data?.modelStats    || {};

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Retraining overlay */}
      <AnimatePresence>
        {isRetraining && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-secondary-950/60 backdrop-blur-md rounded-3xl">
            <div className="text-center p-12 bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl border border-primary-500/30 max-w-md w-full">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary-100 dark:text-secondary-800" />
                  <motion.circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary-600"
                    strokeDasharray="283" animate={{ strokeDashoffset: 283 - (283 * retrainProgress) / 100 }} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit size={32} className="text-primary-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Neural Net Retraining</h3>
              <p className="text-sm text-secondary-500 mb-6">Processing {retrainProgress * 12}k samples…</p>
              <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary-600" style={{ width: `${retrainProgress}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            AI Analytics & Predictive Modeling
            <BrainCircuit className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">Machine learning insights derived from your housing database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleRetrain} disabled={isRetraining}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isRetraining ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed' : 'bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 text-secondary-900 dark:text-white'}`}>
            <RefreshCcw size={18} className={isRetraining ? 'animate-spin' : ''} />
            Retrain Model
          </button>
          <button onClick={() => showNotification('Generating analytical projection report…', 'success')}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Download size={18} />
            Export Forecast
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Records" value={loading ? '…' : modelStats.totalRecords ?? 0} change="In database" icon={Zap} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard label="ETL Jobs Run" value={loading ? '…' : modelStats.etlJobsRun ?? 0} change="All time" icon={ShieldCheck} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard label="Model Accuracy" value={loading ? '…' : `${modelStats.accuracy ?? 0}%`} change="Based on completed jobs" icon={Activity} color="text-amber-500" bg="bg-amber-500/10" />
        <StatCard label="Confidence" value={loading ? '…' : `${modelStats.confidence ?? 0}%`} change="Based on scenarios" icon={RefreshCcw} color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Housing Records Added (Monthly)</h3>
              <p className="text-sm text-secondary-500">Count of housing records added to the database per month.</p>
            </div>
          </div>
          <div className="h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>
            ) : demandSeries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary-400 gap-2">
                <BrainCircuit size={48} className="opacity-20" />
                <p className="text-sm">No housing data yet. Add records to see trends.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandSeries}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Impact Factors */}
        <div className="lg:col-span-1 card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Impact Factors</h3>
            <HelpCircle size={18} className="text-secondary-400" />
          </div>
          <p className="text-xs text-secondary-500 mb-8 leading-relaxed">
            Key variables derived from your housing database. Click to simulate sensitivity.
          </p>
          {loading ? (
            Array(4).fill(null).map((_, i) => <div key={i} className="h-12 bg-secondary-100 dark:bg-secondary-800 rounded-xl animate-pulse mb-4" />)
          ) : impactFactors.length === 0 ? (
            <p className="text-xs text-secondary-400 text-center py-8">No data available yet.</p>
          ) : (
            <div className="space-y-6">
              {impactFactors.map((feature, i) => (
                <motion.div key={feature.name || i}
                  onClick={() => { setActiveFactor(feature); showNotification(`Recalculating sensitivity for ${feature.name}…`, 'info'); setTimeout(() => setActiveFactor(null), 3000); }}
                  className={`space-y-3 cursor-pointer group p-3 rounded-2xl transition-all ${activeFactor?.name === feature.name ? 'bg-secondary-50 dark:bg-secondary-800 ring-2 ring-primary-500/20' : 'hover:bg-secondary-50/50'}`}>
                  <div className="flex justify-between text-xs font-bold">
                    <span className={activeFactor?.name === feature.name ? 'text-primary-600' : 'text-secondary-700 dark:text-secondary-300'}>{feature.name}</span>
                    <span className="text-secondary-900 dark:text-white font-black">{feature.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${feature.value}%` }} transition={{ duration: 1.5, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ backgroundColor: feature.color }} />
                  </div>
                  <AnimatePresence>
                    {activeFactor?.name === feature.name && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-secondary-500 leading-tight pt-1">{feature.desc}</motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 p-5 bg-gradient-to-br from-secondary-900 to-secondary-800 text-white rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">AI Recommendation</p>
              <p className="text-sm font-bold leading-tight mb-4">
                {impactFactors.length > 0 ? `Highest impact factor: ${impactFactors[0]?.name} at ${impactFactors[0]?.value}%` : 'Add housing data to generate recommendations.'}
              </p>
              <button onClick={handleRetrain} className="px-4 py-2 bg-white text-secondary-900 rounded-full font-bold text-[10px] flex items-center gap-2 hover:bg-white/90 transition-all active:scale-95">
                <Play size={10} fill="currentColor" /> Run Now
              </button>
            </div>
            <BrainCircuit className="absolute -right-6 -bottom-6 text-white/5" size={120} />
          </div>
        </div>
      </div>

      {/* Price Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-8">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6">Average Price by Year</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
            ) : priceTrends.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary-400 gap-2">
                <TrendingUp size={40} className="opacity-20" />
                <p className="text-sm">No price data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                  <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                    {priceTrends.map((_, index) => (
                      <Cell key={index} fill={index === priceTrends.length - 1 ? '#3b82f6' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-8 bg-primary-600 text-white border-none shadow-xl shadow-primary-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp size={24} /></div>
              <div>
                <h3 className="text-xl font-bold">Data Summary</h3>
                <p className="text-primary-100 text-sm">Live statistics from your housing database.</p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-xs py-3 border-b border-white/10">
                <span className="font-medium">Total Housing Records</span>
                <span className="font-bold">{loading ? '…' : modelStats.totalRecords ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-3 border-b border-white/10">
                <span className="font-medium">ETL Jobs Completed</span>
                <span className="font-bold">{loading ? '…' : modelStats.etlJobsRun ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-3">
                <span className="font-medium">Price Trend Years</span>
                <span className="font-bold">{loading ? '…' : priceTrends.length}</span>
              </div>
            </div>
            <button className="w-full py-3 bg-white text-primary-600 rounded-2xl font-bold text-sm hover:bg-primary-50 transition-colors">
              Download Full Audit Report
            </button>
          </div>
          <Zap className="absolute -right-8 -bottom-8 text-white/5" size={200} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change, icon: Icon, color, bg }) => (
  <motion.div whileHover={{ y: -5 }} className="card p-6 border-l-4 border-l-primary-500">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</h3>
      <span className="text-xs font-bold text-emerald-500">{change}</span>
    </div>
  </motion.div>
);

export default AIAnalytics;
