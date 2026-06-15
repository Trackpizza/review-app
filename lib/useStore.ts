'use client'

import { useEffect, useState } from 'react'
import { subscribe } from './store'

// Re-render a component whenever the store changes. `selector` reads the
// value you care about; the component updates on every store emit.
export function useStore<T>(selector: () => T): T {
  const [value, setValue] = useState<T>(selector)
  useEffect(() => {
    setValue(selector())
    const unsub = subscribe(() => setValue(selector()))
    return () => {
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return value
}
