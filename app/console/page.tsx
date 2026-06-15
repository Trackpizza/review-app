'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getConfig, getRole } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import FrontDesk from '@/components/FrontDesk'
import StaffQueue from '@/components/StaffQueue'
import AdminDashboard from '@/components/AdminDashboard'

export default function Console() {
  const router = useRouter()
  const config = useStore(getConfig)
  const role = useStore(getRole)

  // No config yet (fresh load / cleared storage) → back to demo-start.
  useEffect(() => {
    if (config === null) router.replace('/')
  }, [config, router])

  if (!config) return null

  if (role === 'staff') return <StaffQueue />
  if (role === 'admin') return <AdminDashboard />
  return <FrontDesk />
}
