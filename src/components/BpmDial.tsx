import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import type { Tick } from '../audio/engine'
import { clampBpm, isFartLevel, MAX_BPM, MIN_BPM, tempoName, type BeatLevel, type Subdivision } from '../lib/tempo'
import { glowText, hud } from '../theme'

const SIZE = 240
const C = SIZE / 2
const ARC_R = 86
const ARC_SWEEP = 0.75
const PX_PER_BPM = 4


const SWEEP_TAIL = { x: C - 80 * Math.sin(Math.PI / 5), y: C - 80 * Math.cos(Math.PI / 5) }

const TICK_MARKS = Array.from({ length: 72 }, (_, i) => {
  const angle = (i / 72) * Math.PI * 2
  const major = i % 6 === 0
  const r1 = major ? 98 : 102
  const r2 = 108
  return {
    key: i,
    major,
    x1: C + Math.cos(angle) * r1,
    y1: C + Math.sin(angle) * r1,
    x2: C + Math.cos(angle) * r2,
    y2: C + Math.sin(angle) * r2,
  }
})

interface Props {
  bpm: number
  onChange: (bpm: number) => void
  tick: Tick | null
  running: boolean
  pattern: BeatLevel[]
  subdivision: Subdivision
}

export function BpmDial({ bpm, onChange, tick, running, pattern, subdivision }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; bpm: number } | null>(null)
  const latest = useRef({ bpm, onChange })
  useEffect(() => {
    latest.current = { bpm, onChange }
  }, [bpm, onChange])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const step = e.shiftKey ? 5 : 1
      const { bpm: current, onChange: change } = latest.current
      change(clampBpm(current + (e.deltaY < 0 ? step : -step)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y: e.clientY, bpm }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const delta = Math.round((drag.current.y - e.clientY) / PX_PER_BPM)
    onChange(clampBpm(drag.current.bpm + delta))
  }
  const endDrag = () => {
    drag.current = null
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 1
    const next: Record<string, number> = {
      ArrowUp: bpm + step,
      ArrowRight: bpm + step,
      ArrowDown: bpm - step,
      ArrowLeft: bpm - step,
      PageUp: bpm + 10,
      PageDown: bpm - 10,
      Home: MIN_BPM,
      End: MAX_BPM,
    }
    if (e.key in next) {
      e.preventDefault()
      onChange(clampBpm(next[e.key]))
    }
  }

  const circumference = 2 * Math.PI * ARC_R
  const fraction = (bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)
  const level = running && tick !== null ? pattern[tick.beat] : null
  const glowColor = level === 'accent' ? hud.amber : level !== null && isFartLevel(level) ? hud.fart : hud.cyan
  const barSeconds = (pattern.length * 60) / bpm
  const barKey = tick ? tick.index - (tick.beat * subdivision + tick.sub) : null
  const beatKey = tick ? tick.index - tick.sub : null

  return (
    <Box
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label="Tempo in beats per minute"
      aria-valuemin={MIN_BPM}
      aria-valuemax={MAX_BPM}
      aria-valuenow={bpm}
      aria-valuetext={`${bpm} BPM, ${tempoName(bpm).toLowerCase()}`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 300,
        aspectRatio: '1',
        mx: 'auto',
        cursor: 'ns-resize',
        touchAction: 'none',
        userSelect: 'none',
        outline: 'none',
        borderRadius: '50%',
        '&:focus-visible': { boxShadow: `0 0 0 1px ${hud.cyan}` },
      }}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%" aria-hidden style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sweep-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={hud.cyan} stopOpacity="0" />
            <stop offset="1" stopColor={hud.cyan} stopOpacity="0.35" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={C} cy={C} r={114} fill="none" stroke={hud.cyanFaint} strokeDasharray="2 6" />
        {TICK_MARKS.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? hud.cyanDim : hud.cyanFaint}
            strokeWidth={t.major ? 1.5 : 1}
          />
        ))}
        <circle cx={C} cy={C} r={66} fill="rgba(5, 12, 22, 0.85)" stroke={hud.cyanFaint} />
        <circle cx={C} cy={C} r={40} fill="none" stroke={hud.cyanFaint} strokeDasharray="1 4" />
        <line x1={C - 76} y1={C} x2={C + 76} y2={C} stroke={hud.cyanFaint} />
        <line x1={C} y1={C - 76} x2={C} y2={C + 76} stroke={hud.cyanFaint} />

        <circle
          cx={C}
          cy={C}
          r={ARC_R}
          fill="none"
          stroke={hud.cyanFaint}
          strokeWidth={8}
          strokeDasharray={`${circumference * ARC_SWEEP} ${circumference}`}
          transform={`rotate(135 ${C} ${C})`}
        />
        <circle
          cx={C}
          cy={C}
          r={ARC_R}
          fill="none"
          stroke={glowColor}
          strokeWidth={8}
          strokeDasharray={`${circumference * ARC_SWEEP * fraction} ${circumference}`}
          transform={`rotate(135 ${C} ${C})`}
          filter="url(#glow)"
          style={{ transition: 'stroke 80ms' }}
        />

        {running && barKey !== null && (
          <g
            key={barKey}
            className="hud-anim"
            style={{
              transformOrigin: `${C}px ${C}px`,
              animation: `hud-spin ${barSeconds}s linear forwards`,
            }}
          >
            <path
              d={`M ${C} ${C} L ${C} ${C - 80} A 80 80 0 0 0 ${SWEEP_TAIL.x} ${SWEEP_TAIL.y} Z`}
              fill="url(#sweep-fill)"
            />
            <line x1={C} y1={C} x2={C} y2={C - 80} stroke={hud.cyan} strokeWidth={1.5} filter="url(#glow)" />
          </g>
        )}

        {running && beatKey !== null && !tick?.muted && (
          <circle
            key={beatKey}
            cx={C}
            cy={C}
            r={66}
            fill="none"
            stroke={glowColor}
            strokeWidth={3}
            className="hud-anim"
            style={{ transformOrigin: `${C}px ${C}px`, animation: 'hud-pulse 260ms ease-out forwards' }}
          />
        )}
      </svg>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          sx={{
            fontFamily: hud.display,
            fontWeight: 900,
            fontSize: 'clamp(44px, 13vw, 64px)',
            lineHeight: 1,
            color: glowColor,
            textShadow: glowText(glowColor),
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 80ms',
          }}
        >
          {bpm}
        </Typography>
        <Typography variant="overline" sx={{ color: hud.textDim, fontSize: 10, mt: 0.5 }}>
          BPM
        </Typography>
        <Typography variant="overline" sx={{ color: hud.amber, fontSize: 10, lineHeight: 1 }}>
          {tempoName(bpm)}
        </Typography>
      </Box>
    </Box>
  )
}
