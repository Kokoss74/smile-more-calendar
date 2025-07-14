'use client';

import { useRef } from 'react';
import { useSessionStore, Profile } from '@/store/sessionStore';
import type { User } from '@supabase/supabase-js';

interface SessionProviderProps {
  user: User;
  profile: Profile;
  children: React.ReactNode;
}

function SessionProvider({ user, profile, children }: SessionProviderProps) {
  const isInitialized = useRef(false);

  // We use a ref to ensure that the store is only initialized once per client session.
  // This is a safeguard against re-renders causing multiple initializations.
  if (!isInitialized.current) {
    useSessionStore.getState().initializeSession(user, profile);
    isInitialized.current = true;
  }

  return <>{children}</>;
}

export default SessionProvider;
