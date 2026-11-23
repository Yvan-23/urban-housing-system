import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Home,
  Percent,
  Activity,
  ArrowUpRight,
  Shield,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { approveRegistration, rejectRegistration, fetchAuditLogs, fetchUsers } from '../store/authSlice';
import { fetchRecords } from '../store/repositorySlice';
import api from '../store/api';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, pendingRegistrations, auditLogs } = useSelector((state) => state.auth);
  const { records, datasets } = useSelector((state) => state.repository);
  const { scenarios, recommendations } = useSelector((state) => state.simulation);
  const { comments } = useSelector((state) => state.collaboration);

  const activeRole = user?.role || 'Stakeholder';
  const [trendData, setTrendData] = React.useState([]);

  useEffect(() => {
    dispatch(fetchRecords());
    if (activeRole === 'Administrator') {
      dispatch(fetchAuditLogs());
      dispatch(fetchUsers());
    }
  }, [dispatch, activeRole]);

  useEffect(() => {
    api.get('/api/analytics/forecast?years=5')
      .then(res => {
        setTrendData(res.data.map(item => ({
          year: item.year,
          demand: item.demand,
          supply: item.supply
        })));
      })
      .catch(err => {
        console.error("Failed to fetch dashboard trend data:", err);
      });
  }, []);

  const districtComparison = React.useMemo(() => {
    const districtsMap = {};
    const defaultDistricts = ['Downtown Central', 'North Valley', 'East Meadows', 'Southern Waterfront', 'West Hills'];
    defaultDistricts.forEach(d => {
      districtsMap[d] = { name: d, supply: 0, demand: 0 };
    });

    records.forEach(r => {
      const d = r.district || 'Other';
      if (!districtsMap[d]) {
        districtsMap[d] = { name: d, supply: 0, demand: 0 };
      }
      const itemSupply = r.units || 40;
      let itemDemand = itemSupply;
      if (r.status === 'Vacant') {
        itemDemand = Math.round(itemSupply * 1.25);
      } else if (r.status === 'Under Construction') {
        itemDemand = Math.round(itemSupply * 1.15);
      } else {
        itemDemand = Math.round(itemSupply * (d === 'North Valley' ? 0.95 : 1.08));
      }

      districtsMap[d].supply += itemSupply;
      districtsMap[d].demand += itemDemand;
    });

    return Object.values(districtsMap);
  }, [records]);

  // Calculate general statistics safely
  const totalUnits = records.reduce((sum, r) => sum + (r.units || 0), 0);
  const averagePrice = records.length ? Math.round(records.reduce((sum, r) => sum + (r.price || 0), 0) / records.length) : 0;
  const averageVacancy = records.length ? +(records.reduce((sum, r) => sum + (r.vacancyRate || 0), 0) / records.length).toFixed(1) : 0;
  const activeProjectsCount = records.filter(r => r.status === 'Under Construction').length;

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back, {user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Here is the current state of housing analytics for the metropolitan area.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px' }}>
          System status: <span className="badge badge-success">Online</span>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Home size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Total Housing Units</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{totalUnits.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Avg Market Price</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>${averagePrice.toLocaleString()}</h3>
          </div>
        </div>

        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--warning-glow)', color: 'var(--warning)' }}>
            <Percent size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Avg Vacancy Rate</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{averageVacancy}%</h3>
          </div>
        </div>

        <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Active Developments</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{activeProjectsCount} Projects</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
        
        {/* Trend Area Chart */}
        <div className="card-glass" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Housing Demand vs Supply Trend</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Historic (2021-2026)</span>
          </div>
          <div style={{ flex: 1, minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                <Area type="monotone" dataKey="demand" name="Projected Demand" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={2} />
                <Area type="monotone" dataKey="supply" name="Actual Supply" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorSupply)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Bar Chart */}
        <div className="card-glass" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>District Supply-Demand Gaps</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Units per District</span>
          </div>
          <div style={{ flex: 1, minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="demand" name="Demand" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="supply" name="Supply" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Role-Specific Workflows Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* ADMINISTRATOR VIEW */}
        {activeRole === 'Administrator' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* Audit Logs Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} style={{ color: 'var(--primary)' }} />
                  Recent System Audit Logs
                </h3>
                <Link to="/users" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Manage <ArrowUpRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.user}</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{log.action}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '2px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.timestamp}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{log.ipAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Requests Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Pending Account Access Requests</h3>
              {pendingRegistrations.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No pending role registrations.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingRegistrations.map(req => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{req.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.email}</p>
                        <span className="badge badge-primary" style={{ marginTop: '6px', display: 'inline-block' }}>{req.role}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => dispatch(approveRegistration(req.id))} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                          Approve
                        </button>
                        <button onClick={() => dispatch(rejectRegistration(req.id))} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--danger)' }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* URBAN PLANNER VIEW */}
        {activeRole === 'Urban Planner' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* GIS Overview Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>GIS Spatial Overlays</h3>
                <Link to="/maps" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Open GIS Map <ArrowUpRight size={14} />
                </Link>
              </div>
              <div style={{ height: '180px', borderRadius: '8px', background: 'radial-gradient(circle, rgba(19,28,46,1) 0%, rgba(11,17,30,1) 100%)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed var(--primary-glow)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', animation: 'spin 12s linear infinite' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}></div>
                </div>
                <div style={{ position: 'absolute', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  5 Districts Active
                </div>
              </div>
            </div>

            {/* Scenarios List Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Active Scenario Configurations</h3>
                <Link to="/simulation" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  New Simulation <ArrowUpRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scenarios.slice(0, 3).map(sc => (
                  <div key={sc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sc.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Budget: ${sc.budget}M | Eco-Friendly: {sc.ecoFriendly ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className={`badge ${sc.status === 'Approved' ? 'badge-success' : sc.status === 'Under Review' ? 'badge-warning' : 'badge-primary'}`}>
                        {sc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* DATA ANALYST VIEW */}
        {activeRole === 'Data Analyst' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* Ingestion Monitor Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>ETL & Ingestion Jobs</h3>
                <span className="badge badge-success">All Pipelines Normal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <FileSpreadsheet size={16} style={{ color: 'var(--accent)' }} />
                    <div>
                      <strong>Job_District_Demographics</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Frequency: Scheduled Daily 02:00</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <FileSpreadsheet size={16} style={{ color: 'var(--primary)' }} />
                    <div>
                      <strong>Job_Municipal_Permits</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Frequency: Hourly Polling</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>

            {/* Datasets Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Housing Datasets Repository</h3>
                <Link to="/repository" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Upload Dataset <Plus size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {datasets.slice(0, 3).map(ds => (
                  <div key={ds.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{ds.filename}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{ds.size} | {ds.recordsCount} records</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{ds.uploadDate}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* GOVERNMENT OFFICIAL VIEW */}
        {activeRole === 'Government Official' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* Recommendations Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Strategic AI Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map(rec => (
                  <div key={rec.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{rec.type}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Confidence: {rec.confidence}%</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* M&E Variance Alerts */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>M&E Milestone Variance Alerts</h3>
                <Link to="/monitoring" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Open Dashboard <ArrowUpRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '10px' }}>
                  <Clock size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <div>
                    <strong>East Meadows low-cost project delayed</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Construction Phase 2 is 18 days behind schedule.</p>
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'var(--warning-glow)', border: '1px solid var(--warning)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '10px' }}>
                  <Clock size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <div>
                    <strong>Downtown Central supply gap</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Current occupancy growth exceeds built units by 9%.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STAKEHOLDER VIEW */}
        {activeRole === 'Stakeholder' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            
            {/* Discussion Feed Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Active Collaboration Discussions</h3>
                <Link to="/collaboration" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Participate <ExternalLink size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {comments.slice(0, 3).map(c => (
                  <div key={c.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.user} ({c.role})</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.timestamp}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Milestones Widget */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Community Project Status Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>North Valley Subsidized Housing Block</span>
                    <span>80%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '80%', height: '100%', background: 'var(--accent)' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>Downtown Central Green Renovation</span>
                    <span>45%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>East Meadows Eco-Suburbs</span>
                    <span>15%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', background: 'var(--secondary)' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
