import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

// Define the shape of the profile data we want to store
export interface Profile {
  role: 'admin' | 'clinic_staff' | 'guest';
  clinic_id: string | null;
}

// Define the state shape for our store
interface SessionState {
  user: User | null;
  profile: Profile | null;
  isInitialized: boolean;
  // Action to initialize the store with data from the server
  initializeSession: (user: User, profile: Profile) => void;
  // Action to clear the session on logout
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  user: null,
  profile: null,
  isInitialized: false,

  // Action to set the session data
  initializeSession: (user, profile) =>
    set({
      user,
      profile,
      isInitialized: true,
    }),

  // Action to clear the session data
  clearSession: () =>
    set({
      user: null,
      profile: null,
      isInitialized: true, // It's initialized, just with no user
    }),
}));
