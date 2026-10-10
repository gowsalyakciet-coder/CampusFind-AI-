import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Search,
  Check,
  X,
  Trash2,
  ExternalLink,
  MessageSquare,
  Laptop,
  Smartphone,
  Apple,
  Filter
} from 'lucide-react';
import {
  User,
  CampusStats,
  ClaimRecord,
  ItemReport,
  ALLOWED_CATEGORIES,
  ItemCategory
} from '../../types';
import { dbService } from '../../services/database';
import { authService } from '../../services/auth';

interface AdminDashboardProps {
  currentUser: User | null;
  stats: CampusStats;
  claims: ClaimRecord[];
  allItems: ItemReport[];
  users: User[];
  onSelectItem: (itemId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  stats,
  claims,
  allItems,
  users,
  onSelectItem
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'claims' | 'reports' | 'users' | 'analytics'>('claims');
  const [reportSearch, setReportSearch] = useState('');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('All');
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected' | 'Returned' | null>(null);

  // If user is not admin, show clear authorization gateway
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 max-w-xl mx-auto border border-amber-200 shadow-xl text-center space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-sm text-slate-600">
          This portal is reserved for verified campus security personnel and authorized lost-and-found officers.
          Students are strictly prohibited from modifying claims or moderating campus reports.
        </p>
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => authService.switchUser('usr_admin_1')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Campus Security Admin Account</span>
          </button>
        </div>
      </div>
    );
  }

  const pendingClaims = claims.filter((c) => c.status === 'Claim Pending');
  const returnRatePercent =
    stats.totalLost + stats.totalFound > 0
      ? Math.round((stats.successfullyReturned / (stats.totalLost + stats.totalFound)) * 100)
      : 0;

  const filteredReports = allItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(reportSearch.toLowerCase()) ||
      item.campusLocation.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesCat = reportCategoryFilter === 'All' || item.category === reportCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExecuteClaimReview = () => {
    if (!selectedClaim || !reviewAction || !currentUser) return;
    try {
      dbService.reviewClaim(selectedClaim.id, reviewAction, adminNotes, currentUser.id);
      setSelectedClaim(null);
      setReviewAction(null);
      setAdminNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    if (currentUser) {
      dbService.deleteReport(itemId, currentUser.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Security Authority Portal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Security Officer Dashboard</h1>
            <p className="text-xs text-slate-300">
              Logged in as {currentUser.name} ({currentUser.email})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 backdrop-blur-md">
              Return Rate: <strong className="text-emerald-400">{returnRatePercent}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Lost Items</span>
            <FileQuestion className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.totalLost}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Found Items</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.totalFound}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Pending Claims</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingClaims}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Matches</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.potentialMatches}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Returned</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.successfullyReturned}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-4">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'claims'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Claim Verification Queue</span>
          {pendingClaims.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full">
              {pendingClaims.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Report Moderation ({allItems.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Category Charts &amp; Analytics
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student User Records ({users.length})
        </button>
      </div>

      {/* TAB 1: CLAIMS VERIFICATION */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {pendingClaims.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">All Claims Cleared</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending claims awaiting security officer review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Pending Verification
                        </span>
                        <span className="text-xs font-bold text-slate-900">{claim.itemTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Claimed by: <strong className="text-slate-800">{claim.claimantName}</strong> ({claim.claimantEmail}) • {claim.claimantDepartment} ({claim.claimantYear})
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectItem(claim.itemId)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>View Target Item</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">
                        Proof of Ownership Provided:
                      </span>
                      <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {claim.verificationProof}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">
                        Device Identifier / Serial Verification:
                      </span>
                      <p className="text-slate-800 font-mono text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {claim.serialOrIdentifierProof || 'No additional identifier given'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReviewAction('Rejected');
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Claim</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReviewAction('Approved');
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Claim</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReviewAction('Returned');
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mark as Handed Over / Returned</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Confirmation Modal */}
          {selectedClaim && reviewAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Claim Action: <span className={reviewAction === 'Approved' ? 'text-emerald-600' : reviewAction === 'Rejected' ? 'text-rose-600' : 'text-blue-600'}>{reviewAction}</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Item: <strong>{selectedClaim.itemTitle}</strong>
                  <br />
                  Claimant: {selectedClaim.claimantName} ({selectedClaim.claimantEmail})
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Officer Notes / Reason (Sent to Student):
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={
                      reviewAction === 'Approved'
                        ? 'Verification confirmed via matching identifier. Come to Security Desk with Student ID.'
                        : reviewAction === 'Returned'
                        ? 'Item physically handed over to student after signature verification.'
                        : 'Serial tag or proof description does not match records.'
                    }
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedClaim(null);
                      setReviewAction(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteClaimReview}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs ${
                      reviewAction === 'Approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : reviewAction === 'Rejected'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Confirm {reviewAction}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REPORT MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports by title, description, or campus building..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={reportCategoryFilter}
                onChange={(e) => setReportCategoryFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All 3 Allowed Categories</option>
                {ALLOWED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category (3 Allowed)</th>
                    <th className="px-4 py-3">Title &amp; Brand</th>
                    <th className="px-4 py-3">Location &amp; Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                            item.type === 'lost'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.brand ? `${item.brand} • ` : ''}
                          {item.color}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{item.campusLocation}</div>
                        <div className="text-[11px] text-slate-400">{item.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Returned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Claim Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'Potential Match'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => onSelectItem(item.id)}
                          className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete report"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY CHARTS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Category Distribution (Strictly 3 Allowed Categories)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Breakdown of student lost vs found reports across the three allowed hardware categories.
            </p>

            <div className="space-y-5">
              {ALLOWED_CATEGORIES.map((cat) => {
                const catData = stats.categoryBreakdown[cat] || { lost: 0, found: 0, returned: 0 };
                const totalInCat = catData.lost + catData.found;
                const maxBar = Math.max(1, stats.totalLost + stats.totalFound);
                const pct = Math.round((totalInCat / maxBar) * 100);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <span>{cat}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({totalInCat} total items)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] font-semibold">
                        <span className="text-rose-600">{catData.lost} Lost</span>
                        <span className="text-blue-600">{catData.found} Found</span>
                        <span className="text-emerald-600">{catData.returned} Returned</span>
                      </div>
                    </div>

                    {/* Visual Segmented Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(catData.lost / maxBar) * 100}%` }}
                        className="bg-rose-500 h-full"
                        title={`${catData.lost} Lost`}
                      />
                      <div
                        style={{ width: `${(catData.found / maxBar) * 100}%` }}
                        className="bg-blue-500 h-full"
                        title={`${catData.found} Found`}
                      />
                      <div
                        style={{ width: `${(catData.returned / maxBar) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title={`${catData.returned} Returned`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center space-x-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Lost Items</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Found Items</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Returned</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Student &amp; Officer Accounts
            </h3>
            <span className="text-[11px] text-slate-500">Role changes restricted to verified administrators</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">College Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Role Status</th>
                  <th className="px-4 py-3 text-right">Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-700">{u.department}</td>
                    <td className="px-4 py-3 text-slate-500">{u.year}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrator' : 'Student'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            const newRole = u.role === 'admin' ? 'student' : 'admin';
                            if (confirm(`Change ${u.name}'s role to ${newRole}?`)) {
                              dbService.updateUserRole(u.id, newRole, currentUser.id);
                            }
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
