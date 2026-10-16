import {
  classifyTick,
  defaultPattern,
  nextPosition,
  tickInterval,
  type BeatLevel,
  type Subdivision,
  type TickType,
} from '../lib/tempo'
import { BufferClickVoice, playChime, type SoundVoice } from './voices'

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_S = 0.1
const START_DELAY_S = 0.05

export interface Tick {
  beat: number
  sub: number
  type: TickType
  /** The beat is muted: shown but not sounded. */
  muted: boolean
  time: number
  /** Monotonic count of ticks since start. */
  index: number
}

export interface EngineSettings {
  bpm: number
  /** One level per beat; its length is the number of beats per bar. */
  pattern: BeatLevel[]
  subdivision: Subdivision
}

/**
 * Lookahead scheduler ("A Tale of Two Clocks"): a coarse JS timer queues ticks
 * on the sample-accurate AudioContext clock slightly ahead of time.
 */
export class MetronomeEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voice: SoundVoice
  private settings: EngineSettings = { bpm: 120, pattern: defaultPattern(4), subdivision: 1 }
  private volume = 0.8
  private timer: number | null = null
  private nextTime = 0
  private beat = 0
  private sub = 0
  private index = 0
  private pending: Tick[] = []
  /** AudioContext time at which a timed run ends, or null for an untimed run. */
  private stopAt: number | null = null
  private chimeScheduled = false
  private onEnded: (() => void) | null = null

  constructor(voice: SoundVoice = new BufferClickVoice()) {
    this.voice = voice
  }

  get running() {
    return this.timer !== null
  }

  setVoice(voice: SoundVoice) {
    this.voice = voice
  }

  /** Called when a timed run reaches its end and stops itself. */
  setOnEnded(callback: (() => void) | null) {
    this.onEnded = callback
  }

  update(settings: Partial<EngineSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  setVolume(volume: number) {
    this.volume = volume
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.015)
    }
  }

  /** Starts ticking; with a duration, stops by itself (with a chime) after that many seconds. */
  async start(durationSeconds: number | null = null) {
    if (this.running) return
    const ctx = this.ensureContext()
    if (ctx.state !== 'running') await ctx.resume()
    this.beat = 0
    this.sub = 0
    this.index = 0
    this.pending = []
    this.nextTime = ctx.currentTime + START_DELAY_S
    this.stopAt = durationSeconds ? this.nextTime + durationSeconds : null
    this.chimeScheduled = false
    this.schedule()
  }

  stop() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    this.pending = []
    this.stopAt = null
  }

  /** Seconds left in a timed run, or null when untimed or stopped. */
  timeRemaining(): number | null {
    if (!this.ctx || this.stopAt === null || !this.running) return null
    return Math.max(0, this.stopAt - this.ctx.currentTime)
  }

  /** Removes ticks whose time has arrived and returns the latest, for visuals. */
  takeDueTick(): Tick | null {
    if (!this.ctx) return null
    const now = this.ctx.currentTime
    let latest: Tick | null = null
    while (this.pending.length && this.pending[0].time <= now) {
      latest = this.pending.shift()!
    }
    return latest
  }

  dispose() {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: 'interactive' })
      this.master = this.ctx.createGain()
      this.master.gain.value = this.volume
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  private schedule = () => {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const { bpm, pattern, subdivision } = this.settings
    const beatsPerBar = pattern.length
    const stopAt = this.stopAt

    if (stopAt !== null && ctx.currentTime >= stopAt) {
      this.stop()
      this.onEnded?.()
      return
    }

    // A throttled timer can leave us far behind; skip ahead rather than burst-play stale ticks.
    if (this.nextTime < ctx.currentTime - SCHEDULE_AHEAD_S) {
      this.nextTime = ctx.currentTime + START_DELAY_S
    }

    while (this.nextTime < ctx.currentTime + SCHEDULE_AHEAD_S && (stopAt === null || this.nextTime < stopAt)) {
      // Settings may have shrunk since the position was computed.
      if (this.sub >= subdivision) {
        this.sub = 0
        this.beat += 1
      }
      if (this.beat >= beatsPerBar) this.beat = 0
      const level = pattern[this.beat]
      const type = classifyTick(level, this.sub)
      const muted = level === 'mute'
      if (!muted) this.voice.play(type, this.nextTime, ctx, master)
      this.pending.push({ beat: this.beat, sub: this.sub, type, muted, time: this.nextTime, index: this.index++ })
      ;({ beat: this.beat, sub: this.sub } = nextPosition(this.beat, this.sub, beatsPerBar, subdivision))
      this.nextTime += tickInterval(bpm, subdivision)
    }
    if (stopAt !== null && !this.chimeScheduled && stopAt < ctx.currentTime + SCHEDULE_AHEAD_S) {
      playChime(ctx, master, stopAt)
      this.chimeScheduled = true
    }
    this.timer = window.setTimeout(this.schedule, LOOKAHEAD_MS)
  }
}
