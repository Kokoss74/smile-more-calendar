'use client';

import { useSessionStore } from "@/store/sessionStore";

export default function Home() {
  const { user, profile } = useSessionStore();

  return (
    <div>
      <p>
        Welcome back, {user?.email} (Role: {profile?.role})
      </p>
      {/* Calendar component will go here */}
    </div>
  );
}
