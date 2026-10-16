import { useCallback, useEffect, useState } from 'react'
import { MetronomeEngine, type Tick } from '../audio/engine'
import type { BeatLevel, Subdivision } from '../lib/tempo'

interface Options {
  bpm: number
  pattern: BeatLevel[]
  subdivision: Subdivision
  volume: number
  /** Length of the next run in seconds, or null for an untimed run. */
  timerSeconds: number | null
}

export function useMetronome({ bpm, pattern, subdivision, volume, timerSeconds }: Options) {
  const [engine] = useState(() => new MetronomeEngine())
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState<Tick | null>(null)
  /** Whole seconds left in a timed run; null when untimed or stopped. */
  const [remaining, setRemaining] = useState<number | null>(null)
  /** The last run ended because its timer ran out. */
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    engine.update({ bpm, pattern, subdivision })
  }, [engine, bpm, pattern, subdivision])

  useEffect(() => {
    engine.setVolume(volume)
  }, [engine, volume])

  useEffect(() => () => engine.dispose(), [engine])

  useEffect(() => {
    engine.setOnEnded(() => {
      setRunning(false)
      setTick(null)
      setRemaining(null)
      setCompleted(true)
    })
    return () => engine.setOnEnded(null)
  }, [engine])

  // An interval rather than animation frames, so the countdown keeps updating in background tabs.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const left = engine.timeRemaining()
      setRemaining(left === null ? null : Math.ceil(left))
    }, 250)
    return () => window.clearInterval(id)
  }, [engine, running])

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
    await engine.start(timerSeconds)
    setCompleted(false)
    setRemaining(timerSeconds)
    setRunning(true)
  }, [engine, timerSeconds])

  const stop = useCallback(() => {
    engine.stop()
    setRunning(false)
    setTick(null)
    setRemaining(null)
  }, [engine])

  const toggle = useCallback(() => {
    if (engine.running) stop()
    else void start()
  }, [engine, start, stop])

  return { running, tick, remaining, completed, start, stop, toggle }
}
