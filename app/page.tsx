'use client'

// Demo-start screen: pick the trade + type the prospect's business name.
// This sets the active config (subject fields, consent gates, wording) AND
// brands the app with their name so it instantly feels like *theirs*.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { INDUSTRY_LABELS, makeConfig, type IndustryKey } from '@/lib/config'
import { setConfig, setRole } from '@/lib/store'

const INDUSTRIES = Object.keys(INDUSTRY_LABELS) as IndustryKey[]

export default function DemoStart() {
  const router = useRouter()
  const [industry, setIndustry] = useState<IndustryKey>('auto')
  const [businessName, setBusinessName] = useState('')

  function start() {
    const name = businessName.trim() || 'Demo Business'
    setConfig(makeConfig(industry, name))
    setRole('frontdesk')
    router.push('/console')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand">ReviewSnap</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every job → photos, reviews, and content. In one tap.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value as IndustryKey)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {INDUSTRIES.map((k) => (
              <option key={k} value={k}>
                {INDUSTRY_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Business name</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Oscar's Auto Detail"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            Used to brand the demo so it feels like their own app.
          </p>
        </div>

        <button
          onClick={start}
          className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white"
        >
          Start demo
        </button>
      </div>
    </main>
  )
}
