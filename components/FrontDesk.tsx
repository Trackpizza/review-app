'use client'

// Front desk → New Job. Reads the active config for subject fields,
// address, and intake-stage consent gates. Captures contact (name +
// mobile/email) — this is a standalone form, not tied to any CRM.

import { useState } from 'react'
import { getConfig, createJob, setRole } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import type { CapturedConsent } from '@/lib/types'

export default function FrontDesk() {
  const config = useStore(getConfig)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<Record<string, string>>({})
  const [address, setAddress] = useState('')
  const [consent, setConsent] = useState<Record<string, boolean>>({})
  const [created, setCreated] = useState(false)

  if (!config) return null
  const intakeGates = config.consentGates.filter((g) => g.stage === 'intake')

  const requiredOk =
    name.trim() &&
    (mobile.trim() || email.trim()) &&
    config.subjectFields.every((f) => !f.required || (subject[f.key] || '').trim())

  function submit() {
    if (!config || !requiredOk) return
    const now = new Date().toISOString()
    const consents: CapturedConsent[] = intakeGates
      .filter((g) => consent[g.id])
      .map((g) => ({ gateId: g.id, scope: g.scope, label: g.label, agreedAt: now }))
    createJob({
      contact: { name: name.trim(), mobile: mobile.trim(), email: email.trim() },
      subject,
      address: config.addressOn ? address.trim() : undefined,
      consents,
    })
    setCreated(true)
  }

  if (created) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-4xl">✅</p>
        <h2 className="mt-2 text-lg font-semibold">Sent to staff</h2>
        <p className="mt-1 text-sm text-gray-500">
          It's in the staff queue now, ready for before/after capture.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => setRole('staff')}
            className="rounded-lg bg-brand py-2.5 font-semibold text-white"
          >
            Switch to Staff →
          </button>
          <button
            onClick={() => {
              setName(''); setMobile(''); setEmail(''); setSubject({}); setAddress(''); setConsent({}); setCreated(false)
            }}
            className="rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600"
          >
            New job
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">New {config.terms.job.toLowerCase()}</h2>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700">Customer</p>
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Mobile" value={mobile} onChange={setMobile} type="tel" />
        <Input label="Email (optional)" value={email} onChange={setEmail} type="email" />
        <p className="text-xs text-gray-400">Mobile or email required — that's how they get the gallery link.</p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700">{config.terms.subject} details</p>
        {config.subjectFields.map((f) => (
          <Input
            key={f.key}
            label={f.label + (f.required ? '' : ' (optional)')}
            value={subject[f.key] || ''}
            onChange={(v) => setSubject((s) => ({ ...s, [f.key]: v }))}
          />
        ))}
        {config.addressOn && <Input label="Address" value={address} onChange={setAddress} />}
      </section>

      {intakeGates.length > 0 && (
        <section className="space-y-2 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">Permission</p>
          {intakeGates.map((g) => (
            <label key={g.id} className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!consent[g.id]}
                onChange={(e) => setConsent((c) => ({ ...c, [g.id]: e.target.checked }))}
                className="mt-0.5"
              />
              {g.label}
            </label>
          ))}
        </section>
      )}

      <button
        onClick={submit}
        disabled={!requiredOk}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-40"
      >
        Send to staff
      </button>
    </div>
  )
}

function Input({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </label>
  )
}
