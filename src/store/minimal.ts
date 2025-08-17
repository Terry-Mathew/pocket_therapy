/**
 * Minimal Store for Testing
 *
 * Testing Zustand persistence middleware
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MinimalState {
  count: number;
  actions: {
    increment: () => void;
    loadInitialData: () => Promise<void>;
  };
}

export const useMinimalStore = create<MinimalState>()(
  persist(
    (set, get) => ({
      count: 0,

      actions: {
        increment: () => {
          set((state) => ({ count: state.count + 1 }));
        },

        loadInitialData: async () => {
          console.log('Loading initial data...');
          // Simple async operation
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('Initial data loaded');
        },
      },
    }),
    {
      name: 'minimal-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
