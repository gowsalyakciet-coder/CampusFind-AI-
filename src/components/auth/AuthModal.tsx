import React, { useState } from 'react';
import {
  X,
  Shield,
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { DEPARTMENTS, ACADEMIC_YEARS } from '../../types';
import { authService } from '../../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [year, setYear] = useState<string>(ACADEMIC_YEARS[1]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      authService.loginWithGmail(gmail, password);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed. Please verify your Gmail and password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full student name.');
      return;
    }
    if (!gmail.trim() || !gmail.includes('@')) {
      setError('Please enter a valid Gmail address (e.g. name@gmail.com).');
      return;
    }

    setLoading(true);
    try {
      authService.register({
        name,
        email: gmail,
        department,
        year
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = authService.requestPasswordReset(gmail);
      setLoading(false);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Password reset request failed.');
    }
  };

  const handleDemoLogin = (userId: string) => {
    authService.switchUser(userId);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {mode === 'login'
                  ? 'Gmail Sign In'
                  : mode === 'register'
                  ? 'Student Registration with Gmail'
                  : 'Reset Gmail Password'}
              </h2>
              <p className="text-[11px] text-blue-100">CampusFind AI Authentication Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Gmail Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Student
          </button>
          <button
            onClick={() => {
              setMode('forgot');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'forgot'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Forgot Password
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-CLICK DEMO ACCOUNTS HELPER */}
          {mode === 'login' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Instant 1-Click Demo Profiles:
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('usr_admin_1')}
                  className="w-full text-left p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 font-semibold text-slate-950 flex items-center justify-between shadow-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold">Campus Security Officer (Admin)</span>
                      <span className="text-[9px] bg-amber-900 text-amber-100 px-1.5 py-0.2 rounded-sm font-bold">
                        Admin
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-800 font-mono">kgowsalya845@gmail.com</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('usr_student_1')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 font-semibold text-blue-900 flex items-center justify-between shadow-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold">Alex Rivera (Student - CS)</span>
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-sm font-bold">
                        Student
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">alex.rivera@campus.edu</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          )}

          {/* FORM: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gmail Address *</span>
                  </span>
                  <span className="text-[10px] text-slate-400">e.g. name@gmail.com</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your Gmail address"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Password *</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating with Gmail...' : 'Sign In with Gmail & Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Samantha Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gmail Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs pl-3 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full text-xs pl-3 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{loading ? 'Creating Account...' : 'Complete Student Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <p className="text-xs text-slate-600">
                Enter your Gmail address to receive password reset instructions.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gmail Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Send Reset Link to Gmail</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
