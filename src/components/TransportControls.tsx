import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import { bevelClip, bevelEdges, glowText, hud } from '../theme'

interface Props {
  running: boolean
  onToggle: () => void
  onTap: () => void
  onNudge: (delta: number) => void
}

const nudgeSx = { minWidth: 0, px: { xs: 1, sm: 1.5 }, fontSize: 13 }

export function TransportControls({ running, onToggle, onTap, onNudge }: Props) {
  const engageColor = running ? hud.danger : hud.amber

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(4, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr)) minmax(0, 2.4fr) repeat(2, minmax(0, 1fr))',
          },
          gap: { xs: 0.75, sm: 1 },
          alignItems: 'stretch',
        }}
      >
        <Button sx={nudgeSx} onClick={() => onNudge(-5)} aria-label="Decrease tempo by 5">
          −5
        </Button>
        <Button sx={nudgeSx} onClick={() => onNudge(-1)} aria-label="Decrease tempo by 1">
          −1
        </Button>
        <Button
          onClick={onToggle}
          aria-pressed={running}
          sx={{
            gridColumn: { xs: '1 / -1', sm: 'auto' },
            order: { xs: -1, sm: 0 },
            py: 1.75,
            fontSize: { xs: 13, sm: 16 },
            color: engageColor,
            borderColor: alpha(engageColor, 0.6),
            clipPath: bevelClip(12),
            backgroundImage: `${bevelEdges(12, alpha(engageColor, 0.6))}, linear-gradient(180deg, ${alpha(engageColor, 0.22)}, ${alpha(engageColor, 0.04)})`,
            textShadow: glowText(engageColor),
            boxShadow: running ? `inset 0 0 22px ${alpha(engageColor, 0.45)}` : 'none',
            '&:hover': {
              backgroundColor: alpha(engageColor, 0.1),
              boxShadow: `inset 0 0 22px ${alpha(engageColor, 0.5)}`,
              textShadow: glowText(engageColor),
            },
            '&:active': { backgroundColor: alpha(engageColor, 0.25) },
          }}
        >
          {running ? 'Disengage' : 'Engage'}
        </Button>
        <Button sx={nudgeSx} onClick={() => onNudge(1)} aria-label="Increase tempo by 1">
          +1
        </Button>
        <Button sx={nudgeSx} onClick={() => onNudge(5)} aria-label="Increase tempo by 5">
          +5
        </Button>
      </Box>
      <Button onClick={onTap} sx={{ py: 1.25 }}>
        Tap tempo
      </Button>
    </Box>
  )
}
