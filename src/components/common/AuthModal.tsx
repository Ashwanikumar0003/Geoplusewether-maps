import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      setTimeout(() => {
        onSuccess?.(email);
        onClose();
        setSuccessMsg('');
      }, 900);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-cyan-500/15 blur-2xl -z-10 rounded-full" />

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {isSignUp ? 'Join GeoPluse' : 'Welcome to GeoPluse'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSignUp
              ? 'Create an account to sync saved places, routes, and custom radar alerts.'
              : 'Sign in to access your personal meteorological bookmarks and map routes.'}
          </p>
        </div>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-3 animate-bounce" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">{successMsg}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Synchronizing your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Free Account' : 'Sign In to GeoPluse'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Zero location telemetry stored without explicit consent</span>
            </div>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/70">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account yet? Create one"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
