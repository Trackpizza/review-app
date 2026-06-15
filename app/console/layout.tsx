'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RoleSwitcher from '@/components/RoleSwitcher'
import { getConfig, resetDemo } from '@/lib/store'
import { useStore } from '@/lib/useStore'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const config = useStore(getConfig)

  function reset() {
    if (confirm('Reset the demo? This clears all jobs but keeps this business setup.')) {
      resetDemo()
      router.push('/console')
    }
  }

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
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
    </div>
  )
}
