/**
 * Authentication Context for PocketTherapy
 * 
 * Manages authentication state, Google OAuth, guest mode, and session persistence.
 * Provides a centralized auth state management system for the entire app.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/api/supabaseClient';
import { authService } from '../services/api/authService';
import { storageService } from '../services/storage';
import type { User, AuthState, GuestUser } from '../types';

interface AuthContextType {
  // Auth State
  authState: AuthState;
  user: User | GuestUser | null;
  isLoading: boolean;
  isGuest: boolean;
  
  // Auth Actions
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  upgradeGuestAccount: () => Promise<void>;
  
  // Profile Actions
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | GuestUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session && (session as any).user) {
          await handleAuthenticatedUser((session as any).user);
        } else if (event === 'SIGNED_OUT') {
          await handleSignOut();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        await checkForGuestUser();
        return;
      }

      if (session && (session as any).user) {
        await handleAuthenticatedUser((session as any).user);
      } else {
        await checkForGuestUser();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState('unauthenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForGuestUser = async () => {
    try {
      const guestUser = await storageService.getGuestUser();
      if (guestUser) {
        setUser(guestUser);
        setAuthState('guest');
      } else {
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error('Error checking guest user:', error);
      setAuthState('unauthenticated');
    }
  };

  const handleAuthenticatedUser = async (authUser: any) => {
    try {
      // Get or create user profile
      const userProfile = await authService.getOrCreateUserProfile(authUser);
      setUser(userProfile);
      setAuthState('authenticated');
      
      // Migrate guest data if exists
      await migrateGuestDataIfNeeded();
    } catch (error) {
      console.error('Error handling authenticated user:', error);
      Alert.alert('Error', 'Failed to load user profile. Please try again.');
    }
  };

  const migrateGuestDataIfNeeded = async () => {
    try {
      const guestUser = await storageService.getGuestUser();
      if (guestUser) {
        // Migrate guest data to authenticated account
        await authService.migrateGuestData(guestUser);
        await storageService.clearGuestUser();
        console.log('Guest data migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating guest data:', error);
      // Don't show error to user as this is not critical
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle();
      // Auth state will be updated via the auth state change listener
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Sign In Failed',
        'Unable to sign in with Google. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
      const guestUser = await authService.createGuestUser();
      setUser(guestUser);
      setAuthState('guest');
    } catch (error) {
      console.error('Guest sign-in error:', error);
      Alert.alert(
        'Error',
        'Unable to create guest account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeGuestAccount = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Migration will happen automatically in handleAuthenticatedUser
    } catch (error) {
      console.error('Account upgrade error:', error);
      Alert.alert(
        'Upgrade Failed',
        'Unable to upgrade your account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      // Auth state will be updated via the auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Unable to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setUser(null);
    setAuthState('unauthenticated');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || authState !== 'authenticated') {
      throw new Error('Must be authenticated to update profile');
    }

    try {
      const updatedUser = await authService.updateUserProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user to delete');
    }

    try {
      setIsLoading(true);
      
      if (authState === 'authenticated') {
        await authService.deleteUserAccount(user.id);
      } else {
        await storageService.clearGuestUser();
      }
      
      setUser(null);
      setAuthState('unauthenticated');
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    authState,
    user,
    isLoading,
    isGuest: authState === 'guest',
    signInWithGoogle,
    signInAsGuest,
    signOut,
    upgradeGuestAccount,
    updateProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
