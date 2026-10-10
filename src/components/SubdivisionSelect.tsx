import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { SUBDIVISIONS, type Subdivision } from '../lib/tempo'
import { FieldLabel } from './FieldLabel'

const GLYPHS: Record<Subdivision, string> = { 1: '♩', 2: '♫', 3: '♪³', 4: '♬' }
const NAMES: Record<4 | 8, Record<Subdivision, string>> = {
  4: { 1: 'Quarter', 2: '8th', 3: 'Triplet', 4: '16th' },
  8: { 1: 'Eighth', 2: '16th', 3: 'Triplet', 4: '32nd' },
}

interface Props {
  value: Subdivision
  unit: 4 | 8
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
          <ToggleButton key={sub} value={sub} aria-label={NAMES[unit][sub]} sx={{ flexDirection: 'column', gap: 0.25 }}>
            <Box component="span" aria-hidden sx={{ fontFamily: 'system-ui, sans-serif', fontSize: 20, lineHeight: 1 }}>
              {GLYPHS[sub]}
            </Box>
            <Box component="span" sx={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {NAMES[unit][sub]}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
