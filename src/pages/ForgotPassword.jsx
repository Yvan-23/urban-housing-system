import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      return setError('Please enter your email address.');
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <KeyRound className="text-primary-600 dark:text-primary-400" size={32} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Reset Password</h2>
            <p className="text-secondary-500 text-sm">
              Enter the email address associated with your government account to receive a reset code.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center"
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Success banner */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-6 text-left">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-green-800 dark:text-green-300 text-sm font-semibold mb-1">
                    Reset code sent!
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    A 6-digit code has been sent to <span className="font-semibold">{email}</span>.
                    Check your inbox and spam folder.
                  </p>
                </div>
              </div>

              <p className="text-secondary-500 text-sm mb-6">
                The code expires in <span className="font-semibold text-secondary-700 dark:text-secondary-300">15 minutes</span>.
                Enter it on the next screen to set your new password.
              </p>

              <button
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mb-4"
              >
                Enter Reset Code
                <ArrowRight size={20} />
              </button>

              <Link
                to="/login"
                className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors"
              >
                Cancel and return to login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                  Government Email
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    size={20}
                  />
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors"
                >
                  Cancel and return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
