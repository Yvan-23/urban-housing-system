import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HousingRepository from './pages/HousingRepository';
import GisMaps from './pages/GisMaps';
import Analytics from './pages/Analytics';
import PolicySimulation from './pages/PolicySimulation';
import Reports from './pages/Reports';
import Collaboration from './pages/Collaboration';
import Monitoring from './pages/Monitoring';
import UserManagement from './pages/UserManagement';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Dashboard Shell */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <LayoutShell />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

// Layout Shell for wrapping protected pages
function LayoutShell() {
  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repository" element={<HousingRepository />} />
            <Route path="/maps" element={<GisMaps />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/simulation" element={<PolicySimulation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
