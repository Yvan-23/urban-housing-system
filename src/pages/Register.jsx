import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, User, Lock, ArrowRight, ShieldCheck, Briefcase, Phone, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Urban Planner',
    department: '',
    organization: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };

  const strengthScore = calculatePasswordStrength(formData.password);
  
  const getStrengthColor = () => {
    if (strengthScore <= 25) return 'bg-red-500';
    if (strengthScore <= 50) return 'bg-orange-500';
    if (strengthScore <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (strengthScore < 75) {
      return setError('Please choose a stronger password for security reasons');
    }

    setIsLoading(true);

    try {
      const { confirmPassword, termsAccepted, ...registrationData } = formData;
      registrationData.name = `${formData.firstName} ${formData.lastName}`;
      
      const response = await authService.register(registrationData);
      console.log('Registration success:', response);
      
      // Navigate to login with success message state
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      console.error('Registration error detail:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-secondary-950">
      {/* Left side - Information */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden flex-col justify-between p-16 fixed top-0 bottom-0 left-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/modern_urban_housing_login_1778334263228.png" 
            alt="Modern Urban Housing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary-900/90 backdrop-blur-[2px]"></div>
        </div>

        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <BrainCircuit className="text-primary-500" size={32} />
            <h1 className="text-3xl font-bold text-white tracking-tight">UrbanAI</h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-white mb-8 leading-tight">Access the Housing <br />Decision Intelligence.</h2>
          
          <div className="space-y-10">
            <div className="flex gap-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                <User className="text-primary-400" size={28} />
              </div>
              <div>
                <h4 className="text-white text-xl font-bold">Role-Based Analytics</h4>
                <p className="text-secondary-400">Tailored dashboards for planners, analysts, and officials.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
                <ShieldCheck className="text-accent-400" size={28} />
              </div>
              <div>
                <h4 className="text-white text-xl font-bold">Secure Data Governance</h4>
                <p className="text-secondary-400">Enterprise-grade encryption and access controls.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-10 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 mt-12">
          <p className="text-secondary-200 text-lg italic leading-relaxed">"The system has revolutionized how we coordinate housing infrastructure across multiple districts."</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 shadow-lg shadow-primary-500/20"></div>
            <div>
              <p className="text-white font-bold text-lg">James Wilson</p>
              <p className="text-secondary-500 text-sm font-medium">Director of Urban Planning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 md:p-12 lg:ml-[40%] bg-secondary-50/50 dark:bg-secondary-950">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl bg-white dark:bg-secondary-900 shadow-2xl shadow-primary-500/10 rounded-[2.5rem] p-10 md:p-16 border border-secondary-200/60 dark:border-secondary-800"
        >
          <div className="mb-12">
            <h3 className="text-5xl font-black text-secondary-900 dark:text-white mb-4 tracking-tight">Request Access</h3>
            <p className="text-secondary-500 text-lg font-medium">Please provide your professional details to apply for an account.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-start gap-4"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <h4 className="text-red-800 dark:text-red-300 font-bold">Registration Issue</h4>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="text" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="text" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="email" name="email" placeholder="example@agency.gov" value={formData.email} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Organization</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="text" name="organization" placeholder="Agency or Ministry Name" value={formData.organization} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Role / Designation</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" size={20} />
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-primary-500 transition-all text-lg font-medium appearance-none cursor-pointer">
                    <option>Urban Planner</option>
                    <option>Data Analyst</option>
                    <option>Government Official</option>
                    <option>System Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Department / Unit</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input type="text" name="department" placeholder="e.g. Urban Infrastructure Department" value={formData.department} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Create Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-secondary-50 dark:bg-secondary-800/50 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 transition-all text-lg font-medium" />
                </div>
              </div>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="p-6 rounded-[1.5rem] bg-secondary-50/50 dark:bg-secondary-800/30 border border-secondary-200 dark:border-secondary-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-secondary-500 uppercase tracking-[0.2em]">Security Rating</span>
                  <span className="text-sm font-black" style={{ color: strengthScore > 50 ? '#10b981' : strengthScore > 25 ? '#f59e0b' : '#ef4444' }}>
                    {strengthScore <= 25 && 'Insufficient'}
                    {strengthScore > 25 && strengthScore <= 50 && 'Moderate'}
                    {strengthScore > 50 && strengthScore <= 75 && 'Good'}
                    {strengthScore > 75 && 'Maximum Security'}
                  </span>
                </div>
                <div className="flex gap-2 h-2 w-full bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${Math.min(strengthScore, 100)}%` }}></div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-2">
              <div className="flex items-center h-6">
                <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required className="w-5 h-5 rounded border-2 border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
              </div>
              <label htmlFor="terms" className="text-sm text-secondary-500 leading-relaxed font-medium">
                I formally declare that I am an authorized government official and I agree to strictly adhere to the <span className="text-secondary-900 dark:text-white font-bold">Data Security Protocols</span> and <span className="text-secondary-900 dark:text-white font-bold">Access Policies</span>.
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Register System Access
                  <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-lg text-secondary-500 font-medium">
            Already have an account? <Link to="/login" className="text-primary-600 font-extrabold hover:underline ml-2">Sign In Here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
