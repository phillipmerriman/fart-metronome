import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { Tick } from '../audio/engine'
import type { BeatLevel, Subdivision } from '../lib/tempo'
import { glowText, hud } from '../theme'

const HEX = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)'

const LEVEL_COLOR: Record<BeatLevel, string> = {
  accent: hud.amber,
  normal: hud.cyan,
  mute: hud.muted,
}

const LEVEL_NAME: Record<BeatLevel, string> = {
  accent: 'accented',
  normal: 'normal',
  mute: 'muted',
}

interface Props {
  pattern: BeatLevel[]
  subdivision: Subdivision
  tick: Tick | null
  running: boolean
  onCycle: (beat: number) => void
}

export function BeatIndicator({ pattern, subdivision, tick, running, onCycle }: Props) {
  const active = running ? tick : null

  return (
    <Box sx={{ display: 'grid', gap: 1, justifyItems: 'center' }}>
      <Box
        role="group"
        aria-label="Beat pattern"
        sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}
      >
        {pattern.map((level, beat) => {
          const color = LEVEL_COLOR[level]
          const muted = level === 'mute'
          const lit = active?.beat === beat
          const fill = muted ? alpha(color, 0.55) : color
          return (
            <Box key={beat} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
              <ButtonBase
                onClick={() => onCycle(beat)}
                aria-label={`Beat ${beat + 1}, ${LEVEL_NAME[level]}. Activate to change.`}
                sx={{
                  width: { xs: 38, sm: 46 },
                  aspectRatio: '1.15',
                  clipPath: HEX,
                  p: '1.5px',
                  background: lit ? fill : alpha(color, level === 'normal' ? 0.4 : 0.65),
                  filter: lit && !muted ? `drop-shadow(0 0 6px ${color})` : 'none',
                  transition: 'background 60ms, transform 80ms',
                  '&:hover': { background: color },
                  '&:active': { transform: 'scale(0.94)' },
                  '&.Mui-focusVisible': { background: hud.text },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: '100%',
                    height: '100%',
                    clipPath: HEX,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: hud.display,
                    fontWeight: 700,
                    fontSize: 14,
                    color: lit ? hud.bg : alpha(color, 0.9),
                    background: lit ? fill : `linear-gradient(180deg, ${alpha(color, 0.14)}, ${hud.panelSolid})`,
                    textShadow: lit || muted ? 'none' : glowText(color),
                    textDecoration: muted ? 'line-through' : 'none',
                    transition: 'background 60ms, color 60ms',
                  }}
                >
                  {beat + 1}
                </Box>
              </ButtonBase>
              <Box sx={{ display: 'flex', gap: '3px', height: 4, visibility: subdivision > 1 ? 'visible' : 'hidden' }}>
                {Array.from({ length: subdivision }, (_, sub) => {
                  const subLit = lit && active?.sub === sub
                  return (
                    <Box
                      key={sub}
                      sx={{
                        width: 6,
                        height: 4,
                        backgroundColor: subLit ? fill : alpha(color, 0.2),
                        boxShadow: subLit && !muted ? `0 0 6px ${color}` : 'none',
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          )
        })}
      </Box>
      <Typography
        variant="overline"
        sx={{ color: hud.textDim, fontSize: 9.5, lineHeight: 1.4, textAlign: 'center' }}
      >
        Tap a beat:{' '}
        <Box component="span" sx={{ color: hud.cyan }}>
          normal
        </Box>
        {' › '}
        <Box component="span" sx={{ color: hud.amber }}>
          accent
        </Box>
        {' › '}
        <Box component="span" sx={{ color: hud.muted }}>
          mute
        </Box>
      </Typography>
    </Box>
  )
}
