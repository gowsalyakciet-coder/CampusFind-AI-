import React from 'react';
import {
  FileQuestion,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Search,
  FolderKanban,
  Bell,
  ArrowRight,
  MapPin,
  Calendar,
  Laptop,
  Smartphone,
  Apple,
  Radio,
  ChevronRight
} from 'lucide-react';
import {
  User,
  CampusStats,
  MatchRecord,
  ItemReport,
  ItemCategory,
  ALLOWED_CATEGORIES
} from '../../types';

interface StudentDashboardProps {
  currentUser: User | null;
  stats: CampusStats;
  matches: MatchRecord[];
  recentItems: ItemReport[];
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onNavigate: (view: string) => void;
  onSelectMatch: (matchId: string) => void;
  onSelectItem: (itemId: string) => void;
  onFilterCategory: (category: ItemCategory) => void;
  onLocateDevice?: (item?: ItemReport) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  stats,
  matches,
  recentItems,
  onOpenReportLost,
  onOpenReportFound,
  onNavigate,
  onSelectMatch,
  onSelectItem,
  onFilterCategory,
  onLocateDevice
}) => {
  const topMatches = matches.slice(0, 2);

  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'Mobile Phone':
        return <Smartphone className="w-4 h-4 text-cyan-600" />;
      case 'iPhone':
        return <Apple className="w-4 h-4 text-slate-800" />;
    }
  };

  // Find trackable lost phones
  const trackablePhones = recentItems.filter(
    (i) => (i.category === 'Mobile Phone' || i.category === 'iPhone') && i.locationServicesOn
  );
  const activePhone = trackablePhones[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner - Humanized Navy Slate */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>AI Recovery Engine &amp; Campus Radar Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back{currentUser ? `, ${currentUser.name}` : ''}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
            CampusFind AI monitors student reports across the three allowed categories with semantic match scoring and GPS locator beacons.
          </p>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards - Unboxed Human Design Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lost */}
        <div className="human-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Lost Items</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalLost}</span>
            <span className="text-xs text-rose-600 font-semibold">Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Reported across 3 categories</p>
        </div>

        {/* Total Found */}
        <div className="human-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Found Items</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalFound}</span>
            <span className="text-xs text-blue-600 font-semibold">Turned In</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Held safely at Security Desk</p>
        </div>

        {/* Potential Matches */}
        <div className="human-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Potential Matches</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats.potentialMatches}</span>
            <span className="text-xs text-indigo-600 font-semibold">Pairs</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">High confidence matches</p>
        </div>

        {/* Successfully Returned */}
        <div className="human-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Successfully Returned</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats.successfullyReturned}</span>
            <span className="text-xs text-emerald-600 font-semibold">Reunited</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Verified &amp; returned to students</p>
        </div>
      </div>

      {/* Quick Action Buttons - Tactile Human Cards */}
      <div className="human-card p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action 1: Report Lost */}
          <button
            onClick={onOpenReportLost}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-200 transition-all text-slate-700 hover:text-rose-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-xs text-center font-bold">Report Lost</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Missing item</span>
          </button>

          {/* Action 2: Report Found */}
          <button
            onClick={onOpenReportFound}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all text-slate-700 hover:text-blue-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs text-center font-bold">Report Found</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Turn in item</span>
          </button>

          {/* Action 3: Find Phone / GPS Radar (Feature 6) */}
          <button
            onClick={() => onLocateDevice && onLocateDevice(activePhone)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-all text-slate-700 hover:text-emerald-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs text-center font-bold">Find Phone GPS</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Live radar locator</span>
          </button>

          {/* Action 4: Browse Items */}
          <button
            onClick={() => onNavigate('browse')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-slate-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center mb-2 shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-xs text-center font-bold">Browse Items</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Search catalog</span>
          </button>

          {/* Action 5: My Reports */}
          <button
            onClick={() => onNavigate('my_reports')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition-all text-slate-700 hover:text-indigo-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-xs text-center font-bold">My Reports</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Track claims</span>
          </button>

          {/* Action 6: Notifications */}
          <button
            onClick={() => onNavigate('notifications')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 transition-all text-slate-700 hover:text-amber-700 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs text-center font-bold">Notifications</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Match alerts</span>
          </button>
        </div>
      </div>

      {/* Live Device Location Beacon Card (User Requirement 6) */}
      {activePhone && (
        <div className="human-card p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Phone Location Beacon Active (Location ON)
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{activePhone.title}</h3>
            <p className="text-xs text-slate-300">
              Live coordinates detected in <strong className="text-emerald-300">{activePhone.lastKnownCoordinates?.campusZone || activePhone.campusLocation}</strong>. Locate on radar or trigger audio chimes.
            </p>
          </div>

          <button
            onClick={() => onLocateDevice && onLocateDevice(activePhone)}
            className="human-btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs shrink-0 self-start sm:self-auto"
          >
            <Radio className="w-4 h-4" />
            <span>Open Radar Locator</span>
          </button>
        </div>
      )}

      {/* The 4 Permitted Categories Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Allowed Item Categories
          </h2>
          <span className="text-xs text-slate-500">Click category to filter catalog</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALLOWED_CATEGORIES.map((cat) => {
            const catStats = stats.categoryBreakdown[cat] || { lost: 0, found: 0, returned: 0 };
            return (
              <button
                key={cat}
                onClick={() => onFilterCategory(cat)}
                className="human-card human-card-interactive p-4 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getCategoryIcon(cat)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {cat}
                </h3>
                <div className="mt-2 human-meta-row text-xs text-slate-500">
                  <span className="text-rose-600 font-semibold">{catStats.lost} Lost</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-blue-600 font-semibold">{catStats.found} Found</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Potential Matches Highlight Section */}
      {topMatches.length > 0 && (
        <div className="human-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">High-Confidence Potential Matches</h2>
              <p className="text-xs text-slate-500">
                Algorithmic matches based on category, brand, features, and campus location
              </p>
            </div>
            <button
              onClick={() => onNavigate('matches')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMatches.map((match) => (
              <div
                key={match.id}
                className="human-card p-4 flex flex-col justify-between space-y-3 border-indigo-100"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-bold text-indigo-700">
                      {match.category} Match
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {match.score}% Score
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">{match.reasoning}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Engine: {match.matchEngine}
                  </span>
                  <button
                    onClick={() => onSelectMatch(match.id)}
                    className="human-btn-primary py-1.5 px-3 text-xs"
                  >
                    Compare &amp; Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Campus Reports Feed */}
      <div className="human-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500">Newly reported lost and found items on campus</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-800">
                      {item.type.toUpperCase()} · {item.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                  </div>
                  <div className="human-meta-row text-[11px] text-slate-500 mt-0.5">
                    <span className="truncate max-w-[180px]">{item.campusLocation}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-semibold text-slate-600">
                  {item.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
