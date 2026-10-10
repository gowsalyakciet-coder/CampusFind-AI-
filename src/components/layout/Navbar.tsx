import React, { useState } from 'react';
import {
  Shield,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { authService } from '../../services/auth';
import { dbService } from '../../services/database';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  notifications: NotificationItem[];
  onOpenArchitectureGuide: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenLocator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onNavigate,
  activeView,
  notifications,
  onOpenArchitectureGuide,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenLocator
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleQuickSwitch = (userId: string) => {
    authService.switchUser(userId);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUserDropdownOpen(false);
  };

  const handleResetData = () => {
    dbService.resetToDefaults();
    setResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Humanist Academic Seal */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-700 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">CampusFind</span>
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Campus Recovery System</p>
              </div>
            </button>
          </div>

          {/* Center Navigation Shortcuts (Desktop) - Human Segmented Pill */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'home'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'browse'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => onNavigate('matches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeView === 'matches'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Matches</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'history'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History
            </button>
            <button
              onClick={() => onNavigate('my_reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'my_reports'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Reports
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Quick Find Phone Locator Button (Feature 6) */}
            {onOpenLocator && (
              <button
                onClick={onOpenLocator}
                title="Locate mobile phone using live campus GPS beacon"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-colors border border-emerald-200 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Find Phone (GPS)</span>
              </button>
            )}

            {/* Architecture Specs Guide Button */}
            <button
              onClick={onOpenArchitectureGuide}
              title="System Architecture & Cloud Specs"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Specs &amp; Rules</span>
            </button>

            {/* In-App Notifications Bell */}
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-hidden cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Current User & Role Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-hidden cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight flex items-center space-x-1">
                      <span className="truncate max-w-[100px]">{currentUser.name}</span>
                      {currentUser.role === 'admin' ? (
                        <span className="px-1 py-0.2 text-[9px] font-bold uppercase bg-amber-100 text-amber-800 rounded-sm">
                          Admin
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 text-[9px] font-semibold uppercase bg-slate-100 text-slate-700 rounded-sm">
                          Student
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu - Human Surface */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in account</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</p>
                    </div>

                    {/* Quick Demo Role Switcher */}
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Test Role Switcher
                      </p>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleQuickSwitch('usr_admin_1')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                            currentUser.role === 'admin'
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Security Admin (Full Rights)</span>
                          {currentUser.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                        <button
                          onClick={() => handleQuickSwitch('usr_student_1')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                            currentUser.id === 'usr_student_1'
                              ? 'bg-blue-50 text-blue-900 font-bold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Alex Rivera (Student - CS)</span>
                          {currentUser.id === 'usr_student_1' && <CheckCircle className="w-3.5 h-3.5 text-blue-700" />}
                        </button>
                      </div>
                    </div>

                    {/* Navigation links */}
                    <div className="px-3 py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          onNavigate('login');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center space-x-2 cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open Login &amp; Account Page</span>
                      </button>

                      {onOpenLocator && (
                        <button
                          onClick={() => {
                            onOpenLocator();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Find Lost Phone (GPS Radar)</span>
                        </button>
                      )}

                      <button
                        onClick={() => setResetConfirmOpen(true)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 flex items-center space-x-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset Sample Database</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 pt-1 px-3">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="human-btn-primary py-1.5 px-3.5 text-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In with Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="human-panel max-w-sm w-full text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reset Sample Data?</h3>
            <p className="text-xs text-slate-500">
              This will restore all default test accounts, items, and matches across the 3 allowed categories.
            </p>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="human-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="human-btn-danger"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
