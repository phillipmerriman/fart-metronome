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
