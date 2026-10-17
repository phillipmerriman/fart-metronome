import { useCallback, useEffect, useState } from 'react'
import { MetronomeEngine, type Tick } from '../audio/engine'
import { findFartSound, loadVoice } from '../audio/sounds'
import { fartSoundId, type BeatLevel, type Subdivision } from '../lib/tempo'

interface Options {
  bpm: number
  pattern: BeatLevel[]
  subdivision: Subdivision
  volume: number
}

/** Loads the recording a fart sound id refers to (stale ids fall back to the first sample) into the engine. */
async function loadFartVoice(engine: MetronomeEngine, id: string) {
  try {
    engine.setFartVoice(id, await loadVoice(findFartSound(id)))
  } catch (error) {
    console.error(`Could not load fart sound "${id}"`, error)
  }
}

export function useMetronome({ bpm, pattern, subdivision, volume }: Options) {
  const [engine] = useState(() => new MetronomeEngine())
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState<Tick | null>(null)

  useEffect(() => {
    engine.update({ bpm, pattern, subdivision })
  }, [engine, bpm, pattern, subdivision])

  useEffect(() => {
    engine.setVolume(volume)
  }, [engine, volume])

  // loadVoice caches, so re-running this on every pattern edit is cheap.
  useEffect(() => {
    for (const level of new Set(pattern)) {
      const id = fartSoundId(level)
      if (id !== null) void loadFartVoice(engine, id)
    }
  }, [engine, pattern])

  useEffect(() => () => engine.dispose(), [engine])

  useEffect(() => {
    if (!running) return
    let frame = 0
    const loop = () => {
      const due = engine.takeDueTick()
      if (due) setTick(due)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [engine, running])

  const start = useCallback(async () => {
    await engine.start()
    setRunning(true)
  }, [engine])

  const stop = useCallback(() => {
    engine.stop()
    setRunning(false)
    setTick(null)
  }, [engine])

  const toggle = useCallback(() => {
    if (engine.running) stop()
    else void start()
  }, [engine, start, stop])

  /** Plays one beat at the given level, once its recording has loaded, unless the metronome is running. */
  const preview = useCallback(
    async (level: BeatLevel) => {
      const id = fartSoundId(level)
      if (id !== null) await loadFartVoice(engine, id)
      if (!engine.running) await engine.preview(level)
    },
    [engine],
  )

  return { running, tick, start, stop, toggle, preview }
}
