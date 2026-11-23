import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  Folder, File, Search, Filter, Upload, Download, MoreVertical,
  ChevronRight, Database, Grid, List as ListIcon, Tag, Info,
  CheckCircle2, RefreshCcw, Loader2, AlertCircle, Home, DollarSign, MapPin
} from 'lucide-react';
import api from '../services/api';

const Repository = () => {
  const { showNotification } = useNotification();
  const [viewMode, setViewMode]       = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [housingData, setHousingData] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeFilter !== 'All') params.propertyType = activeFilter;
      if (searchQuery)            params.district      = searchQuery;

      const res = await api.get('/housing/search', { params });
      setHousingData(res.data?.data || []);
    } catch (err) {
      setError('Failed to load housing records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleExport = async () => {
    showNotification('Preparing CSV export…', 'info');
    try {
      const res = await api.get('/housing/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'housing_data_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification('Export downloaded.', 'success');
    } catch {
      showNotification('Export failed.', 'error');
    }
  };

  // Derive filter options from data
  const propertyTypes = ['All', ...new Set(housingData.map(h => h.propertyType).filter(Boolean))];

  const filterStats = propertyTypes.map(type => ({
    label: type,
    count: type === 'All' ? housingData.length : housingData.filter(h => h.propertyType === type).length,
  }));

  const filtered = housingData.filter(h => {
    const q = searchQuery.toLowerCase();
    return !q || h.title?.toLowerCase().includes(q) || h.district?.toLowerCase().includes(q) || h.address?.toLowerCase().includes(q);
  });

  const statusColor = (s) => {
    if (!s) return 'bg-secondary-300';
    switch (s.toLowerCase()) {
      case 'available': return 'bg-emerald-500';
      case 'sold':      return 'bg-red-500';
      case 'rented':    return 'bg-blue-500';
      default:          return 'bg-amber-500 animate-pulse';
    }
  };
  const statusTextColor = (s) => {
    if (!s) return 'text-secondary-600';
    switch (s.toLowerCase()) {
      case 'available': return 'text-emerald-600';
      case 'sold':      return 'text-red-600';
      case 'rented':    return 'text-blue-600';
      default:          return 'text-amber-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Housing Repository
            <Database className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">
            {loading ? 'Loading records…' : `${housingData.length} housing record${housingData.length !== 1 ? 's' : ''} in the database.`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={() => showNotification('Upload gateway initialized.', 'info')} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Upload size={18} />
            Add Record
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">Filter by Type</h3>
            <div className="space-y-2">
              {filterStats.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    activeFilter === f.label
                      ? 'bg-primary-50 text-primary-700 font-bold border-l-4 border-l-primary-500 shadow-sm'
                      : 'hover:bg-secondary-50 text-secondary-600'
                  }`}
                >
                  <span className="text-sm">{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${activeFilter === f.label ? 'bg-primary-100' : 'bg-secondary-100'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Stats summary */}
            <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-800">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">Status Breakdown</h3>
              {['Available', 'Sold', 'Rented'].map(status => {
                const count = housingData.filter(h => h.status === status).length;
                const pct = housingData.length ? Math.round((count / housingData.length) * 100) : 0;
                return (
                  <div key={status} className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>{status}</span>
                      <span className="text-primary-600">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${statusColor(status).replace('animate-pulse', '')}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* File Browser */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, district, or address…"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-xl p-1 flex">
                <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-secondary-100 dark:bg-secondary-700 text-primary-600' : 'text-secondary-400'}`}>
                  <Grid size={18} />
                </button>
                <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-secondary-100 dark:bg-secondary-700 text-primary-600' : 'text-secondary-400'}`}>
                  <ListIcon size={18} />
                </button>
              </div>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveFilter('All'); }} className="p-3 bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-xl text-secondary-500 hover:text-primary-600 transition-colors shadow-sm">
                <RefreshCcw size={18} />
              </button>
            </div>
          </form>

          {/* Records */}
          <div className="space-y-4">
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <div key={i} className="card h-20 animate-pulse bg-secondary-100 dark:bg-secondary-800" />
              ))
            ) : filtered.length === 0 ? (
              <div className="card py-16 text-center">
                <Home size={48} className="mx-auto text-secondary-200 mb-4" />
                <h4 className="font-bold text-secondary-900 dark:text-white">No records found</h4>
                <p className="text-sm text-secondary-500 max-w-xs mx-auto mt-2">
                  {searchQuery || activeFilter !== 'All'
                    ? 'Adjust your search or filters.'
                    : 'No housing data in the database yet. Add records to get started.'}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="card flex items-center justify-between p-4 hover:border-primary-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl group-hover:bg-primary-50 transition-colors shrink-0">
                      <Home className="text-primary-500" size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-secondary-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {item.propertyType && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                            <Tag size={12} />
                            {item.propertyType}
                          </div>
                        )}
                        {item.district && (
                          <>
                            <span className="w-1 h-1 bg-secondary-200 rounded-full" />
                            <div className="flex items-center gap-1 text-xs text-secondary-400">
                              <MapPin size={11} />
                              {item.district}
                            </div>
                          </>
                        )}
                        {item.price != null && (
                          <>
                            <span className="w-1 h-1 bg-secondary-200 rounded-full" />
                            <div className="flex items-center gap-1 text-xs text-secondary-400 font-medium">
                              <DollarSign size={11} />
                              {Number(item.price).toLocaleString()}
                            </div>
                          </>
                        )}
                        {item.bedrooms != null && (
                          <>
                            <span className="w-1 h-1 bg-secondary-200 rounded-full" />
                            <span className="text-xs text-secondary-400">{item.bedrooms} bed · {item.bathrooms} bath</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColor(item.status)}`} />
                      <span className={`text-[10px] font-black uppercase ${statusTextColor(item.status)}`}>
                        {item.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); showNotification(`Viewing details for ${item.title}`, 'info'); }}
                        className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-400 hover:text-primary-600 transition-all"
                      >
                        <Info size={20} />
                      </button>
                    </div>
                    <ChevronRight size={20} className="text-secondary-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upload CTA */}
          <div className="mt-8 p-6 bg-secondary-50 dark:bg-secondary-800/30 rounded-2xl border border-dashed border-secondary-200 dark:border-secondary-700 flex flex-col items-center justify-center text-center">
            <Upload className="text-secondary-300 mb-4" size={48} />
            <h4 className="font-bold text-secondary-900 dark:text-white mb-2">Add more housing data</h4>
            <p className="text-xs text-secondary-500 max-w-sm mb-6">
              Upload new housing records or use the Data Integration module to run an ETL pipeline.
            </p>
            <button onClick={() => showNotification('Upload gateway initialized.', 'info')} className="btn-secondary active:scale-95 transition-transform">
              Add Housing Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repository;
