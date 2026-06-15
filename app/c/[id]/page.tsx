'use client'

// Customer page — what the prospect sees on THEIR phone.
// Order is deliberate: After shot first (the glamour), then Before,
// then the Google review ask while they're delighted, then the social
// consent last so it never dampens the moment.
//
// PASS 1 note: reads from localStorage, so it only opens on the SAME
// device. True cross-device (the real pitch) lands when the store swaps
// to Firestore in pass 2.

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getConfig, getJob, updateJob } from '@/lib/store'
import { useStore } from '@/lib/useStore'

export default function CustomerGallery() {
  const { id } = useParams<{ id: string }>()
  const config = useStore(getConfig)
  const job = useStore(() => getJob(id))

  useEffect(() => {
    if (job && !job.galleryOpenedAt) {
      updateJob(job.id, { galleryOpenedAt: new Date().toISOString() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id])

  if (!config || !job) {
    return (
      <main className="mx-auto max-w-md p-6 text-center text-sm text-gray-400">
        This gallery isn't available on this device.
      </main>
    )
  }

  const selected = job.photos.filter((p) => p.selected)
  const after = selected.filter((p) => p.tag === 'after')
  const before = selected.filter((p) => p.tag === 'before')
  const videos = job.videos.filter((v) => v.selected)
  const socialGate = config.consentGates.find((g) => g.stage === 'send' && g.scope === 'social')

  return (
    <main className="mx-auto max-w-md p-5">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold text-ink">{config.businessName}</h1>
        <p className="text-sm text-gray-500">Thanks, {job.contact.name}! Here's your before & after 👇</p>
      </div>

      <Gallery title="After" photos={after} />
      <Gallery title="Before" photos={before} />

      {videos.length > 0 && (
        <section className="mb-5">
          <p className="mb-2 text-sm font-semibold text-gray-700">Video</p>
          {videos.map((v) => (
            <video key={v.id} src={v.url} controls className="mb-2 w-full rounded-xl" />
          ))}
        </section>
      )}

      <a
        href={config.googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => updateJob(job.id, { reviewClickedAt: new Date().toISOString() })}
        className="mb-3 block rounded-xl bg-accent py-3.5 text-center font-semibold text-white"
      >
        ⭐ Leave us a Google review
      </a>

      {socialGate && (
        <label className="flex items-start gap-2 rounded-xl bg-white p-4 text-sm text-gray-700 shadow-sm">
          <input
            type="checkbox"
            checked={!!job.socialConsentAt}
            onChange={(e) =>
              updateJob(job.id, { socialConsentAt: e.target.checked ? new Date().toISOString() : null })
            }
            className="mt-0.5"
          />
          {socialGate.label}
        </label>
      )}
    </main>
  )
}

function Gallery({ title, photos }: { title: string; photos: { id: string; url: string }[] }) {
  if (photos.length === 0) return null
  return (
    <section className="mb-5">
      <p className="mb-2 text-sm font-semibold text-gray-700">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt={title} className="aspect-square w-full rounded-xl object-cover" />
        ))}
      </div>
    </section>
  )
}
