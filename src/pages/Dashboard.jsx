import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import {
  Users, Home, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight,
  Filter, Download, Calendar, Database, ShieldCheck, Activity, Zap,
  Globe, DollarSign, BarChart3, FileText, UserCheck, RefreshCw, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon: Icon, isPositive, onClick, loading }) => (
  <div
    onClick={onClick}
    className="card hover:border-primary-500/50 transition-colors group cursor-pointer active:scale-[0.98]"
  >
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="text-secondary-500 text-sm font-medium truncate">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse mt-1" />
        ) : (
          <h3 className="text-2xl font-bold mt-1 group-hover:text-primary-600 transition-colors truncate">
            {value ?? '—'}
          </h3>
        )}
        {sub && (
          <div className={`flex items-center mt-2 text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={14} className="mr-1 shrink-0" /> : <ArrowDownRight size={14} className="mr-1 shrink-0" />}
            <span className="truncate">{sub}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors ml-3 shrink-0">
        <Icon size={24} className="text-primary-600" />
      </div>
    </div>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan={10} className="py-12 text-center text-secondary-400 text-sm">{message}</td>
  </tr>
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, role } = useAuth();

  const [loading, setLoading]       = useState(true);
  const [metrics, setMetrics]       = useState(null);
  const [charts, setCharts]         = useState(null);
  const [tableData, setTableData]   = useState([]);
  const [tableRole, setTableRole]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedTime, setSelectedTime] = useState('Last 7 Days');
  const [error, setError]           = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, chartsRes, tableRes] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getCharts(),
        dashboardService.getTableData(),
      ]);
      setMetrics(metricsRes.data);
      setCharts(chartsRes);
      setTableData(tableRes.data || []);
      setTableRole(tableRes.role || role);
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Export ────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    showNotification('Generating report…', 'info');
    const iv = setInterval(() => {
      setExportProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            setIsExporting(false);
            showNotification('Report generated successfully.', 'success');
          }, 400);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    showNotification(`Dashboard refreshed for ${selectedTime}.`, 'success');
    fetchAll();
  };

  const handleCardClick = (title, path) => {
    if (path) { navigate(path); }
    else { showNotification(`Opening ${title}…`, 'info'); }
  };

  // ─── Role-based stat cards ─────────────────────────────────────────────────

  const renderRoleStats = () => {
    if (!metrics) return Array(4).fill(null).map((_, i) => (
      <StatCard key={i} title="Loading…" value="" icon={Activity} loading={true} isPositive={true} />
    ));

    switch (role) {
      case 'System Administrator':
        return (
          <>
            <StatCard title="Total Users" value={metrics.totalUsers} sub={`${metrics.totalUsers} registered`} icon={Users} isPositive={true} onClick={() => handleCardClick('Users', '/dashboard/security')} />
            <StatCard title="Active ETL Jobs" value={metrics.activeETLJobs} sub={metrics.activeETLJobs > 0 ? 'Running now' : 'All idle'} icon={Zap} isPositive={metrics.activeETLJobs === 0} onClick={() => handleCardClick('ETL Jobs', '/dashboard/integration')} />
            <StatCard title="Failed Jobs" value={metrics.failedETLJobs} sub={metrics.failedETLJobs > 0 ? 'Needs attention' : 'All healthy'} icon={AlertCircle} isPositive={metrics.failedETLJobs === 0} onClick={() => handleCardClick('Failed Jobs', '/dashboard/integration')} />
            <StatCard title="Housing Records" value={metrics.totalHousingUnits} sub={`${metrics.availableUnits} available`} icon={Home} isPositive={true} onClick={() => handleCardClick('Housing', '/dashboard/repository')} />
          </>
        );
      case 'Data Analyst':
        return (
          <>
            <StatCard title="Housing Records" value={metrics.totalHousingUnits} sub={`${metrics.availableUnits} available`} icon={Database} isPositive={true} onClick={() => handleCardClick('Housing Data', '/dashboard/repository')} />
            <StatCard title="Active ETL Jobs" value={metrics.activeETLJobs} sub={`${metrics.completedETLJobs} completed`} icon={Zap} isPositive={true} onClick={() => handleCardClick('ETL Jobs', '/dashboard/integration')} />
            <StatCard title="Failed Jobs" value={metrics.failedETLJobs} sub={metrics.failedETLJobs > 0 ? 'Needs attention' : 'All healthy'} icon={AlertCircle} isPositive={metrics.failedETLJobs === 0} onClick={() => handleCardClick('Failed Jobs', '/dashboard/integration')} />
            <StatCard title="Avg. Housing Price" value={metrics.avgHousingPrice > 0 ? `$${metrics.avgHousingPrice.toLocaleString()}` : 'No data'} sub="Across all districts" icon={DollarSign} isPositive={true} onClick={() => handleCardClick('Pricing', '/dashboard/analytics')} />
          </>
        );
      case 'Government Official':
        return (
          <>
            <StatCard title="Total Scenarios" value={metrics.totalScenarios} sub={`${metrics.completedScenarios} completed`} icon={BarChart3} isPositive={true} onClick={() => handleCardClick('Scenarios', '/dashboard/scenarios')} />
            <StatCard title="Housing Units" value={metrics.totalHousingUnits} sub={`${metrics.availableUnits} available`} icon={Home} isPositive={true} onClick={() => handleCardClick('Housing', '/dashboard/repository')} />
            <StatCard title="Avg. Price" value={metrics.avgHousingPrice > 0 ? `$${metrics.avgHousingPrice.toLocaleString()}` : 'No data'} sub="Market average" icon={DollarSign} isPositive={true} onClick={() => handleCardClick('Pricing', '/dashboard/intelligence')} />
            <StatCard title="My Tasks" value={metrics.pendingTasks} sub={metrics.pendingTasks > 0 ? 'Pending action' : 'All done'} icon={UserCheck} isPositive={metrics.pendingTasks === 0} onClick={() => handleCardClick('Tasks', '/dashboard/collaboration')} />
          </>
        );
      default: // Urban Planner
        return (
          <>
            <StatCard title="Housing Units" value={metrics.totalHousingUnits} sub={`${metrics.availableUnits} available`} icon={Home} isPositive={true} onClick={() => handleCardClick('Housing', '/dashboard/repository')} />
            <StatCard title="My Tasks" value={metrics.pendingTasks} sub={metrics.pendingTasks > 0 ? 'Action required' : 'All done'} icon={Activity} isPositive={metrics.pendingTasks === 0} onClick={() => handleCardClick('Tasks', '/dashboard/collaboration')} />
            <StatCard title="Active ETL Jobs" value={metrics.activeETLJobs} sub={`${metrics.completedETLJobs} completed`} icon={Database} isPositive={true} onClick={() => handleCardClick('ETL', '/dashboard/integration')} />
            <StatCard title="Alerts" value={metrics.alerts?.length ?? 0} sub={metrics.alerts?.length > 0 ? 'Needs review' : 'All clear'} icon={AlertCircle} isPositive={(metrics.alerts?.length ?? 0) === 0} onClick={() => handleCardClick('Alerts')} />
          </>
        );
    }
  };

  // ─── Charts ────────────────────────────────────────────────────────────────

  const renderCharts = () => {
    const areaData  = charts?.monthlySeries  || [];
    const barData   = charts?.districtSeries || [];

    const areaTitle = role === 'System Administrator' ? 'Housing Records Added (Monthly)' :
                      role === 'Data Analyst'         ? 'Data Ingestion (Monthly)'         :
                      role === 'Government Official'  ? 'Housing Units by Month'            :
                                                        'Housing Demand (Monthly)';
    const barTitle  = role === 'System Administrator' ? 'Records by District' :
                      role === 'Data Analyst'         ? 'District Distribution'             :
                      role === 'Government Official'  ? 'District Development'              :
                                                        'Regional Housing Distribution';

    const isEmpty = areaData.every(d => d.value === 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Area chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{areaTitle}</h3>
            <div className="flex items-center text-xs text-secondary-500 gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary-500 inline-block" />Current</span>
            </div>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : isEmpty ? (
            <div className="h-72 flex flex-col items-center justify-center text-secondary-400 gap-2">
              <BarChart3 size={40} className="opacity-30" />
              <p className="text-sm">No housing data yet. Add records to see trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">{barTitle}</h3>
            <button onClick={() => navigate('/dashboard/repository')} className="text-primary-600 text-sm font-medium hover:underline">View All</button>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : barData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-secondary-400 gap-2">
              <Globe size={40} className="opacity-30" />
              <p className="text-sm">No district data available yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={i === barData.length - 1 ? '#0369a1' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  // ─── Table ─────────────────────────────────────────────────────────────────

  const renderTable = () => {
    const titles = {
      'System Administrator': 'Registered Users',
      'Data Analyst':         'ETL Job History',
      'Government Official':  'Policy Scenarios',
    };
    const tableTitle = titles[tableRole] || 'Recent Housing Records';

    const colsByRole = {
      'System Administrator': ['ID', 'Name', 'Email', 'Role', 'Status', 'Department'],
      'Data Analyst':         ['ID', 'Source', 'Status', 'Records', 'Started', 'Completed'],
      'Government Official':  ['ID', 'Name', 'Description', 'Status', 'Created By', 'Date'],
    };
    const cols = colsByRole[tableRole] || ['ID', 'Title', 'District', 'Type', 'Price', 'Status'];

    const statusColor = (s) => {
      if (!s) return 'bg-secondary-100 text-secondary-600';
      const v = s.toLowerCase();
      if (v === 'active' || v === 'completed' || v === 'available' || v === 'done') return 'bg-emerald-100 text-emerald-700';
      if (v === 'running' || v === 'in progress') return 'bg-blue-100 text-blue-700';
      if (v === 'failed' || v === 'locked') return 'bg-red-100 text-red-700';
      if (v === 'pending' || v === 'to do' || v === 'draft') return 'bg-amber-100 text-amber-700';
      return 'bg-secondary-100 text-secondary-600';
    };

    return (
      <div className="card overflow-hidden">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="font-bold text-lg">{tableTitle}</h3>
          <button
            onClick={fetchAll}
            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={`text-secondary-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-secondary-100 dark:border-secondary-800">
                {cols.map((col, i) => (
                  <th key={i} className="pb-3 font-semibold text-secondary-500 pr-4 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {loading ? (
                Array(5).fill(null).map((_, i) => (
                  <tr key={i}>
                    {cols.map((_, j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tableData.length === 0 ? (
                <EmptyState message="No records found. Data will appear here once added to the system." />
              ) : (
                tableData.map((row, i) => {
                  const vals = Object.values(row);
                  return (
                    <tr key={i} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors cursor-pointer">
                      {vals.map((val, j) => {
                        const col = cols[j]?.toLowerCase();
                        const isStatus = col === 'status';
                        const isPrice  = col === 'price';
                        return (
                          <td key={j} className="py-3 pr-4 text-secondary-700 dark:text-secondary-300 whitespace-nowrap max-w-[200px] truncate">
                            {isStatus ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(String(val))}`}>{val}</span>
                            ) : isPrice ? (
                              `$${Number(val).toLocaleString()}`
                            ) : (
                              String(val ?? '—')
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── Alerts banner ─────────────────────────────────────────────────────────

  const renderAlerts = () => {
    if (!metrics?.alerts?.length) return null;
    return (
      <div className="space-y-2">
        {metrics.alerts.map((a, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
            ${a.type === 'error'   ? 'bg-red-50 border border-red-200 text-red-700' :
              a.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
                                     'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            <AlertCircle size={16} className="shrink-0" />
            {a.message}
          </div>
        ))}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 relative">

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-secondary-950/40 backdrop-blur-md z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: -40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -40 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-secondary-900 rounded-[2.5rem] shadow-2xl z-[101] border border-white dark:border-secondary-800 p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-secondary-900 dark:text-white">Refine Analytics</h2>
                  <p className="text-sm text-secondary-500 mt-1">Select a time range to recalibrate your dashboard.</p>
                </div>
                <button onClick={() => setShowFilters(false)} className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-2xl text-secondary-400 hover:text-secondary-900 transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {['Real-time', 'Last 7 Days', 'Last 30 Days'].map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-4 px-2 rounded-2xl border-2 transition-all font-bold text-xs
                      ${selectedTime === t ? 'border-primary-500 bg-primary-50/50 text-primary-600' : 'border-secondary-100 dark:border-secondary-800 text-secondary-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowFilters(false)} className="flex-1 py-4 text-sm font-bold text-secondary-500 hover:bg-secondary-50 rounded-2xl transition-colors">Cancel</button>
                <button onClick={handleApplyFilters} className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold text-sm hover:bg-primary-700 transition-colors">Apply</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export progress */}
      <AnimatePresence>
        {isExporting && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] bg-white dark:bg-secondary-900 px-6 py-4 rounded-2xl shadow-2xl border border-primary-500/30 flex items-center gap-4 w-full max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
              <Download size={20} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-secondary-900 dark:text-white">Preparing Export…</p>
              <div className="mt-2 h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary-600" animate={{ width: `${exportProgress}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-primary-600">{exportProgress}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{role} Overview</h1>
          <p className="text-secondary-500 mt-1">
            Welcome back, <span className="font-semibold text-secondary-700 dark:text-secondary-300">{user?.name || 'Officer'}</span>.
            {user?.department ? ` ${user.department}.` : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 active:scale-95 transition-transform" title="Refresh data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setShowFilters(true)} className="btn-secondary flex items-center gap-2 active:scale-95 transition-transform">
            <Filter size={18} />
            Filters
          </button>
          <button onClick={handleExport} disabled={isExporting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all
              ${isExporting ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            <Download size={18} />
            {isExporting ? 'Exporting…' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchAll} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Alerts */}
      {renderAlerts()}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderRoleStats()}
      </div>

      {/* Charts */}
      {renderCharts()}

      {/* Table */}
      {renderTable()}
    </div>
  );
};

export default Dashboard;
