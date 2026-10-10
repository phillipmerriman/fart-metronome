import Slider from '@mui/material/Slider'
import { FieldLabel } from './FieldLabel'

interface Props {
  value: number
  onChange: (value: number) => void
}

export function VolumeSlider({ value, onChange }: Props) {
  const percent = Math.round(value * 100)
  return (
    <div>
      <FieldLabel id="volume-label" value={`${percent}%`}>
        Output gain
      </FieldLabel>
      <Slider
        value={percent}
        min={0}
        max={100}
        onChange={(_, next) => onChange((next as number) / 100)}
        aria-labelledby="volume-label"
        getAriaValueText={(v) => `${v}%`}
      />
    </div>
  )
}
