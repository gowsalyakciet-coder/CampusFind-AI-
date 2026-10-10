/**
 * CampusFind AI - Core Type Definitions
 * Strictly enforces the 3 allowed categories across the entire application.
 */

// ONLY these three categories are allowed throughout the application:
export const ALLOWED_CATEGORIES = [
  'Laptop',
  'Mobile Phone',
  'iPhone'
] as const;

export type ItemCategory = (typeof ALLOWED_CATEGORIES)[number];

export function isValidCategory(value: unknown): value is ItemCategory {
  return typeof value === 'string' && ALLOWED_CATEGORIES.includes(value as ItemCategory);
}

export type ReportType = 'lost' | 'found';

export type ItemStatus =
  | 'Open'
  | 'Potential Match'
  | 'Claim Pending'
  | 'Approved'
  | 'Returned'
  | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  role: 'student' | 'admin';
  createdAt: string;
  avatarUrl?: string;
}

export interface ItemReport {
  id: string;
  type: ReportType;
  category: ItemCategory; // STRICT: Laptop | Mobile Phone | iPhone
  title: string;
  description: string;
  brand?: string;
  model?: string;
  color: string;
  identifyingFeatures: string;
  campusLocation: string;
  date: string;
  timeApprox?: string;
  photoUrl?: string;
  reportedByUserId: string;
  reporterName: string;
  reporterEmail: string;
  reporterDepartment?: string;
  status: ItemStatus;
  sensitiveInfoMasked?: boolean;
  maskedDetails?: string; // Private info like student reg num or IMEI masked
  locationServicesOn?: boolean; // If mobile phone location is ON, allows live device tracking
  lastKnownCoordinates?: {
    lat: number;
    lng: number;
    campusZone: string;
    accuracyMeters: number;
    lastPingTime: string;
    signalStrength: 'Strong' | 'Medium' | 'Weak';
  };
  batteryLevel?: number; // Device battery percentage (0-100)
  createdAt: string;
  updatedAt: string;
}

export interface MatchDimension {
  name: string;
  score: number; // 0 - 100
  weight: number;
  details: string;
}

export interface MatchRecord {
  id: string;
  lostItemId: string;
  foundItemId: string;
  category: ItemCategory;
  score: number; // 0 - 100
  matchConfidence: 'High' | 'Medium' | 'Low';
  matchEngine: 'AI Model (Gemini)' | 'Rule-Based Campus Similarity Engine';
  breakdown: MatchDimension[];
  reasoning: string;
  status: 'Unreviewed' | 'Claim Initiated' | 'Confirmed' | 'Dismissed';
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  itemId: string; // The found item (or lost item)
  itemTitle: string;
  category: ItemCategory;
  claimedByUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantDepartment: string;
  claimantYear: string;
  verificationProof: string; // Detailed proof description (wallpapers, stickers, secret scratches)
  serialOrIdentifierProof: string; // IMEI digits, device serial tag
  supportingPhotoUrl?: string;
  status: 'Claim Pending' | 'Approved' | 'Returned' | 'Rejected';
  adminNotes?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'claim_update' | 'item_update' | 'admin_alert';
  read: boolean;
  linkType?: 'match' | 'claim' | 'item';
  linkId?: string;
  createdAt: string;
}

export interface CampusStats {
  totalLost: number;
  totalFound: number;
  potentialMatches: number;
  successfullyReturned: number;
  pendingClaims: number;
  totalUsers: number;
  categoryBreakdown: Record<ItemCategory, { lost: number; found: number; returned: number }>;
}

export const CAMPUS_LOCATIONS = [
  'Central Library (Floor 1-3)',
  'Science Complex & Labs',
  'Engineering Building A & B',
  'Student Dining Hall / Cafeteria',
  'Athletic Pavilion & Gym',
  'Main Lecture Auditorium',
  'Student Center & Union',
  'Dormitory Quadrangle',
  'Campus Health & Counseling Center',
  'Administration & Registrar Office',
  'Campus Shuttle Stop',
  'Outdoor Courtyard & Amphitheater'
] as const;

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Computer Engineering',
  'Mechanical & Aerospace Engineering',
  'School of Business & Economics',
  'Biological Sciences & Pre-Med',
  'Arts, Media & Design',
  'Humanities & Social Sciences',
  'Architecture & Built Environment'
] as const;

export const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Graduate / Master’s',
  'Doctoral / PhD'
] as const;
