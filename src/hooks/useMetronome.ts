import { useCallback, useEffect, useState } from 'react'
import { MetronomeEngine, type Tick } from '../audio/engine'
import type { Subdivision } from '../lib/tempo'

interface Options {
  bpm: number
  beatsPerBar: number
  subdivision: Subdivision
  volume: number
}

export function useMetronome({ bpm, beatsPerBar, subdivision, volume }: Options) {
  const [engine] = useState(() => new MetronomeEngine())
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState<Tick | null>(null)

  useEffect(() => {
    engine.update({ bpm, beatsPerBar, subdivision })
  }, [engine, bpm, beatsPerBar, subdivision])

  useEffect(() => {
    engine.setVolume(volume)
  }, [engine, volume])

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

  return { running, tick, start, stop, toggle }
}
