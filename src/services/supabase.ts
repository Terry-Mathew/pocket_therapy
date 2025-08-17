/**
 * Supabase Client for PocketTherapy
 * 
 * Placeholder implementation for authentication context.
 * This will be replaced with the actual Supabase implementation.
 */

// Placeholder Supabase client
export const supabase = {
  auth: {
    onAuthStateChange: (_callback: (event: any, session: any) => void) => {
      // Placeholder implementation
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    getSession: async () => {
      // Placeholder implementation
      return {
        data: {
          session: null as any
        },
        error: null,
      };
    },
  },
};
