import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { bevelClip, bevelEdges, hud } from '../theme'

const CUT = 16

const Frame = styled('section')({
  position: 'relative',
  clipPath: bevelClip(CUT),
  border: `1px solid ${hud.cyanDim}`,
  backgroundColor: hud.panel,
  backgroundImage: `${bevelEdges(CUT, hud.cyanDim)}, linear-gradient(180deg, rgba(63, 240, 255, 0.05), transparent 120px)`,
  backdropFilter: 'blur(3px)',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(160, 230, 255, 0.035) 0 1px, transparent 1px 3px)',
  },
})

const Bracket = styled('span')({
  position: 'absolute',
  width: 14,
  height: 14,
  borderColor: hud.cyan,
  borderStyle: 'solid',
  pointerEvents: 'none',
})

const Header = styled('header')({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: `8px 16px 8px ${CUT + 10}px`,
  borderBottom: `1px solid ${hud.cyanDim}`,
  background: `linear-gradient(90deg, rgba(63, 240, 255, 0.14), transparent 70%)`,
})

const StatusLight = styled('span', { shouldForwardProp: (prop) => prop !== 'active' })<{ active?: boolean }>(({ active }) => ({
  width: 8,
  height: 8,
  flexShrink: 0,
  transform: 'rotate(45deg)',
  backgroundColor: active ? hud.amber : hud.cyan,
  boxShadow: `0 0 8px ${active ? hud.amber : hud.cyan}`,
}))

const HeaderTicks = styled('span')({
  marginLeft: 'auto',
  width: 48,
  height: 8,
  flexShrink: 0,
  backgroundImage: `repeating-linear-gradient(90deg, ${hud.cyanDim} 0 3px, transparent 3px 6px)`,
})

interface Props {
  title: string
  code?: string
  active?: boolean
  children: ReactNode
}

export function ConsoleFrame({ title, code, active, children }: Props) {
  return (
    <Frame>
      <Bracket sx={{ top: 4, right: 4, borderWidth: '2px 2px 0 0' }} />
      <Bracket sx={{ bottom: 4, left: 4, borderWidth: '0 0 2px 2px' }} />
      <Header>
        <StatusLight active={active} />
        <Typography
          variant="overline"
          component="h2"
          noWrap
          sx={{ color: hud.cyan, fontSize: 11, lineHeight: 1.4, minWidth: 0 }}
        >
          {'// '}
          {title}
        </Typography>
        {code && (
          <Typography
            variant="overline"
            noWrap
            sx={{ color: hud.textDim, fontSize: 10, ml: 'auto', lineHeight: 1.4, flexShrink: 0 }}
          >
            {code}
          </Typography>
        )}
        <HeaderTicks sx={{ ml: code ? 1 : 'auto', display: { xs: 'none', sm: 'block' } }} />
      </Header>
      <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Frame>
  )
}
