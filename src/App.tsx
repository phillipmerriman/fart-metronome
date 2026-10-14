import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo } from 'react'
import { BeatIndicator } from './components/BeatIndicator'
import { BpmDial } from './components/BpmDial'
import { ConsoleFrame } from './components/ConsoleFrame'
import { Starfield } from './components/Starfield'
import { TimerPanel } from './components/TimerPanel'
import { SubdivisionSelect } from './components/SubdivisionSelect'
import { TimeSignatureSelect } from './components/TimeSignatureSelect'
import { TransportControls } from './components/TransportControls'
import { VolumeSlider } from './components/VolumeSlider'
import { useMetronome } from './hooks/useMetronome'
import { usePersistentState } from './hooks/usePersistentState'
import { useTapTempo } from './hooks/useTapTempo'
import { patternFor, sanitizeSettings, SETTINGS_KEY, type Settings } from './lib/settings'
import { clampBpm, findTimeSignature, nextBeatLevel } from './lib/tempo'
import { formatClock } from './lib/timer'
import { glowText, hud } from './theme'

const SHORTCUTS = [
  ['Space', 'Engage'],
  ['T', 'Tap'],
  ['↑ ↓', '±1'],
  ['Shift', '±5'],
]

function matches(target: EventTarget | null, selector: string) {
  return target instanceof Element && target.closest(selector) !== null
}
const TEXT_ENTRY = 'input:not([type="range"]), textarea, select'
const OWNS_ARROWS = `${TEXT_ENTRY}, [role="slider"], input[type="range"]`

