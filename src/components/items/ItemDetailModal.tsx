import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  Lock,
  Trash2,
  CheckCircle2,
  FileQuestion,
  Laptop,
  Smartphone,
  Apple,
  ExternalLink,
  RotateCcw,
  Radio
} from 'lucide-react';
import { ItemReport, User, ItemCategory } from '../../types';
import { dbService } from '../../services/database';
import { runMatchingForReport } from '../../services/matchingEngine';
import { DeviceLocationTrackerModal } from '../locator/DeviceLocationTrackerModal';

interface ItemDetailModalProps {
  itemId: string | null;
  onClose: () => void;
  currentUser: User | null;
  onOpenClaim: (item: ItemReport) => void;
  onNavigateToMatches: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  itemId,
  onClose,
  currentUser,
  onOpenClaim,
  onNavigateToMatches
}) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResultMsg, setMatchResultMsg] = useState<string | null>(null);
  const [locationTrackerOpen, setLocationTrackerOpen] = useState(false);

  if (!itemId) return null;

  const item = dbService.getItemById(itemId);
  if (!item) return null;

  const isOwner = currentUser?.id === item.reportedByUserId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const handleDelete = () => {
    if (!confirm('Are you sure you want to permanently delete this item report?')) return;
    if (currentUser) {
      dbService.deleteReport(item.id, currentUser.id);
      onClose();
    }
  };

  const handleMarkReturned = () => {
    dbService.updateItemStatus(item.id, 'Returned');
  };

  const handleRunMatching = async () => {
    setIsMatching(true);
    setMatchResultMsg(null);
    try {
      const newMatches = await runMatchingForReport(item);
      setIsMatching(false);
      if (newMatches.length > 0) {
        setMatchResultMsg(`Found ${newMatches.length} high-confidence match suggestions!`);
      } else {
        setMatchResultMsg('No strong matches found yet. Our engine will notify you when a match is reported.');
      }
    } catch {
      setIsMatching(false);
      setMatchResultMsg('Completed matching scan.');
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 my-8 overflow-hidden">
        {/* Header - Humanized Slate */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              {item.type === 'lost' ? <FileQuestion className="w-4 h-4 text-rose-300" /> : <CheckCircle2 className="w-4 h-4 text-blue-300" />}
            </div>
            <div>
              <div className="human-meta-row text-xs text-slate-300">
                <span className="font-bold uppercase tracking-wider text-white">
                  {item.type} Report
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{item.category}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">{item.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status & Photo Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {item.photoUrl && (
              <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Lifecycle Stage:</span>
                <span className="font-bold text-slate-900">{item.status}</span>
              </div>

              {/* Status progression bar */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span className={item.status === 'Open' ? 'text-blue-600' : ''}>1. Open</span>
                  <span className={item.status === 'Potential Match' ? 'text-blue-600' : ''}>2. Match</span>
                  <span className={item.status === 'Claim Pending' ? 'text-blue-600' : ''}>3. Claim</span>
                  <span className={item.status === 'Approved' ? 'text-blue-600' : ''}>4. Approved</span>
                  <span className={item.status === 'Returned' ? 'text-emerald-600' : ''}>5. Returned</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width:
                        item.status === 'Open'
                          ? '20%'
                          : item.status === 'Potential Match'
                          ? '40%'
                          : item.status === 'Claim Pending'
                          ? '60%'
                          : item.status === 'Approved'
                          ? '80%'
                          : '100%'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Brand:</span>
                  <span className="font-semibold text-slate-800">{item.brand || 'Unspecified'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Model:</span>
                  <span className="font-semibold text-slate-800">{item.model || 'Unspecified'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Color:</span>
                  <span className="font-semibold text-slate-800">{item.color}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">Category:</span>
                  <span className="font-semibold text-slate-800 flex items-center space-x-1">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Spatiotemporal details */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Campus Location: <strong className="text-slate-900">{item.campusLocation}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500 text-xs">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.date}</span>
              </span>
              {item.timeApprox && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.timeApprox}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mobile Phone / iPhone Live Location Tracking Feature (User Requirement 6) */}
          {(item.category === 'Mobile Phone' || item.category === 'iPhone') && (
            <div className="human-card p-4 space-y-2.5 border-blue-200 bg-linear-to-r from-blue-50/70 via-white to-indigo-50/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Radio className={`w-4 h-4 ${item.locationServicesOn ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-slate-900">
                    Device Location Tracking: {item.locationServicesOn ? 'ACTIVE (LOCATION ON)' : 'OFF (DISABLED)'}
                  </span>
                </div>
                {item.locationServicesOn && (
                  <span className="text-xs font-bold text-emerald-700">
                    GPS Beacon ±{item.lastKnownCoordinates?.accuracyMeters || 4}m
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.locationServicesOn
                  ? `Live beacon active in ${item.lastKnownCoordinates?.campusZone || item.campusLocation}. You can locate this device on the radar map and trigger remote sound chimes.`
                  : 'Device location is turned off. Turn location ON to detect its live campus beacon coordinates.'}
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setLocationTrackerOpen(true)}
                  className="human-btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 py-1.5 px-3 text-xs"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{item.locationServicesOn ? 'Locate Device on Radar Map' : 'Turn Location ON & Locate'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Identifying Features */}
          {item.identifyingFeatures && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700">Identifying Features / Signature Marks:</h4>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {item.identifyingFeatures}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Full Description:</h4>
            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Privacy Protection Notice */}
          {item.sensitiveInfoMasked && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start space-x-2 text-xs text-indigo-900">
              <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Confidential Verification Record:</strong>
                <p className="text-xs text-indigo-800 mt-0.5">
                  {isAdmin
                    ? `Admin Decryption: "${item.maskedDetails || 'No private notes'}"`
                    : 'Personal identity codes and device credentials are encrypted and held safely with Campus Security.'}
                </p>
              </div>
            </div>
          )}

          {/* Reporter Attestation Note */}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
            <span>Reported by: <strong>{item.reporterName}</strong> ({item.reporterDepartment || 'College'})</span>
            <span>Ref ID: <code className="font-mono">{item.id}</code></span>
          </div>

          {/* AI Matching feedback message */}
          {matchResultMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <span>{matchResultMsg}</span>
              <button
                onClick={onNavigateToMatches}
                className="text-blue-700 font-bold hover:underline"
              >
                View Matches &rarr;
              </button>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunMatching}
                disabled={isMatching}
                className="human-btn-secondary py-2 px-3 text-xs"
              >
                <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isMatching ? 'animate-spin' : ''}`} />
                <span>{isMatching ? 'Analyzing...' : 'Scan AI Matches'}</span>
              </button>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isAdmin && item.status !== 'Returned' && (
                <button
                  onClick={handleMarkReturned}
                  className="human-btn-secondary text-emerald-700 border-emerald-200 hover:bg-emerald-50 py-2 px-3 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark Returned</span>
                </button>
              )}

              {item.type === 'found' && item.status !== 'Returned' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClaim(item);
                  }}
                  className="human-btn-primary py-2 px-4 text-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Claim This Item</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device Location Tracker Radar Modal */}
      <DeviceLocationTrackerModal
        item={item}
        isOpen={locationTrackerOpen}
        onClose={() => setLocationTrackerOpen(false)}
      />
    </div>
  );
};
