export const MAX_TIMER_MINUTES = 180
export const TIMER_PRESETS = [0, 5, 10, 20, 25, 45]

export function clampTimerMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 0
  return Math.min(MAX_TIMER_MINUTES, Math.max(0, Math.round(minutes)))
}

/** "M:SS", or "H:MM:SS" from an hour up. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = String(s % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}
