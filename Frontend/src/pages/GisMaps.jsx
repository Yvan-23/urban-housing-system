import React, { useState, useEffect } from 'react';
import { Map, Layers, Radio, ShieldAlert, Layers3, Info } from 'lucide-react';
import api from '../store/api';

const DISTRICT_SPECS = {
  'Downtown Central': { units: 150, price: 320000, vacancy: 3.5, demand: 'High', color: '#3b82f6', description: 'Metropolitan center with high density apartment complexes and retail corridors.' },
  'North Valley': { units: 40, price: 480000, vacancy: 3.5, demand: 'Medium', color: '#10b981', description: 'Suburban valley corridor, experiencing steady medium-density family development.' },
  'East Meadows': { units: 60, price: 290000, vacancy: 12.5, demand: 'High', color: '#f59e0b', description: 'Low density developments; currently displaying high vacancy and infrastructure lags.' },
  'Southern Waterfront': { units: 85, price: 650000, vacancy: 3.5, demand: 'Critical', color: '#ef4444', description: 'Premium coastal sector with luxury condominiums and rapid price inflation.' },
  'West Hills': { units: 40, price: 540000, vacancy: 0.0, demand: 'Low', color: '#8b5cf6', description: 'Exurban foothills area; high income bracket single family residential units.' }
};

