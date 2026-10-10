import { clampBpm, SUBDIVISIONS, TIME_SIGNATURES, type Subdivision } from './tempo'

export interface Settings {
  bpm: number
  timeSig: string
  subdivision: Subdivision
  volume: number
}

export const DEFAULT_SETTINGS: Settings = {
  bpm: 120,
  timeSig: '4/4',
  subdivision: 1,
  volume: 0.8,
}

export const SETTINGS_KEY = 'fart-metronome:settings'

export function sanitizeSettings(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    bpm: typeof r.bpm === 'number' ? clampBpm(r.bpm) : DEFAULT_SETTINGS.bpm,
    timeSig:
      typeof r.timeSig === 'string' && TIME_SIGNATURES.some((ts) => ts.id === r.timeSig)
        ? r.timeSig
        : DEFAULT_SETTINGS.timeSig,
    subdivision: SUBDIVISIONS.includes(r.subdivision as Subdivision)
      ? (r.subdivision as Subdivision)
      : DEFAULT_SETTINGS.subdivision,
    volume:
      typeof r.volume === 'number' && Number.isFinite(r.volume)
        ? Math.min(1, Math.max(0, r.volume))
        : DEFAULT_SETTINGS.volume,
  }
}
