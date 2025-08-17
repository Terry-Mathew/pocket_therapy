/**
 * Authentication Service for PocketTherapy
 *
 * Handles user authentication, session management, guest mode,
 * and integration with Supabase Auth.
 */

import { supabase } from './supabase';
import { guestModeService } from './guestMode';
import { User, GuestUser, GoogleAuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STATE_KEY = 'auth_state';
const USER_SESSION_KEY = 'user_session';

class AuthService {
  /**
   * Initialize authentication state
   */
  async initializeAuth(): Promise<{
    isAuthenticated: boolean;
    user: User | GuestUser | null;
    authState: 'loading' | 'authenticated' | 'guest' | 'unauthenticated';
  }> {
    try {
      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // User is authenticated with Supabase
        const userData = await this.getUserProfile(session.user.id);
        return {
          isAuthenticated: true,
          user: userData,
          authState: 'authenticated'
        };
      }

      // Check for guest mode
      const guestUser = await guestModeService.getGuestUser();
      if (guestUser) {
        return {
          isAuthenticated: false,
          user: guestUser,
          authState: 'guest'
        };
      }

      // No authentication
      return {
        isAuthenticated: false,
        user: null,
        authState: 'unauthenticated'
      };

    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return {
        isAuthenticated: false,
        user: null,
        authState: 'unauthenticated'
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile data
      const userData = await this.getUserProfile(data.user.id);

      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, displayName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          display_name: displayName,
        });

        const userData = await this.getUserProfile(data.user.id);
        return { success: true, user: userData };
      }

      return { success: false, error: 'Failed to create user' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'pockettherapy://auth/callback'
        }
      });

      if (error) throw error;

      // Note: In a real implementation, this would handle the OAuth flow
      // For now, we'll return a placeholder response
      return {
        success: true,
        user: null // Will be populated after OAuth callback
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create guest user session
   */
  async createGuestUser(): Promise<{ success: boolean; user?: GuestUser; error?: string }> {
    try {
      const guestUser = await guestModeService.createGuestUser();
      return { success: true, user: guestUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get or create user profile for authenticated users
   */
  async getOrCreateUserProfile(authUser: any): Promise<User> {
    try {
      let userData = await this.getUserProfile(authUser.id);

      if (!userData) {
        // Create new user profile
        await this.createUserProfile(authUser.id, {
          email: authUser.email,
          display_name: authUser.user_metadata?.display_name,
        });
        userData = await this.getUserProfile(authUser.id);
      }

      return userData;
    } catch (error) {
      console.error('Failed to get or create user profile:', error);
      throw error;
    }
  }

  /**
   * Migrate guest data to authenticated account
   */
  async migrateGuestData(guestUser: GuestUser): Promise<void> {
    try {
      const guestData = await guestModeService.prepareDataForMigration();

      if (guestData.user) {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await this.migrateGuestDataToUser(user.id, guestData);
          await guestModeService.clearGuestData();
        }
      }
    } catch (error) {
      console.error('Failed to migrate guest data:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local session data
      await AsyncStorage.multiRemove([AUTH_STATE_KEY, USER_SESSION_KEY]);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const updatedUser = await this.getUserProfile(userId);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(userId: string): Promise<void> {
    try {
      // Delete user data (cascading deletes will handle related data)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Sign out
      await this.signOut();
    } catch (error) {
      console.error('Failed to delete user account:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pockettherapy://auth/reset-password'
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return await this.getUserProfile(user.id);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(userId: string, userData: {
    email?: string;
    display_name?: string;
    timezone?: string;
    onboarding_completed?: boolean;
  }) {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userData.email,
          display_name: userData.display_name,
          timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          onboarding_completed: userData.onboarding_completed || false,
          is_guest: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }

  /**
   * Migrate guest data to authenticated account
   */
  private async migrateGuestDataToUser(userId: string, guestData: any) {
    try {
      // Migrate mood logs
      if (guestData.moodLogs.length > 0) {
        const moodLogsToInsert = guestData.moodLogs.map(log => ({
          ...log,
          user_id: userId,
          synced: true // Mark as synced since we're inserting directly
        }));

        const { error: moodError } = await supabase
          .from('mood_logs')
          .insert(moodLogsToInsert);

        if (moodError) throw moodError;
      }

      // Migrate exercise sessions
      if (guestData.exerciseSessions.length > 0) {
        const sessionsToInsert = guestData.exerciseSessions.map(session => ({
          ...session,
          user_id: userId,
          synced: true
        }));

        const { error: sessionError } = await supabase
          .from('user_exercise_logs')
          .insert(sessionsToInsert);

        if (sessionError) throw sessionError;
      }

      // Migrate preferences if they exist
      if (guestData.preferences) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: this.generateUUID(),
            user_id: userId,
            timezone: guestData.user.timezone,
            onboarding_completed: guestData.user.onboarding_completed,
            notification_preferences: guestData.preferences.notifications,
            audio_preferences: guestData.preferences.audio,
            privacy_preferences: guestData.preferences.privacy,
            accessibility_preferences: guestData.preferences.accessibility,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
      }

    } catch (error) {
      console.error('Failed to migrate guest data:', error);
      throw error;
    }
  }

  /**
   * Generate UUID for database records
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const authService = new AuthService();
};
