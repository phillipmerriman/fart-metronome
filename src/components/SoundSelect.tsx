import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import type { SoundOption } from '../audio/sounds'
import type { SoundStatus } from '../hooks/useMetronome'
import { hud } from '../theme'
import { FieldLabel } from './FieldLabel'

const STATUS_TEXT: Record<SoundStatus, string> = {
  loading: 'Loading…',
  ready: 'Online',
  error: 'Load failed',
}

interface Props {
  id: string
  label: string
  sounds: SoundOption[]
  value: string
  status?: SoundStatus
  onChange: (id: string) => void
}

export function SoundSelect({ id, label, sounds, value, status, onChange }: Props) {
  return (
    <div>
      <FieldLabel
        id={id}
        value={
          status && <span style={{ color: status === 'error' ? hud.danger : undefined }}>{STATUS_TEXT[status]}</span>
        }
      >
        {label}
      </FieldLabel>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, next: string | null) => next && onChange(next)}
        aria-labelledby={id}
        sx={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        {sounds.map((sound) => (
          <ToggleButton key={sound.id} value={sound.id} sx={{ fontSize: 11, px: 1, minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sound.label}</span>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  )
}
