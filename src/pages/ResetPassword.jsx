import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If no email in state, redirect back to forgot-password
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };

  const strengthScore = calculatePasswordStrength(password);

  const getStrengthColor = () => {
    if (strengthScore <= 25) return 'bg-red-500';
    if (strengthScore <= 50) return 'bg-orange-500';
    if (strengthScore <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      return setError('Please enter the 6-digit code sent to your email.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (strengthScore < 75) {
      return setError('Please choose a stronger password.');
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email, otp, password);
      navigate('/login', { state: { message: 'Password has been reset successfully. Please log in with your new password.' } });
    } catch (err) {
      setError(err.message || 'Failed to reset password. The code may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden"
      >
        <div className="p-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <KeyRound className="text-primary-600 dark:text-primary-400" size={32} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Create New Password</h2>
            <p className="text-secondary-500 text-sm">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-secondary-700 dark:text-secondary-300">{email}</span>{' '}
              and choose a new password.
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP field */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Reset Code
              </label>
              <div className="relative group">
                <ShieldCheck
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all tracking-widest text-center font-mono text-lg"
                />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                New Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
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

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-secondary-500 font-medium">Password Strength</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: strengthScore > 50 ? '#10b981' : strengthScore > 25 ? '#f59e0b' : '#ef4444' }}
                  >
                    {strengthScore <= 25 && 'Weak'}
                    {strengthScore > 25 && strengthScore <= 50 && 'Fair'}
                    {strengthScore > 50 && strengthScore <= 75 && 'Good'}
                    {strengthScore > 75 && 'Strong'}
                  </span>
                </div>
                <div className="flex gap-1 h-1.5 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${Math.min(strengthScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-secondary-400 mt-1">
                  Must contain at least 8 characters, one uppercase, one number, and one special character.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors"
              >
                Cancel and return to login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
