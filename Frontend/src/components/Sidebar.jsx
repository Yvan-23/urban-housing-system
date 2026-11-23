import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Database,
  Map,
  Cpu,
  Sliders,
  FileText,
  Users,
  Eye,
  Settings
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Urban Planner', 'Data Analyst', 'Government Official', 'Stakeholder'] },
  { path: '/repository', label: 'Housing Repository', icon: Database, roles: ['Data Analyst'] },
  { path: '/analytics', label: 'AI Analytics', icon: Cpu, roles: ['Urban Planner', 'Data Analyst'] },
  { path: '/maps', label: 'GIS Maps', icon: Map, roles: ['Urban Planner'] },
  { path: '/simulation', label: 'Scenario Planning', icon: Sliders, roles: ['Urban Planner', 'Government Official'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['Administrator', 'Urban Planner', 'Data Analyst', 'Government Official', 'Stakeholder'] },
  { path: '/collaboration', label: 'Collaboration', icon: Users, roles: ['Stakeholder'] },
  { path: '/monitoring', label: 'Monitoring & Eval', icon: Eye, roles: ['Government Official'] },
  { path: '/users', label: 'User Management', icon: Settings, roles: ['Administrator'] }
];

function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const activeRole = user?.role || 'Stakeholder';

  // Filter menu items by user role
  const allowedItems = MENU_ITEMS.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <img 
          src="/RHA_logo.png" 
          alt="RHA Logo" 
          style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
        />
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            URBAN AI
          </h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
            Analytics Portal
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, var(--primary-glow) 0%, transparent 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'var(--transition-smooth)',
                paddingLeft: isActive ? '13px' : '16px' // adjust for border
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div style={{
        padding: '20px 16px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          color: 'var(--primary)',
          fontSize: '0.9rem'
        }}>
          {user?.avatar || 'U'}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'Guest User'}
          </h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 500 }}>
            {activeRole}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
