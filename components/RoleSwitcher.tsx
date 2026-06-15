'use client'

import { ROLE_LABELS, type Role } from '@/lib/types'
import { getRole, setRole } from '@/lib/store'
import { useStore } from '@/lib/useStore'

const ROLES: Role[] = ['frontdesk', 'staff', 'admin']

// The one device, three hats. Eric taps through these live while pitching.
export default function RoleSwitcher() {
  const role = useStore(getRole)
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
      {ROLES.map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={`rounded-md px-2.5 py-1.5 transition ${
            role === r ? 'bg-white text-brand shadow-sm' : 'text-gray-500'
          }`}
        >
          {ROLE_LABELS[r]}
        </button>
      ))}
    </div>
  )
}
