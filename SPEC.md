# ReviewSnap — Phase 1 Spec

A **standalone** (not CRM-connected) capture-and-review app for local-service
businesses. Front desk logs a job, staff capture before/after + video, owner
sends a gallery + review request. **One codebase**, configured per business by a
single `BusinessConfig` object. Built as a **live sales tool**: Eric walks into a
business, plays Front desk + Staff + Admin on his phone; the prospect plays the
customer and receives the real SMS on their own phone.

## Roles (all three, day one)
- **Owner/Admin** — config, all jobs, send gallery + review, content selection.
- **Front desk** — creates jobs (contact + subject fields + intake consent).
- **Staff/Tech** — queue (owner/subject only, no contact), capture before/after + video, mark complete.

Demo = single login + role switcher (one person, three hats).

## Job lifecycle
`new` → `capturing` → `ready` → `sent` → `archived`

## The config object (`lib/config.ts`)
Per-business `BusinessConfig` drives all variation:
- `subjectFields[]` — how staff identify a job (auto: vehicle; groomer: owner+pet; painter: owner+address).
- `addressOn` — show an address field.
- `intakeDelivery` — `qr_sms` | `email` | `both`.
- `consentGates[]` — the main per-business variable. Each: `stage` (intake|send), `scope` (capture|social), `label`, `required`. Auto = optional social at send; groomer = capture at intake + social at send; painter = social at send.
- `terms` — UI wording (job/subject labels).
- `googleReviewUrl` — review button target (Eric's keepitlocal listing for the demo).

## Customer page order
After photo → Before → Google review → social consent (consent last).

## Key product rules
- **No review gating** (routing unhappy customers away from Google) — it's illegal (Google policy + FTC). Everyone gets the same review ask.
- Live capture is the wow (speed of populate). Reuse party app's marketing
  selection: `selected` = send to customer gallery, `producerSelected` = send
  to content producer (Eric) for social.
- One-tap demo reset: wipes jobs, keeps config + role.

## Build passes
- **Pass 1 (done):** foundation, config core, role flow (front desk → staff capture → admin send → customer page), localStorage store. Runs with no backend.
- **Pass 2:** swap `lib/store.ts` to Firestore + Storage (needed for cross-device customer link), auth gate, SMS deep link verified on device.
- **Pass 3:** QR self-intake, email delivery, content-producer send, polish.

## Stack / infra
Next.js 14 + Firebase (Auth/Firestore/Storage) + Tailwind. New Firebase project,
repo `Trackpizza/review-app`, App Hosting, domain `reviewsnapdemo.keepitlocal.la`
(after testing on the default App Hosting domain first). LA region picks.
