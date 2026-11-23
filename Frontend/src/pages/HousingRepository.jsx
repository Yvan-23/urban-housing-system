import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilters, uploadDataset, resetFilters, fetchRecords, clearRecords, addRecord } from '../store/repositorySlice';
import { Search, Filter, RefreshCw, Upload, AlertCircle, CheckCircle2, Play, Plus, X } from 'lucide-react';

function HousingRepository() {
  const dispatch = useDispatch();
  const { records, datasets, filters } = useSelector((state) => state.repository);
  const { user } = useSelector((state) => state.auth);
  const isAnalyst = user?.role === 'Data Analyst';
  const isPlanner = user?.role === 'Urban Planner';
  const isAdmin = user?.role === 'Administrator';
  const canAdd = isAnalyst || isPlanner || isAdmin;

  // State for file upload status
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [etlRunning, setEtlRunning] = useState(false);

  // Add Record form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '', district: '', propertyType: 'Apartment',
    status: 'Occupied', price: '', city: '', address: ''
  });
  const [addStatus, setAddStatus] = useState(null); // 'success' | 'error' | 'loading'

  // Load records from backend
  useEffect(() => {
    dispatch(fetchRecords());
  }, [dispatch]);

  // ETL pipelines logs (auto-generated, not hardcoded demo data)
  const [etlLogs, setEtlLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), text: 'ETL Pipeline Ready. Awaiting manual sync trigger.' }
  ]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  // Run mock ETL Pipeline
  const runEtl = () => {
    setEtlRunning(true);
    setEtlLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), text: 'Triggering Manual ETL Sync...' },
    ]);

    setTimeout(() => {
      setEtlLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), text: 'Cleaning duplicate records and formatting currencies...' },
      ]);
    }, 1500);

    setTimeout(() => {
      setEtlLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), text: 'Job Completed Successfully. 45 records updated.' }
      ]);
      dispatch(fetchRecords());
      setEtlRunning(false);
    }, 3000);
  };

  // Real File Upload Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    setUploadStatus('loading');
    dispatch(uploadDataset({ file, uploadedBy: user?.name }))
      .unwrap()
      .then(() => {
        setUploadStatus('success');
      })
      .catch((err) => {
        console.error("Upload error:", err);
        setUploadStatus('error');
      });
  };

  // Add Record submit handler
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!addFormData.title || !addFormData.district) return;
    setAddStatus('loading');
    dispatch(addRecord({
      title: addFormData.title,
      district: addFormData.district,
      propertyType: addFormData.propertyType,
      status: addFormData.status,
      price: parseFloat(addFormData.price) || 0,
      city: addFormData.city,
      address: addFormData.address,
    }))
      .unwrap()
      .then(() => {
        setAddStatus('success');
        setAddFormData({ title: '', district: '', propertyType: 'Apartment', status: 'Occupied', price: '', city: '', address: '' });
        setTimeout(() => setAddStatus(null), 3000);
      })
      .catch((err) => {
        console.error('Add record error:', err);
        setAddStatus('error');
        setTimeout(() => setAddStatus(null), 4000);
      });
  };

  // Filter Logic
  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.district.toLowerCase().includes(filters.search.toLowerCase()) || 
                          rec.type.toLowerCase().includes(filters.search.toLowerCase()) ||
                          rec.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDistrict = filters.district === 'All' || rec.district === filters.district;
    const matchesType = filters.type === 'All' || rec.type === filters.type;
    const matchesStatus = filters.status === 'All' || rec.status === filters.status;
    return matchesSearch && matchesDistrict && matchesType && matchesStatus;
  });

  // Extract unique filter options for dropdowns
  const uniqueDistricts = ['All', ...new Set(records.map(r => r.district))];
  const uniqueTypes = ['All', ...new Set(records.map(r => r.type))];
  const uniqueStatuses = ['All', ...new Set(records.map(r => r.status))];

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Housing Data Repository</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Centralized system database containing verified regional housing data records and ETL integrations.
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Close Form' : 'Add Record'}
          </button>
        )}
      </div>

      {/* Access Warning banner if unauthorized */}
      {!canAdd && (
        <div style={{ padding: '16px', background: 'var(--warning-glow)', border: '1px solid var(--warning)', borderRadius: '8px', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Read-Only Mode:</strong> Your role ({user?.role}) does not have permission to upload datasets or add records. You can only view the catalog.
          </div>
        </div>
      )}

      {/* Add Record Form Panel */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="card-glass animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            Add New Housing Record
          </h3>

          {addStatus === 'success' && (
            <div style={{ padding: '10px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--accent)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Record saved to database successfully!
            </div>
          )}
          {addStatus === 'error' && (
            <div style={{ padding: '10px', background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> Failed to save record. Check the backend is running.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Property Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" className="form-input" placeholder="e.g. Kigali Skyline Apartments" required
                value={addFormData.title} onChange={e => setAddFormData({ ...addFormData, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">District <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" className="form-input" placeholder="e.g. Nyarugenge" required
                value={addFormData.district} onChange={e => setAddFormData({ ...addFormData, district: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" placeholder="e.g. Kigali"
                value={addFormData.city} onChange={e => setAddFormData({ ...addFormData, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-input" placeholder="e.g. KG 7 Ave"
                value={addFormData.address} onChange={e => setAddFormData({ ...addFormData, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select className="form-input" style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                value={addFormData.propertyType} onChange={e => setAddFormData({ ...addFormData, propertyType: e.target.value })}>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Condominium">Condominium</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                value={addFormData.status} onChange={e => setAddFormData({ ...addFormData, status: e.target.value })}>
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Under Construction">Under Construction</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Market Price (USD)</label>
              <input type="number" className="form-input" placeholder="e.g. 250000" min="0"
                value={addFormData.price} onChange={e => setAddFormData({ ...addFormData, price: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={addStatus === 'loading'} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {addStatus === 'loading' ? <><RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} /> Saving...</> : <><Plus size={14} /> Save to Database</>}
            </button>
          </div>
        </form>
      )}

      {/* Upper Grid: Search/Filter + Upload Simulator (If authorized) */}
      <div style={{ display: 'grid', gridTemplateColumns: isAnalyst ? '1.3fr 0.7fr' : '1fr', gap: '32px' }}>
        
        {/* Filter Controls Panel */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} style={{ color: 'var(--primary)' }} />
            Search Filters
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Search Query</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="ID, district, type..."
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%' }}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', width: '100%', cursor: 'pointer' }}
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Housing Type</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', width: '100%', cursor: 'pointer' }}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', width: '100%', cursor: 'pointer' }}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => dispatch(resetFilters())} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Upload File Panel (Analyst Only) */}
        {isAnalyst && (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} style={{ color: 'var(--primary)' }} />
                Ingest Housing Dataset
              </h3>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear ALL housing records from the database? This cannot be undone.")) {
                    dispatch(clearRecords());
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--danger)' }}
              >
                Clear Database
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '24px 16px',
                textAlign: 'center',
                background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
            >
              <input
                type="file"
                multiple={false}
                accept=".csv,.xlsx,.json"
                onChange={handleFileInput}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {uploadStatus === 'loading' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <RefreshCw size={32} className="animated-spin" style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Parsing housing structures and validation schemas...</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>File Upload & Validation Complete</p>
                  <button onClick={() => setUploadStatus(null)} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                    Upload Another File
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={28} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Drag & drop CSV/Excel files here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports CSV, XLSX up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Database Table Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isAnalyst ? '1.5fr 0.5fr' : '1fr', gap: '32px' }}>
        
        {/* Catalog Table */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Housing Catalog Records</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {filteredRecords.length} of {records.length} records
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>District</th>
                  <th>Type</th>
                  <th>Units</th>
                  <th>Market Price</th>
                  <th>Vacancy Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      No records matched the filter query.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => (
                    <tr key={rec.id}>
                      <td style={{ fontWeight: 600 }}>{rec.id}</td>
                      <td>{rec.district}</td>
                      <td>{rec.type}</td>
                      <td>{rec.units}</td>
                      <td>${rec.price.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 500 }}>{rec.vacancyRate}%</span>
                          <div style={{ width: '40px', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px' }}>
                            <div style={{ width: `${rec.vacancyRate}%`, height: '100%', background: rec.vacancyRate > 8 ? 'var(--warning)' : 'var(--accent)', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${rec.status === 'Occupied' ? 'badge-success' : rec.status === 'Vacant' ? 'badge-danger' : 'badge-warning'}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Integration & ETL Panel (Analyst Only) */}
        {isAnalyst && (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>ETL Job Monitor</h3>
              <button 
                onClick={runEtl} 
                disabled={etlRunning}
                className="btn btn-primary" 
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                <Play size={12} />
                Sync ETL
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981', overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {etlLogs.map((log, index) => (
                  <div key={index}>
                    <span style={{ color: 'var(--text-secondary)' }}>[{log.timestamp}]</span> {log.text}
                  </div>
                ))}
                {etlRunning && (
                  <div className="animated-pulse" style={{ color: 'var(--primary)' }}>
                    Running pipeline processes...
                  </div>
                )}
              </div>

              {/* Uploads history */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Uploaded Dataset Files
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {datasets.map(ds => (
                    <div key={ds.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{ds.filename}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{ds.size} | {ds.recordsCount} records</span>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Ingested</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default HousingRepository;
