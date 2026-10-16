import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { makeTimeSignature, MAX_BEATS, MIN_BEATS, NOTE_VALUES, noteName, type NoteValue, type TimeSignature } from '../lib/tempo'
import { glowText, hud } from '../theme'
import { FieldLabel } from './FieldLabel'

interface Props {
  value: TimeSignature
  onChange: (id: string) => void
}

export function TimeSignatureSelect({ value, onChange }: Props) {
  const setBeats = (beats: number) => onChange(makeTimeSignature(beats, value.unit).id)
  const setUnit = (unit: NoteValue) => onChange(makeTimeSignature(value.beats, unit).id)

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <div>
        <FieldLabel id="beats-label">Time signature</FieldLabel>
        <Box
          role="group"
          aria-labelledby="beats-label"
          sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}
        >
          <Button
            onClick={() => setBeats(value.beats - 1)}
            disabled={value.beats <= MIN_BEATS}
            aria-label="One beat fewer"
            sx={{ minWidth: 0, px: 1.5 }}
          >
            −1
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              aria-live="polite"
              aria-label={`${value.id}: ${value.beats} ${noteName(value.unit).toLowerCase()} beats per bar`}
              sx={{
                fontFamily: hud.display,
                fontWeight: 900,
                fontSize: 34,
                lineHeight: 1.1,
                color: hud.cyan,
                textShadow: glowText(hud.cyan),
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value.beats}
              <Box component="span" sx={{ color: hud.textDim, textShadow: 'none' }}>
                /{value.unit}
              </Box>
            </Typography>
            <Typography variant="overline" sx={{ fontSize: 9.5, lineHeight: 1.4, color: hud.textDim }}>
              Beats per bar
            </Typography>
          </Box>
          <Button
            onClick={() => setBeats(value.beats + 1)}
            disabled={value.beats >= MAX_BEATS}
            aria-label="One beat more"
            sx={{ minWidth: 0, px: 1.5 }}
          >
            +1
          </Button>
        </Box>
      </div>

      <div>
        <FieldLabel id="note-value-label" value={noteName(value.unit)}>
          Beat unit
        </FieldLabel>
        <ToggleButtonGroup
          exclusive
          value={value.unit}
          onChange={(_, next: NoteValue | null) => next && setUnit(next)}
          aria-labelledby="note-value-label"
          sx={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
        >
          {NOTE_VALUES.map((unit) => (
            <ToggleButton key={unit} value={unit} aria-label={`${noteName(unit)} note`} sx={{ fontSize: 15 }}>
              {unit}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    </Box>
  )
}
