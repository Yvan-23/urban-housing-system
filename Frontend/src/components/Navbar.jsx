import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { Bell, Search, LogOut, ChevronDown, User } from 'lucide-react';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Notifications will be loaded from backend in a future sprint
  const notifications = [];


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--navbar-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 90
    }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: '20px', width: '300px' }}>
        <Search size={16} style={{ color: 'var(--text-secondary)' }} />
        <input type="text" placeholder="Search parameters or logs..." style={{ fontSize: '0.85rem', width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)' }} />
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
            )}
          </button>

          {showNotifications && (
            <div className="card-glass" style={{
              position: 'absolute',
              top: '35px',
              right: 0,
              width: '320px',
              padding: '16px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No new notifications.</p>
                ) : notifications.map(n => (
                  <div key={n.id} style={{ fontSize: '0.8rem', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{n.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{n.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
              {user?.avatar || 'U'}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {showProfileMenu && (
            <div className="card-glass" style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '180px',
              padding: '8px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
              <button onClick={handleLogout} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                fontSize: '0.85rem',
                color: 'var(--danger)',
                cursor: 'pointer',
                borderRadius: '6px',
                textAlign: 'left',
                width: '100%'
              }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
