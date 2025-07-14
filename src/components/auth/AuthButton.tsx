'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@mui/material'

export default function AuthButton() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button variant="contained" onClick={handleGoogleLogin}>
      Login with Google
    </Button>
  )
}
