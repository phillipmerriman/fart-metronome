import { useEffect, useState } from 'react'

export function usePersistentState<T>(key: string, sanitize: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return sanitize(stored === null ? null : JSON.parse(stored))
    } catch {
      return sanitize(null)
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable (private mode, blocked); settings just won't persist.
    }
  }, [key, value])

  return [value, setValue] as const
}
