import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  FileQuestion,
  RotateCcw,
  Shield,
  Laptop,
  Smartphone,
  Apple,
  Filter,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { MatchRecord, User, ALLOWED_CATEGORIES, ItemCategory, ItemReport } from '../../types';
import { dbService } from '../../services/database';
import { runMatchingForReport } from '../../services/matchingEngine';

interface MatchesViewProps {
  matches: MatchRecord[];
  currentUser: User | null;
  onSelectItem: (itemId: string) => void;
  onOpenClaim: (item: ItemReport) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  currentUser,
  onSelectItem,
  onOpenClaim
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isRescanning, setIsRescanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredMatches = matches.filter((m) => {
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const handleRescanAll = async () => {
    setIsRescanning(true);
    const lostItems = dbService.getLostItems().filter((i) => i.status !== 'Returned');
    for (const item of lostItems) {
      await runMatchingForReport(item);
    }
    setIsRescanning(false);
  };

  const handleDismissMatch = (matchId: string) => {
    dbService.updateMatchStatus(matchId, 'Dismissed');
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-700 via-blue-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Multi-Dimensional AI Recovery Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Potential Item Matches
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              We strictly compare identical categories (laptops to laptops, mobile phones to mobile phones, and iPhones to iPhones)
              evaluating brand, model, colors, stickers, scratches, campus buildings, and timestamps.
            </p>
          </div>

          <button
            onClick={handleRescanAll}
            disabled={isRescanning}
            className="px-4 py-2.5 bg-white text-indigo-800 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
            <span>{isRescanning ? 'Running Scan...' : 'Re-Scan All Items'}</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              categoryFilter === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {ALLOWED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                categoryFilter === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Match States</option>
            <option value="Unreviewed">Unreviewed</option>
            <option value="Claim Initiated">Claim Initiated</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Potential Matches in this View</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When a lost and found report share compatible category and similar features, our matching system will surface them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((match) => {
            const lostItem = dbService.getItemById(match.lostItemId);
            const foundItem = dbService.getItemById(match.foundItemId);

            return (
              <div
                key={match.id}
                className="bg-white rounded-3xl border border-indigo-100 shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Match Header Bar */}
                <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-lg text-emerald-400 border border-white/15">
                      {match.score}%
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          {match.matchConfidence} Confidence Match
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          {match.category} Only
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 flex items-center space-x-2">
                        <span>Engine: <strong>{match.matchEngine}</strong></span>
                        <span>•</span>
                        <span className="text-slate-400">{new Date(match.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        match.status === 'Confirmed'
                          ? 'bg-emerald-500 text-white'
                          : match.status === 'Claim Initiated'
                          ? 'bg-blue-500 text-white'
                          : match.status === 'Dismissed'
                          ? 'bg-slate-600 text-slate-300'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                </div>

                {/* Match AI Reasoning Description */}
                <div className="p-4 bg-indigo-50/50 border-b border-indigo-100/70 text-xs text-indigo-950 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{match.reasoning}</p>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-5 gap-5">
                  {/* LOST ITEM SIDE */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md flex items-center space-x-1">
                        <FileQuestion className="w-3 h-3" />
                        <span>Lost Item Report</span>
                      </span>
                      {lostItem && (
                        <button
                          onClick={() => onSelectItem(lostItem.id)}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          View Full Report
                        </button>
                      )}
                    </div>

                    {lostItem ? (
                      <div className="space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900 text-sm">{lostItem.title}</h4>
                        <p className="text-slate-600 line-clamp-2">{lostItem.description}</p>
                        <div className="space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                          <div>
                            Brand &amp; Model: <strong>{lostItem.brand || 'N/A'} {lostItem.model || ''}</strong>
                          </div>
                          <div>
                            Color: <strong>{lostItem.color}</strong>
                          </div>
                          <div>
                            Marks: <strong>{lostItem.identifyingFeatures || 'None specified'}</strong>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{lostItem.campusLocation}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{lostItem.date}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Lost item record unavailable</p>
                    )}
                  </div>

                  {/* FOUND ITEM SIDE */}
                  <div className="space-y-3 md:pl-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Found Item Report</span>
                      </span>
                      {foundItem && (
                        <button
                          onClick={() => onSelectItem(foundItem.id)}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          View Full Report
                        </button>
                      )}
                    </div>

                    {foundItem ? (
                      <div className="space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900 text-sm">{foundItem.title}</h4>
                        <p className="text-slate-600 line-clamp-2">{foundItem.description}</p>
                        <div className="space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                          <div>
                            Brand &amp; Model: <strong>{foundItem.brand || 'N/A'} {foundItem.model || ''}</strong>
                          </div>
                          <div>
                            Color: <strong>{foundItem.color}</strong>
                          </div>
                          <div>
                            Marks: <strong>{foundItem.identifyingFeatures || 'None specified'}</strong>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{foundItem.campusLocation}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{foundItem.date}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Found item record unavailable</p>
                    )}
                  </div>
                </div>

                {/* Dimension Breakdown Accordion */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Scoring Dimensions Breakdown
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {match.breakdown.map((dim) => (
                      <div key={dim.name} className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                          <span className="truncate">{dim.name}</span>
                          <span className="text-blue-600">{dim.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                          <div
                            style={{ width: `${dim.score}%` }}
                            className={`h-full ${
                              dim.score >= 85
                                ? 'bg-emerald-500'
                                : dim.score >= 70
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{dim.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Action Buttons */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDismissMatch(match.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Dismiss / Not a Match
                  </button>

                  <div className="flex items-center space-x-2">
                    {foundItem && (
                      <button
                        onClick={() => onOpenClaim(foundItem)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Submit Claim For This Found Item</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
