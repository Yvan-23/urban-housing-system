import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';
import DataIntegration from './pages/DataIntegration';
import AIAnalytics from './pages/AIAnalytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import MFAVerify from './pages/MFAVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import GISVisualization from './pages/GISVisualization';
import DecisionIntelligence from './pages/DecisionIntelligence';
import Reporting from './pages/Reporting';
import SecurityGovernance from './pages/SecurityGovernance';
import Collaboration from './pages/Collaboration';
import ScenarioPlanning from './pages/ScenarioPlanning';
import MonitoringEvaluation from './pages/MonitoringEvaluation';

// Placeholder components for other pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-secondary-500">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>This module is currently under development for the urban intelligence system.</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, mfaPending, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (mfaPending) return <Navigate to="/verify-mfa" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-mfa" element={<MFAVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Dashboard Layout */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
              <Route index element={<Dashboard />} />
              <Route path="repository" element={<Repository />} />
              <Route path="integration" element={<DataIntegration />} />
              <Route path="analytics" element={<AIAnalytics />} />
              <Route path="intelligence" element={<DecisionIntelligence />} />
              <Route path="gis" element={<GISVisualization />} />
              <Route path="reporting" element={<Reporting />} />
              <Route path="scenarios" element={<ScenarioPlanning />} />
              <Route path="collaboration" element={<Collaboration />} />
              <Route path="monitoring" element={<MonitoringEvaluation />} />
              <Route path="security" element={<SecurityGovernance />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
