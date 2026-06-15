'use client'

// Staff capture: snap BEFORE + AFTER photos and a short video, then
// mark complete. The wow in the live demo is how fast these populate
// into the admin marketing section — so capture is deliberately 2 taps.

import { useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJob, updateJob, setStatus } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import type { PhotoTag, Photo, Video } from '@/lib/types'

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function Capture() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const job = useStore(() => getJob(id))
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  if (!job) return <p className="text-sm text-gray-400">Job not found.</p>

  async function addPhoto(file: File | undefined, tag: PhotoTag) {
    if (!file || !job) return
    const url = await readFile(file)
    const photo: Photo = {
      id: 'p_' + Math.random().toString(36).slice(2, 8),
      url,
      tag,
      selected: true,        // default into the customer gallery
      producerSelected: false,
      uploadedAt: new Date().toISOString(),
    }
    updateJob(job.id, { photos: [...job.photos, photo] })
  }

  async function addVideo(file: File | undefined) {
    if (!file || !job) return
    const url = await readFile(file)
    const video: Video = {
      id: 'v_' + Math.random().toString(36).slice(2, 8),
      url,
      selected: true,
      producerSelected: false,
      uploadedAt: new Date().toISOString(),
    }
    updateJob(job.id, { videos: [...job.videos, video] })
  }

  function complete() {
    setStatus(job!.id, 'ready')
    router.push('/console')
  }

  const before = job.photos.filter((p) => p.tag === 'before')
  const after = job.photos.filter((p) => p.tag === 'after')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Capture</h2>

      <PhotoGroup title="Before" photos={before} onAdd={() => beforeRef.current?.click()} />
      <PhotoGroup title="After" photos={after} onAdd={() => afterRef.current?.click()} />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Video ({job.videos.length})</p>
          <button onClick={() => videoRef.current?.click()} className="text-sm font-semibold text-brand">
            + Add video
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {job.videos.map((v) => (
            <video key={v.id} src={v.url} className="h-20 w-20 rounded-lg object-cover" />
          ))}
        </div>
      </section>

      <button onClick={complete} className="w-full rounded-lg bg-accent py-3 font-semibold text-white">
        Mark complete
      </button>

      {/* hidden capture inputs */}
      <input ref={beforeRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => addPhoto(e.target.files?.[0], 'before')} />
      <input ref={afterRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => addPhoto(e.target.files?.[0], 'after')} />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" hidden
        onChange={(e) => addVideo(e.target.files?.[0])} />
    </div>
  )
}

function PhotoGroup({
  title, photos, onAdd,
}: { title: string; photos: Photo[]; onAdd: () => void }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{title} ({photos.length})</p>
        <button onClick={onAdd} className="text-sm font-semibold text-brand">+ Add {title.toLowerCase()}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt={title} className="h-20 w-20 rounded-lg object-cover" />
        ))}
        {photos.length === 0 && <p className="text-xs text-gray-400">No {title.toLowerCase()} photos yet.</p>}
      </div>
    </section>
  )
}
