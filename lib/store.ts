'use client'

// ============================================================
// Store (PASS 2): jobs in Firestore, config + role device-local.
//
// - Jobs live in Firestore so the customer gallery link opens on the
//   prospect's phone (a different device). A collection listener keeps a
//   synchronous in-memory cache, so console screens keep their simple
//   getJob()/listJobs() reads and re-render via the same emit() bus.
// - Active config + current role are device-local (Eric's phone) — fast,
//   offline-friendly, and not shared across devices.
// - Each job snapshots its config at creation (see types.ts).
// ============================================================

import {
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase/client'
import type { BusinessConfig } from './config'
import type { Job, JobStatus, Role } from './types'

const CONFIG_KEY = 'reviewsnap_config'
const ROLE_KEY = 'reviewsnap_role'

const isBrowser = typeof window !== 'undefined'

type Listener = () => void
const listeners = new Set<Listener>()
export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function emit() {
  listeners.forEach((fn) => fn())
}

// ---- Device-local state: active config + role ----
function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLocal(key: string, value: unknown) {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(value))
  emit()
}

export function getConfig(): BusinessConfig | null {
  return read<BusinessConfig | null>(CONFIG_KEY, null)
}
export function setConfig(cfg: BusinessConfig) {
  writeLocal(CONFIG_KEY, cfg)
}
export function getRole(): Role {
  return read<Role>(ROLE_KEY, 'frontdesk')
}
export function setRole(role: Role) {
  writeLocal(ROLE_KEY, role)
}

// ---- Jobs (Firestore, cached) ----
let cache: Job[] = []
let started = false

// Start the collection listener once the console is authenticated.
export function startJobsSync() {
  if (started || !isBrowser) return
  started = true
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
  onSnapshot(
    q,
    (snap) => {
      cache = snap.docs.map((d) => d.data() as Job)
      emit()
    },
    (err) => console.error('jobs sync error:', err),
  )
}

export function listJobs(): Job[] {
  return cache
}
export function getJob(id: string): Job | null {
  return cache.find((j) => j.id === id) ?? null
}

// Live subscription to a single job — used by the public customer page,
// which doesn't (and shouldn't) load the whole collection.
export function subscribeJob(id: string, cb: (job: Job | null) => void): () => void {
  return onSnapshot(
    doc(db, 'jobs', id),
    (d) => cb(d.exists() ? (d.data() as Job) : null),
    () => cb(null),
  )
}

export function createJob(input: {
  contact: Job['contact']
  subject: Record<string, string>
  address?: string
  consents: Job['consents']
}): Job {
  const config = getConfig()
  if (!config) throw new Error('No active business config')
  const ref = doc(collection(db, 'jobs'))
  const now = new Date().toISOString()
  const job: Job = {
    id: ref.id,
    status: 'new',
    config,
    contact: input.contact,
    // omit address entirely when unused — Firestore rejects undefined fields
    ...(input.address !== undefined ? { address: input.address } : {}),
    subject: input.subject,
    consents: input.consents,
    photos: [],
    videos: [],
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    galleryOpenedAt: null,
    reviewClickedAt: null,
    socialConsentAt: null,
  }
  cache = [job, ...cache]
  emit()
  setDoc(ref, job).catch((e) => console.error('createJob error:', e))
  return job
}

export function updateJob(id: string, patch: Partial<Job>) {
  const updatedAt = new Date().toISOString()
  cache = cache.map((j) => (j.id === id ? { ...j, ...patch, updatedAt } : j))
  emit()
  updateDoc(doc(db, 'jobs', id), { ...patch, updatedAt }).catch((e) =>
    console.error('updateJob error:', e),
  )
}

export function setStatus(id: string, status: JobStatus, extra?: Partial<Job>) {
  updateJob(id, { status, ...extra })
}

// One-tap demo reset: delete all jobs, keep config + role.
export function resetDemo() {
  const ids = cache.map((j) => j.id)
  cache = []
  emit()
  ids.forEach((id) => deleteDoc(doc(db, 'jobs', id)).catch(() => {}))
}
