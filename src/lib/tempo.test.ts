import { describe, expect, it } from 'vitest'
import { sanitizeSettings, DEFAULT_SETTINGS, patternFor } from './settings'
import {
  clampBpm,
  classifyTick,
  defaultPattern,
  nextPosition,
  tapsToBpm,
  tempoName,
  tickInterval,
  type Subdivision,
} from './tempo'

describe('clampBpm', () => {
  it('clamps to range and rounds', () => {
    expect(clampBpm(10)).toBe(30)
    expect(clampBpm(999)).toBe(300)
    expect(clampBpm(120.6)).toBe(121)
    expect(clampBpm(NaN)).toBe(120)
  })
})

describe('tapsToBpm', () => {
  it('needs at least two taps', () => {
    expect(tapsToBpm([])).toBeNull()
    expect(tapsToBpm([1000])).toBeNull()
  })
  it('averages intervals', () => {
    expect(tapsToBpm([0, 500])).toBe(120)
    expect(tapsToBpm([0, 490, 1000, 1510, 2000])).toBe(120)
  })
  it('only uses the most recent taps', () => {
    expect(tapsToBpm([0, 2000, 2500, 3000, 3500, 4000])).toBe(120)
  })
  it('clamps extreme tempos', () => {
    expect(tapsToBpm([0, 50])).toBe(300)
  })
})

describe('tickInterval', () => {
  it('divides the beat by the subdivision', () => {
    expect(tickInterval(120, 1)).toBeCloseTo(0.5)
    expect(tickInterval(120, 2)).toBeCloseTo(0.25)
    expect(tickInterval(60, 3)).toBeCloseTo(1 / 3)
  })
})

describe('classifyTick', () => {
  it('follows the beat level on the beat and marks the rest as subdivisions', () => {
    expect(classifyTick('accent', 0)).toBe('accent')
    expect(classifyTick('normal', 0)).toBe('beat')
    expect(classifyTick('mute', 0)).toBe('beat')
    expect(classifyTick('fart:a.mp3', 0)).toBe('fart')
    expect(classifyTick('fart:a.mp3', 1)).toBe('sub')
    expect(classifyTick('accent', 1)).toBe('sub')
    expect(classifyTick('normal', 2)).toBe('sub')
  })
})

describe('beat patterns', () => {
  it('accents only the downbeat by default', () => {
    expect(defaultPattern(3)).toEqual(['accent', 'normal', 'normal'])
  })
})

describe('nextPosition', () => {
  function walk(beats: number, subdivision: Subdivision, steps: number) {
    const out: string[] = []
    let pos = { beat: 0, sub: 0 }
    for (let i = 0; i < steps; i++) {
      out.push(classifyTick(defaultPattern(beats)[pos.beat], pos.sub)[0])
      pos = nextPosition(pos.beat, pos.sub, beats, subdivision)
    }
    return out.join('')
  }

  it('cycles a 3/4 bar of quarters', () => {
    expect(walk(3, 1, 7)).toBe('abbabba')
  })
  it('handles triplets in 2/4', () => {
    expect(walk(2, 3, 7)).toBe('assbssa')
  })
  it('handles sixteenths in 6/8', () => {
    expect(walk(6, 4, 25)).toBe('asss' + 'bsss'.repeat(5) + 'a')
  })
  it('wraps when the bar shrinks mid-play', () => {
    expect(nextPosition(5, 0, 3, 1)).toEqual({ beat: 0, sub: 0 })
    expect(nextPosition(1, 3, 4, 2)).toEqual({ beat: 2, sub: 0 })
  })
})

describe('tempoName', () => {
  it('names tempos', () => {
    expect(tempoName(30)).toBe('GRAVE')
    expect(tempoName(100)).toBe('ANDANTE')
    expect(tempoName(120)).toBe('ALLEGRO')
    expect(tempoName(250)).toBe('PRESTISSIMO')
  })
})

describe('sanitizeSettings', () => {
  it('falls back to defaults for garbage', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(
      sanitizeSettings({ bpm: 'fast', timeSig: '9/9', subdivision: 7, volume: 'x', patterns: 'nope' }),
    ).toEqual(DEFAULT_SETTINGS)
  })
  it('keeps only well-formed beat patterns', () => {
    const { patterns } = sanitizeSettings({
      patterns: {
        '3/4': ['normal', 'fart:a.mp3', 'mute'],
        '5/4': ['accent', 'normal', 'fart', 'normal', 'normal'],
        '4/4': ['accent', 'normal'],
        '2/4': ['accent', 'loud'],
        '9/9': ['accent'],
      },
      fartSound: 'b.mp3',
    })
    expect(patterns).toEqual({
      '3/4': ['normal', 'fart:a.mp3', 'mute'],
      '5/4': ['accent', 'normal', 'fart:b.mp3', 'normal', 'normal'],
    })
    expect(patternFor(patterns, { id: '4/4', beats: 4, unit: 4 })).toEqual(defaultPattern(4))
  })
  it('keeps and clamps valid values', () => {
    expect(sanitizeSettings({ bpm: 500, timeSig: '6/8', subdivision: 3, volume: 2 })).toEqual({
      bpm: 300,
      timeSig: '6/8',
      subdivision: 3,
      volume: 1,
      patterns: {},
    })
  })
})
