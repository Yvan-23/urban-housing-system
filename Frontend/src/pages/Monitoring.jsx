import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, Clock, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../store/api';

function Monitoring() {
  const [projectMilestones, setProjectMilestones] = useState([]);
  const [kpiVariance, setKpiVariance] = useState([]);
  const [databaseKpis, setDatabaseKpis] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/housing'),
      api.get('/api/monitoring/kpis')
    ]).then(([resHousing, resKpis]) => {
      const records = resHousing.data;
      const kpis = resKpis.data;

      // 1. Calculate project milestones from housing records
      const projects = records.map((r, idx) => {
        let progress = 100;
        let status = 'Completed';
        let delay = 0;

        if (r.status === 'Under Construction') {
          progress = 45;
          status = 'In Progress';
          if (r.district === 'East Meadows') {
            status = 'Delayed';
            delay = 18;
          }
        } else if (r.status === 'Vacant') {
          progress = 85;
          status = 'In Progress';
        } else if (r.createdAt && new Date(r.createdAt).getFullYear() > 2026) {
          progress = 5;
          status = 'Planning';
        }

        let lead = 'Elena Rostova';
        if (r.district === 'East Meadows' || r.district === 'North Valley') {
          lead = 'Marcus Vance';
        } else if (r.district === 'West Hills') {
          lead = 'Sarah Jenkins';
        }

        return {
          id: `PRJ-${String(idx + 1).padStart(2, '0')}`,
          name: r.title,
          lead,
          budget: `$${r.price.toLocaleString()}`,
          status,
          progress,
          delay
        };
      });
      setProjectMilestones(projects);

      // 2. Calculate KPI variance dynamically
      const totalUnits = records.reduce((sum, r) => sum + (r.units || 0), 0);
      const avgPrice = records.length ? records.reduce((sum, r) => sum + (r.price || 0), 0) / records.length : 0;
      const underConstruction = records.filter(r => r.status === 'Under Construction').length;

      const varianceList = [
        { metric: 'Housing Units Built', target: 400, actual: totalUnits, variance: totalUnits ? +(((totalUnits - 400) / 400) * 100).toFixed(1) : -100 },
        { metric: 'Average Market Price', target: 450000, actual: Math.round(avgPrice), variance: avgPrice ? +(((avgPrice - 450000) / 450000) * 100).toFixed(1) : -100 },
        { metric: 'Active Under-Construction Projects', target: 1, actual: underConstruction, variance: underConstruction ? +(((underConstruction - 1) / 1) * 100).toFixed(1) : -100 }
      ];
      setKpiVariance(varianceList);
      setDatabaseKpis(kpis);
    }).catch(err => {
      console.error("Failed to load monitoring data:", err);
    });
  }, []);

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Monitoring & Evaluation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Evaluate active housing project milestones, KPI variance reports, and construction timelines.
        </p>
      </div>

      {/* Threshold Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {projectMilestones.filter(p => p.status === 'Delayed').map(prj => (
          <div key={prj.id} style={{ padding: '16px', background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Milestone Delay Warning ({prj.id}):</strong> {prj.name} project is <strong>{prj.delay} days behind schedule</strong>. High risk of budget overflow.
            </div>
          </div>
        ))}

        {kpiVariance.filter(v => v.variance < 0).map((varItem, idx) => (
          <div key={idx} style={{ padding: '16px', background: 'var(--warning-glow)', border: '1px solid var(--warning)', borderRadius: '8px', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>KPI Variance Trigger:</strong> {varItem.metric} is currently <strong>{Math.abs(varItem.variance)}%</strong> below the target threshold.
            </div>
          </div>
        ))}

        {projectMilestones.filter(p => p.status === 'Delayed').length === 0 && kpiVariance.filter(v => v.variance < 0).length === 0 && (
          <div style={{ padding: '16px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.85rem', display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>All Systems Operational:</strong> All active projects are tracking on schedule, and key performance indicators are within acceptable variance thresholds.
            </div>
          </div>
        )}
      </div>

      {/* Upper row: KPI tracking table + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Variance Table */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            Policy KPI Variance Report
          </h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric Indicator</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Variance %</th>
                </tr>
              </thead>
              <tbody>
                {kpiVariance.map((kpi, idx) => (
                  <tr key={`static-${idx}`}>
                    <td style={{ fontWeight: 600 }}>{kpi.metric}</td>
                    <td>{kpi.target}</td>
                    <td>{kpi.actual}</td>
                    <td>
                      <span className={`badge ${kpi.variance === 0 ? 'badge-primary' : (kpi.metric.includes('Cycle') || kpi.metric.includes('Spend')) ? (kpi.variance > 0 ? 'badge-danger' : 'badge-success') : (kpi.variance < 0 ? 'badge-danger' : 'badge-success')}`}>
                        {kpi.variance > 0 ? `+${kpi.variance}%` : `${kpi.variance}%`}
                      </span>
                    </td>
                  </tr>
                ))}
                {databaseKpis.map((kpi) => {
                  const varianceVal = kpi.targetValue ? (((kpi.actualValue - kpi.targetValue) / kpi.targetValue) * 100).toFixed(1) : 0;
                  const isNegative = parseFloat(varianceVal) < 0;
                  return (
                    <tr key={kpi.id}>
                      <td style={{ fontWeight: 600 }}>{kpi.name} ({kpi.district})</td>
                      <td>{kpi.targetValue} {kpi.unit}</td>
                      <td>{kpi.actualValue} {kpi.unit}</td>
                      <td>
                        <span className={`badge ${isNegative ? 'badge-danger' : 'badge-success'}`}>
                          {isNegative ? '' : '+'}{varianceVal}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual progress comparison */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Active Projects Budget vs Progress</h3>
          <div style={{ flex: 1, minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectMilestones} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="id" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="progress" name="Progress (%)" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Project Milestone Monitor Catalog */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={18} style={{ color: 'var(--primary)' }} />
          Housing Projects Development Monitor
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Budget Allocation</th>
                <th>Project Lead</th>
                <th>Progress Check</th>
                <th>Status</th>
                <th>Delay Timeline</th>
              </tr>
            </thead>
            <tbody>
              {projectMilestones.map(prj => (
                <tr key={prj.id}>
                  <td style={{ fontWeight: 600 }}>{prj.id}</td>
                  <td>{prj.name}</td>
                  <td>{prj.budget}</td>
                  <td>{prj.lead}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', width: '32px', textAlign: 'right' }}>{prj.progress}%</span>
                      <div style={{ width: '100px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${prj.progress}%`,
                          height: '100%',
                          background: prj.status === 'Delayed' ? 'var(--danger)' : prj.status === 'Completed' ? 'var(--accent)' : 'var(--primary)',
                          borderRadius: '3px'
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${prj.status === 'Completed' ? 'badge-success' : prj.status === 'Delayed' ? 'badge-danger' : prj.status === 'In Progress' ? 'badge-primary' : 'badge-secondary'}`}>
                      {prj.status}
                    </span>
                  </td>
                  <td>
                    {prj.delay > 0 ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{prj.delay} Days Delayed</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>On Schedule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Monitoring;
