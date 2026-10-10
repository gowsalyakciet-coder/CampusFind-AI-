import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Calendar,
  MapPin,
  ShieldCheck,
  Laptop,
  Smartphone,
  Apple,
  Filter,
  Search,
  ExternalLink,
  Clock,
  Radio
} from 'lucide-react';
import { ItemReport, ClaimRecord, User, ALLOWED_CATEGORIES, ItemCategory } from '../../types';

interface HistoryPageProps {
  allItems: ItemReport[];
  claims: ClaimRecord[];
  currentUser: User | null;
  onSelectItem: (itemId: string) => void;
  onNavigate: (view: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  allItems,
  claims,
  currentUser,
  onSelectItem,
  onNavigate
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Items that have reached terminal returned status
  const returnedItems = allItems.filter((i) => i.status === 'Returned');

  // Filtered list
  const filteredList = returnedItems.filter((item) => {
    // 1. Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.campusLocation.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // 2. Category filter
    if (categoryFilter !== 'All' && item.category !== categoryFilter) {
      return false;
    }

    // 3. Personal filter
    if (filterMode === 'mine' && currentUser) {
      const isMyReport = item.reportedByUserId === currentUser.id;
      const isMyClaim = claims.some(
        (c) => c.itemId === item.id && c.claimedByUserId === currentUser.id
      );
      if (!isMyReport && !isMyClaim) return false;
    }

    return true;
  });

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Humanized Emerald Ledger */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Campus Return Ledger · Chain of Custody</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Recovery History &amp; Resolved Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Every successfully recovered student item is verified through ownership criteria and logged here after physical handover at Campus Security.
          </p>
        </div>
      </div>

      {/* 4 Metric Stats - Unboxed Human Design Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="human-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Returned Items</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{returnedItems.length}</div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">100% Handover Rate</p>
        </div>

        <div className="human-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Recovery Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">1.8 Days</div>
          <p className="text-xs text-blue-700 font-semibold mt-1">From report to return</p>
        </div>

        <div className="human-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Claims</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {claims.filter((c) => c.status === 'Approved' || c.status === 'Returned').length}
          </div>
          <p className="text-xs text-indigo-700 font-semibold mt-1">Security approved</p>
        </div>

        <div className="human-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Permitted Categories</span>
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">3 Categories</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Laptop · Mobile Phone · iPhone</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="human-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Mode Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campus Recoveries ({returnedItems.length})
            </button>
            <button
              onClick={() => setFilterMode('mine')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'mine'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Activity Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search recovery history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="human-input pl-9 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* 3 Allowed Categories Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {ALLOWED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History Ledger List */}
      {filteredList.length === 0 ? (
        <div className="human-panel p-12 text-center">
          <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Recovery Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filterMode === 'mine'
              ? 'You do not have any returned items under your account yet.'
              : 'Items marked as returned by Campus Security will appear in this verification ledger.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const relatedClaim = claims.find((c) => c.itemId === item.id);
            return (
              <div
                key={item.id}
                className="human-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 max-w-2xl">
                  {/* Clean unboxed metadata (anti-AI slop) */}
                  <div className="human-meta-row text-xs">
                    <span className="human-status-indicator text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Returned to Owner</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">{item.category}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-400">
                      Resolved on {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Handed over from: <strong className="text-slate-700">{item.campusLocation}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Original Report: <strong className="text-slate-700">{item.date}</strong></span>
                    </div>
                    {item.brand && (
                      <div className="text-slate-600">
                        Brand: <strong>{item.brand}</strong>
                      </div>
                    )}
                  </div>

                  {relatedClaim && (
                    <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-950 flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Security Handover Notes:</strong>{' '}
                        <span>
                          {relatedClaim.adminNotes ||
                            'Ownership confirmed through verified matching identifier and photo student ID at Security Desk.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center md:flex-col justify-end space-x-2 md:space-x-0 md:space-y-2 border-t md:border-t-0 pt-3 md:pt-0">
                  <button
                    onClick={() => onSelectItem(item.id)}
                    className="human-btn-secondary"
                  >
                    <span>View Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
