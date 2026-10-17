import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { noteName, SUBDIVISIONS, type NoteValue, type Subdivision } from '../lib/tempo'
import { FieldLabel } from './FieldLabel'

const GLYPHS: Record<Subdivision, string> = { 1: '♩', 2: '♫', 3: '♪³', 4: '♬' }

function subdivisionName(unit: NoteValue, sub: Subdivision): string {
  return sub === 3 ? 'Triplet' : noteName(unit * sub)
}

interface Props {
  value: Subdivision
  unit: NoteValue
  onChange: (value: Subdivision) => void
}

export function SubdivisionSelect({ value, unit, onChange }: Props) {
  return (
    <div>
      <FieldLabel id="subdivision-label">Subdivision</FieldLabel>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, next: Subdivision | null) => next && onChange(next)}
        aria-labelledby="subdivision-label"
        sx={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        {SUBDIVISIONS.map((sub) => (
          <ToggleButton key={sub} value={sub} aria-label={subdivisionName(unit, sub)} sx={{ flexDirection: 'column', gap: 0.25 }}>
            <Box component="span" aria-hidden sx={{ fontFamily: 'system-ui, sans-serif', fontSize: 20, lineHeight: 1 }}>
              {GLYPHS[sub]}
            </Box>
            <Box component="span" sx={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {subdivisionName(unit, sub)}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
