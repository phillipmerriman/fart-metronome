import { useCallback, useEffect, useRef, useState } from 'react'
import { MetronomeEngine, type Tick } from '../audio/engine'
import { loadVoice, type SoundOption } from '../audio/sounds'
import { SynthClickVoice } from '../audio/voices'
import type { BeatLevel, Subdivision } from '../lib/tempo'

export type SoundStatus = 'loading' | 'ready' | 'error'

interface Options {
  bpm: number
  pattern: BeatLevel[]
  subdivision: Subdivision
  volume: number
  sound: SoundOption
  fartSound: SoundOption
}

export function useMetronome({ bpm, pattern, subdivision, volume, sound, fartSound }: Options) {
  const [engine] = useState(() => new MetronomeEngine())
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState<Tick | null>(null)
  const [loaded, setLoaded] = useState<{ id: string; ok: boolean } | null>(null)
  const soundStatus: SoundStatus = loaded?.id !== sound.id ? 'loading' : loaded.ok ? 'ready' : 'error'
  const previewPending = useRef<'main' | 'fart' | null>(null)

  useEffect(() => {
    engine.update({ bpm, pattern, subdivision })
  }, [engine, bpm, pattern, subdivision])

  useEffect(() => {
    engine.setVolume(volume)
  }, [engine, volume])

  useEffect(() => {
    let cancelled = false
    loadVoice(sound).then(
      (voice) => {
        if (cancelled) return
        engine.setVoice(voice)
        setLoaded({ id: sound.id, ok: true })
        if (previewPending.current === 'main' && !engine.running) void engine.preview('main')
        previewPending.current = null
      },
      (error: unknown) => {
        if (cancelled) return
        console.error(`Could not load sound "${sound.id}"`, error)
        engine.setVoice(new SynthClickVoice())
        setLoaded({ id: sound.id, ok: false })
        previewPending.current = null
      },
    )
    return () => {
      cancelled = true
    }
  }, [engine, sound])

  useEffect(() => {
    let cancelled = false
    loadVoice(fartSound).then(
      (voice) => {
        if (cancelled) return
        engine.setFartVoice(voice)
        if (previewPending.current === 'fart' && !engine.running) void engine.preview('fart')
        previewPending.current = null
      },
      (error: unknown) => {
        if (!cancelled) console.error(`Could not load fart sound "${fartSound.id}"`, error)
      },
    )
    return () => {
      cancelled = true
    }
  }, [engine, fartSound])

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

  /** Preview the next main or fart sound once it has loaded (call when the user picks one). */
  const previewNextSound = useCallback((which: 'main' | 'fart') => {
    previewPending.current = which
  }, [])

  return { running, tick, start, stop, toggle, soundStatus, previewNextSound }
}
