'use client'

// Admin → Job detail. The marketing section (ported concept from the party
// app): pick which shots go to the CUSTOMER gallery and which go to the
// CONTENT PRODUCER (Eric) for social posts, then text the customer the link.

import { useParams } from 'next/navigation'
import { getConfig, getJob, updateJob, setStatus } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import type { Photo } from '@/lib/types'

function smsDigits(s: string) {
  return s.replace(/[^\d+]/g, '')
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const config = useStore(getConfig)
  const job = useStore(() => getJob(id))

  if (!config || !job) return <p className="text-sm text-gray-400">Job not found.</p>

  function toggle(photoId: string, field: 'selected' | 'producerSelected') {
    if (!job) return
    updateJob(job.id, {
      photos: job.photos.map((p) => (p.id === photoId ? { ...p, [field]: !p[field] } : p)),
    })
  }

  const galleryUrl =
    (typeof window !== 'undefined' ? window.location.origin : '') + `/c/${job.id}`
  const message = `${config.businessName}: your photos are ready! View them & leave a quick review: ${galleryUrl}`
  const smsHref = `sms:${smsDigits(job.contact.mobile)}?body=${encodeURIComponent(message)}`

  const customerCount = job.photos.filter((p) => p.selected).length
  const producerCount = job.photos.filter((p) => p.producerSelected).length

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{job.contact.name}</h2>

      <section className="rounded-2xl bg-white p-4 text-sm shadow-sm">
        <p className="text-gray-500">📱 {job.contact.mobile || '—'}</p>
        {job.contact.email && <p className="text-gray-500">✉️ {job.contact.email}</p>}
        {job.address && <p className="text-gray-500">📍 {job.address}</p>}
        {job.consents.length > 0 && (
          <p className="mt-2 text-xs text-accent">✅ Intake consent: {job.consents.map((c) => c.scope).join(', ')}</p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Photos</p>
          <p className="text-xs text-gray-400">{customerCount} to customer · {producerCount} to social</p>
        </div>
        {job.photos.length === 0 && <p className="text-xs text-gray-400">No photos captured yet.</p>}
        <div className="grid grid-cols-2 gap-3">
          {job.photos.map((p) => (
            <PhotoCard key={p.id} photo={p} onToggle={toggle} />
          ))}
        </div>
      </section>

      <a
        href={smsHref}
        onClick={() => setStatus(job.id, 'sent', { sentAt: new Date().toISOString() })}
        className="block rounded-lg bg-brand py-3 text-center font-semibold text-white"
      >
        Text customer the gallery link
      </a>
      <p className="text-center text-xs text-gray-400">
        Opens Messages prefilled to {job.contact.mobile || 'the customer'}.
      </p>
    </div>
  )
}

function PhotoCard({
  photo, onToggle,
}: { photo: Photo; onToggle: (id: string, f: 'selected' | 'producerSelected') => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.tag} className="aspect-square w-full object-cover" />
        <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
          {photo.tag}
        </span>
      </div>
      <div className="flex text-[11px] font-medium">
        <button
          onClick={() => onToggle(photo.id, 'selected')}
          className={`flex-1 py-1.5 ${photo.selected ? 'bg-brand text-white' : 'text-gray-500'}`}
        >
          Customer
        </button>
        <button
          onClick={() => onToggle(photo.id, 'producerSelected')}
          className={`flex-1 py-1.5 ${photo.producerSelected ? 'bg-accent text-white' : 'text-gray-500'}`}
        >
          Social
        </button>
      </div>
    </div>
  )
}
