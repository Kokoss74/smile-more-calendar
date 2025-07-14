'use client'

import { createClient } from '@/lib/supabase/client'
import { Button, Box, Typography } from '@mui/material'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthButton({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
