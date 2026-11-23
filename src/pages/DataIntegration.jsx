import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCcw, Database, Activity, AlertCircle, CheckCircle2,
  Plus, Clock, ShieldCheck, Zap, Play, FileJson, Table as TableIcon,
  Globe, Trash2, Loader2
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const DataIntegration = () => {
  const { showNotification } = useNotification();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/etl');
      setData(res.data?.data);
    } catch (err) {
      setError('Failed to load ETL data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showNotification('Probing source endpoints…', 'info');
    await fetchData();
    setIsRefreshing(false);
    showNotification('Integration health check complete.', 'success');
  };

  const handleTriggerJob = async (sourceName) => {
    showNotification(`Triggering ETL pipeline for ${sourceName}…`, 'info');
    try {
      await api.post('/etl/start', { source: sourceName });
      showNotification('ETL pipeline started.', 'success');
      setTimeout(fetchData, 2000);
    } catch {
      showNotification('Failed to start ETL job.', 'error');
    }
  };

  const jobHistory  = data?.jobHistory  || [];
  const healthSeries = data?.healthSeries || [];
  const summary     = data?.summary     || {};

  const statusStyle = (s) => {
    if (!s) return 'bg-secondary-100 text-secondary-600';
    switch (s.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'running':   return 'bg-blue-100 text-blue-700 animate-pulse';
      case 'failed':    return 'bg-red-100 text-red-700';
      default:          return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Data Integration & ETL Pipeline
            <RefreshCcw className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">
            {loading ? 'Loading…' : `${summary.total ?? 0} total jobs — ${summary.running ?? 0} running, ${summary.failed ?? 0} failed.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="p-2.5 bg-secondary-100 dark:bg-secondary-800 rounded-xl hover:bg-secondary-200 transition-colors">
            <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => showNotification('Initializing Source Connection Wizard.', 'info')}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Plus size={18} />
            Connect New Source
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: summary.total ?? 0, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Completed', value: summary.completed ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Running', value: summary.running ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Failed', value: summary.failed ?? 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`card p-4 ${s.bg} dark:bg-opacity-10`}>
            <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Chart */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Pipeline Activity (Monthly)</h3>
              <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary-500" /> Jobs Run</div>
              </div>
            </div>
            <div className="h-[250px]">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
              ) : healthSeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-secondary-400 text-sm">No ETL jobs recorded yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ETL Job Log Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-6">
              Recent Pipeline Logs {!loading && `(${jobHistory.length})`}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {loading ? (
                Array(4).fill(null).map((_, i) => <div key={i} className="h-20 bg-secondary-100 dark:bg-secondary-800 rounded-2xl animate-pulse" />)
              ) : jobHistory.length === 0 ? (
                <div className="py-8 text-center text-secondary-400 text-sm">
                  <Database size={32} className="mx-auto mb-2 opacity-20" />
                  No ETL jobs yet. Trigger one to get started.
                </div>
              ) : (
                jobHistory.map((job, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-secondary-100 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-800/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300 truncate max-w-[150px]">{job.name}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${statusStyle(job.status)}`}>{job.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-secondary-400 uppercase tracking-wider mt-3">
                      <div className="flex items-center gap-1.5"><Activity size={12} /> {job.records} rows</div>
                      <div className="flex items-center gap-1.5"><Clock size={12} /> {job.duration}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => handleTriggerJob('Manual Upload')}
              className="w-full mt-6 py-3 border-2 border-secondary-100 dark:border-secondary-800 rounded-xl text-xs font-bold text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2">
              <Play size={14} /> Trigger Manual Job
            </button>
          </div>

          <div className="card p-6 bg-gradient-to-br from-indigo-600 to-primary-700 text-white border-none shadow-xl shadow-indigo-500/20">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Data Quality Guard</h3>
            <p className="text-xs text-indigo-100 mb-6 leading-relaxed">
              Validation rules are active. Schema drifts are automatically flagged.
            </p>
            <div className="space-y-3">
              {['Null Value Checks', 'Type Matching', 'Duplicate Detection'].map(rule => (
                <div key={rule} className="flex items-center justify-between text-xs font-medium py-2 border-b border-white/10">
                  <span>{rule}</span>
                  <span className="font-bold">Active</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
              Modify Guard Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIntegration;
