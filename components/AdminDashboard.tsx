'use client'

// Admin → Dashboard. Full visibility into every job by status.
// Tapping a job opens its detail (gallery, photo selection, send).

import Link from 'next/link'
import { getConfig, listJobs } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { STATUS_LABELS, subjectSummary } from '@/lib/types'

export default function AdminDashboard() {
  const config = useStore(getConfig)
  const jobs = useStore(listJobs)

  if (!config) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">All jobs</h2>
      {jobs.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
          No jobs yet.
        </p>
      )}
      {jobs.map((j) => (
        <Link
          key={j.id}
          href={`/console/job/${j.id}`}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{j.contact.name || subjectSummary(j)}</p>
            <p className="truncate text-xs text-gray-400">{subjectSummary(j)}</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {STATUS_LABELS[j.status]}
          </span>
        </Link>
      ))}
    </div>
  )
}
