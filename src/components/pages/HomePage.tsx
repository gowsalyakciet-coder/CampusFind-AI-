import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  PlusCircle,
  HelpCircle,
  Laptop,
  Smartphone,
  Apple,
  Clock,
  RotateCcw,
  Users,
  Compass,
  FileCheck2,
  BellRing,
  Radio,
  Volume2
} from 'lucide-react';
import { CampusStats, ItemReport, ALLOWED_CATEGORIES, ItemCategory, User } from '../../types';

interface HomePageProps {
  currentUser: User | null;
  stats: CampusStats;
  recentItems: ItemReport[];
  onNavigate: (view: string) => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onSelectItem: (itemId: string) => void;
  onFilterCategory: (category: ItemCategory) => void;
  onLocateDevice?: (item?: ItemReport) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  stats,
  recentItems,
  onNavigate,
  onOpenReportLost,
  onOpenReportFound,
  onSelectItem,
  onFilterCategory,
  onLocateDevice
}) => {
  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'Mobile Phone':
        return <Smartphone className="w-5 h-5 text-cyan-600" />;
      case 'iPhone':
        return <Apple className="w-5 h-5 text-slate-800" />;
    }
  };

  const getCategoryDesc = (category: ItemCategory) => {
    switch (category) {
      case 'Laptop':
        return 'MacBooks, Windows laptops, Chromebooks & power adapters';
      case 'Mobile Phone':
        return 'Android smartphones, Galaxy, Pixel, OnePlus devices';
      case 'iPhone':
        return 'Apple iPhone models with protected lockscreen metadata';
    }
  };

  // Find a lost phone with location ON to showcase live tracking
  const activeTrackablePhone = recentItems.find(
    (i) => (i.category === 'Mobile Phone' || i.category === 'iPhone') && i.locationServicesOn
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section - Humanized Royal Academic Canvas */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-14 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Campus Lost &amp; Found Recovery Platform</span>
            <span aria-hidden="true">·</span>
            <span>AI Matching &amp; GPS Radar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Never lose your campus essentials again.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            CampusFind AI connects students across college buildings to recover lost Laptops, Mobile Phones, and iPhones using smart semantic matching, live GPS device radar, and verified safety handovers.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenReportLost}
              className="human-btn-danger px-5 py-3 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </button>

            <button
              onClick={onOpenReportFound}
              className="human-btn-primary px-5 py-3 text-sm bg-blue-600 hover:bg-blue-700"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Report Found Item</span>
            </button>

            {onLocateDevice && (
              <button
                onClick={() => onLocateDevice(activeTrackablePhone)}
                className="human-btn-secondary px-5 py-3 text-sm bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Locate Lost Phone (Radar)</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('browse')}
              className="human-btn-secondary px-5 py-3 text-sm bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 w-72 h-72 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" />
      </section>

      {/* FEATURE SPOTLIGHT: Mobile Phone Location Tracking Feature (User Requirement 6) */}
      <section className="human-card p-6 sm:p-8 border-blue-200 bg-linear-to-r from-blue-50/60 via-white to-indigo-50/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Live Campus GPS Radar Feature</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lost your phone? Find it instantly when location is ON.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If a student's Mobile Phone or iPhone has location services active, CampusFind AI locks onto its live campus beacon coordinates. Track distance on the radar map, view the exact room or cafeteria booth, and play high-frequency audio chimes to locate it in person.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Room-level beacon accuracy (±4m)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Remote acoustic chime</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Walking directions guidance</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {onLocateDevice && (
              <button
                onClick={() => onLocateDevice(activeTrackablePhone)}
                className="human-btn-primary px-5 py-3 text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-sm"
              >
                <Radio className="w-4 h-4" />
                <span>Open Device Radar Map</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('browse')}
              className="human-btn-secondary px-5 py-3 text-xs"
            >
              <span>View Lost Phones Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Live Campus Impact Statistics - Unboxed Human Design Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="human-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.successfullyReturned}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Items Reunited</div>
          </div>
        </div>

        <div className="human-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.potentialMatches}
            </div>
            <div className="text-xs text-slate-500 font-semibold">AI Match Suggestions</div>
          </div>
        </div>

        <div className="human-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.totalLost}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Lost Reports Active</div>
          </div>
        </div>

        <div className="human-card p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.totalUsers}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Registered Campus Users</div>
          </div>
        </div>
      </section>

      {/* The 3 Strictly Allowed Categories */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Campus Policy: 3 Permitted Categories</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supported Item Categories
            </h2>
            <p className="text-xs text-slate-500">
              CampusFind AI exclusively tracks high-value student possessions across these three categories.
            </p>
          </div>

          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ALLOWED_CATEGORIES.map((cat) => {
            const catStats = stats.categoryBreakdown[cat] || { lost: 0, found: 0, returned: 0 };
            return (
              <div
                key={cat}
                onClick={() => onFilterCategory(cat)}
                className="human-card human-card-interactive p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    {getCategoryIcon(cat)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {cat}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {getCategoryDesc(cat)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-x-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="text-rose-600">{catStats.lost} Lost</span>
                    <span>·</span>
                    <span className="text-blue-600">{catStats.found} Found</span>
                  </div>
                  <span className="text-blue-700 font-bold flex items-center">
                    Browse &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How CampusFind AI Works (3 Simple Steps) */}
      <section className="human-panel space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Reliable Campus Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            How Campus Lost &amp; Found Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed to ensure lost property is recovered quickly with privacy protection and verified security desk handovers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Report in 3 Categories</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your lost or found item specifying brand, model, color, unique marks, campus building, and date.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Matching &amp; GPS Radar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our matching engine evaluates category compatibility, feature marks, location proximity, and live GPS beacons for phones.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Verification &amp; Return Handover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify ownership via secret identifiers (stickers, serial tag, student ID code). Campus Security officers approve and hand over items.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Recoveries & Active Reports */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500">Newly reported belongings across university buildings</p>
          </div>

          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="human-card human-card-interactive p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-slate-700">
                    {item.type.toUpperCase()} · {item.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">{item.date}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[140px]">{item.campusLocation}</span>
                <span className="font-bold text-blue-600">Details &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Ethics Guarantee */}
      <section className="human-panel bg-slate-50 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Privacy Protection &amp; Campus Honor Code Compliance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sensitive identifying details like student ID numbers and phone lockscreen previews are never displayed to the public. Physical belongings are securely held at Campus Security Headquarters until ownership verification is approved.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="human-btn-primary shrink-0 self-start md:self-auto"
        >
          Open Student Dashboard
        </button>
      </section>
    </div>
  );
};
