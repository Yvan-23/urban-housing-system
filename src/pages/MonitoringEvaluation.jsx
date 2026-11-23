import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Target, AlertCircle, CheckCircle2, Download,
  Filter, Search, Zap, Building2, TrendingUp, TrendingDown,
  MoreVertical, RefreshCw, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ComposedChart
} from 'recharts';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const MonitoringEvaluation = () => {
  const { showNotification } = useNotification();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/monitoring');
      setData(res.data?.data);
    } catch (err) {
      setError('Failed to load monitoring data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const kpis            = data?.kpis            || {};
  const projectStatus   = data?.projectStatus   || [];
  const performanceSeries = data?.performanceSeries || [];
  const evalScores      = data?.evalScores      || [];

  const statusStyle = (s) => {
    if (!s) return 'bg-secondary-100 text-secondary-600';
    switch (s) {
      case 'Ahead':    return 'bg-emerald-100 text-emerald-700';
      case 'On Track': return 'bg-primary-100 text-primary-700';
      default:         return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Monitoring & Evaluation
            <Activity className="text-emerald-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">Track implementation progress, KPI targets, and program accountability.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => { showNotification('Running audit…', 'info'); setTimeout(() => showNotification('Audit complete.', 'success'), 2000); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 rounded-xl font-bold text-sm transition-colors">
            <CheckCircle2 size={16} />
            Run Audit
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Download size={16} />
            Download M&E Report
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Task Completion', value: loading ? '…' : `${kpis.overallProgress ?? 0}%`, change: `${kpis.doneTasks ?? 0}/${kpis.totalTasks ?? 0} done`, icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Completed Scenarios', value: loading ? '…' : kpis.completedScenarios ?? 0, change: 'Simulations done', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Draft Scenarios', value: loading ? '…' : kpis.delayedScenarios ?? 0, change: 'Pending simulation', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Tasks', value: loading ? '…' : kpis.totalTasks ?? 0, change: 'Across all users', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="card p-6 border-b-4 border-b-secondary-100 dark:border-b-secondary-800 hover:border-b-primary-500 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} dark:bg-opacity-10 ${kpi.color}`}><kpi.icon size={20} /></div>
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{kpi.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-secondary-900 dark:text-white">{kpi.value}</h3>
              <span className="text-xs font-bold text-secondary-400">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Scenario Completions (Monthly)</h3>
              <p className="text-sm text-secondary-500">Number of scenarios completed per month.</p>
            </div>
          </div>
          <div className="h-[350px]">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
            ) : performanceSeries.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary-400 text-sm">No scenario data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Evaluation Scores */}
        <div className="lg:col-span-1 card p-8">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6">Data Quality Scores</h3>
          <p className="text-sm text-secondary-500 mb-8">Completeness metrics from your housing database.</p>
          <div className="space-y-6">
            {loading ? (
              Array(4).fill(null).map((_, i) => <div key={i} className="h-8 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse" />)
            ) : evalScores.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-4">No data available.</p>
            ) : (
              evalScores.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-secondary-600 dark:text-secondary-400">{item.label}</span>
                    <span className="text-secondary-900 dark:text-white">{item.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 p-5 bg-secondary-900 text-white rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">M&E Insight</p>
              <p className="text-sm font-bold leading-tight">
                {evalScores.length > 0
                  ? `Lowest score: ${evalScores.sort((a, b) => a.score - b.score)[0]?.label} at ${evalScores.sort((a, b) => a.score - b.score)[0]?.score}%. Improve data entry.`
                  : 'Add housing data to generate insights.'}
              </p>
            </div>
            <AlertCircle className="absolute -right-4 -bottom-4 text-white/5" size={80} />
          </div>
        </div>
      </div>

      {/* Project Status Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
            Scenario Tracking {!loading && `(${projectStatus.length})`}
          </h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg text-secondary-400"><Filter size={18} /></button>
            <button className="p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg text-secondary-400"><Search size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50/50 dark:bg-secondary-800/50 text-[10px] font-bold text-secondary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800">
                {['Scenario Name', 'District', 'Status', 'Progress', 'Trend', ''].map((h, i) => (
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
              ) : projectStatus.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-secondary-400 text-sm">
                  <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                  No scenarios yet. Create one in Scenario Planning.
                </td></tr>
              ) : (
                projectStatus.map((project, i) => (
                  <tr key={i} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-600">
                          <Building2 size={16} />
                        </div>
                        <span className="text-sm font-bold text-secondary-900 dark:text-white">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-500">{project.district}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${statusStyle(project.status)}`}>{project.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-secondary-900 dark:text-white">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> :
                       project.trend === 'down' ? <TrendingDown size={16} className="text-red-500" /> :
                       <Activity size={16} className="text-secondary-400" />}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitoringEvaluation;
