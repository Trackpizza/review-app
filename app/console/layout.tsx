'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import RoleSwitcher from '@/components/RoleSwitcher'
import Login from '@/components/Login'
import { getConfig, resetDemo, startJobsSync } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { useAuth } from '@/lib/useAuth'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const config = useStore(getConfig)
  const user = useAuth()

  // Start the jobs listener once signed in.
  useEffect(() => {
    if (user) startJobsSync()
  }, [user])

  function reset() {
    if (confirm('Reset the demo? This clears all jobs but keeps this business setup.')) {
      resetDemo()
      router.push('/console')
    }
  }

  if (user === undefined) {
    return <main className="p-8 text-center text-sm text-gray-400">Loading…</main>
  }
  if (user === null) return <Login />

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/console" className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">
              {config?.businessName || 'ReviewSnap'}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-brand">ReviewSnap demo</p>
          </Link>
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <button
              onClick={reset}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-500"
            >
              Reset
            </button>
            <button
              onClick={() => signOut(auth)}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
    </div>
  )
}
