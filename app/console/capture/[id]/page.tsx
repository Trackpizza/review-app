'use client'

// Staff capture: snap BEFORE + AFTER photos and a short video, then
// mark complete. The wow in the live demo is how fast these populate
// into the admin marketing section — so capture is deliberately 2 taps.
// Each shot can be kept or retaken (delete + shoot again).

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJob, updateJob, setStatus } from '@/lib/store'
import { uploadDataUrl, deleteFile } from '@/lib/storage'
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
  const [busy, setBusy] = useState(false)
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  if (!job) return <p className="text-sm text-gray-400">Job not found.</p>

  async function addPhoto(file: File | undefined, tag: PhotoTag) {
    if (!file || !job) return
    setBusy(true)
    try {
      const pid = 'p_' + Math.random().toString(36).slice(2, 8)
      const url = await uploadDataUrl(`jobs/${job.id}/${pid}`, await readFile(file))
      const photo: Photo = {
        id: pid,
        url,
        tag,
        selected: true,        // default into the customer gallery
        producerSelected: false,
        uploadedAt: new Date().toISOString(),
      }
      updateJob(job.id, { photos: [...job.photos, photo] })
    } finally {
      setBusy(false)
    }
  }

  async function addVideo(file: File | undefined) {
    if (!file || !job) return
    setBusy(true)
    try {
      const vid = 'v_' + Math.random().toString(36).slice(2, 8)
      const url = await uploadDataUrl(`jobs/${job.id}/${vid}`, await readFile(file))
      const video: Video = {
        id: vid,
        url,
        selected: true,
        producerSelected: false,
        uploadedAt: new Date().toISOString(),
      }
      updateJob(job.id, { videos: [...job.videos, video] })
    } finally {
      setBusy(false)
    }
  }

  // Retake = remove the shot from the job and delete it from Storage.
  function removePhoto(p: Photo) {
    if (!job) return
    updateJob(job.id, { photos: job.photos.filter((x) => x.id !== p.id) })
    deleteFile(`jobs/${job.id}/${p.id}`)
  }
  function removeVideo(v: Video) {
    if (!job) return
    updateJob(job.id, { videos: job.videos.filter((x) => x.id !== v.id) })
    deleteFile(`jobs/${job.id}/${v.id}`)
  }

  function complete() {
    setStatus(job!.id, 'ready')
    router.push('/console')
  }

  const before = job.photos.filter((p) => p.tag === 'before')
  const after = job.photos.filter((p) => p.tag === 'after')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Capture</h2>
        {busy && <span className="text-xs font-medium text-brand">Uploading…</span>}
      </div>

      <PhotoGroup title="Before" photos={before} onAdd={() => beforeRef.current?.click()} onRemove={removePhoto} />
      <PhotoGroup title="After" photos={after} onAdd={() => afterRef.current?.click()} onRemove={removePhoto} />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Video ({job.videos.length})</p>
          <button onClick={() => videoRef.current?.click()} className="text-sm font-semibold text-brand">
            + Add video
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {job.videos.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-1">
              <video src={v.url} className="h-20 w-20 rounded-lg object-cover" />
              <button onClick={() => removeVideo(v)} className="text-[11px] font-medium text-red-500">
                Retake
              </button>
            </div>
          ))}
          {job.videos.length === 0 && <p className="text-xs text-gray-400">No video yet.</p>}
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
  title, photos, onAdd, onRemove,
}: { title: string; photos: Photo[]; onAdd: () => void; onRemove: (p: Photo) => void }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{title} ({photos.length})</p>
        <button onClick={onAdd} className="text-sm font-semibold text-brand">+ Add {title.toLowerCase()}</button>
      </div>
      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={title} className="h-20 w-20 rounded-lg object-cover" />
            <button onClick={() => onRemove(p)} className="text-[11px] font-medium text-red-500">
              Retake
            </button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-xs text-gray-400">No {title.toLowerCase()} photos yet.</p>}
      </div>
    </section>
  )
}
