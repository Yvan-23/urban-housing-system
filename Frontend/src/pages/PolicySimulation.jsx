import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addScenario, toggleCompareScenario, deleteScenario, approveScenario, fetchScenarios } from '../store/simulationSlice';
import { Sliders, FilePlus2, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';

function PolicySimulation() {
  const dispatch = useDispatch();
  const { scenarios, activeScenarioIds } = useSelector((state) => state.simulation);
  const { user } = useSelector((state) => state.auth);
  
  const isOfficial = user?.role === 'Government Official';
  const isPlanner = user?.role === 'Urban Planner';

  // Load scenarios from backend
  useEffect(() => {
    dispatch(fetchScenarios());
  }, [dispatch]);

  // State for new scenario form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [growthRate, setGrowthRate] = useState(2.5);
  const [budget, setBudget] = useState(40);
  const [zoning, setZoning] = useState('Mixed');
  const [ecoFriendly, setEcoFriendly] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Submit Handler
  const handleCreateScenario = (e) => {
    e.preventDefault();
    if (!name || !description) return;

    dispatch(addScenario({
      name,
      description,
      growthRate: +growthRate,
      budget: +budget,
      zoning,
      ecoFriendly
    }));

    // Reset Form
    setName('');
    setDescription('');
    setGrowthRate(2.5);
    setBudget(40);
    setZoning('Mixed');
    setEcoFriendly(true);
    setShowForm(false);
  };

  // Get active scenarios for comparison
  const comparisonScenarios = scenarios.filter(s => activeScenarioIds.includes(s.id));

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Scenario Planning & Policy Simulation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Simulate and compare outcomes of diverse housing policies by adjusting growth parameters, budgets, and zoning.
          </p>
        </div>
        {(isPlanner || isOfficial) && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <FilePlus2 size={16} />
            {showForm ? 'Hide Creator' : 'New Scenario'}
          </button>
        )}
      </div>

      {/* New Scenario Form Dropdown */}
      {showForm && (
        <form onSubmit={handleCreateScenario} className="card-glass animated-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Scenario Name</label>
              <input
                type="text"
                placeholder="e.g. Eco-Waterfront Expansion"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                placeholder="Describe scenario purpose and constraints..."
                className="form-input"
                style={{ minHeight: '60px' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Zoning Policy</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                value={zoning}
                onChange={(e) => setZoning(e.target.value)}
              >
                <option value="Mixed">Mixed-Use High & Medium Density</option>
                <option value="High-Density">High-Density Residential Zoning</option>
                <option value="Low-Density Subsidized">Low-Density Subsidized Districts</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Projected Population Growth Rate: {growthRate}%</label>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Budget Allocation: ${budget}M</label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
              <input
                type="checkbox"
                id="eco"
                checked={ecoFriendly}
                onChange={(e) => setEcoFriendly(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="eco" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Enforce Eco-Friendly Mandates (+cost, +eco score)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 'auto' }}>
              Simulate Outcomes
            </button>
          </div>
        </form>
      )}

      {/* Side-by-Side Comparison Container */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Side-by-Side Policy Comparison</h3>
        
        {comparisonScenarios.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select scenarios from the catalog list below to display a side-by-side simulation comparison.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparisonScenarios.length}, 1fr)`, gap: '24px' }}>
            {comparisonScenarios.map(sc => (
              <div key={sc.id} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{sc.id}</span>
                    <span className={`badge ${sc.status === 'Approved' ? 'badge-success' : sc.status === 'Under Review' ? 'badge-warning' : 'badge-primary'}`}>
                      {sc.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginTop: '8px', fontWeight: 700 }}>{sc.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', minHeight: '38px', lineHeight: 1.4 }}>
                    {sc.description}
                  </p>
                </div>

                <hr style={{ border: 'none', height: '1px', background: 'var(--border-color)' }} />

                {/* Input variables */}
                <div>
                  <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Simulation Inputs</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Growth Rate:</span>
                      <strong>{sc.growthRate}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Budget:</span>
                      <strong>${sc.budget}M</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Zoning:</span>
                      <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{sc.zoning}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Eco Mandates:</span>
                      <strong>{sc.ecoFriendly ? 'Enforced' : 'None'}</strong>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', height: '1px', background: 'var(--border-color)' }} />

                {/* Simulated Outcomes */}
                <div>
                  <h5 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Simulated Outcomes</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Projected Supply:</span>
                      <strong>{sc.outcomes.supply.toLocaleString()} units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Projected Demand:</span>
                      <strong>{sc.outcomes.demand.toLocaleString()} units</strong>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', background: sc.outcomes.gap >= 0 ? 'var(--accent-glow)' : 'var(--danger-glow)', margin: '4px 0' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Housing Gap:</span>
                      <strong style={{ color: sc.outcomes.gap >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                        {sc.outcomes.gap >= 0 ? `+${sc.outcomes.gap.toLocaleString()} (Surplus)` : `${sc.outcomes.gap.toLocaleString()} (Deficit)`}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Estimated Cost:</span>
                      <strong>${sc.outcomes.cost}M</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Environmental Score:</span>
                      <strong style={{ color: sc.outcomes.ecoScore > 75 ? 'var(--accent)' : sc.outcomes.ecoScore > 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {sc.outcomes.ecoScore}/100
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Approve Button (Only Gov Officials have decision signing authority) */}
                {isOfficial && sc.status !== 'Approved' && (
                  <button
                    onClick={() => dispatch(approveScenario(sc.id))}
                    className="btn btn-primary"
                    style={{ marginTop: 'auto', fontSize: '0.8rem', padding: '8px' }}
                  >
                    <CheckCircle2 size={14} />
                    Approve Policy Draft
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Catalog */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Platform Simulation Catalog</h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Compare</th>
                <th>Name</th>
                <th>Zoning Policy</th>
                <th>Growth</th>
                <th>Budget</th>
                <th>Eco Score</th>
                <th>Gap Outcome</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(sc => (
                <tr key={sc.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={activeScenarioIds.includes(sc.id)}
                      onChange={() => dispatch(toggleCompareScenario(sc.id))}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td>
                    <strong style={{ display: 'block' }}>{sc.name}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Created: {sc.createdDate}</span>
                  </td>
                  <td>{sc.zoning}</td>
                  <td>{sc.growthRate}%</td>
                  <td>${sc.budget}M</td>
                  <td>
                    <span style={{ fontWeight: 600, color: sc.outcomes.ecoScore > 70 ? 'var(--accent)' : 'var(--warning)' }}>{sc.outcomes.ecoScore}/100</span>
                  </td>
                  <td>
                    <span className={`badge ${sc.outcomes.gap >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {sc.outcomes.gap >= 0 ? `+${sc.outcomes.gap}` : sc.outcomes.gap}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sc.status === 'Approved' ? 'badge-success' : sc.status === 'Under Review' ? 'badge-warning' : 'badge-primary'}`}>
                      {sc.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {isOfficial && sc.status !== 'Approved' && (
                        <button
                          onClick={() => dispatch(approveScenario(sc.id))}
                          style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                        >
                          Approve
                        </button>
                      )}
                      {(isPlanner || isOfficial) && (
                        <button
                          onClick={() => dispatch(deleteScenario(sc.id))}
                          style={{ color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
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

export default PolicySimulation;
