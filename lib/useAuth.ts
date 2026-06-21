'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase/client'

// undefined = still resolving, null = signed out, User = signed in.
export function useAuth(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [])
  return user
}
