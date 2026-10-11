import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { hud } from '../theme'

interface Props {
  id?: string
  children: ReactNode
  value?: ReactNode
}

export function FieldLabel({ id, children, value }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
      <Typography id={id} variant="overline" sx={{ color: hud.textDim, fontSize: 10.5, lineHeight: 1.4 }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, borderBottom: `1px dashed ${hud.cyanFaint}`, alignSelf: 'center' }} />
      {value !== undefined && (
        <Typography
          variant="overline"
          sx={{ color: hud.cyan, fontSize: 11, lineHeight: 1.4, fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>
      )}
    </Box>
  )
}
