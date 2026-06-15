'use client'

// Staff → Queue. Privacy by design: staff see the owner name + subject
// details (so they know whose car/pet it is) but NOT contact info.
// Claiming opens the capture screen; "mark complete" drops it from here.

import { useRouter } from 'next/navigation'
import { getConfig, listJobs, setStatus } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { subjectSummary } from '@/lib/types'

export default function StaffQueue() {
  const router = useRouter()
  const config = useStore(getConfig)
  const jobs = useStore(listJobs).filter((j) => j.status === 'new' || j.status === 'capturing')

  if (!config) return null

  function claim(id: string) {
    setStatus(id, 'capturing', { assignedTo: 'staff' })
    router.push(`/console/capture/${id}`)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Queue</h2>
      {jobs.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
          Nothing waiting. New jobs from the front desk show up here.
        </p>
      )}
      {jobs.map((j) => (
        <button
          key={j.id}
          onClick={() => claim(j.id)}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{subjectSummary(j)}</p>
            <p className="text-xs text-gray-400">
              {j.photos.length > 0 ? `${j.photos.length} photo(s) so far` : 'Not started'}
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {j.status === 'capturing' ? 'Continue' : 'Start'}
          </span>
        </button>
      ))}
    </div>
  )
}
