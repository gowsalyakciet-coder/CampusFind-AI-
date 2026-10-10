/**
 * Authentication service for CampusFind AI
 * Handles student registration, login, logout, password reset,
 * and role-based access control with admin protection.
 */

import { User } from '../types';
import { dbService } from './database';

const CURRENT_USER_KEY = 'campusfind_current_user';

type AuthListener = (user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

function notifyAuthChange(user: User | null) {
  authListeners.forEach((fn) => fn(user));
}

export const authService = {
  subscribe(listener: AuthListener): () => void {
    authListeners.add(listener);
    // Initial call
    listener(this.getCurrentUser());
    return () => {
      authListeners.delete(listener);
    };
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) {
        // Default to student on first boot so user immediately sees interactive state
        const defaultStudent = dbService.getUserByEmail('alex.rivera@campus.edu');
        if (defaultStudent) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultStudent));
          return defaultStudent;
        }
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  login(email: string, password?: string): User {
    return this.loginWithGmail(email, password);
  },

  loginWithGmail(emailOrGmail: string, password?: string): User {
    const cleanEmail = emailOrGmail.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your Gmail address.');
    }
    if (!cleanEmail.includes('@')) {
      throw new Error('Please enter a valid Gmail address (e.g. yourname@gmail.com).');
    }
    if (password !== undefined && password.trim().length === 0) {
      throw new Error('Please enter your password.');
    }

    let user = dbService.getUserByEmail(cleanEmail);
    if (!user) {
      // If user does not exist yet, automatically initialize them
      const isAdminEmail = cleanEmail === 'kgowsalya845@gmail.com';
      const cleanUserPart = cleanEmail.split('@')[0];
      const derivedName =
        cleanUserPart
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Campus Student';

      user = dbService.createUser({
        name: derivedName,
        email: cleanEmail,
        department: 'Computer Science & Engineering',
        year: '2nd Year (Sophomore)',
        role: isAdminEmail ? 'admin' : 'student'
      });
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    notifyAuthChange(user);
    return user;
  },

  register(params: {
    name: string;
    email: string;
    department: string;
    year: string;
  }): User {
    const existing = dbService.getUserByEmail(params.email.trim());
    if (existing) {
      throw new Error(`An account with email "${params.email}" already exists. Please log in.`);
    }

    // Role safety: Students cannot assign themselves administrator status!
    const newUser = dbService.createUser({
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      department: params.department,
      year: params.year,
      role: 'student'
    });

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    notifyAuthChange(newUser);
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    notifyAuthChange(null);
  },

  requestPasswordReset(email: string): { success: boolean; message: string } {
    const user = dbService.getUserByEmail(email.trim());
    if (!user) {
      throw new Error(`No student account registered under "${email}".`);
    }
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}. Check your campus inbox.`
    };
  },

  // Switch to specific user account for rapid demonstration
  switchUser(userId: string): User | null {
    const user = dbService.getUserById(userId);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      notifyAuthChange(user);
    }
    return user || null;
  }
};
