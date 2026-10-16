import type { TickType } from '../lib/tempo'

/** Something that can sound a metronome tick at an exact AudioContext time. */
export interface SoundVoice {
  play(type: TickType, time: number, ctx: BaseAudioContext, destination: AudioNode): void
}

const TONES: Record<TickType, { freq: number; peak: number; duration: number; wave: OscillatorType }> = {
  accent: { freq: 1568, peak: 1, duration: 0.07, wave: 'triangle' },
  beat: { freq: 1046.5, peak: 0.7, duration: 0.05, wave: 'sine' },
  sub: { freq: 784, peak: 0.35, duration: 0.035, wave: 'sine' },
}

export class SynthClickVoice implements SoundVoice {
  play(type: TickType, time: number, ctx: BaseAudioContext, destination: AudioNode) {
    const tone = TONES[type]
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = tone.wave
    osc.frequency.setValueAtTime(tone.freq, time)
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(tone.peak, time + 0.002)
    env.gain.exponentialRampToValueAtTime(0.0001, time + tone.duration)
    osc.connect(env).connect(destination)
    osc.start(time)
    osc.stop(time + tone.duration + 0.01)
  }
}

const ATTACK_S = 0.002
const FLOOR = 0.0001

/** Renders one tone with the same waveform and envelope SynthClickVoice schedules live. */
function renderTone(ctx: BaseAudioContext, tone: (typeof TONES)[TickType]): AudioBuffer {
  const rate = ctx.sampleRate
  const length = Math.ceil((tone.duration + 0.01) * rate)
  const buffer = ctx.createBuffer(1, length, rate)
  const data = buffer.getChannelData(0)
  const w = 2 * Math.PI * tone.freq

  // Band-limited triangle (odd harmonics below Nyquist), like the built-in oscillator.
  const harmonics: number[] = []
  if (tone.wave === 'triangle') {
    for (let n = 1; n * tone.freq < rate / 2; n += 2) harmonics.push(n)
  }
  let wavePeak = 0
  for (let i = 0; i < length; i++) {
    const t = i / rate
    let s: number
    if (tone.wave === 'triangle') {
      s = 0
      for (const n of harmonics) s += (((n - 1) / 2) % 2 ? -1 : 1) * Math.sin(n * w * t) / (n * n)
    } else {
      s = Math.sin(w * t)
    }
    data[i] = s
    wavePeak = Math.max(wavePeak, Math.abs(s))
  }

  for (let i = 0; i < length; i++) {
    const t = i / rate
    let gain: number
    if (t < ATTACK_S) gain = (tone.peak * t) / ATTACK_S
    else if (t < tone.duration) gain = tone.peak * Math.pow(FLOOR / tone.peak, (t - ATTACK_S) / (tone.duration - ATTACK_S))
    else gain = FLOOR
    data[i] = (data[i] / wavePeak) * gain
  }
  return buffer
}

/**
 * Plays pre-rendered copies of the synth clicks, so every tick is the identical
 * waveform instead of a freshly automated oscillator (which iOS Safari can garble).
 */
export class BufferClickVoice implements SoundVoice {
  private cache = new WeakMap<BaseAudioContext, Record<TickType, AudioBuffer>>()

  play(type: TickType, time: number, ctx: BaseAudioContext, destination: AudioNode) {
    let buffers = this.cache.get(ctx)
    if (!buffers) {
      buffers = {
        accent: renderTone(ctx, TONES.accent),
        beat: renderTone(ctx, TONES.beat),
        sub: renderTone(ctx, TONES.sub),
      }
      this.cache.set(ctx, buffers)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffers[type]
    source.connect(destination)
    source.start(time)
  }
}

/** A short rising three-note "mission complete" chime. */
export function playChime(ctx: BaseAudioContext, destination: AudioNode, time: number) {
  const notes = [880, 1108.73, 1318.51]
  notes.forEach((freq, i) => {
    const start = time + i * 0.14
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)
    env.gain.setValueAtTime(0, start)
    env.gain.linearRampToValueAtTime(0.6, start + 0.01)
    env.gain.exponentialRampToValueAtTime(0.0001, start + (i === notes.length - 1 ? 0.6 : 0.2))
    osc.connect(env).connect(destination)
    osc.start(start)
    osc.stop(start + 0.65)
  })
}
