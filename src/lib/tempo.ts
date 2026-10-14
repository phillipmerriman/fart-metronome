export const MIN_BPM = 30
export const MAX_BPM = 300
export const TAP_RESET_MS = 2000
const TAP_WINDOW = 5

export type TickType = 'accent' | 'beat' | 'fart' | 'sub'
export type Subdivision = 1 | 2 | 3 | 4
export type BeatLevel = 'accent' | 'normal' | 'fart' | 'mute'

export const BEAT_LEVELS: BeatLevel[] = ['accent', 'normal', 'fart', 'mute']

export interface TimeSignature {
  id: string
  beats: number
  unit: 4 | 8
}

export const TIME_SIGNATURES: TimeSignature[] = [
  { id: '2/4', beats: 2, unit: 4 },
  { id: '3/4', beats: 3, unit: 4 },
  { id: '4/4', beats: 4, unit: 4 },
  { id: '5/4', beats: 5, unit: 4 },
  { id: '6/8', beats: 6, unit: 8 },
  { id: '7/8', beats: 7, unit: 8 },
]

export const SUBDIVISIONS: Subdivision[] = [1, 2, 3, 4]

export function findTimeSignature(id: string): TimeSignature {
  return TIME_SIGNATURES.find((ts) => ts.id === id) ?? TIME_SIGNATURES[2]
}

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return 120
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)))
}

/** BPM from tap timestamps (ms), averaging the most recent intervals. */
export function tapsToBpm(taps: number[]): number | null {
  const recent = taps.slice(-TAP_WINDOW)
  if (recent.length < 2) return null
  const avgInterval = (recent[recent.length - 1] - recent[0]) / (recent.length - 1)
  if (avgInterval <= 0) return null
  return clampBpm(60000 / avgInterval)
}

/** Seconds between consecutive ticks; BPM counts the time signature's pulse unit. */
export function tickInterval(bpm: number, subdivision: Subdivision): number {
  return 60 / bpm / subdivision
}

export function defaultPattern(beats: number): BeatLevel[] {
  return Array.from({ length: beats }, (_, i) => (i === 0 ? 'accent' : 'normal'))
}

const NEXT_LEVEL: Record<BeatLevel, BeatLevel> = { normal: 'accent', accent: 'fart', fart: 'mute', mute: 'normal' }

export function nextBeatLevel(level: BeatLevel): BeatLevel {
  return NEXT_LEVEL[level]
}

export function classifyTick(level: BeatLevel, sub: number): TickType {
  if (sub !== 0) return 'sub'
  if (level === 'accent' || level === 'fart') return level
  return 'beat'
}

/** Position after the given one, wrapping sub → beat → bar. Tolerates settings that shrank mid-bar. */
export function nextPosition(
  beat: number,
  sub: number,
  beatsPerBar: number,
  subdivision: Subdivision,
): { beat: number; sub: number } {
  let nextSub = sub + 1
  let nextBeat = beat
  if (nextSub >= subdivision) {
    nextSub = 0
    nextBeat += 1
  }
  if (nextBeat >= beatsPerBar) nextBeat = 0
  return { beat: nextBeat, sub: nextSub }
}

const TEMPO_NAMES: [number, string][] = [
  [40, 'GRAVE'],
  [60, 'LARGO'],
  [66, 'LARGHETTO'],
  [76, 'ADAGIO'],
  [108, 'ANDANTE'],
  [120, 'MODERATO'],
  [156, 'ALLEGRO'],
  [176, 'VIVACE'],
  [200, 'PRESTO'],
]

export function tempoName(bpm: number): string {
  for (const [limit, name] of TEMPO_NAMES) {
    if (bpm < limit) return name
  }
  return 'PRESTISSIMO'
}
