import React, { useState } from 'react';
import {
  Shield,
  User,
  Mail,
  Lock,
  Building2,
  GraduationCap,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { DEPARTMENTS, ACADEMIC_YEARS, User as UserType } from '../../types';
import { authService } from '../../services/auth';

interface LoginPageProps {
  currentUser: UserType | null;
  onNavigate: (view: string) => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onNavigate,
  onSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
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
      onNavigate('dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed. Please check your Gmail address and password.');
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
      setError('Please enter a valid Gmail address (e.g., student@gmail.com).');
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
      onNavigate('dashboard');
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

  const handleQuickGmailLogin = (emailAddress: string) => {
    setGmail(emailAddress);
    setPassword('campuspass2026');
    authService.loginWithGmail(emailAddress, 'campuspass2026');
    onSuccess();
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6">
      {/* If already logged in banner */}
      {currentUser && (
        <div className="human-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-blue-200">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-lg border border-blue-100">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900">{currentUser.name}</h3>
                <span className="text-xs text-blue-700 font-semibold">
                  {currentUser.role === 'admin' ? 'Campus Administrator' : 'Verified Student'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gmail: <strong className="text-slate-800 font-mono">{currentUser.email}</strong> · {currentUser.department}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="human-btn-primary"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => authService.logout()}
              className="human-btn-secondary text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Panel Auth Container */}
      <div className="human-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-md">
        {/* Left Informational Branding Pane */}
        <div className="md:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight">CampusFind AI</span>
                <p className="text-xs text-slate-400">Campus Recovery System</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-300">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>Google / Gmail Sign-In</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight leading-tight text-white">
                Sign in with your Gmail &amp; Password
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect using your college or personal Gmail address to file reports, verify lost or found belongings, and receive instant AI match alerts.
              </p>
            </div>

            {/* Clear value bullets */}
            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Allowed Categories: Laptop, Mobile Phone, iPhone</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Live radar tracking for phones with location turned ON</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Protected ownership claims &amp; verified desk handover</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Gmail Accounts Helper */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Quick Test Accounts (1-Click Fill):
            </span>

            {/* Admin Account Button */}
            <button
              onClick={() => handleQuickGmailLogin('kgowsalya845@gmail.com')}
              className="w-full text-left p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black">Campus Security Admin</span>
                  <span className="text-[9px] bg-amber-900 text-amber-100 px-1.5 py-0.2 rounded-sm font-bold">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-slate-800 font-mono font-medium block">
                  kgowsalya845@gmail.com
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
            </button>

            {/* Student Account Button */}
            <button
              onClick={() => handleQuickGmailLogin('alex.rivera@campus.edu')}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black">Alex Rivera</span>
                  <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-sm font-bold">
                    Student
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono font-medium block">
                  alex.rivera@campus.edu
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 text-xs sm:text-sm font-bold space-x-2">
              <button
                onClick={() => {
                  setTab('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In with Gmail
              </button>
              <button
                onClick={() => {
                  setTab('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Register Account
              </button>
              <button
                onClick={() => {
                  setTab('forgot');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
                  tab === 'forgot'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Reset Password
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Gmail Address Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Gmail Address *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g., student@gmail.com</span>
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
                      placeholder="Enter your Gmail (e.g. name@gmail.com)"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      className="human-input pl-10"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Password *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="human-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full human-btn-primary py-3"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Authenticating with Gmail...' : 'Sign In with Gmail & Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Tip: Default test password is <strong className="font-mono text-slate-700">campuspass2026</strong>.
                </div>
              </form>
            )}

            {/* TAB: REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Maya Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="human-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gmail Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="studentname@gmail.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      className="human-input pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="human-select"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="human-select"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Create your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="human-input pl-10"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  Security Policy: Student accounts receive verified student privileges. Campus Administrator privileges are managed by Campus Security.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full human-btn-primary py-3"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Registration with Gmail'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB: FORGOT PASSWORD */}
            {tab === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered Gmail address. We will verify your campus account and dispatch password reset instructions to your Gmail inbox.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      className="human-input pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full human-btn-primary py-3"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Link to Gmail Inbox</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Protected by Campus Safety &amp; Security Division · College Credential Verification
          </div>
        </div>
      </div>
    </div>
  );
};
