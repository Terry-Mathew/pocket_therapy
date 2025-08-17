/**
 * Supabase Client Configuration for PocketTherapy
 * 
 * This file configures the Supabase client for both development and production environments.
 * Supports Google OAuth authentication and local-first data storage.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { debugLog } from '../../utils'; // Commented out for now

// Environment configuration
const isDevelopment = __DEV__;

// Supabase configuration
const SUPABASE_CONFIG = {
  development: {
    url: process.env.EXPO_PUBLIC_SUPABASE_DEV_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_DEV_ANON_KEY || '',
  },
  production: {
    url: process.env.EXPO_PUBLIC_SUPABASE_PROD_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_PROD_ANON_KEY || '',
  },
};

// Get current environment config
const currentConfig = isDevelopment 
  ? SUPABASE_CONFIG.development 
  : SUPABASE_CONFIG.production;

// Validate configuration
if (!currentConfig.url || !currentConfig.anonKey) {
  const env = isDevelopment ? 'development' : 'production';
  throw new Error(
    `Missing Supabase configuration for ${env} environment. ` +
    `Please check your environment variables.`
  );
}

// Create Supabase client with custom configuration
export const supabase = createClient(
  currentConfig.url,
  currentConfig.anonKey,
  {
    auth: {
      // Use AsyncStorage for session persistence
      storage: AsyncStorage,
      // Auto-refresh tokens
      autoRefreshToken: true,
      // Persist session across app restarts
      persistSession: true,
      // Detect session in URL (for OAuth redirects)
      detectSessionInUrl: true,
      // OAuth configuration
      flowType: 'pkce', // Proof Key for Code Exchange (more secure)
    },
    // Global configuration
    global: {
      headers: {
        'X-Client-Info': `PocketTherapy-${isDevelopment ? 'dev' : 'prod'}`,
      },
    },
    // Real-time configuration
    realtime: {
      // Enable real-time features for mood sync
      params: {
        eventsPerSecond: 2, // Limit for mental health app (not high-frequency)
      },
    },
  }
);

// Environment info for debugging
// debugLog(`Supabase client initialized for ${isDevelopment ? 'development' : 'production'}`);
// debugLog(`Supabase URL: ${currentConfig.url}`);

// Export configuration for use in other services
export const supabaseConfig = {
  url: currentConfig.url,
  anonKey: currentConfig.anonKey,
  environment: isDevelopment ? 'development' : 'production',
};

// Export types for TypeScript
export type SupabaseClient = typeof supabase;

/**
 * Helper function to check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(currentConfig.url && currentConfig.anonKey);
};

/**
 * Helper function to get current environment
 */
export const getCurrentEnvironment = (): 'development' | 'production' => {
  return isDevelopment ? 'development' : 'production';
};

/**
 * Helper function to check connection status
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    if (error) {
      // debugLog('Supabase connection check failed:', error.message);
      return false;
    }
    // debugLog('Supabase connection successful');
    return true;
  } catch (error) {
    // debugLog('Supabase connection error:', error);
    return false;
  }
};

export default supabase;
