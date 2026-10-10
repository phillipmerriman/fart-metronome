import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import type { Tick } from '../audio/engine'
import type { Subdivision } from '../lib/tempo'
import { glowText, hud } from '../theme'

const HEX = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)'

interface Props {
  beats: number
  subdivision: Subdivision
  tick: Tick | null
  running: boolean
}

export function BeatIndicator({ beats, subdivision, tick, running }: Props) {
  const active = running ? tick : null

  return (
    <Box
      role="img"
      aria-label={active ? `Beat ${active.beat + 1} of ${beats}` : `${beats} beats per bar`}
      sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}
    >
      {Array.from({ length: beats }, (_, beat) => {
        const isAccent = beat === 0
        const color = isAccent ? hud.amber : hud.cyan
        const lit = active?.beat === beat
        return (
          <Box key={beat} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: { xs: 38, sm: 46 },
                aspectRatio: '1.15',
                clipPath: HEX,
                p: '1.5px',
                background: lit ? color : alpha(color, isAccent ? 0.6 : 0.35),
                filter: lit ? `drop-shadow(0 0 6px ${color})` : 'none',
                transition: 'background 60ms',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  clipPath: HEX,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: hud.display,
                  fontWeight: 700,
                  fontSize: 14,
                  color: lit ? hud.bg : alpha(color, 0.85),
                  background: lit ? color : `linear-gradient(180deg, ${alpha(color, 0.12)}, ${hud.panelSolid})`,
                  textShadow: lit ? 'none' : glowText(color),
                  transition: 'background 60ms, color 60ms',
                }}
              >
                {beat + 1}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: '3px', height: 4, visibility: subdivision > 1 ? 'visible' : 'hidden' }}>
              {Array.from({ length: Math.max(subdivision, 1) }, (_, sub) => {
                const subLit = lit && active?.sub === sub
                return (
                  <Box
                    key={sub}
                    sx={{
                      width: 6,
                      height: 4,
                      backgroundColor: subLit ? color : alpha(color, 0.2),
                      boxShadow: subLit ? `0 0 6px ${color}` : 'none',
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
