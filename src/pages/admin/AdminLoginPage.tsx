import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword, isAdmin } = useAuth();

  const [email, setEmail] = useState('admin@hhdcollections.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      // Helpful error guidance
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please verify your credentials or create the admin user in Firebase Auth.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please verify administrator credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide your administrator email address.');
      return;
    }
    try {
      await resetPassword(email);
      setResetSuccess(true);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center space-x-2 group">
          <img
            src="./assets/logo.png"
            alt="HHD Collections"
            className="h-12 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </Link>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          Admin Authentication
        </h1>
        <p className="text-xs text-charcoal-400">
          Secure Firebase Authentication for HHD Collections Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-charcoal-900 border border-charcoal-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Password reset link sent to your administrator email!</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-300">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hhdcollections.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder-charcoal-500 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-charcoal-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(!isResetOpen)}
                  className="text-[11px] text-brand-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder-charcoal-500 focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-luxury hover:shadow-luxury-lg disabled:opacity-70"
            >
              {isLoading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {isResetOpen && (
            <div className="p-4 rounded-xl bg-charcoal-800/80 border border-charcoal-700 space-y-3">
              <h4 className="text-xs font-bold text-white">Reset Admin Password</h4>
              <p className="text-[11px] text-charcoal-400">
                A password reset email will be dispatched to <strong>{email}</strong> via Firebase Authentication.
              </p>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full py-2 px-3 rounded-lg bg-charcoal-700 text-xs font-semibold text-white hover:bg-charcoal-600"
              >
                Send Reset Link
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-charcoal-800 text-[11px] text-charcoal-500 text-center space-y-1">
            <p>🔒 Protected by Firebase Authentication & Firestore Security Rules.</p>
            <Link to="/" className="text-brand-400 hover:underline block pt-2">
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
