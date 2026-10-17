import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import type { Tick } from '../audio/engine'
import { SAMPLE_SOUNDS } from '../audio/sounds'
import { fartLevel, isFartLevel, type BeatLevel, type Subdivision } from '../lib/tempo'
import { glowText, hud } from '../theme'

const HEX = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)'

const SOUND_OPTIONS: { level: BeatLevel; label: string }[] = [
  { level: 'normal', label: 'Click' },
  { level: 'accent', label: 'Accent click' },
  ...SAMPLE_SOUNDS.map((sound) => ({ level: fartLevel(sound.id), label: sound.label })),
  { level: 'mute', label: 'Mute' },
]

function levelColor(level: BeatLevel): string {
  if (isFartLevel(level)) return hud.fart
  return level === 'accent' ? hud.amber : level === 'mute' ? hud.muted : hud.cyan
}

function levelLabel(level: BeatLevel): string {
  return SOUND_OPTIONS.find((o) => o.level === level)?.label ?? 'Fart'
}

interface Props {
  pattern: BeatLevel[]
  subdivision: Subdivision
  tick: Tick | null
  running: boolean
  onChange: (beat: number, level: BeatLevel) => void
}

export function BeatIndicator({ pattern, subdivision, tick, running, onChange }: Props) {
  const active = running ? tick : null
  const [open, setOpen] = useState<{ beat: number; anchor: HTMLElement } | null>(null)

  return (
    <Box sx={{ display: 'grid', gap: 1, justifyItems: 'center' }}>
      <Box
        role="group"
        aria-label="Beat pattern"
        sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}
      >
        {pattern.map((level, beat) => {
          const color = levelColor(level)
          const muted = level === 'mute'
          const lit = active?.beat === beat
          const fill = muted ? alpha(color, 0.55) : color
          return (
            <Box key={beat} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
              <ButtonBase
                onClick={(e) => setOpen({ beat, anchor: e.currentTarget })}
                aria-label={`Beat ${beat + 1}: ${levelLabel(level)}. Choose sound.`}
                aria-haspopup="menu"
                aria-expanded={open?.beat === beat}
                aria-controls={open?.beat === beat ? 'beat-sound-menu' : undefined}
                sx={{
                  width: { xs: 38, sm: 46 },
                  aspectRatio: '1.15',
                  clipPath: HEX,
                  p: '1.5px',
                  background: lit || open?.beat === beat ? fill : alpha(color, level === 'normal' ? 0.4 : 0.65),
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
      <Menu
        id="beat-sound-menu"
        anchorEl={open?.anchor}
        open={open !== null}
        onClose={() => setOpen(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: { mt: 1, minWidth: 180, backdropFilter: 'blur(8px)', boxShadow: `0 0 18px ${alpha(hud.cyan, 0.18)}` },
          },
          list: { dense: true, 'aria-label': open ? `Beat ${open.beat + 1} sound` : undefined },
        }}
      >
        <Typography
          component="li"
          role="presentation"
          variant="overline"
          sx={{ display: 'block', px: 2, pt: 0.5, pb: 0.75, color: hud.textDim, fontSize: 9.5 }}
        >
          Beat {open ? open.beat + 1 : ''} sound
        </Typography>
        {SOUND_OPTIONS.map(({ level, label }) => {
          const color = levelColor(level)
          return (
            <MenuItem
              key={level}
              selected={open !== null && pattern[open.beat] === level}
              onClick={() => {
                if (open) onChange(open.beat, level)
                setOpen(null)
              }}
              sx={{
                gap: 1.5,
                fontFamily: hud.display,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: alpha(color, 0.85),
                '&:hover': { backgroundColor: alpha(color, 0.1), color },
                '&.Mui-selected, &.Mui-selected:hover': {
                  backgroundColor: alpha(color, 0.16),
                  color,
                  textShadow: glowText(color),
                },
                '&.Mui-focusVisible': {
                  backgroundColor: alpha(color, 0.12),
                  outline: `1px solid ${color}`,
                  outlineOffset: -1,
                },
              }}
            >
              <Box component="span" sx={{ width: 12, aspectRatio: '1.15', clipPath: HEX, flexShrink: 0, background: color }} />
              {label}
            </MenuItem>
          )
        })}
      </Menu>
      <Typography
        variant="overline"
        sx={{ color: hud.textDim, fontSize: 9.5, lineHeight: 1.4, textAlign: 'center' }}
      >
        Tap a beat to pick its sound:{' '}
        <Box component="span" sx={{ color: hud.cyan }}>
          click
        </Box>
        {' · '}
        <Box component="span" sx={{ color: hud.amber }}>
          accent
        </Box>
        {' · '}
        <Box component="span" sx={{ color: hud.fart }}>
          fart
        </Box>
        {' · '}
        <Box component="span" sx={{ color: hud.muted }}>
          mute
        </Box>
      </Typography>
    </Box>
  )
}
