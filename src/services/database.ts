/**
 * CampusFind AI - Database Service & Reactive Store
 * Manages the 6 core collections:
 * 1. users
 * 2. lostItems
 * 3. foundItems
 * 4. matches
 * 5. claims
 * 6. notifications
 *
 * Persists data to localStorage with automatic initial seeding.
 * Strictly validates that only the 3 permitted categories are used.
 */

import {
  User,
  ItemReport,
  MatchRecord,
  ClaimRecord,
  NotificationItem,
  CampusStats,
  ALLOWED_CATEGORIES,
  isValidCategory
} from '../types';

const STORAGE_KEYS = {
  USERS: 'campusfind_users',
  LOST_ITEMS: 'campusfind_lost_items',
  FOUND_ITEMS: 'campusfind_found_items',
  MATCHES: 'campusfind_matches',
  CLAIMS: 'campusfind_claims',
  NOTIFICATIONS: 'campusfind_notifications',
  SEEDED: 'campusfind_db_seeded_v3'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener callback error', e);
    }
  });
}

export function subscribeToDatabase(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Helper for local storage read/write
function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key} from storage`, e);
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to write ${key} to storage`, e);
  }
}

/**
 * Seed data with realistic campus records in all 4 permitted categories
 */
function initializeSeedData(): void {
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) {
    return;
  }

  const initialUsers: User[] = [
    {
      id: 'usr_admin_1',
      name: 'Campus Security Administrator',
      email: 'kgowsalya845@gmail.com',
      department: 'Campus Safety & Security Division',
      year: 'Staff / Admin',
      role: 'admin',
      createdAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'usr_student_1',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      department: 'Computer Science & Engineering',
      year: '2nd Year (Sophomore)',
      role: 'student',
      createdAt: '2026-09-05T10:15:00Z'
    },
    {
      id: 'usr_student_2',
      name: 'Marcus Chen',
      email: 'm.chen@campus.edu',
      department: 'School of Business & Economics',
      year: '3rd Year (Junior)',
      role: 'student',
      createdAt: '2026-09-12T14:30:00Z'
    },
    {
      id: 'usr_student_3',
      name: 'Elena Rostova',
      email: 'elena.rostova@campus.edu',
      department: 'Biological Sciences & Pre-Med',
      year: '1st Year (Freshman)',
      role: 'student',
      createdAt: '2026-09-20T11:45:00Z'
    }
  ];

  const initialLostItems: ItemReport[] = [
    {
      id: 'lost_101',
      type: 'lost',
      category: 'iPhone',
      title: 'iPhone 15 Pro (Natural Titanium)',
      description: 'Lost during lunch hour. Has a transparent blue silicone bumper case with a small starry night sticker on the back.',
      brand: 'Apple',
      model: 'iPhone 15 Pro 128GB',
      color: 'Natural Titanium',
      identifyingFeatures: 'Small scratch near bottom speaker port, lock screen is an astronaut in space wallpaper.',
      campusLocation: 'Student Dining Hall / Cafeteria',
      date: '2026-10-08',
      timeApprox: '12:45 PM',
      reportedByUserId: 'usr_student_1',
      reporterName: 'Alex Rivera',
      reporterEmail: 'alex.rivera@campus.edu',
      reporterDepartment: 'Computer Science & Engineering',
      status: 'Potential Match',
      locationServicesOn: true,
      lastKnownCoordinates: {
        lat: 37.7749,
        lng: -122.4194,
        campusZone: 'Student Dining Hall - North Booth Area',
        accuracyMeters: 4,
        lastPingTime: 'Just now',
        signalStrength: 'Strong'
      },
      batteryLevel: 84,
      createdAt: '2026-10-08T13:30:00Z',
      updatedAt: '2026-10-08T15:00:00Z'
    },
    {
      id: 'lost_102',
      type: 'lost',
      category: 'Laptop',
      title: 'Dell XPS 15 9530',
      description: 'Left on study carrel desk on 2nd floor library. Contains sticker of GitHub Octocat and React logo on upper lid.',
      brand: 'Dell',
      model: 'XPS 15 9530 (OLED display)',
      color: 'Platinum Silver / Black Carbon Fiber',
      identifyingFeatures: 'GitHub Octocat holographic sticker, black protective sleeve.',
      campusLocation: 'Central Library (Floor 1-3)',
      date: '2026-10-07',
      timeApprox: '4:15 PM',
      reportedByUserId: 'usr_student_2',
      reporterName: 'Marcus Chen',
      reporterEmail: 'm.chen@campus.edu',
      reporterDepartment: 'School of Business & Economics',
      status: 'Claim Pending',
      createdAt: '2026-10-07T17:00:00Z',
      updatedAt: '2026-10-08T09:20:00Z'
    },
    {
      id: 'lost_103',
      type: 'lost',
      category: 'Laptop',
      title: 'Lenovo ThinkPad X1 Carbon Gen 11',
      description: 'Matte black ThinkPad left in Engineering Room 304 study desk. Has Linux sticker on bottom case.',
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 11',
      color: 'Matte Black',
      identifyingFeatures: 'Tux Linux sticker on underside, red TrackPoint button intact.',
      campusLocation: 'Engineering Building A & B',
      date: '2026-10-09',
      timeApprox: '09:10 AM',
      reportedByUserId: 'usr_student_3',
      reporterName: 'Elena Rostova',
      reporterEmail: 'elena.rostova@campus.edu',
      reporterDepartment: 'Biological Sciences & Pre-Med',
      status: 'Open',
      createdAt: '2026-10-09T09:40:00Z',
      updatedAt: '2026-10-09T09:40:00Z'
    },
    {
      id: 'lost_104',
      type: 'lost',
      category: 'Mobile Phone',
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Titanium Gray finish, black Spigen armor case with kickstand on back.',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      color: 'Titanium Gray',
      identifyingFeatures: 'Spigen Tough Armor case, integrated S-Pen stylus intact.',
      campusLocation: 'Athletic Pavilion & Gym',
      date: '2026-10-06',
      timeApprox: '6:30 PM',
      reportedByUserId: 'usr_student_1',
      reporterName: 'Alex Rivera',
      reporterEmail: 'alex.rivera@campus.edu',
      reporterDepartment: 'Computer Science & Engineering',
      status: 'Open',
      locationServicesOn: true,
      lastKnownCoordinates: {
        lat: 37.7752,
        lng: -122.4188,
        campusZone: 'Athletic Pavilion & Gym - Locker Room East',
        accuracyMeters: 6,
        lastPingTime: '15 minutes ago',
        signalStrength: 'Medium'
      },
      batteryLevel: 62,
      createdAt: '2026-10-06T19:00:00Z',
      updatedAt: '2026-10-06T19:00:00Z'
    }
  ];

  const initialFoundItems: ItemReport[] = [
    {
      id: 'found_201',
      type: 'found',
      category: 'iPhone',
      title: 'Found Apple iPhone in Cafeteria Booth',
      description: 'Discovered sitting on a booth seat near the salad bar. Turned in to security desk. Screen is locked.',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      color: 'Titanium / Grey',
      identifyingFeatures: 'Transparent blue case, art sticker visible on back.',
      campusLocation: 'Student Dining Hall / Cafeteria',
      date: '2026-10-08',
      timeApprox: '1:10 PM',
      reportedByUserId: 'usr_admin_1',
      reporterName: 'Campus Security Officer',
      reporterEmail: 'kgowsalya845@gmail.com',
      status: 'Potential Match',
      sensitiveInfoMasked: true,
      maskedDetails: 'Lock screen preview shows student emergency contact; IMEI ends in ***9041.',
      createdAt: '2026-10-08T13:45:00Z',
      updatedAt: '2026-10-08T15:00:00Z'
    },
    {
      id: 'found_202',
      type: 'found',
      category: 'Laptop',
      title: 'Dell Silver Laptop on Library Level 2',
      description: 'Found unattended at library carrel #14. High-spec silver Dell machine in black protective case.',
      brand: 'Dell',
      model: 'XPS Series',
      color: 'Silver / Carbon Fiber',
      identifyingFeatures: 'Contains developer tech sticker on front lid.',
      campusLocation: 'Central Library (Floor 1-3)',
      date: '2026-10-07',
      timeApprox: '5:00 PM',
      reportedByUserId: 'usr_admin_1',
      reporterName: 'Library Staff (Front Desk)',
      reporterEmail: 'kgowsalya845@gmail.com',
      status: 'Claim Pending',
      sensitiveInfoMasked: true,
      maskedDetails: 'Dell Service Tag ends in ***7Y2. Kept safely in Admin Locker #4.',
      createdAt: '2026-10-07T17:30:00Z',
      updatedAt: '2026-10-08T09:20:00Z'
    },
    {
      id: 'found_203',
      type: 'found',
      category: 'Mobile Phone',
      title: 'Google Pixel 8 Pro in Amphitheater',
      description: 'Porcelain white Google Pixel found on outdoor stone bench. Screen locked with PIN.',
      brand: 'Google',
      model: 'Pixel 8 Pro',
      color: 'Porcelain White',
      identifyingFeatures: 'Clear transparent case with campus bus pass insert.',
      campusLocation: 'Outdoor Courtyard & Amphitheater',
      date: '2026-10-09',
      timeApprox: '10:00 AM',
      reportedByUserId: 'usr_admin_1',
      reporterName: 'Campus Security Office',
      reporterEmail: 'kgowsalya845@gmail.com',
      status: 'Open',
      locationServicesOn: true,
      lastKnownCoordinates: {
        lat: 37.7761,
        lng: -122.4205,
        campusZone: 'Outdoor Courtyard & Amphitheater - Main Stage Area',
        accuracyMeters: 5,
        lastPingTime: '10 minutes ago',
        signalStrength: 'Strong'
      },
      batteryLevel: 51,
      sensitiveInfoMasked: true,
      maskedDetails: 'Lock screen preview shows student emergency contact; IMEI ends in ***3821.',
      createdAt: '2026-10-09T10:15:00Z',
      updatedAt: '2026-10-09T10:15:00Z'
    },
    {
      id: 'found_204',
      type: 'found',
      category: 'Laptop',
      title: 'Apple MacBook Air 13-inch (M2)',
      description: 'Found in lecture hall podium drawer. Safely returned to its verified owner yesterday.',
      brand: 'Apple',
      model: 'MacBook Air M2',
      color: 'Midnight Navy',
      identifyingFeatures: 'Matte keyboard cover with math shortcut keys.',
      campusLocation: 'Main Lecture Auditorium',
      date: '2026-10-04',
      timeApprox: '3:00 PM',
      reportedByUserId: 'usr_admin_1',
      reporterName: 'Lecture Hall Coordinator',
      reporterEmail: 'kgowsalya845@gmail.com',
      status: 'Returned',
      createdAt: '2026-10-04T15:30:00Z',
      updatedAt: '2026-10-06T11:00:00Z'
    }
  ];

  const initialMatches: MatchRecord[] = [
    {
      id: 'match_301',
      lostItemId: 'lost_101',
      foundItemId: 'found_201',
      category: 'iPhone',
      score: 94,
      matchConfidence: 'High',
      matchEngine: 'AI Model (Gemini)',
      breakdown: [
        { name: 'Category Compatibility', score: 100, weight: 25, details: 'Strict iPhone to iPhone match.' },
        { name: 'Brand & Model Alignment', score: 96, weight: 25, details: 'Apple iPhone 15 Pro titanium finish.' },
        { name: 'Features & Color', score: 92, weight: 25, details: 'Transparent blue case and sticker matches.' },
        { name: 'Campus Spatiotemporal', score: 88, weight: 25, details: 'Both reported at Student Dining Hall within 25 minutes.' }
      ],
      reasoning: 'Strong multi-dimensional correlation: Exact iPhone 15 Pro category, identical Dining Hall location, transparent blue case with rear sticker, reported within 25 minutes of loss.',
      status: 'Unreviewed',
      createdAt: '2026-10-08T13:50:00Z'
    },
    {
      id: 'match_302',
      lostItemId: 'lost_102',
      foundItemId: 'found_202',
      category: 'Laptop',
      score: 91,
      matchConfidence: 'High',
      matchEngine: 'Rule-Based Campus Similarity Engine',
      breakdown: [
        { name: 'Category Compatibility', score: 100, weight: 25, details: 'Strict Laptop to Laptop match.' },
        { name: 'Brand & Model Alignment', score: 92, weight: 25, details: 'Dell XPS series silver/carbon fiber.' },
        { name: 'Features & Color', score: 88, weight: 25, details: 'Developer stickers and protective sleeve.' },
        { name: 'Campus Spatiotemporal', score: 85, weight: 25, details: 'Central Library 2nd Floor desk within 45 mins.' }
      ],
      reasoning: 'High confidence match for Dell XPS silver laptop found in Central Library Level 2, corresponding with Marcus Chen’s lost report.',
      status: 'Claim Initiated',
      createdAt: '2026-10-07T17:35:00Z'
    }
  ];

  const initialClaims: ClaimRecord[] = [
    {
      id: 'claim_401',
      itemId: 'found_202',
      itemTitle: 'Dell Silver Laptop on Library Level 2',
      category: 'Laptop',
      claimedByUserId: 'usr_student_2',
      claimantName: 'Marcus Chen',
      claimantEmail: 'm.chen@campus.edu',
      claimantDepartment: 'School of Business & Economics',
      claimantYear: '3rd Year (Junior)',
      verificationProof: 'Stickers on lid: GitHub Octocat holographic on top left, React hexagonal sticker near bottom right. Lock screen user name is "marcus-biz".',
      serialOrIdentifierProof: 'Dell Service Tag ends in 7Y2, invoice registered to m.chen@campus.edu.',
      status: 'Claim Pending',
      adminNotes: 'Awaiting administrator physical serial tag verification at Security desk.',
      createdAt: '2026-10-08T09:20:00Z',
      updatedAt: '2026-10-08T09:20:00Z'
    }
  ];

  const initialNotifications: NotificationItem[] = [
    {
      id: 'notif_501',
      userId: 'usr_student_1',
      title: 'Potential Match Found! (94% Score)',
      message: 'A found iPhone matching your lost iPhone 15 Pro was reported at Student Dining Hall.',
      type: 'match',
      read: false,
      linkType: 'match',
      linkId: 'match_301',
      createdAt: '2026-10-08T13:51:00Z'
    },
    {
      id: 'notif_502',
      userId: 'usr_student_2',
      title: 'Claim Submitted Successfully',
      message: 'Your claim for the Dell XPS laptop is under review by Campus Security.',
      type: 'claim_update',
      read: true,
      linkType: 'claim',
      linkId: 'claim_401',
      createdAt: '2026-10-08T09:21:00Z'
    },
    {
      id: 'notif_503',
      userId: 'usr_admin_1',
      title: 'New Ownership Claim Submitted',
      message: 'Student Marcus Chen submitted proof of ownership for Dell Silver Laptop.',
      type: 'admin_alert',
      read: false,
      linkType: 'claim',
      linkId: 'claim_401',
      createdAt: '2026-10-08T09:22:00Z'
    }
  ];

  writeToStorage(STORAGE_KEYS.USERS, initialUsers);
  writeToStorage(STORAGE_KEYS.LOST_ITEMS, initialLostItems);
  writeToStorage(STORAGE_KEYS.FOUND_ITEMS, initialFoundItems);
  writeToStorage(STORAGE_KEYS.MATCHES, initialMatches);
  writeToStorage(STORAGE_KEYS.CLAIMS, initialClaims);
  writeToStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}

