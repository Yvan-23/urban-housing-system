import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, ArrowRight, ShieldCheck, Building, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show success message from password reset redirect
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  // Check if redirected due to timeout
  const isTimeout = sessionStorage.getItem('urban_session_timeout') === 'true';
  if (isTimeout) {
    sessionStorage.removeItem('urban_session_timeout');
    setTimeout(() => setError('Your session has expired due to inactivity. Please log in again.'), 0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      login(user);
      
      // Redirect to MFA verification
      navigate('/verify-mfa');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-secondary-950">
      {/* Left side - Branding & Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/modern_urban_housing_login_1778334263228.png" 
            alt="Modern Urban Housing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        ></motion.div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
              <BrainCircuit className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">UrbanAI Intelligence</h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-8">
            Empowering Cities Through <br />
            <span className="text-primary-200">Data Intelligence.</span>
          </h2>
          
          <div className="space-y-6">
            {[
              "AI-Driven Housing Demand Forecasting",
              "Real-time Geospatial Visualization",
              "Policy Impact Simulation Engine",
              "Multi-Agency Data Integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <ShieldCheck size={20} className="text-accent-400" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2024 Urban Analytics & Decision Support System. <br />
            Official Government Use Only.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">Welcome Back</h3>
            <p className="text-secondary-500">Please enter your credentials to access the platform.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {successMessage && !error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3"
            >
              <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-green-700">{successMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Government Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="remember" className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">Remember this device for 30 days</label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to System
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-secondary-200 dark:border-secondary-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-secondary-950 px-4 text-secondary-500 font-semibold tracking-wider">Secure Access</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-secondary-200 dark:border-secondary-800 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-colors text-sm font-medium">
                <ShieldCheck size={18} className="text-primary-600" />
                GovID
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-secondary-200 dark:border-secondary-800 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-colors text-sm font-medium">
                <Building size={18} />
                Agency Auth
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-secondary-500">
            Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Request Access</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
