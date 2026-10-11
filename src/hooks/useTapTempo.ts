import { useCallback, useEffect, useRef } from 'react'
import { TAP_RESET_MS, tapsToBpm } from '../lib/tempo'

export function useTapTempo(onTempo: (bpm: number) => void) {
  const taps = useRef<number[]>([])
  const callback = useRef(onTempo)
  useEffect(() => {
    callback.current = onTempo
  }, [onTempo])

  return useCallback(() => {
    const now = performance.now()
    const last = taps.current[taps.current.length - 1]
    if (last !== undefined && now - last > TAP_RESET_MS) taps.current = []
    taps.current = [...taps.current, now].slice(-8)
    const bpm = tapsToBpm(taps.current)
    if (bpm !== null) callback.current(bpm)
  }, [])
}
