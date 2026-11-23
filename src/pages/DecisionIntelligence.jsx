import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, Target, Scaling, Zap, FileText, ArrowRight,
  AlertCircle, RefreshCw, Loader2, DollarSign, Building2
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const DecisionIntelligence = () => {
  const { showNotification } = useNotification();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/decision');
      setData(res.data?.data);
    } catch (err) {
      setError('Failed to load decision intelligence data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const policyRadar    = data?.policyRadar    || [];
  const allocationData = data?.allocationData || [];
  const housingGap     = data?.housingGap     || [];
  const affordability  = data?.affordability  || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Decision Intelligence Engine
            <Lightbulb className="text-amber-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">AI-driven policy simulations and resource optimization recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => { showNotification('Running multi-variable policy simulation…', 'info'); setTimeout(() => showNotification('Simulation complete.', 'success'), 2500); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 rounded-xl font-bold text-sm transition-colors">
            <Scaling size={16} />
            Run Optimization
          </button>
          <button onClick={() => showNotification('Exporting Decision Brief…', 'success')}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <FileText size={16} />
            Export Brief
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Radar */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Policy Impact Simulation</h3>
              <p className="text-sm text-secondary-500">Derived from your live housing database metrics.</p>
            </div>
          </div>
          <div className="h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>
            ) : policyRadar.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary-400 gap-2">
                <Lightbulb size={48} className="opacity-20" />
                <p className="text-sm">No data available. Add housing records to generate insights.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={policyRadar}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Current State" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Allocation */}
        <div className="lg:col-span-1 card p-8">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6">Property Type Allocation</h3>
          <p className="text-sm text-secondary-500 mb-8">Current vs recommended distribution by property type.</p>
          <div className="space-y-6">
            {loading ? (
              Array(4).fill(null).map((_, i) => <div key={i} className="h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl animate-pulse" />)
            ) : allocationData.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-8">No property type data yet.</p>
            ) : (
              allocationData.map((item, i) => {
                const gap = item.recommended - item.allocated;
                return (
                  <div key={i} className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-100 dark:border-secondary-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-secondary-700 dark:text-secondary-300">{item.name}</span>
                      <span className={`text-xs font-bold ${gap > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {gap > 0 ? `+${gap} needed` : `${Math.abs(gap)} surplus`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (item.allocated / Math.max(item.recommended, 1)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-secondary-900 dark:text-white">{item.allocated}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-8">
            <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
              Apply Optimized Budget <Zap size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Housing Gap by District */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl"><Target size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Housing by District</h3>
              <p className="text-xs text-secondary-500">Available vs total units per district.</p>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(null).map((_, i) => <div key={i} className="h-12 bg-secondary-100 dark:bg-secondary-800 rounded-2xl animate-pulse" />)
            ) : housingGap.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-8">No district data yet.</p>
            ) : (
              housingGap.map((d, i) => (
                <div key={i} className="p-4 border border-secondary-100 dark:border-secondary-800 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>{d.district}</span>
                    <span>{d.pct}% Available</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                    <div className={`h-full ${d.pct >= 50 ? 'bg-emerald-500' : d.pct >= 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Affordability Index */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><Scaling size={24} /></div>
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Affordability Index</h3>
              <p className="text-xs text-secondary-500">Calculated from housing price data.</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[180px]">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary-100 dark:text-secondary-800" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 * (1 - (affordability.affordabilityScore || 0) / 100)}
                  className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-secondary-900 dark:text-white">
                  {loading ? '…' : affordability.affordabilityScore ?? 0}
                </span>
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Score</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl text-center">
            <p className="text-xs text-secondary-600 dark:text-secondary-400">
              Status: <span className="font-bold text-secondary-900 dark:text-white">{loading ? '…' : affordability.status ?? 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* What-If */}
        <div className="card p-8 bg-primary-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">What-If Analysis</h3>
            <p className="text-primary-100 text-sm mb-8 leading-relaxed">
              Test the impact of potential policy changes before official implementation.
            </p>
            <div className="space-y-4">
              {['Interest Rate +0.5%', 'Zoning Relaxation', 'Infrastructure Subsidy'].map(item => (
                <div key={item} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20">
                  <span className="text-xs font-medium">{item}</span>
                  <ArrowRight size={14} />
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors">
              Create Custom Scenario
            </button>
          </div>
          <Scaling className="absolute -right-6 -bottom-6 text-white/10" size={140} />
        </div>
      </div>
    </div>
  );
};

export default DecisionIntelligence;