// Ensure database is initialized on boot
initializeSeedData();

// --- DATABASE OPERATIONS ---

export const dbService = {
  // Reset database back to default seed state
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.SEEDED);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LOST_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.FOUND_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    initializeSeedData();
    notifyListeners();
  },

  // USERS
  getUsers(): User[] {
    return readFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    // Security enforcement: Prevent student self-promotion to admin
    const safeRole = userData.role === 'admin' ? 'student' : userData.role;

    const newUser: User = {
      ...userData,
      role: safeRole,
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    users.push(newUser);
    writeToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  updateUserRole(userId: string, newRole: 'student' | 'admin', adminCallerId: string): boolean {
    const caller = this.getUserById(adminCallerId);
    if (!caller || caller.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can modify roles');
    }

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      writeToStorage(STORAGE_KEYS.USERS, users);
      return true;
    }
    return false;
  },

  // ITEMS (LOST & FOUND)
  getLostItems(): ItemReport[] {
    return readFromStorage<ItemReport[]>(STORAGE_KEYS.LOST_ITEMS, []).filter(
      (item) => isValidCategory(item.category)
    );
  },

  getFoundItems(): ItemReport[] {
    return readFromStorage<ItemReport[]>(STORAGE_KEYS.FOUND_ITEMS, []).filter(
      (item) => isValidCategory(item.category)
    );
  },

  getAllItems(): ItemReport[] {
    return [...this.getLostItems(), ...this.getFoundItems()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getItemById(id: string): ItemReport | undefined {
    return this.getAllItems().find((item) => item.id === id);
  },

  createReport(data: Omit<ItemReport, 'id' | 'createdAt' | 'updatedAt'>): ItemReport {
    // STRICT VALIDATION: ONLY PERMITTED CATEGORIES
    if (!isValidCategory(data.category)) {
      throw new Error(
        `Invalid category "${data.category}". Only Laptop, Mobile Phone, and iPhone are permitted.`
      );
    }

    const now = new Date().toISOString();
    const newReport: ItemReport = {
      ...data,
      id: (data.type === 'lost' ? 'lost_' : 'found_') + Date.now(),
      createdAt: now,
      updatedAt: now
    };

    if (data.type === 'lost') {
      const items = this.getLostItems();
      items.unshift(newReport);
      writeToStorage(STORAGE_KEYS.LOST_ITEMS, items);
    } else {
      const items = this.getFoundItems();
      items.unshift(newReport);
      writeToStorage(STORAGE_KEYS.FOUND_ITEMS, items);
    }

    return newReport;
  },

  updateItemStatus(itemId: string, status: ItemReport['status']): void {
    const isLost = itemId.startsWith('lost_');
    const storageKey = isLost ? STORAGE_KEYS.LOST_ITEMS : STORAGE_KEYS.FOUND_ITEMS;
    const items = readFromStorage<ItemReport[]>(storageKey, []);
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      items[idx].status = status;
      items[idx].updatedAt = new Date().toISOString();
      writeToStorage(storageKey, items);
    }
  },

  toggleDeviceLocation(itemId: string, enabled: boolean): ItemReport | undefined {
    const isLost = itemId.startsWith('lost_');
    const storageKey = isLost ? STORAGE_KEYS.LOST_ITEMS : STORAGE_KEYS.FOUND_ITEMS;
    const items = readFromStorage<ItemReport[]>(storageKey, []);
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      items[idx].locationServicesOn = enabled;
      if (enabled && !items[idx].lastKnownCoordinates) {
        items[idx].lastKnownCoordinates = {
          lat: 37.7749 + (Math.random() - 0.5) * 0.005,
          lng: -122.4194 + (Math.random() - 0.5) * 0.005,
          campusZone: items[idx].campusLocation + ' (Active Beacon Detected)',
          accuracyMeters: Math.floor(Math.random() * 5) + 3,
          lastPingTime: 'Just now',
          signalStrength: 'Strong'
        };
        items[idx].batteryLevel = items[idx].batteryLevel || 78;
      }
      items[idx].updatedAt = new Date().toISOString();
      writeToStorage(storageKey, items);
      return items[idx];
    }
    return undefined;
  },

  pingDeviceLocation(itemId: string): ItemReport | undefined {
    const isLost = itemId.startsWith('lost_');
    const storageKey = isLost ? STORAGE_KEYS.LOST_ITEMS : STORAGE_KEYS.FOUND_ITEMS;
    const items = readFromStorage<ItemReport[]>(storageKey, []);
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      if (items[idx].lastKnownCoordinates) {
        items[idx].lastKnownCoordinates = {
          ...items[idx].lastKnownCoordinates!,
          lastPingTime: 'Just now',
          accuracyMeters: Math.floor(Math.random() * 4) + 2,
          signalStrength: 'Strong'
        };
      }
      items[idx].updatedAt = new Date().toISOString();
      writeToStorage(storageKey, items);
      return items[idx];
    }
    return undefined;
  },

  deleteReport(itemId: string, callerUserId: string): boolean {
    const caller = this.getUserById(callerUserId);
    const item = this.getItemById(itemId);
    if (!item) return false;

    // Must be either owner or admin
    if (item.reportedByUserId !== callerUserId && caller?.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own reports or administer them');
    }

    const isLost = item.type === 'lost';
    const storageKey = isLost ? STORAGE_KEYS.LOST_ITEMS : STORAGE_KEYS.FOUND_ITEMS;
    const items = readFromStorage<ItemReport[]>(storageKey, []);
    const filtered = items.filter((i) => i.id !== itemId);
    writeToStorage(storageKey, filtered);
    return true;
  },

  // MATCHES
  getMatches(): MatchRecord[] {
    return readFromStorage<MatchRecord[]>(STORAGE_KEYS.MATCHES, []);
  },

  getMatchById(id: string): MatchRecord | undefined {
    return this.getMatches().find((m) => m.id === id);
  },

  saveMatch(match: MatchRecord): void {
    // STRICT VALIDATION
    if (!isValidCategory(match.category)) {
      throw new Error(`Invalid match category: ${match.category}`);
    }

    const matches = this.getMatches();
    const existingIdx = matches.findIndex((m) => m.id === match.id);
    if (existingIdx !== -1) {
      matches[existingIdx] = match;
    } else {
      matches.unshift(match);
    }
    writeToStorage(STORAGE_KEYS.MATCHES, matches);
  },

  updateMatchStatus(matchId: string, status: MatchRecord['status']): void {
    const matches = this.getMatches();
    const idx = matches.findIndex((m) => m.id === matchId);
    if (idx !== -1) {
      matches[idx].status = status;
      writeToStorage(STORAGE_KEYS.MATCHES, matches);
    }
  },

  // CLAIMS
  getClaims(): ClaimRecord[] {
    return readFromStorage<ClaimRecord[]>(STORAGE_KEYS.CLAIMS, []);
  },

  getClaimById(id: string): ClaimRecord | undefined {
    return this.getClaims().find((c) => c.id === id);
  },

  createClaim(claimData: Omit<ClaimRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>): ClaimRecord {
    if (!isValidCategory(claimData.category)) {
      throw new Error(`Invalid claim category: ${claimData.category}`);
    }

    const now = new Date().toISOString();
    const newClaim: ClaimRecord = {
      ...claimData,
      id: 'claim_' + Date.now(),
      status: 'Claim Pending',
      createdAt: now,
      updatedAt: now
    };

    const claims = this.getClaims();
    claims.unshift(newClaim);
    writeToStorage(STORAGE_KEYS.CLAIMS, claims);

    // Update item status to 'Claim Pending'
    this.updateItemStatus(claimData.itemId, 'Claim Pending');

    // Notify admins of new pending claim
    const admins = this.getUsers().filter((u) => u.role === 'admin');
    admins.forEach((admin) => {
      this.createNotification({
        userId: admin.id,
        title: 'New Ownership Claim Submitted',
        message: `${claimData.claimantName} filed an ownership claim for: "${claimData.itemTitle}".`,
        type: 'admin_alert',
        linkType: 'claim',
        linkId: newClaim.id
      });
    });

    return newClaim;
  },

  reviewClaim(
    claimId: string,
    action: 'Approved' | 'Rejected' | 'Returned',
    adminNotes: string,
    adminId: string
  ): ClaimRecord {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can approve or reject claims');
    }

    const claims = this.getClaims();
    const idx = claims.findIndex((c) => c.id === claimId);
    if (idx === -1) {
      throw new Error('Claim not found');
    }

    const now = new Date().toISOString();
    claims[idx].status = action;
    claims[idx].adminNotes = adminNotes;
    claims[idx].reviewedByAdminId = adminId;
    claims[idx].updatedAt = now;
    writeToStorage(STORAGE_KEYS.CLAIMS, claims);

    // Update corresponding item status
    const itemStatus = action === 'Approved' ? 'Approved' : action === 'Returned' ? 'Returned' : 'Open';
    this.updateItemStatus(claims[idx].itemId, itemStatus);

    // Notify student claimant of the decision
    this.createNotification({
      userId: claims[idx].claimedByUserId,
      title: `Claim ${action}: ${claims[idx].itemTitle}`,
      message:
        action === 'Approved'
          ? `Your claim was APPROVED! Visit the Campus Security office with your photo ID to collect your item.`
          : action === 'Returned'
          ? `This item has been officially marked as RETURNED to you.`
          : `Your claim was reviewed and rejected. Admin note: ${adminNotes || 'Verification details were insufficient.'}`,
      type: 'claim_update',
      linkType: 'claim',
      linkId: claimId
    });

    return claims[idx];
  },

  // NOTIFICATIONS
  getNotifications(userId?: string): NotificationItem[] {
    const all = readFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!userId) return all;
    return all.filter((n) => n.userId === userId);
  },

  createNotification(notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString()
    };
    const notifs = readFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift(newNotif);
    writeToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  markNotificationAsRead(notifId: string): void {
    const notifs = readFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = notifs.findIndex((n) => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].read = true;
      writeToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsRead(userId: string): void {
    const notifs = readFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    writeToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // OVERALL STATS
  getStats(): CampusStats {
    const lost = this.getLostItems();
    const found = this.getFoundItems();
    const matches = this.getMatches();
    const claims = this.getClaims();
    const users = this.getUsers();

    const returnedCount =
      lost.filter((i) => i.status === 'Returned').length +
      found.filter((i) => i.status === 'Returned').length;

    const categoryBreakdown: CampusStats['categoryBreakdown'] = {
      Laptop: { lost: 0, found: 0, returned: 0 },
      'Mobile Phone': { lost: 0, found: 0, returned: 0 },
      iPhone: { lost: 0, found: 0, returned: 0 }
    };

    ALLOWED_CATEGORIES.forEach((cat) => {
      categoryBreakdown[cat].lost = lost.filter((i) => i.category === cat).length;
      categoryBreakdown[cat].found = found.filter((i) => i.category === cat).length;
      categoryBreakdown[cat].returned =
        lost.filter((i) => i.category === cat && i.status === 'Returned').length +
        found.filter((i) => i.category === cat && i.status === 'Returned').length;
    });

    return {
      totalLost: lost.length,
      totalFound: found.length,
      potentialMatches: matches.length,
      successfullyReturned: returnedCount,
      pendingClaims: claims.filter((c) => c.status === 'Claim Pending').length,
      totalUsers: users.length,
      categoryBreakdown
    };
  }
};
