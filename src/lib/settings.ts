import {
  BEAT_LEVELS,
  clampBpm,
  defaultPattern,
  SUBDIVISIONS,
  TIME_SIGNATURES,
  type BeatLevel,
  type Subdivision,
  type TimeSignature,
} from './tempo'

export interface Settings {
  bpm: number
  timeSig: string
  subdivision: Subdivision
  volume: number
  /** Id of the selected sound; unknown ids fall back to the synth click. */
  sound: string
  /** Id of the recording played on "fart" beats; unknown ids fall back to the first sample. */
  fartSound: string
  /** Per-beat levels, keyed by time signature id; missing entries use the default pattern. */
  patterns: Record<string, BeatLevel[]>
}

export const DEFAULT_SETTINGS: Settings = {
  bpm: 120,
  timeSig: '4/4',
  subdivision: 1,
  volume: 0.8,
  sound: 'click',
  fartSound: '',
  patterns: {},
}

export const SETTINGS_KEY = 'fart-metronome:settings'

export function patternFor(patterns: Settings['patterns'], ts: TimeSignature): BeatLevel[] {
  return patterns[ts.id] ?? defaultPattern(ts.beats)
}

function sanitizePatterns(raw: unknown): Settings['patterns'] {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Settings['patterns'] = {}
  for (const ts of TIME_SIGNATURES) {
    const p = (raw as Record<string, unknown>)[ts.id]
    if (Array.isArray(p) && p.length === ts.beats && p.every((l) => BEAT_LEVELS.includes(l as BeatLevel))) {
      out[ts.id] = p as BeatLevel[]
    }
  }
  return out
}

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
    sound: typeof r.sound === 'string' ? r.sound : DEFAULT_SETTINGS.sound,
    fartSound: typeof r.fartSound === 'string' ? r.fartSound : DEFAULT_SETTINGS.fartSound,
    patterns: sanitizePatterns(r.patterns),
  }
}