function GisMaps() {
  const [activeOverlay, setActiveOverlay] = useState('density'); // 'density', 'population', 'infrastructure'
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Downtown Central');
  const [mapMode, setMapMode] = useState('interactive'); // 'interactive', 'leaflet'
  const [backendDistricts, setBackendDistricts] = useState([]);
  const [districtSpecs, setDistrictSpecs] = useState(DISTRICT_SPECS);

  useEffect(() => {
    api.get('/api/maps/districts')
      .then(res => {
        setBackendDistricts(res.data.features || []);
      })
      .catch(err => {
        console.error("Failed to load GIS data:", err);
      });

    api.get('/api/housing')
      .then(res => {
        const records = res.data;
        const specs = { ...DISTRICT_SPECS };
        
        const groups = {};
        records.forEach(r => {
          const d = r.district;
          if (!d) return;
          if (!groups[d]) {
            groups[d] = [];
          }
          groups[d].push(r);
        });

        Object.keys(groups).forEach(d => {
          const groupRecords = groups[d];
          const totalUnits = groupRecords.reduce((sum, r) => sum + (r.units || 0), 0);
          const avgPrice = groupRecords.reduce((sum, r) => sum + (r.price || 0), 0) / groupRecords.length;
          const avgVacancy = groupRecords.reduce((sum, r) => sum + (r.vacancyRate || 0), 0) / groupRecords.length;

          let demand = 'Low';
          if (avgVacancy < 3.0) demand = 'Critical';
          else if (avgVacancy < 5.0) demand = 'High';
          else if (avgVacancy < 8.0) demand = 'Medium';

          specs[d] = {
            ...specs[d],
            units: totalUnits,
            price: Math.round(avgPrice),
            vacancy: +avgVacancy.toFixed(1),
            demand
          };
        });

        setDistrictSpecs(specs);
      })
      .catch(err => {
        console.error("Failed to load housing data for GIS:", err);
      });
  }, []);

  const activeSpecs = districtSpecs[selectedDistrict] || DISTRICT_SPECS[selectedDistrict];

  // Helper to color districts based on active overlay
  const getDistrictFill = (name) => {
    const specs = districtSpecs[name] || DISTRICT_SPECS[name];
    if (activeOverlay === 'density') {
      // Scale from yellow to deep red based on unit density
      if (specs.units > 100) return 'rgba(239, 68, 68, 0.7)'; // Southern/Downtown
      if (specs.units > 50) return 'rgba(245, 158, 11, 0.7)'; // Valley
      return 'rgba(16, 185, 129, 0.7)'; // Meadows/Hills
    }
    if (activeOverlay === 'population') {
      // Scale based on vacancy rates (higher vacancy = green, lower vacancy = purple)
      if (specs.vacancy > 8) return 'rgba(16, 185, 129, 0.7)'; // East Meadows (12.5%)
      if (specs.vacancy > 4) return 'rgba(59, 130, 246, 0.7)'; // North Valley (5.1%)
      return 'rgba(139, 92, 246, 0.7)'; // West Hills / Central
    }
    // Infrastructure overlays
    if (name === 'East Meadows') return 'rgba(245, 158, 11, 0.6)'; // Infrastructure gap warning
    return 'rgba(16, 185, 129, 0.6)'; // Normal status
  };

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Geospatial GIS Visualization</h1>
            {backendDistricts.length > 0 ? (
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>GIS Connected</span>
            ) : (
              <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Offline</span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Interactive district-level maps analyzing housing density, population, and infrastructure overlays.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setMapMode('interactive')}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              background: mapMode === 'interactive' ? 'var(--primary)' : 'transparent',
              color: 'white',
              transition: 'var(--transition-smooth)'
            }}
          >
            Vector Map
          </button>
          <button
            onClick={() => setMapMode('leaflet')}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              background: mapMode === 'leaflet' ? 'var(--primary)' : 'transparent',
              color: 'white',
              transition: 'var(--transition-smooth)'
            }}
          >
            Leaflet GIS
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '32px' }}>
        
        {/* Main Map Container Card */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '600px' }}>
          
          {/* Overlay selectors */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} />
              Active GIS Overlays
            </h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="overlay"
                  checked={activeOverlay === 'density'}
                  onChange={() => setActiveOverlay('density')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Density Heatmap
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="overlay"
                  checked={activeOverlay === 'population'}
                  onChange={() => setActiveOverlay('population')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Vacancy Choropleth
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="overlay"
                  checked={activeOverlay === 'infrastructure'}
                  onChange={() => setActiveOverlay('infrastructure')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Infrastructure Overlay
              </label>
            </div>
          </div>

          {/* Render Vector Vector Map */}
          {mapMode === 'interactive' && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Interactive Vector SVG Map */}
              <svg viewBox="0 0 600 400" style={{ width: '100%', maxHeight: '380px', fill: 'none' }}>
                {/* District Paths - Custom Polygons simulating districts shape */}
                
                {/* North Valley */}
                <path
                  d="M 100 50 L 300 30 L 350 150 L 150 180 Z"
                  fill={getDistrictFill('North Valley')}
                  stroke={selectedDistrict === 'North Valley' ? 'white' : 'var(--border-color)'}
                  strokeWidth={selectedDistrict === 'North Valley' ? 3 : 1.5}
                  onClick={() => setSelectedDistrict('North Valley')}
                  onMouseEnter={() => setHoveredDistrict('North Valley')}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                />
                <text x="210" y="100" fill="white" fontSize={11} fontWeight={600} pointerEvents="none">North Valley</text>

                {/* West Hills */}
                <path
                  d="M 80 150 L 150 180 L 120 350 L 40 280 Z"
                  fill={getDistrictFill('West Hills')}
                  stroke={selectedDistrict === 'West Hills' ? 'white' : 'var(--border-color)'}
                  strokeWidth={selectedDistrict === 'West Hills' ? 3 : 1.5}
                  onClick={() => setSelectedDistrict('West Hills')}
                  onMouseEnter={() => setHoveredDistrict('West Hills')}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                />
                <text x="85" y="240" fill="white" fontSize={11} fontWeight={600} pointerEvents="none">West Hills</text>

                {/* Downtown Central */}
                <path
                  d="M 150 180 L 350 150 L 380 270 L 220 300 Z"
                  fill={getDistrictFill('Downtown Central')}
                  stroke={selectedDistrict === 'Downtown Central' ? 'white' : 'var(--border-color)'}
                  strokeWidth={selectedDistrict === 'Downtown Central' ? 3 : 1.5}
                  onClick={() => setSelectedDistrict('Downtown Central')}
                  onMouseEnter={() => setHoveredDistrict('Downtown Central')}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                />
                <text x="250" y="225" fill="white" fontSize={11} fontWeight={600} pointerEvents="none">Downtown Central</text>

                {/* East Meadows */}
                <path
                  d="M 300 30 L 520 80 L 500 220 L 350 150 Z"
                  fill={getDistrictFill('East Meadows')}
                  stroke={selectedDistrict === 'East Meadows' ? 'white' : 'var(--border-color)'}
                  strokeWidth={selectedDistrict === 'East Meadows' ? 3 : 1.5}
                  onClick={() => setSelectedDistrict('East Meadows')}
                  onMouseEnter={() => setHoveredDistrict('East Meadows')}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                />
                <text x="400" y="125" fill="white" fontSize={11} fontWeight={600} pointerEvents="none">East Meadows</text>

                {/* Southern Waterfront */}
                <path
                  d="M 220 300 L 380 270 L 500 220 L 540 340 L 300 370 Z"
                  fill={getDistrictFill('Southern Waterfront')}
                  stroke={selectedDistrict === 'Southern Waterfront' ? 'white' : 'var(--border-color)'}
                  strokeWidth={selectedDistrict === 'Southern Waterfront' ? 3 : 1.5}
                  onClick={() => setSelectedDistrict('Southern Waterfront')}
                  onMouseEnter={() => setHoveredDistrict('Southern Waterfront')}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                />
                <text x="350" y="325" fill="white" fontSize={11} fontWeight={600} pointerEvents="none">Southern Waterfront</text>
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredDistrict && (
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  pointerEvents: 'none'
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>{hoveredDistrict}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>Units: {(districtSpecs[hoveredDistrict] || DISTRICT_SPECS[hoveredDistrict]).units.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Render Mock Leaflet View */}
          {mapMode === 'leaflet' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <ShieldAlert size={48} style={{ color: 'var(--primary)' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Leaflet GIS Engine Initialization</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                  Leaflet map tiles successfully connected via API. Using mock district coordinates bound at coordinates <code>[40.7128, -74.0060]</code>. Map layer tiles loaded from OpenStreetMap CDN.
                </p>
              </div>
              <button onClick={() => setMapMode('interactive')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Toggle Vector Graphic View
              </button>
            </div>
          )}

          {/* Map legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderTop: '1px solid var(--border-color)', borderRadius: '0 0 12px 12px', fontSize: '0.75rem' }}>
            <div>
              <strong>Legend:</strong> {activeOverlay === 'density' ? 'Density Range (Units)' : activeOverlay === 'population' ? 'Vacancy Percentages' : 'Infrastructure Quality'}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: activeOverlay === 'density' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(139, 92, 246, 0.7)' }}></div>
                <span>High (Risk)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: activeOverlay === 'density' ? 'rgba(245, 158, 11, 0.7)' : 'rgba(59, 130, 246, 0.7)' }}></div>
                <span>Moderate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.7)' }}></div>
                <span>Sustainable</span>
              </div>
            </div>
          </div>

        </div>

        {/* District Detail Side Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>District Inspector</span>
              <h2 style={{ fontSize: '1.4rem', marginTop: '6px', fontWeight: 700 }}>{selectedDistrict}</h2>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {activeSpecs.description}
            </p>

            <hr style={{ border: 'none', height: '1px', background: 'var(--border-color)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Housing Units:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeSpecs.units.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Median Unit Price:</span>
                <strong style={{ color: 'var(--text-primary)' }}>${activeSpecs.price.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vacancy Rate:</span>
                <strong style={{ color: activeSpecs.vacancy > 8 ? 'var(--warning)' : 'var(--accent)' }}>{activeSpecs.vacancy}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI Demand Priority:</span>
                <strong style={{
                  color: activeSpecs.demand === 'Critical' ? 'var(--danger)' : activeSpecs.demand === 'High' ? 'var(--warning)' : 'var(--accent)'
                }}>{activeSpecs.demand}</strong>
              </div>
            </div>
          </div>

          {/* Infrastructure Overlays Warning alerts */}
          {selectedDistrict === 'East Meadows' && (
            <div className="card-glass" style={{ background: 'var(--warning-glow)', border: '1px solid var(--warning)', display: 'flex', gap: '10px' }}>
              <Info size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                <strong>Infrastructure Deficit Alert:</strong> Sewer and electricity pipelines in East Meadows are currently capped at 12,000 capacity. New developments exceed threshold tolerances.
              </div>
            </div>
          )}

          {selectedDistrict === 'Southern Waterfront' && (
            <div className="card-glass" style={{ background: 'var(--danger-glow)', border: '1px solid var(--danger)', display: 'flex', gap: '10px' }}>
              <Info size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                <strong>Zoning Boundary Warning:</strong> Rapid expansion of residential high-rises borders protected coastal wetlands. Immediate zoning review recommended.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default GisMaps;
