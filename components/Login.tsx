'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

// Gate for the console (front desk / staff / admin). The public customer
// gallery (/c/[id]) is NOT gated. Single login plays all roles in the demo.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch {
      setError('Wrong email or password.')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-1 text-center text-2xl font-bold text-brand">ReviewSnap</h1>
      <p className="mb-6 text-center text-sm text-gray-500">Sign in to the console</p>
      <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
