import React, { useState } from 'react';
import {
  FolderKanban,
  FileQuestion,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  Shield,
  RotateCcw,
  Clock,
  AlertCircle,
  Radio
} from 'lucide-react';
import { User, ItemReport, ClaimRecord, MatchRecord } from '../../types';
import { dbService } from '../../services/database';

interface MyReportsProps {
  currentUser: User | null;
  allItems: ItemReport[];
  claims: ClaimRecord[];
  matches: MatchRecord[];
  onSelectItem: (itemId: string) => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onNavigateToMatches: () => void;
  onOpenAuth: () => void;
  onLocateDevice?: (item: ItemReport) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({
  currentUser,
  allItems,
  claims,
  matches,
  onSelectItem,
  onOpenReportLost,
  onOpenReportFound,
  onNavigateToMatches,
  onOpenAuth,
  onLocateDevice
}) => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'claims'>('lost');

  if (!currentUser) {
    return (
      <div className="human-panel max-w-md mx-auto text-center space-y-4 my-8">
        <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Sign In to View Your Reports</h2>
        <p className="text-xs text-slate-500">
          Sign in with your student account to track your submitted lost items, turned-in belongings, and ownership claims.
        </p>
        <button
          onClick={onOpenAuth}
          className="human-btn-primary"
        >
          Sign In with Gmail
        </button>
      </div>
    );
  }

  const myLostItems = allItems.filter(
    (i) => i.type === 'lost' && i.reportedByUserId === currentUser.id
  );
  const myFoundItems = allItems.filter(
    (i) => i.type === 'found' && i.reportedByUserId === currentUser.id
  );
  const myClaims = claims.filter((c) => c.claimedByUserId === currentUser.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header - Human Card */}
      <div className="human-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Reports &amp; Claims</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active reports submitted by {currentUser.name} ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReportLost}
            className="human-btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={onOpenReportFound}
            className="human-btn-primary"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'lost'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileQuestion className="w-4 h-4 text-rose-500" />
          <span>My Lost Items ({myLostItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'found'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <span>My Found Items ({myFoundItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
            activeTab === 'claims'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-500" />
          <span>My Submitted Claims ({myClaims.length})</span>
        </button>
      </div>

      {/* TAB 1: MY LOST ITEMS */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          {myLostItems.length === 0 ? (
            <div className="human-panel p-10 text-center">
              <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Lost Items Reported Yet</h3>
              <p className="text-xs text-slate-500 mt-1">If you have misplaced a laptop or phone, file a report.</p>
              <button
                onClick={onOpenReportLost}
                className="human-btn-danger mt-4"
              >
                Report Lost Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myLostItems.map((item) => {
                const itemMatches = matches.filter((m) => m.lostItemId === item.id);
                return (
                  <div
                    key={item.id}
                    className="human-card p-5 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="human-meta-row text-xs mb-2">
                        <span className="font-semibold text-slate-700">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{item.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>

                      <div className="mt-3 human-meta-row text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.campusLocation}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      {itemMatches.length > 0 ? (
                        <button
                          onClick={onNavigateToMatches}
                          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{itemMatches.length} Match(es) Found!</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Scanning for matches...</span>
                      )}

                      <div className="flex items-center space-x-2">
                        {/* Device Location Tracker for phones */}
                        {(item.category === 'Mobile Phone' || item.category === 'iPhone') && onLocateDevice && (
                          <button
                            onClick={() => onLocateDevice(item)}
                            className="human-btn-secondary py-1 px-2.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Radio className="w-3 h-3 text-emerald-600" />
                            <span>Locate (Radar)</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectItem(item.id)}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY FOUND ITEMS */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {myFoundItems.length === 0 ? (
            <div className="human-panel p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Found Items Turned In</h3>
              <p className="text-xs text-slate-500 mt-1">Thank you for helping fellow students recover misplaced belongings.</p>
              <button
                onClick={onOpenReportFound}
                className="human-btn-primary mt-4"
              >
                Report Found Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myFoundItems.map((item) => (
                <div
                  key={item.id}
                  className="human-card p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="human-meta-row text-xs mb-2">
                      <span className="font-semibold text-slate-700">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{item.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-3 human-meta-row text-xs text-slate-500">
                      <span>Found at: <strong className="text-slate-700">{item.campusLocation}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Held safely at Security Desk</span>
                    <button
                      onClick={() => onSelectItem(item.id)}
                      className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY SUBMITTED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="human-panel p-10 text-center">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Claims Submitted Yet</h3>
              <p className="text-xs text-slate-500 mt-1">If you identify a found item that belongs to you, submit a verified claim.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="human-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="human-meta-row text-xs">
                      <span className="font-bold text-slate-900">Claim ID: {claim.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">{claim.status}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{claim.itemTitle}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      Verification Proof: "{claim.verificationProof}"
                    </p>
                    {claim.adminNotes && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        Officer Notes: {claim.adminNotes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectItem(claim.itemId)}
                    className="human-btn-secondary text-xs shrink-0 self-start sm:self-auto"
                  >
                    View Item
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