export default function App() {
  const [settings, setSettings] = usePersistentState(SETTINGS_KEY, sanitizeSettings)
  const timeSig = findTimeSignature(settings.timeSig)
  const pattern = useMemo(() => patternFor(settings.patterns, timeSig), [settings.patterns, timeSig])

  const patch = useCallback((change: Partial<Settings>) => setSettings((s) => ({ ...s, ...change })), [setSettings])
  const setBpm = useCallback((bpm: number) => patch({ bpm: clampBpm(bpm) }), [patch])
  const nudge = useCallback(
    (delta: number) => setSettings((s) => ({ ...s, bpm: clampBpm(s.bpm + delta) })),
    [setSettings],
  )
  const cycleBeat = useCallback(
    (beat: number) =>
      setSettings((s) => {
        const ts = findTimeSignature(s.timeSig)
        const next = patternFor(s.patterns, ts).map((level, i) => (i === beat ? nextBeatLevel(level) : level))
        return { ...s, patterns: { ...s.patterns, [ts.id]: next } }
      }),
    [setSettings],
  )

  const { running, tick, remaining, completed, toggle } = useMetronome({
    bpm: settings.bpm,
    pattern,
    subdivision: settings.subdivision,
    volume: settings.volume,
    timerSeconds: settings.timerMinutes > 0 ? settings.timerMinutes * 60 : null,
  })
  const tap = useTapTempo(setBpm)
  const countdown = running && remaining !== null ? formatClock(remaining) : null

  useEffect(() => {
    document.title = countdown ? `${countdown} · Fart Metronome` : 'Fart Metronome'
  }, [countdown])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || matches(e.target, TEXT_ENTRY)) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (!e.repeat) toggle()
      } else if (e.key === 't' || e.key === 'T') {
        if (!e.repeat) tap()
      } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !matches(e.target, OWNS_ARROWS)) {
        e.preventDefault()
        const step = e.shiftKey ? 5 : 1
        nudge(e.key === 'ArrowUp' ? step : -step)
      }
    }
    // Space is the global transport key; stop focused buttons from also activating on keyup.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !matches(e.target, TEXT_ENTRY)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [toggle, tap, nudge])

  return (
    <>
      <Starfield />
      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1040,
          mx: 'auto',
          px: 2,
          py: { xs: 2.5, md: 5 },
          display: 'grid',
          gap: { xs: 2, md: 3 },
        }}
      >
        <Box component="header" sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1, columnGap: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ color: hud.textDim, fontSize: 10, display: 'block', lineHeight: 1.4 }}>
              Temporal pulse regulator // MK-I
            </Typography>
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: 24, sm: 34 }, color: hud.cyan, textShadow: glowText(hud.cyan) }}
            >
              FART METRONOME
            </Typography>
          </Box>
          <Typography
            variant="overline"
            role="status"
            sx={{ ml: { sm: 'auto' }, display: 'flex', alignItems: 'center', gap: 1, color: hud.textDim, fontSize: 11 }}
          >
            Status:
            <Box
              component="span"
              className={running ? 'hud-anim' : undefined}
              sx={{
                color: running ? hud.amber : hud.cyan,
                textShadow: glowText(running ? hud.amber : hud.cyan),
                animation: running ? 'hud-blink 1.2s steps(1) infinite' : 'none',
              }}
            >
              {running ? 'Active' : 'Standby'}
            </Box>
            {countdown && (
              <Box component="span" sx={{ color: hud.amber, fontVariantNumeric: 'tabular-nums' }}>
                T-{countdown}
              </Box>
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.55fr) minmax(0, 1fr)' },
            gap: { xs: 2, md: 3 },
            alignItems: 'start',
          }}
        >
          <ConsoleFrame title="Command console" code={`${timeSig.id} · ×${settings.subdivision}`} active={running}>
            <Box sx={{ display: 'grid', gap: { xs: 2.5, sm: 3 } }}>
              <BpmDial
                bpm={settings.bpm}
                onChange={setBpm}
                tick={tick}
                running={running}
                pattern={pattern}
                subdivision={settings.subdivision}
              />
              <BeatIndicator
                pattern={pattern}
                subdivision={settings.subdivision}
                tick={tick}
                running={running}
                onCycle={cycleBeat}
              />
              <TransportControls running={running} onToggle={toggle} onTap={tap} onNudge={nudge} />
            </Box>
          </ConsoleFrame>

          <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 } }}>
            <ConsoleFrame title="Configuration" code="CFG-02">
              <Box sx={{ display: 'grid', gap: 2.5 }}>
                <TimeSignatureSelect value={timeSig.id} onChange={(timeSig) => patch({ timeSig })} />
                <SubdivisionSelect
                  value={settings.subdivision}
                  unit={timeSig.unit}
                  onChange={(subdivision) => patch({ subdivision })}
                />
              </Box>
            </ConsoleFrame>
            <ConsoleFrame title="Mission timer" code="TMR-03" active={countdown !== null}>
              <TimerPanel
                minutes={settings.timerMinutes}
                onChange={(timerMinutes) => patch({ timerMinutes })}
                running={running}
                remaining={remaining}
                completed={completed}
              />
            </ConsoleFrame>
            <ConsoleFrame title="Audio systems" code="AUD-01">
              <VolumeSlider value={settings.volume} onChange={(volume) => patch({ volume })} />
            </ConsoleFrame>
            <ConsoleFrame title="Input bindings" code="KEY-04">
              <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, columnGap: 2 }}>
                {SHORTCUTS.map(([key, action]) => (
                  <Box key={key} sx={{ display: 'contents' }}>
                    <Box
                      component="dt"
                      sx={{
                        fontFamily: hud.display,
                        fontSize: 11,
                        color: hud.cyan,
                        border: `1px solid ${hud.cyanDim}`,
                        px: 1,
                        py: 0.25,
                        textAlign: 'center',
                      }}
                    >
                      {key}
                    </Box>
                    <Box
                      component="dd"
                      sx={{ m: 0, color: hud.textDim, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 13 }}
                    >
                      {action}
                    </Box>
                  </Box>
                ))}
              </Box>
            </ConsoleFrame>
          </Box>
        </Box>
      </Box>
    </>
  )
}
