import React from 'react';
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  HelpCircle,
  Compass,
  Sparkles,
  FolderKanban,
  Bell,
  ShieldCheck,
  FileCode2,
  ChevronRight,
  Laptop,
  Smartphone,
  Apple,
  RotateCcw,
  LogIn,
  Radio
} from 'lucide-react';
import { User, NotificationItem, ALLOWED_CATEGORIES } from '../../types';

interface SidebarProps {
  currentUser: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  notifications: NotificationItem[];
  onOpenArchitectureGuide: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLocator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenReportLost,
  onOpenReportFound,
  notifications,
  onOpenArchitectureGuide,
  isOpenMobile,
  onCloseMobile,
  onOpenLocator
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Campus Items', icon: Compass },
    { id: 'matches', label: 'AI Matches', icon: Sparkles },
    { id: 'history', label: 'Recovery History', icon: RotateCcw },
    { id: 'my_reports', label: 'My Reports & Claims', icon: FolderKanban },
    { id: 'login', label: currentUser ? 'Account & Profile' : 'Sign In with Gmail', icon: LogIn },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Human Design White Paper Surface */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between py-5 px-3 transition-transform duration-200 ease-in-out md:translate-x-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="space-y-2 px-1">
            <button
              onClick={() => {
                onOpenReportLost();
                onCloseMobile();
              }}
              className="w-full human-btn-danger justify-between"
            >
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={() => {
                onOpenReportFound();
                onCloseMobile();
              }}
              className="w-full human-btn-primary justify-between"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>Report Found Item</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Quick Find Phone (GPS) - Feature 6 */}
            {onOpenLocator && (
              <button
                onClick={() => {
                  onOpenLocator();
                  onCloseMobile();
                }}
                className="w-full human-btn-secondary justify-between text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Find Phone (GPS)</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800">
                  Radar
                </span>
              </button>
            )}
          </div>

          {/* Primary Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Main Menu
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.count && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Admin Dashboard if user is admin */}
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs font-bold'
                      : 'text-amber-800 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin Security Desk</span>
                  </div>
                  <span className="text-[9px] uppercase font-black bg-amber-200 text-amber-900 px-1 py-0.2 rounded-sm">
                    Admin
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Allowed Categories Reference Box (Zero-Pill, Anti-AI Slop) */}
          <div className="px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Campus Policy Categories
            </span>
            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center space-x-2">
                <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Laptop</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                <span>2. Mobile Phone</span>
              </div>
              <div className="flex items-center space-x-2">
                <Apple className="w-3.5 h-3.5 text-slate-800" />
                <span>3. iPhone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 px-3 space-y-2 text-xs">
          <button
            onClick={() => {
              onOpenArchitectureGuide();
              onCloseMobile();
            }}
            className="w-full flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Architecture &amp; Specs</span>
          </button>
          <div className="text-[11px] text-slate-400">
            Campus Safety &amp; Security Division
          </div>
        </div>
      </aside>
    </>
  );
};
