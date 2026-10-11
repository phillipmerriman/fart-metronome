import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { TIME_SIGNATURES } from '../lib/tempo'
import { FieldLabel } from './FieldLabel'

interface Props {
  value: string
  onChange: (id: string) => void
}

export function TimeSignatureSelect({ value, onChange }: Props) {
  return (
    <div>
      <FieldLabel id="timesig-label">Time signature</FieldLabel>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, next: string | null) => next && onChange(next)}
        aria-labelledby="timesig-label"
        sx={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
      >
        {TIME_SIGNATURES.map((ts) => (
          <ToggleButton key={ts.id} value={ts.id} sx={{ fontSize: 15 }}>
            {ts.id}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
