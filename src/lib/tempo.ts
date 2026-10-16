export const MIN_BPM = 30
export const MAX_BPM = 300
export const TAP_RESET_MS = 2000
const TAP_WINDOW = 5

export type TickType = 'accent' | 'beat' | 'sub'
export type Subdivision = 1 | 2 | 3 | 4
export type BeatLevel = 'accent' | 'normal' | 'mute'

export const BEAT_LEVELS: BeatLevel[] = ['accent', 'normal', 'mute']

export type NoteValue = 1 | 2 | 4 | 8 | 16 | 32

export const NOTE_VALUES: NoteValue[] = [1, 2, 4, 8, 16, 32]
export const MIN_BEATS = 1
export const MAX_BEATS = 16

export interface TimeSignature {
  id: string
  beats: number
  unit: NoteValue
}

export const DEFAULT_TIME_SIGNATURE: TimeSignature = { id: '4/4', beats: 4, unit: 4 }

export const SUBDIVISIONS: Subdivision[] = [1, 2, 3, 4]

export function clampBeats(beats: number): number {
  if (!Number.isFinite(beats)) return DEFAULT_TIME_SIGNATURE.beats
  return Math.min(MAX_BEATS, Math.max(MIN_BEATS, Math.round(beats)))
}

export function makeTimeSignature(beats: number, unit: NoteValue): TimeSignature {
  const b = clampBeats(beats)
  return { id: `${b}/${unit}`, beats: b, unit }
}

/** Parses an id like "7/8"; null unless both parts are in range. */
export function parseTimeSignature(id: string): TimeSignature | null {
  const m = /^(\d+)\/(\d+)$/.exec(id)
  if (!m) return null
  const beats = Number(m[1])
  const unit = Number(m[2]) as NoteValue
  if (beats < MIN_BEATS || beats > MAX_BEATS || !NOTE_VALUES.includes(unit)) return null
  return { id, beats, unit }
}

export function findTimeSignature(id: string): TimeSignature {
  return parseTimeSignature(id) ?? DEFAULT_TIME_SIGNATURE
}

const NOTE_NAMES: Record<number, string> = {
  1: 'Whole',
  2: 'Half',
  4: 'Quarter',
  8: '8th',
  16: '16th',
  32: '32nd',
  64: '64th',
  128: '128th',
}

/** Name of the note that is 1/value of a whole note, e.g. 8 → "8th". */
export function noteName(value: number): string {
  return NOTE_NAMES[value] ?? `1/${value}`
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

const NEXT_LEVEL: Record<BeatLevel, BeatLevel> = { normal: 'accent', accent: 'mute', mute: 'normal' }

export function nextBeatLevel(level: BeatLevel): BeatLevel {
  return NEXT_LEVEL[level]
}

export function classifyTick(level: BeatLevel, sub: number): TickType {
  if (sub !== 0) return 'sub'
  return level === 'accent' ? 'accent' : 'beat'
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
