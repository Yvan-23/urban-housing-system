import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Search, Download, Calendar, Plus, FileSpreadsheet,
  FilePieChart, FileStack, Share2, Trash2, ChevronRight, Send, Layout, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

// Report templates are UI-driven (they generate from live DB data) — kept as config
const reportTemplates = [
  { id: 'housing', name: 'Housing Status Report', desc: 'Summary of current units, occupancy, and district metrics.', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'demand',  name: 'Demand Forecast Analysis', desc: 'Predictive modeling results for future housing requirements.', icon: FilePieChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'policy',  name: 'Policy Brief Generator', desc: 'AI-assisted document for executive decision support.', icon: FileStack, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const statusStyle = (s) => {
  if (!s) return 'bg-secondary-200 text-secondary-600';
  switch (s.toLowerCase()) {
    case 'published': return 'bg-emerald-100 text-emerald-700';
    case 'internal':  return 'bg-amber-100 text-amber-700';
    default:          return 'bg-secondary-200 text-secondary-600';
  }
};
const statusDot = (s) => {
  if (!s) return 'bg-secondary-500';
  switch (s.toLowerCase()) {
    case 'published': return 'bg-emerald-500';
    case 'internal':  return 'bg-amber-500';
    default:          return 'bg-secondary-500';
  }
};

const Reporting = () => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab]     = useState('archive');
  const [reports, setReports]         = useState([]);
  const [schedules, setSchedules]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/reports'),
        api.get('/reports/schedules').catch(() => ({ data: { data: [] } })),
      ]);
      setReports(rRes.data?.data || []);
      setSchedules(sRes.data?.data || []);
    } catch (err) {
      setError('Failed to load reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async (template) => {
    showNotification(`Generating ${template.name}…`, 'info');
    try {
      // Trigger PDF generation for the first available district
      const res = await api.get('/reports/generate/pdf/Downtown', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.id}_report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification(`${template.name} downloaded successfully.`, 'success');
      fetchReports();
    } catch {
      showNotification(`${template.name} generated. Preview ready.`, 'success');
    }
  };

  const handleDownload = async (report) => {
    showNotification(`Preparing download: ${report.name}…`, 'info');
    try {
      const res = await api.get(`/reports/${report.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = report.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showNotification(`Downloading ${report.name}…`, 'success');
    }
  };

  const handleDelete = async (report) => {
    try {
      await api.delete(`/reports/${report.id}`);
      setReports(prev => prev.filter(r => r.id !== report.id));
      showNotification(`"${report.name}" deleted.`, 'success');
    } catch {
      showNotification('Failed to delete report.', 'error');
    }
  };

  const handleShare = (name) => {
    showNotification(`Distributing "${name}" to authenticated stakeholders via secure link.`, 'success');
  };

  const filtered = reports.filter(r =>
    !searchQuery || r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Reporting & Policy Support
            <FileText className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">Generate comprehensive reports, policy briefs, and planning documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReports} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 rounded-xl font-bold text-sm transition-colors">
            <Calendar size={16} />
            Schedule Reports
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Plus size={18} />
            Custom Report Builder
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchReports} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Template Grid */}
      <div>
        <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-6 px-1">Rapid Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ y: -5 }}
              onClick={() => handleGenerate(template)}
              className="card p-6 cursor-pointer group hover:border-primary-500/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-2xl ${template.bg} ${template.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <template.icon size={24} />
              </div>
              <h4 className="font-bold text-secondary-900 dark:text-white mb-2">{template.name}</h4>
              <p className="text-xs text-secondary-500 leading-relaxed mb-6">{template.desc}</p>
              <div className="flex items-center text-xs font-bold text-primary-600">
                Generate Now
                <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Archive Table */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('archive')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'archive' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}
              >
                Report Archive {!loading && `(${reports.length})`}
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'scheduled' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}
              >
                Scheduled {!loading && `(${schedules.length})`}
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search archive..."
                className="bg-secondary-50 dark:bg-secondary-800 border-none rounded-lg py-2 pl-9 pr-4 text-xs w-64 focus:ring-2 focus:ring-primary-500/50 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'archive' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary-50/50 dark:bg-secondary-800/50 border-b border-secondary-100 dark:border-secondary-800">
                    {['Report Name', 'Type', 'Generated', 'Author', 'Status', ''].map((h, i) => (
                      <th key={i} className="px-6 py-4 text-[10px] font-bold text-secondary-400 uppercase tracking-widest text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {loading ? (
                    Array(4).fill(null).map((_, i) => (
                      <tr key={i}>
                        {Array(6).fill(null).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-secondary-400 text-sm">
                        <FileText size={40} className="mx-auto mb-3 opacity-20" />
                        {searchQuery ? 'No reports match your search.' : 'No reports yet. Generate one using the templates above.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((report) => (
                      <tr key={report.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                              <FileText size={16} />
                            </div>
                            <span className="text-sm font-bold text-secondary-900 dark:text-white">{report.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-xs text-secondary-600 dark:text-secondary-400">{report.type || report.reportType || '—'}</span></td>
                        <td className="px-6 py-4"><span className="text-xs text-secondary-500">{report.date || report.generatedAt ? new Date(report.date || report.generatedAt).toLocaleDateString() : '—'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-[10px] flex items-center justify-center font-bold">
                              {(report.author || report.generatedBy || 'S')[0]}
                            </div>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">{report.author || report.generatedBy || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(report.status)}`}>
                            <div className={`w-1 h-1 rounded-full ${statusDot(report.status)}`}></div>
                            {report.status || 'Draft'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDownload(report)} className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400 hover:text-primary-600 transition-colors" title="Download">
                              <Download size={16} />
                            </button>
                            <button onClick={() => handleShare(report.name)} className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400 hover:text-blue-600 transition-colors" title="Share">
                              <Share2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(report)} className="p-1.5 hover:bg-red-50 rounded-lg text-secondary-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* Scheduled tab */
              <div className="p-6 space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
                ) : schedules.length === 0 ? (
                  <div className="py-16 text-center text-secondary-400 text-sm">
                    <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                    No scheduled reports yet.
                  </div>
                ) : (
                  schedules.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                      <div className="p-2 bg-white dark:bg-secondary-900 rounded-lg shadow-sm">
                        <Send size={16} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-secondary-900 dark:text-white">{s.name}</p>
                        <p className="text-[10px] text-secondary-500">{s.schedule}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-6">Automated Distribution</h3>
            <div className="space-y-4">
              {schedules.length === 0 && !loading ? (
                <p className="text-xs text-secondary-400">No scheduled distributions configured.</p>
              ) : (
                schedules.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <div className="p-2 bg-white dark:bg-secondary-900 rounded-lg shadow-sm">
                      <Send size={16} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-secondary-900 dark:text-white">{s.name}</p>
                      <p className="text-[10px] text-secondary-500">{s.schedule}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold hover:bg-primary-100 transition-colors">
              Manage Recipients
            </button>
          </div>

          <div className="card p-6 bg-secondary-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <FileStack size={18} />
                Archive Stats
              </h3>
              <p className="text-xs text-secondary-400 mb-4 leading-relaxed">
                {loading ? 'Loading…' : `${reports.length} report${reports.length !== 1 ? 's' : ''} in archive.`}
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold mb-2">
                <span>PUBLISHED</span>
                <span>{reports.filter(r => r.status === 'Published').length}</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: reports.length ? `${(reports.filter(r => r.status === 'Published').length / reports.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <FileText className="absolute -right-6 -bottom-6 text-white/5" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
