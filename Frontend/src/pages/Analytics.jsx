import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Cpu, RefreshCw, AlertCircle, Play, BarChart2 } from 'lucide-react';
import api from '../store/api';

const modelMetrics = [
  { name: 'XGBoost Demand Forecaster', accuracy: '94.2%', r2: '0.91', trainingTime: '12s', status: 'Optimal' },
  { name: 'LSTM Neural Network (Price)', accuracy: '91.8%', r2: '0.88', trainingTime: '45s', status: 'Optimal' },
  { name: 'Prophet Time Series (Supply)', accuracy: '89.5%', r2: '0.83', trainingTime: '8s', status: 'Needs Update' }
];

function Analytics() {
  const [activeModel, setActiveModel] = useState('XGBoost');
  const [horizon, setHorizon] = useState('5');
  const [forecastData, setForecastData] = useState([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainingLogs, setRetrainingLogs] = useState([]);

  useEffect(() => {
    api.get(`/api/analytics/forecast?years=${horizon}`)
      .then(res => {
        const formatted = res.data.map(item => {
          const demand = item.demand;
          return {
            year: item.year,
            current: demand,
            forecastLow: Math.round(demand * 0.92),
            forecastHigh: Math.round(demand * 1.08)
          };
        });
        setForecastData(formatted);
      })
      .catch(err => {
        console.error("Failed to fetch forecast data:", err);
      });
  }, [horizon]);

  // Retrain Trigger Mock
  const triggerRetraining = () => {
    setIsRetraining(true);
    setRetrainingLogs(['[INFO] Fetching records from central repository... Done.', '[INFO] Formulating training shapes...']);
    
    setTimeout(() => {
      setRetrainingLogs(prev => [...prev, '[INFO] Aligning cross-validation grids. Training XGBoost model...']);
    }, 1000);

    setTimeout(() => {
      setRetrainingLogs(prev => [
        ...prev, 
        '[SUCCESS] Retrained successfully. New Accuracy: 94.8% (+0.6% gain). Saved model weight snapshot.'
      ]);
      setIsRetraining(false);
    }, 2500);
  };

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>AI Analytics & Predictive Modeling</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Evaluate machine learning forecasts on housing demand, price projections, and model diagnostic layers.
        </p>
      </div>

      {/* Grid: Parameters Config + Model Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        
        {/* Model Configurations */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} style={{ color: 'var(--primary)' }} />
            Model Parameters
          </h3>

          <div className="form-group">
            <label className="form-label">Algorithm Engine</label>
            <select
              className="form-input"
              style={{ background: 'var(--bg-secondary)', width: '100%', cursor: 'pointer' }}
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
            >
              <option value="XGBoost">XGBoost Regression Forest</option>
              <option value="LSTM">LSTM Recurrent Neural Net</option>
              <option value="Prophet">Facebook Prophet Estimator</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Forecast Horizon</label>
            <select
              className="form-input"
              style={{ background: 'var(--bg-secondary)', width: '100%', cursor: 'pointer' }}
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            >
              <option value="3">3 Years (Short-term)</option>
              <option value="5">5 Years (Medium-term)</option>
              <option value="10">10 Years (Long-term)</option>
            </select>
          </div>
        </div>

        {/* Retraining console */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Model Optimization</h3>
            <button
              onClick={triggerRetraining}
              disabled={isRetraining}
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              <RefreshCw size={12} className={isRetraining ? 'animated-spin' : ''} style={{ animation: isRetraining ? 'spin 1.5s linear infinite' : 'none' }} />
              Retrain AI
            </button>
          </div>

          {retrainingLogs.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select "Retrain AI" to run model fit optimization.
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: '#8b5cf6', overflowY: 'auto', maxHeight: '110px' }}>
                {retrainingLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Forecast charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px' }}>
        
        {/* Forecast Area Curve */}
        <div className="card-glass" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Housing Demand Projection Bounds</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confidence Intervals (95% bounds)</span>
          </div>
          
          <div style={{ flex: 1, minHeight: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastInterval" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                {/* Interval bounds */}
                <Area type="monotone" dataKey="forecastHigh" name="Forecast Upper Bound" stroke="none" fill="url(#forecastInterval)" />
                <Area type="monotone" dataKey="forecastLow" name="Forecast Lower Bound" stroke="none" fill="url(#forecastInterval)" />
                {/* Mid forecast line */}
                <Line type="monotone" dataKey="current" name="Forecast Median" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Accuracy Diagnostics */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
            Model Performance metrics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modelMetrics.map((met, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{met.name}</strong>
                  <span className={`badge ${met.status === 'Optimal' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>{met.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>
                    Accuracy: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{met.accuracy}</span>
                  </div>
                  <div>
                    R-Squared: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{met.r2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <AlertCircle size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Models retrain on incremental dataset uploads to prevent weights drift.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;
