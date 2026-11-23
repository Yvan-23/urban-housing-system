import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generateReport, fetchReports } from '../store/collaborationSlice';
import { FileText, Download, Printer, Plus, RefreshCw, AlertCircle } from 'lucide-react';

function Reports() {
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.collaboration);
  const { user } = useSelector((state) => state.auth);

  // Load reports from backend
  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Form states
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('Demand Forecast');
  const [format, setFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    setIsGenerating(true);
    setMessage(null);

    dispatch(generateReport({
      name: title,
      format
    }))
      .unwrap()
      .then(() => {
        setIsGenerating(false);
        setTitle('');
        setMessage({ type: 'success', text: 'Report generated and archived successfully.' });
      })
      .catch((err) => {
        console.error("Report generation error:", err);
        setIsGenerating(false);
        setMessage({ type: 'error', text: 'Failed to generate report.' });
      });
  };

  const handleDownload = (reportName, format) => {
    alert(`Downloading "${reportName}" as ${format}...`);
  };

  const handlePrint = (reportName) => {
    alert(`Opening system print dialog for "${reportName}"...`);
  };

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reports & Policy Briefs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Generate, customize, and export detailed regional reports and executive policy briefs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Report Generator Form */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            On-Demand Report Generator
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {message && (
              <div style={{
                background: message.type === 'success' ? 'var(--accent-glow)' : 'var(--danger-glow)',
                border: `1px solid ${message.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`,
                color: message.type === 'success' ? 'var(--accent)' : 'var(--danger)',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input
                type="text"
                placeholder="e.g. Q2 housing demand summary"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Classification Type</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Demand Forecast">Demand Forecast Models</option>
                <option value="Policy Simulation">Policy Simulation Summary</option>
                <option value="Evaluation Summary">M&E Projects Evaluation</option>
                <option value="Audit Report">Security Compliance Audit</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Export Format</label>
              <select
                className="form-input"
                style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="PDF">Portable Document Format (PDF)</option>
                <option value="Excel">Microsoft Excel Workbook (XLSX)</option>
                <option value="PowerPoint">PowerPoint Slideshow (PPTX)</option>
              </select>
            </div>

            <button type="submit" disabled={isGenerating} className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animated-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Compiling Data...
                </>
              ) : 'Compile & Generate'}
            </button>
          </form>
        </div>

        {/* Scheduled Automation Card */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            Automated Delivery Scheduler
          </h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Configure the platform to automatically compile and distribute housing metrics reports to stakeholders.
          </p>

          <hr style={{ border: 'none', height: '1px', background: 'var(--border-color)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div>
                <strong>Monthly Planning Brief</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Recipients: Urban Planner group</p>
              </div>
              <span className="badge badge-primary">First of Month</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div>
                <strong>M&E KPI Summary</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Recipients: Government Officials</p>
              </div>
              <span className="badge badge-primary">Weekly (Mon)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Reports Catalog */}
      <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Generated Reports Archive</h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Format</th>
                <th>Size</th>
                <th>Compiled By</th>
                <th>Date Generated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                    No reports found in the archive.
                  </td>
                </tr>
              ) : (
                reports.map(rep => (
                  <tr key={rep.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <FileText size={18} style={{ color: 'var(--primary)' }} />
                        <strong>{rep.name}</strong>
                      </div>
                    </td>
                    <td>{rep.type}</td>
                    <td>
                      <span className={`badge ${rep.format === 'PDF' ? 'badge-danger' : rep.format === 'Excel' ? 'badge-success' : 'badge-primary'}`}>
                        {rep.format}
                      </span>
                    </td>
                    <td>{rep.size}</td>
                    <td>{rep.generatedBy}</td>
                    <td>{rep.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <button
                          onClick={() => handleDownload(rep.name, rep.format)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          onClick={() => handlePrint(rep.name)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <Printer size={12} /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Reports;
