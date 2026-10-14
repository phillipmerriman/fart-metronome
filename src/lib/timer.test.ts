import { describe, expect, it } from 'vitest'
import { clampTimerMinutes, formatClock } from './timer'

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(59)).toBe('0:59')
    expect(formatClock(20 * 60)).toBe('20:00')
  })
  it('rounds partial seconds up so the clock never shows 0:00 early', () => {
    expect(formatClock(0.2)).toBe('0:01')
    expect(formatClock(61.5)).toBe('1:02')
  })
  it('adds hours past 60 minutes', () => {
    expect(formatClock(3600)).toBe('1:00:00')
    expect(formatClock(3725)).toBe('1:02:05')
  })
})

describe('clampTimerMinutes', () => {
  it('rounds and clamps to 0–180', () => {
    expect(clampTimerMinutes(-5)).toBe(0)
    expect(clampTimerMinutes(20.4)).toBe(20)
    expect(clampTimerMinutes(500)).toBe(180)
    expect(clampTimerMinutes(NaN)).toBe(0)
  })
})
