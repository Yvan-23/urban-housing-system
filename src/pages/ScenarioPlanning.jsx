import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle, Plus, Save, Share2, Activity, TrendingUp, AlertCircle,
  CheckCircle2, ArrowRight, Settings2, Users, Building2, DollarSign,
  HelpCircle, Layout, RefreshCcw, Zap, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ScenarioPlanning = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [scenarios, setScenarios]         = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [simulationData, setSimulationData] = useState([]);
  const [impactCards, setImpactCards]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [simulating, setSimulating]       = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);
  const [params, setParams] = useState({
    popGrowth: 2.5,
    constructionRate: 1.8,
    interestRate: 4.2,
    subsidyLevel: 15,
  });

  // ─── Load scenarios from DB ─────────────────────────────────────────────────
  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/scenarios');
      const data = res.data?.data || [];
      setScenarios(data);
      if (data.length > 0) {
        setActiveScenario(data[0]);
        loadScenarioResults(data[0]);
      }
    } catch (err) {
      setError('Failed to load scenarios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScenarios(); }, []);

  // ─── Parse results from a scenario ─────────────────────────────────────────
  const loadScenarioResults = (scenario) => {
    if (!scenario?.results) {
      setSimulationData([]);
      setImpactCards([]);
      return;
    }
    try {
      const results = typeof scenario.results === 'string'
        ? JSON.parse(scenario.results)
        : scenario.results;

      // Build chart data from results if available
      if (results.chartData) {
        setSimulationData(results.chartData);
      } else {
        // Build a simple projection from available metrics
        const base = results.currentAvgPrice || 100;
        const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
        setSimulationData(years.map((year, i) => ({
          year,
          base: Math.round(base * Math.pow(1.05, i)),
          projected: Math.round(base * Math.pow(1 + (params.popGrowth / 100), i)),
        })));
      }

      // Impact cards from results
      setImpactCards([
        {
          label: 'Avg. Housing Price',
          value: results.currentAvgPrice ? `$${Number(results.currentAvgPrice).toLocaleString()}` : 'N/A',
          desc: 'Current average across all districts.',
          icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100',
        },
        {
          label: 'Predicted Price (6mo)',
          value: results.predictedPrice6Months ? `$${Number(results.predictedPrice6Months).toLocaleString()}` : 'N/A',
          desc: '6-month price forecast.',
          icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100',
        },
        {
          label: 'Market Trend',
          value: results.trend || 'N/A',
          desc: results.affordabilityStatus || 'Based on current data.',
          icon: Activity, color: 'text-primary-600', bg: 'bg-primary-100',
        },
      ]);
    } catch {
      setSimulationData([]);
      setImpactCards([]);
    }
  };

  // ─── Run simulation ─────────────────────────────────────────────────────────
  const handleRunSimulation = async () => {
    if (!activeScenario) {
      showNotification('Please select or create a scenario first.', 'warning');
      return;
    }
    setSimulating(true);
    showNotification('Initializing simulation…', 'info');
    try {
      const res = await api.post(`/scenarios/${activeScenario.id}/simulate`, {
        district: activeScenario.name || 'Downtown',
        popGrowth: String(params.popGrowth),
        constructionRate: String(params.constructionRate),
        interestRate: String(params.interestRate),
        subsidyLevel: String(params.subsidyLevel),
      });
      const updated = res.data?.data;
      if (updated) {
        setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveScenario(updated);
        loadScenarioResults(updated);
      }
      showNotification('Simulation complete.', 'success');
    } catch (err) {
      showNotification('Simulation failed. Please try again.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // ─── Save scenario ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeScenario?.id) {
        // Update existing
        await api.put(`/scenarios/${activeScenario.id}`, {
          ...activeScenario,
          parameters: JSON.stringify(params),
        });
        showNotification(`"${activeScenario.name}" saved.`, 'success');
      } else {
        // Create new
        const res = await api.post('/scenarios', {
          name: `Scenario ${new Date().toLocaleDateString()}`,
          description: 'Custom simulation',
          parameters: JSON.stringify(params),
          status: 'Draft',
        });
        const created = res.data?.data;
        setScenarios(prev => [...prev, created]);
        setActiveScenario(created);
        showNotification('New scenario created.', 'success');
      }
      fetchScenarios();
    } catch {
      showNotification('Failed to save scenario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Create new scenario ────────────────────────────────────────────────────
  const handleNewScenario = async () => {
    try {
      const res = await api.post('/scenarios', {
        name: `New Scenario ${scenarios.length + 1}`,
        description: 'New simulation scenario',
        parameters: JSON.stringify(params),
        status: 'Draft',
      });
      const created = res.data?.data;
      setScenarios(prev => [...prev, created]);
      setActiveScenario(created);
      setSimulationData([]);
      setImpactCards([]);
      showNotification('New scenario created. Set parameters and run simulation.', 'success');
    } catch {
      showNotification('Failed to create scenario.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
            Scenario Planning & Simulation
            <PlayCircle className="text-primary-500" size={28} />
          </h1>
          <p className="text-secondary-500 mt-1">Simulate complex urban growth patterns and evaluate infrastructure requirements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchScenarios} className="btn-secondary flex items-center gap-2">
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Scenario
          </button>
          <button onClick={() => showNotification('Scenario share link copied.', 'success')} className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-xl hover:bg-secondary-200">
            <Share2 size={18} />
          </button>
          <button onClick={handleNewScenario} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Plus size={18} />
            New Simulation
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchScenarios} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Parameter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Input Parameters</h3>
              <Settings2 size={16} className="text-secondary-400" />
            </div>
            <div className="space-y-6">
              {[
                { key: 'popGrowth', label: 'Pop. Growth Rate', min: 0, max: 10, step: 0.1, unit: '%' },
                { key: 'constructionRate', label: 'Construction Rate', min: 0, max: 5, step: 0.1, unit: '%' },
                { key: 'subsidyLevel', label: 'Affordability Subsidy', min: 0, max: 50, step: 1, unit: '%' },
              ].map(({ key, label, min, max, step, unit }) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-secondary-600 dark:text-secondary-400">{label}</span>
                    <span className="text-primary-600">{params[key]}{unit}</span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={params[key]}
                    onChange={e => setParams({ ...params, [key]: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-800">
              <button
                onClick={handleRunSimulation}
                disabled={simulating || !activeScenario}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {simulating ? <><Loader2 size={18} className="animate-spin" /> Running…</> : <><Zap size={18} className="group-hover:scale-110 transition-transform" /> Run Prediction</>}
              </button>
            </div>
          </div>

          {/* Saved Scenarios from DB */}
          <div className="card p-6 bg-secondary-50 dark:bg-secondary-800/50 border-dashed border-2">
            <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">
              Saved Scenarios {!loading && `(${scenarios.length})`}
            </h3>
            {loading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-xl animate-pulse mb-2" />
              ))
            ) : scenarios.length === 0 ? (
              <p className="text-xs text-secondary-400 text-center py-4">No scenarios yet. Create one above.</p>
            ) : (
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => { setActiveScenario(s); loadScenarioResults(s); }}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      activeScenario?.id === s.id
                        ? 'bg-white dark:bg-secondary-900 shadow-sm border border-secondary-100 dark:border-secondary-700 text-primary-600 font-bold'
                        : 'text-secondary-500 hover:bg-white/50 dark:hover:bg-secondary-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Layout size={14} />
                      <span className="truncate">{s.name}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'Simulating' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Dashboard */}
        <div className="lg:col-span-3 space-y-8">
          {/* Main Chart */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {activeScenario ? `Results: ${activeScenario.name}` : 'Select a scenario to view results'}
                </h3>
                <p className="text-sm text-secondary-500">
                  {activeScenario?.description || 'Run a simulation to generate forecast data.'}
                </p>
              </div>
              {simulationData.length > 0 && (
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary-500" /> Projected</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary-300" /> Baseline</div>
                </div>
              )}
            </div>
            <div className="h-[350px]">
              {simulating ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-secondary-400">
                  <Loader2 size={40} className="animate-spin text-primary-500" />
                  <p className="text-sm">Running simulation…</p>
                </div>
              ) : simulationData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-secondary-400">
                  <PlayCircle size={48} className="opacity-20" />
                  <p className="text-sm">No simulation data yet. Set parameters and click Run Prediction.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="base" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Impact Cards from DB results */}
          {impactCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {impactCards.map((item, i) => (
                <div key={i} className="card p-6">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">{item.label}</h4>
                  <p className="text-2xl font-black text-secondary-900 dark:text-white mb-2">{item.value}</p>
                  <p className="text-[10px] text-secondary-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sensitivity Map */}
          <div className="card p-8 bg-secondary-900 text-white relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-lg font-bold mb-2">Multi-District Sensitivity Map</h3>
                <p className="text-secondary-400 text-sm max-w-md">
                  District-level responsiveness based on current simulation parameters.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                <TrendingUp className="text-emerald-400" size={24} />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-5 h-16 gap-2 relative z-10">
              {[params.popGrowth * 8, params.constructionRate * 18, params.subsidyLevel * 1.8, params.interestRate * 10, 60].map((v, i) => (
                <div key={i} className="h-full bg-white/10 rounded-lg overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 right-0 bg-primary-500" style={{ height: `${Math.min(v, 100)}%` }} />
                </div>
              ))}
            </div>
            <Activity className="absolute -right-8 -bottom-8 text-white/5" size={160} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPlanning;
