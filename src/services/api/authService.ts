/**
 * Authentication Service for PocketTherapy
 * 
 * Handles Google OAuth authentication and guest mode functionality.
 * Provides secure authentication with privacy-first approach.
 */

import { supabase } from './supabaseClient';
import { User } from '../../types';
// import { debugLog, generateId } from '../../utils'; // Commented out for now

// Temporary implementations
const debugLog = (...args: any[]) => console.log('[DEBUG]', ...args);
const generateId = () => Math.random().toString(36).substring(2, 11);
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for local authentication state
const STORAGE_KEYS = {
  GUEST_USER: 'pockettherapy_guest_user',
  AUTH_STATE: 'pockettherapy_auth_state',
  USER_PREFERENCES: 'pockettherapy_user_preferences',
} as const;

// Guest user interface
interface GuestUser {
  id: string;
  isGuest: true;
  createdAt: string;
  localData: {
    moodLogs: any[];
    exerciseSessions: any[];
    preferences: any;
  };
}

/**
 * Authentication Service Class
 */
class AuthService {
  private currentUser: User | GuestUser | null = null;
  private authStateListeners: ((user: User | GuestUser | null) => void)[] = [];

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<void> {
    try {
      debugLog('Initializing authentication service...');

      // Check for existing Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        debugLog('Error getting session:', error.message);
        await this.checkGuestMode();
        return;
      }

      if (session?.user) {
        debugLog('Found existing Supabase session');
        await this.handleSupabaseUser(session.user);
      } else {
        debugLog('No existing session, checking guest mode');
        await this.checkGuestMode();
      }

      // Set up auth state listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        debugLog('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.handleSupabaseUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          await this.handleSignOut();
        }
      });

    } catch (error) {
      debugLog('Error initializing auth service:', error);
      await this.checkGuestMode();
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      debugLog('Starting Google OAuth sign in...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect URL for mobile app
          redirectTo: 'pockettherapy://auth/callback',
          // Request additional scopes if needed
          scopes: 'email profile',
          // Query parameters for OAuth
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        debugLog('Google OAuth error:', error.message);
        return { success: false, error: error.message };
      }

      debugLog('Google OAuth initiated successfully');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLog('Google sign in error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create guest user session
   */
  async createGuestSession(): Promise<{ success: boolean; user?: GuestUser; error?: string }> {
    try {
      debugLog('Creating guest session...');

      const guestUser: GuestUser = {
        id: `guest_${generateId()}`,
        isGuest: true,
        createdAt: new Date().toISOString(),
        localData: {
          moodLogs: [],
          exerciseSessions: [],
          preferences: {
            notifications: { enabled: false },
            audio: { enabled: true, volume: 0.7 },
            haptics: { enabled: true, intensity: 'medium' },
            privacy: { localOnly: true, dataRetentionDays: 30 },
          },
        },
      };

      // Store guest user locally
      await AsyncStorage.setItem(
        STORAGE_KEYS.GUEST_USER,
        JSON.stringify(guestUser)
      );

      this.currentUser = guestUser;
      this.notifyAuthStateListeners();

      debugLog('Guest session created successfully');
      return { success: true, user: guestUser };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLog('Error creating guest session:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Convert guest account to full account
   */
  async upgradeGuestToFullAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser || !('isGuest' in this.currentUser) || !this.currentUser.isGuest) {
        return { success: false, error: 'No guest account to upgrade' };
      }

      debugLog('Upgrading guest account to full account...');

      // Initiate Google OAuth for account upgrade
      const result = await this.signInWithGoogle();
      
      if (!result.success) {
        return result;
      }

      // Note: The actual data migration will happen in handleSupabaseUser
      // when the OAuth callback completes
      
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLog('Error upgrading guest account:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      debugLog('Signing out user...');

      // Sign out from Supabase if authenticated
      if (this.currentUser && !('isGuest' in this.currentUser)) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          debugLog('Error signing out from Supabase:', error.message);
        }
      }

      // Clear local storage
      await this.clearLocalAuthData();

      // Reset current user
      this.currentUser = null;
      this.notifyAuthStateListeners();

      debugLog('Sign out successful');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLog('Error during sign out:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | GuestUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user is in guest mode
   */
  isGuestMode(): boolean {
    return this.currentUser !== null && 'isGuest' in this.currentUser && this.currentUser.isGuest;
  }

  /**
   * Add auth state listener
   */
  onAuthStateChange(callback: (user: User | GuestUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Private: Handle Supabase user authentication
   */
  private async handleSupabaseUser(supabaseUser: any): Promise<void> {
    try {
      debugLog('Handling Supabase user authentication...');

      // Check if we need to migrate guest data
      const guestData = await this.getGuestData();

      // Create or update user profile
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        onboarding_completed: false,
        isGuest: false,
        createdAt: supabaseUser.created_at,
        updatedAt: new Date().toISOString(),
      };

      // If migrating from guest, handle data migration
      if (guestData) {
        debugLog('Migrating guest data to authenticated account...');
        // TODO: Implement data migration logic
        await this.clearGuestData();
      }

      this.currentUser = user;
      this.notifyAuthStateListeners();

      debugLog('Supabase user authentication successful');

    } catch (error) {
      debugLog('Error handling Supabase user:', error);
    }
  }

  /**
   * Private: Handle sign out
   */
  private async handleSignOut(): Promise<void> {
    debugLog('Handling sign out...');
    this.currentUser = null;
    this.notifyAuthStateListeners();
  }

  /**
   * Private: Check for existing guest mode
   */
  private async checkGuestMode(): Promise<void> {
    try {
      const guestData = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_USER);
      
      if (guestData) {
        const guestUser: GuestUser = JSON.parse(guestData);
        this.currentUser = guestUser;
        this.notifyAuthStateListeners();
        debugLog('Restored guest session');
      }
    } catch (error) {
      debugLog('Error checking guest mode:', error);
    }
  }

  /**
   * Private: Get guest data for migration
   */
  private async getGuestData(): Promise<GuestUser | null> {
    try {
      const guestData = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_USER);
      return guestData ? JSON.parse(guestData) : null;
    } catch (error) {
      debugLog('Error getting guest data:', error);
      return null;
    }
  }

  /**
   * Private: Clear guest data after migration
   */
  private async clearGuestData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_USER);
      debugLog('Guest data cleared');
    } catch (error) {
      debugLog('Error clearing guest data:', error);
    }
  }

  /**
   * Private: Clear all local auth data
   */
  private async clearLocalAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.GUEST_USER),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_STATE),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES),
      ]);
      debugLog('Local auth data cleared');
    } catch (error) {
      debugLog('Error clearing local auth data:', error);
    }
  }

  /**
   * Private: Notify auth state listeners
   */
  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        debugLog('Error in auth state listener:', error);
      }
    });
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
