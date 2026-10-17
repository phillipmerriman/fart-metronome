import {
  clampBpm,
  defaultPattern,
  fartLevel,
  isBeatLevel,
  parseTimeSignature,
  SUBDIVISIONS,
  type BeatLevel,
  type Subdivision,
  type TimeSignature,
} from './tempo'
import { clampTimerMinutes } from './timer'

export interface Settings {
  bpm: number
  timeSig: string
  subdivision: Subdivision
  volume: number
  /** Length of a timed run in minutes; 0 means the timer is off. */
  timerMinutes: number
  /** Per-beat sounds, keyed by time signature id; missing entries use the default pattern. */
  patterns: Record<string, BeatLevel[]>
}

export const DEFAULT_SETTINGS: Settings = {
  bpm: 120,
  timeSig: '4/4',
  subdivision: 1,
  volume: 0.8,
  timerMinutes: 0,
  patterns: {},
}

export const SETTINGS_KEY = 'fart-metronome:settings'

export function patternFor(patterns: Settings['patterns'], ts: TimeSignature): BeatLevel[] {
  return patterns[ts.id] ?? defaultPattern(ts.beats)
}

/** `legacyFartSound` upgrades saved patterns from when every "fart" beat shared one recording. */
function sanitizePatterns(raw: unknown, legacyFartSound: string): Settings['patterns'] {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Settings['patterns'] = {}
  for (const [id, p] of Object.entries(raw)) {
    const ts = parseTimeSignature(id)
    if (!ts || !Array.isArray(p) || p.length !== ts.beats) continue
    const levels = p.map((l) => (l === 'fart' ? fartLevel(legacyFartSound) : l))
    if (levels.every(isBeatLevel)) out[id] = levels
  }
  return out
}

export function sanitizeSettings(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    bpm: typeof r.bpm === 'number' ? clampBpm(r.bpm) : DEFAULT_SETTINGS.bpm,
    timeSig:
      typeof r.timeSig === 'string' && parseTimeSignature(r.timeSig)
        ? r.timeSig
        : DEFAULT_SETTINGS.timeSig,
    subdivision: SUBDIVISIONS.includes(r.subdivision as Subdivision)
      ? (r.subdivision as Subdivision)
      : DEFAULT_SETTINGS.subdivision,
    volume:
      typeof r.volume === 'number' && Number.isFinite(r.volume)
        ? Math.min(1, Math.max(0, r.volume))
        : DEFAULT_SETTINGS.volume,
    timerMinutes: typeof r.timerMinutes === 'number' ? clampTimerMinutes(r.timerMinutes) : 0,
    patterns: sanitizePatterns(r.patterns, typeof r.fartSound === 'string' ? r.fartSound : ''),
  }
}
