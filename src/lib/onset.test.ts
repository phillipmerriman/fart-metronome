import { describe, expect, it } from 'vitest'
import { findOnset } from './onset'

describe('findOnset', () => {
  it('skips leading silence, backing off 2ms', () => {
    const samples = new Float32Array(1000)
    samples[500] = 0.5
    expect(findOnset(samples, 1000)).toBeCloseTo(0.498)
  })
  it('ignores noise below the threshold', () => {
    const samples = new Float32Array(1000).fill(0.01)
    samples[800] = -0.3
    expect(findOnset(samples, 1000)).toBeCloseTo(0.798)
  })
  it('returns 0 for sound at the start or total silence', () => {
    expect(findOnset(new Float32Array([0.9, 0, 0]), 1000)).toBe(0)
    expect(findOnset(new Float32Array(100), 1000)).toBe(0)
  })
})
