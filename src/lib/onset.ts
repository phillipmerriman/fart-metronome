/**
 * Seconds of near-silence before a sample's first audible sound, so playback
 * can start at the onset and land exactly on the beat.
 */
export function findOnset(samples: Float32Array, sampleRate: number, threshold = 0.02): number {
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) >= threshold) {
      // Back off slightly so the attack isn't clipped.
      return Math.max(0, i - Math.round(sampleRate * 0.002)) / sampleRate
    }
  }
  return 0
}
