import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  approveRegistration,
  rejectRegistration,
  updateUserRole,
  fetchUsers,
  fetchAuditLogs
} from '../store/authSlice';
import { Settings, Shield, UserCheck, ShieldAlert, Check, X } from 'lucide-react';

function UserManagement() {
  const dispatch = useDispatch();
  const { users, pendingRegistrations, auditLogs, user: currentUser } = useSelector((state) => state.auth);

  const isAdmin = currentUser?.role === 'Administrator';

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers());
      dispatch(fetchAuditLogs());
    }
  }, [dispatch, isAdmin]);

  // Handle role select change
  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUserRole({ userId, role: newRole }));
  };

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>User Management & Governance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Enforce Role-Based Access Controls (RBAC), audit platform behaviors, and configure account approvals.
        </p>
      </div>

      {/* Access Warning if not admin */}
      {!isAdmin && (
        <div style={{ padding: '16px', background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Access Denied:</strong> Only Administrators can modify user accounts, roles, or view full security audit logs.
          </div>
        </div>
      )}

      {/* Pending Account Requests Panel */}
      {isAdmin && (
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} style={{ color: 'var(--primary)' }} />
            Pending Self-Registration Requests
          </h3>

          {pendingRegistrations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No pending registrations currently require review.
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requester Name</th>
                    <th>Email Address</th>
                    <th>Requested Role</th>
                    <th>Date Requested</th>
                    <th>Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.name}</td>
                      <td>{req.email}</td>
                      <td>
                        <span className="badge badge-primary">{req.role}</span>
                      </td>
                      <td>{req.requestDate}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => dispatch(approveRegistration(req.id))}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px' }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => dispatch(rejectRegistration(req.id))}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px', color: 'var(--danger)' }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lower Row: Platform Users + Security Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '24px' }}>
        
        {/* User Catalog Table */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} style={{ color: 'var(--primary)' }} />
            System Directory & RBAC Roles
          </h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Role Config</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          fontSize: '0.8rem'
                        }}>
                          {u.avatar}
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="form-input"
                          style={{ background: 'var(--bg-secondary)', fontSize: '0.8rem', padding: '6px 10px', cursor: 'pointer', width: '100%', maxWidth: '180px' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Urban Planner">Urban Planner</option>
                          <option value="Data Analyst">Data Analyst</option>
                          <option value="Government Official">Government Official</option>
                          <option value="Stakeholder">Stakeholder</option>
                        </select>
                      ) : (
                        <span className="badge badge-primary">{u.role}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Governance Audit Logs */}
        {isAdmin && (
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--primary)' }} />
              Security Audit Logs (Immutable)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.75rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.user}</strong>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{log.action}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '2px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{log.timestamp}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default UserManagement;
