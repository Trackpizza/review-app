// ============================================================
// Job model for ReviewSnap.
// A "job" is one customer visit captured through the role flow:
//   front desk creates -> staff captures -> admin sends -> customer reviews.
// ============================================================

import type { BusinessConfig, ConsentScope } from './config'

// Who's using the app right now. Single login in the demo; one person
// switches roles. The seam is here for real multi-user later.
export type Role = 'frontdesk' | 'staff' | 'admin'

export const ROLE_LABELS: Record<Role, string> = {
  frontdesk: 'Front desk',
  staff: 'Staff',
  admin: 'Admin',
}

// Job lifecycle:
//  new        front desk created it, waiting for staff
//  capturing  staff claimed it, uploading before/after + video
//  ready      staff marked complete, waiting for admin to send
//  sent       gallery + review request sent to customer
//  archived   cleared/closed
export type JobStatus = 'new' | 'capturing' | 'ready' | 'sent' | 'archived'

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: 'New',
  capturing: 'Capturing',
  ready: 'Ready to send',
  sent: 'Sent',
  archived: 'Archived',
}

export interface Contact {
  name: string
  mobile: string
  email: string
}

// A consent the customer/owner actually agreed to, frozen with its wording.
export interface CapturedConsent {
  gateId: string
  scope: ConsentScope
  label: string      // exact text agreed to
  agreedAt: string   // ISO
}

export type PhotoTag = 'before' | 'after'

export interface Photo {
  id: string
  url: string                // object URL / dataURL now; Storage path later
  tag: PhotoTag
  selected: boolean          // send to customer gallery
  producerSelected: boolean  // send to content producer (Eric) for social
  uploadedAt: string
}

export interface Video {
  id: string
  url: string
  selected: boolean
  producerSelected: boolean
  uploadedAt: string
}

export interface Job {
  id: string
  status: JobStatus
  // Snapshot of the business config at creation, so the customer page (a
  // different device) renders correctly regardless of the console's active
  // industry, and so reset/industry-switch between walk-ins can't corrupt it.
  config: BusinessConfig
  contact: Contact
  subject: Record<string, string>  // keyed by SubjectField.key
  address?: string
  consents: CapturedConsent[]      // intake-stage consents captured at front desk
  photos: Photo[]
  videos: Video[]
  assignedTo: Role | null
  createdAt: string
  updatedAt: string
  sentAt: string | null

  // customer-side activity (filled when they open the link)
  galleryOpenedAt: string | null
  reviewClickedAt: string | null
  socialConsentAt: string | null   // send-stage social consent, agreed on their phone
}

export function subjectSummary(job: Job): string {
  const vals = Object.values(job.subject).filter(Boolean)
  return vals.join(' · ') || '(no details)'
}
