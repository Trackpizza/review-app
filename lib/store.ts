'use client'

// ============================================================
// Client-side store (PASS 1: localStorage).
//
// This is the swap seam. Today it persists to localStorage so the
// whole demo runs with zero backend. When the Firebase project exists,
// only THIS file changes to Firestore + Storage — the customer link
// needs server data to open on the prospect's phone, but every screen
// already talks to this module, not to storage directly.
// ============================================================

import type { BusinessConfig } from './config'
import type { Job, JobStatus, Role } from './types'

const CONFIG_KEY = 'reviewsnap_config'
const ROLE_KEY = 'reviewsnap_role'
const JOBS_KEY = 'reviewsnap_jobs'

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

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(value))
  emit()
}

// ---- Active business config (set at the demo-start screen) ----
export function getConfig(): BusinessConfig | null {
  return read<BusinessConfig | null>(CONFIG_KEY, null)
}
export function setConfig(cfg: BusinessConfig) {
  write(CONFIG_KEY, cfg)
}

// ---- Active role (single login plays all three) ----
export function getRole(): Role {
  return read<Role>(ROLE_KEY, 'frontdesk')
}
export function setRole(role: Role) {
  write(ROLE_KEY, role)
}

// ---- Jobs ----
export function listJobs(): Job[] {
  return read<Job[]>(JOBS_KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
export function getJob(id: string): Job | null {
  return listJobs().find((j) => j.id === id) ?? null
}
function saveJobs(jobs: Job[]) {
  write(JOBS_KEY, jobs)
}

export function createJob(input: {
  contact: Job['contact']
  subject: Record<string, string>
  address?: string
  consents: Job['consents']
}): Job {
  const now = new Date().toISOString()
  const job: Job = {
    id: 'j_' + Math.random().toString(36).slice(2, 10),
    status: 'new',
    contact: input.contact,
    subject: input.subject,
    address: input.address,
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
  saveJobs([job, ...listJobs()])
  return job
}

export function updateJob(id: string, patch: Partial<Job>) {
  const jobs = listJobs().map((j) =>
    j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j
  )
  saveJobs(jobs)
}

export function setStatus(id: string, status: JobStatus, extra?: Partial<Job>) {
  updateJob(id, { status, ...extra })
}

// ---- One-tap demo reset: wipe jobs, keep config + role ----
export function resetDemo() {
  saveJobs([])
}
