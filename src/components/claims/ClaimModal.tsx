import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Lock,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { ItemReport, User, ClaimRecord } from '../../types';
import { dbService } from '../../services/database';

interface ClaimModalProps {
  item: ItemReport | null;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (claim: ClaimRecord) => void;
  onOpenAuth: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  onClose,
  currentUser,
  onSuccess,
  onOpenAuth
}) => {
  if (!item) return null;

  const [verificationProof, setVerificationProof] = useState('');
  const [serialOrIdentifierProof, setSerialOrIdentifierProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Student Sign In Required</h2>
          <p className="text-xs text-slate-600">
            You must be logged in with your college account to file an ownership claim.
            This ensures accountability and prevents unauthorized access to student possessions.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationProof.trim()) {
      setError('Please provide proof of ownership details (stickers, lock screen, unique marks).');
      return;
    }

    setIsSubmitting(true);
    try {
      const claim = dbService.createClaim({
        itemId: item.id,
        itemTitle: item.title,
        category: item.category,
        claimedByUserId: currentUser.id,
        claimantName: currentUser.name,
        claimantEmail: currentUser.email,
        claimantDepartment: currentUser.department,
        claimantYear: currentUser.year,
        verificationProof: verificationProof.trim(),
        serialOrIdentifierProof: serialOrIdentifierProof.trim()
      });

      setIsSubmitting(false);
      onSuccess(claim);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit ownership claim.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Ownership Claim Submission</h2>
              <p className="text-[11px] text-blue-100">
                Official verification required before physical release
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Item summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Found Belonging:</span>
            <div className="font-bold text-slate-900">{item.title}</div>
            <div className="text-slate-600">
              {item.category} • Found at {item.campusLocation} on {item.date}
            </div>
          </div>

          {/* Claimant Verification Badge */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Verified Claimant</span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-slate-500 text-[11px] block">{currentUser.email} • {currentUser.department}</span>
            </div>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md">
              Student ID Linked
            </span>
          </div>

          {/* Proof 1: Visual / Secret Features */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Secret Proof of Ownership *
            </label>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Describe details that only the true owner would know (e.g. wallpaper picture, specific sticker on cover,
              exact scratch location, case brand, or secret engraving).
            </p>
            <textarea
              required
              rows={3}
              value={verificationProof}
              onChange={(e) => setVerificationProof(e.target.value)}
              placeholder="e.g., Lock screen wallpaper is a picture of an astronaut, with a small crack on the top left speaker. Transparent bumper case has an NASA badge sticker on the bottom."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Proof 2: Device Identifier / Serial Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Device Serial / IMEI Identifier Code
            </label>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              For Laptops &amp; Phones: enter device serial tag, service tag, IMEI last 4 digits, or purchase email reference.
            </p>
            <input
              type="text"
              value={serialOrIdentifierProof}
              onChange={(e) => setSerialOrIdentifierProof(e.target.value)}
              placeholder="e.g., Dell Service Tag ending in 7Y2, or IMEI last 4 digits"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Legal / Student Ethics notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              By submitting this claim, you attest under the University Honor Code that you are the lawful owner.
              Fraudulent claims are reported directly to the Dean of Students.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting Claim...</span>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Submit Ownership Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
