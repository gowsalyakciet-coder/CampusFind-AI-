import React, { useState } from 'react';
import {
  X,
  Shield,
  Database,
  FileCode,
  Lock,
  Sparkles,
  CheckCircle,
  Copy,
  Server,
  Layers
} from 'lucide-react';
import { ALLOWED_CATEGORIES } from '../../types';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global catch-all default deny
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isValidCategory(cat) {
      return cat in ['Laptop', 'Mobile Phone', 'iPhone'];
    }

    // 1. Users collection
    match /users/{userId} {
      allow get: if isSignedIn();
      allow list: if isAdmin();
      allow create: if isSignedIn() && request.auth.uid == userId && request.resource.data.role == 'student';
      allow update: if isAdmin() || (isOwner(userId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']));
    }

    // 2. Lost items collection
    match /lostItems/{itemId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidCategory(request.resource.data.category);
      allow update, delete: if isAdmin() || isOwner(resource.data.reportedByUserId);
    }

    // 3. Found items collection
    match /foundItems/{itemId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidCategory(request.resource.data.category);
      allow update, delete: if isAdmin() || isOwner(resource.data.reportedByUserId);
    }

    // 4. Matches collection
    match /matches/{matchId} {
      allow read: if isSignedIn();
      allow create, update: if isAdmin();
    }

    // 5. Claims collection
    match /claims/{claimId} {
      allow read: if isAdmin() || isOwner(resource.data.claimedByUserId);
      allow create: if isSignedIn();
      allow update: if isAdmin();
    }

    // 6. Notifications collection
    match /notifications/{notifId} {
      allow read, update: if isOwner(resource.data.userId);
      allow create: if isSignedIn();
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Architecture, Cloud Schemas &amp; Security Specs</h2>
              <p className="text-[11px] text-blue-200">CampusFind AI System Design Overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Section 1: Allowed Categories Rule */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
            <h3 className="font-bold text-blue-950 flex items-center space-x-2 text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Strict 3-Category Governance</span>
            </h3>
            <p className="text-blue-900 leading-relaxed">
              Throughout CampusFind AI, exactly three hardware categories are authorized:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALLOWED_CATEGORIES.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 bg-white font-bold text-blue-700 rounded-lg border border-blue-200 shadow-2xs"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-blue-800 italic">
              Matching rule: Incompatible categories are strictly isolated (e.g. Laptops never match Phones,
              Mobile Phones never match iPhones).
            </p>
          </div>

          {/* Section 2: Six Collections */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Server className="w-4 h-4 text-slate-700" />
              <span>Database Collections (Active &amp; Persistent)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">1. users</span>
                <span className="text-[11px] text-slate-500">
                  Student profiles, college email, department, year, role (student/admin), creation timestamp.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">2. lostItems</span>
                <span className="text-[11px] text-slate-500">
                  Lost reports with category, brand, model, color, marks, campus location, date, photos.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">3. foundItems</span>
                <span className="text-[11px] text-slate-500">
                  Found reports with category, condition, location found, and private masked serial/ID tags.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">4. matches</span>
                <span className="text-[11px] text-slate-500">
                  Paired item matches with category verification, multi-dimensional scores, engine attribution.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">5. claims</span>
                <span className="text-[11px] text-slate-500">
                  Ownership claims with secret verification proof, ID codes, status lifecycle, admin review notes.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">6. notifications</span>
                <span className="text-[11px] text-slate-500">
                  Targeted student alerts for AI matches, claim approvals, status transitions, and announcements.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Hardened Firestore Security Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Hardened Firestore Security Rules</span>
              </h3>
              <button
                onClick={() => copyToClipboard(sampleRules, 'rules')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied === 'rules' ? 'Copied!' : 'Copy Rules'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 max-h-56">
              {sampleRules}
            </pre>
          </div>

          {/* Section 4: AI & Matching Algorithm Transparency */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5">
            <h3 className="font-bold text-indigo-950 flex items-center space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Honest AI Engine Attribution</span>
            </h3>
            <p className="text-indigo-900 leading-relaxed text-[11px]">
              In accordance with ethical requirements, CampusFind AI honestly identifies the matching engine used:
              <br />
              • <strong>AI Model (Gemini):</strong> Active when Gemini Flash evaluates deep semantic descriptions and features.
              <br />
              • <strong>Rule-Based Campus Similarity Engine:</strong> Evaluates exact category match (100%), brand token overlap, color alignment, campus building proximity, and loss dates.
            </p>
          </div>

          {/* Close button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              Close Specifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
