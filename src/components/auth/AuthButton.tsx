'use client'

import { createClient } from '@/lib/supabase/client'
import { Button, Box, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { getURL } from '@/lib/utils'

export default function AuthButton() {
  const router = useRouter()
  const supabase = createClient()
  const { user, clearSession } = useSessionStore()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearSession() // Clear the session in the Zustand store
    router.refresh()
  }

  return user ? (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body1">Hi, {user.email}</Typography>
      <Button variant="outlined" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  ) : (
    <Button variant="contained" onClick={handleGoogleLogin}>
      Login with Google
    </Button>
  )
}
