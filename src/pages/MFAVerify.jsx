import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const MFAVerify = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { user, mfaPending, completeMFA, logout } = useAuth();

  useEffect(() => {
    // If not logged in at all, or MFA already done, redirect
    if (!user) {
      navigate('/login', { replace: true });
    } else if (!mfaPending) {
      navigate('/dashboard', { replace: true });
    }
    
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [user, mfaPending, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.substring(0, 1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      return setError('Please enter the 6-digit code');
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.verifyMFA(fullCode);
      completeMFA();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      // Clear inputs on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    logout();
    navigate('/login');
  };

  if (!user || !mfaPending) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden"
      >
        <div className="p-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <ShieldAlert className="text-primary-600 dark:text-primary-400" size={32} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Two-Factor Authentication</h2>
            <p className="text-secondary-500 text-sm">
              Please enter the 6-digit verification code sent to your registered device.
              <br />
              <span className="font-medium text-secondary-600 dark:text-secondary-400 text-xs mt-2 block">
                Hint: Use 123456 for testing
              </span>
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || code.join('').length !== 6}
              className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Access
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleCancel}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Return to Login
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MFAVerify;
