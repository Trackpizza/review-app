// ============================================================
// BusinessConfig — the heart of ReviewSnap.
// One codebase serves every trade; everything that differs
// between an auto shop and a dog groomer lives in this object.
// ============================================================

export type IndustryKey = 'auto' | 'groomer' | 'painter'

// How STAFF identify a job in their queue (NOT contact info).
export interface SubjectField {
  key: string
  label: string
  required: boolean
}

// Consent gates — the main per-business variable.
//  stage: where it's shown ('intake' = front desk, 'send' = on the customer page)
//  scope: what it authorizes ('capture' = OK to shoot before/after, 'social' = OK to post publicly)
export type ConsentStage = 'intake' | 'send'
export type ConsentScope = 'capture' | 'social'

export interface ConsentGate {
  id: string
  stage: ConsentStage
  scope: ConsentScope
  label: string
  required: boolean
}

// How the intake link reaches the customer.
export type IntakeDelivery = 'qr_sms' | 'email' | 'both'

export interface BusinessConfig {
  industry: IndustryKey
  businessName: string
  subjectFields: SubjectField[]
  addressOn: boolean
  intakeDelivery: IntakeDelivery
  consentGates: ConsentGate[]
  // UI wording so the app reads native to the trade
  terms: { job: string; subject: string }
  // Where the "Leave a Google review" button points (Eric's keepitlocal listing for the demo)
  googleReviewUrl: string
}

// Eric's own keepitlocal Google review link — placeholder until he pastes the real one.
export const DEFAULT_GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=PLACEHOLDER'

// Per-industry defaults. businessName is filled in live at the demo-start screen.
export const INDUSTRY_PRESETS: Record<IndustryKey, Omit<BusinessConfig, 'businessName'>> = {
  auto: {
    industry: 'auto',
    subjectFields: [
      { key: 'vehicle', label: 'Vehicle (year / make / model)', required: true },
      { key: 'color', label: 'Color', required: false },
    ],
    addressOn: false,
    intakeDelivery: 'qr_sms',
    // Auto body needs little/no consent — one optional social ask at send.
    consentGates: [
      {
        id: 'social-send',
        stage: 'send',
        scope: 'social',
        label: 'You can feature my vehicle on your social media.',
        required: false,
      },
    ],
    terms: { job: 'Job', subject: 'Vehicle' },
    googleReviewUrl: DEFAULT_GOOGLE_REVIEW_URL,
  },

  groomer: {
    industry: 'groomer',
    subjectFields: [
      { key: 'ownerName', label: "Owner's name", required: true },
      { key: 'petName', label: "Pet's name", required: true },
    ],
    addressOn: false,
    intakeDelivery: 'qr_sms',
    // Two-step: permission to shoot before/after at intake, social use at send.
    consentGates: [
      {
        id: 'capture-intake',
        stage: 'intake',
        scope: 'capture',
        label: 'I give permission to photograph my pet before and after the groom.',
        required: false,
      },
      {
        id: 'social-send',
        stage: 'send',
        scope: 'social',
        label: 'You can share photos of my pet on your social media.',
        required: false,
      },
    ],
    terms: { job: 'Groom', subject: 'Pet' },
    googleReviewUrl: DEFAULT_GOOGLE_REVIEW_URL,
  },

  painter: {
    industry: 'painter',
    subjectFields: [
      { key: 'ownerName', label: "Customer's name", required: true },
    ],
    addressOn: true,
    intakeDelivery: 'both',
    consentGates: [
      {
        id: 'social-send',
        stage: 'send',
        scope: 'social',
        label: 'You can feature photos of my project on your social media.',
        required: false,
      },
    ],
    terms: { job: 'Project', subject: 'Customer' },
    googleReviewUrl: DEFAULT_GOOGLE_REVIEW_URL,
  },
}

export const INDUSTRY_LABELS: Record<IndustryKey, string> = {
  auto: 'Auto detail / body shop',
  groomer: 'Dog groomer',
  painter: 'House painter',
}

// Build a fresh config for an industry with the prospect's business name baked in.
export function makeConfig(industry: IndustryKey, businessName: string): BusinessConfig {
  return { ...INDUSTRY_PRESETS[industry], businessName: businessName.trim() }
}
