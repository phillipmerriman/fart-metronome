import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { clampTimerMinutes, formatClock, TIMER_PRESETS } from '../lib/timer'
import { glowText, hud } from '../theme'
import { FieldLabel } from './FieldLabel'

interface Props {
  minutes: number
  onChange: (minutes: number) => void
  running: boolean
  /** Seconds left in the current timed run, or null. */
  remaining: number | null
  completed: boolean
}

const SEGMENTS = 24

export function TimerPanel({ minutes, onChange, running, remaining, completed }: Props) {
  const total = minutes * 60
  const counting = running && remaining !== null
  const off = minutes === 0
  const readout = counting ? formatClock(remaining) : off ? '--:--' : formatClock(total)
  const fraction = counting && total > 0 ? remaining / total : off ? 0 : 1
  const lit = Math.ceil(fraction * SEGMENTS)
  const color = counting || completed ? hud.amber : off ? hud.textDim : hud.cyan

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={() => onChange(clampTimerMinutes(minutes - 1))}
          disabled={running || off}
          aria-label="One minute less"
          sx={{ minWidth: 0, px: 1.5 }}
        >
          −1
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            role="timer"
            aria-label={off ? 'Timer off' : `Time ${counting ? 'remaining' : 'set'}: ${readout}`}
            sx={{
              fontFamily: hud.display,
              fontWeight: 900,
              fontSize: 34,
              lineHeight: 1.1,
              color,
              textShadow: off ? 'none' : glowText(color),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {readout}
          </Typography>
          <Typography
            variant="overline"
            sx={{ fontSize: 9.5, lineHeight: 1.4, color: completed && !running ? hud.amber : hud.textDim }}
          >
            {counting ? 'Remaining' : completed ? 'Mission complete' : off ? 'Timer offline' : 'Armed'}
          </Typography>
        </Box>
        <Button
          onClick={() => onChange(clampTimerMinutes(minutes + 1))}
          disabled={running}
          aria-label="One minute more"
          sx={{ minWidth: 0, px: 1.5 }}
        >
          +1
        </Button>
      </Box>

      <Box aria-hidden sx={{ display: 'grid', gridTemplateColumns: `repeat(${SEGMENTS}, 1fr)`, gap: '3px', height: 6 }}>
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: i < lit ? color : alpha(hud.cyan, 0.12),
              boxShadow: i < lit && !off ? `0 0 4px ${alpha(color, 0.7)}` : 'none',
              transition: 'background-color 200ms',
            }}
          />
        ))}
      </Box>

      <div>
        <FieldLabel id="timer-label" value={off ? 'Off' : `${minutes} min`}>
          Duration
        </FieldLabel>
        <ToggleButtonGroup
          exclusive
          value={minutes}
          disabled={running}
          onChange={(_, next: number | null) => next !== null && onChange(next)}
          aria-labelledby="timer-label"
          sx={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
        >
          {TIMER_PRESETS.map((preset) => (
            <ToggleButton key={preset} value={preset} sx={{ fontSize: 13 }}>
              {preset === 0 ? 'Off' : `${preset}m`}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <Typography variant="overline" sx={{ fontSize: 9.5, lineHeight: 1.5, color: hud.textDim, textAlign: 'center' }}>
        Engage starts the countdown · the metronome stops at zero
      </Typography>
    </Box>
  )
}
