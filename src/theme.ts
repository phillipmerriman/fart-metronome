import { alpha, createTheme } from '@mui/material/styles'

export const hud = {
  bg: '#05080f',
  panel: 'rgba(7, 18, 32, 0.78)',
  panelSolid: '#081422',
  cyan: '#3ff0ff',
  cyanDim: 'rgba(63, 240, 255, 0.35)',
  cyanFaint: 'rgba(63, 240, 255, 0.12)',
  amber: '#ffb83f',
  danger: '#ff4d5e',
  text: '#cfefff',
  textDim: '#6f93a8',
  display: '"Orbitron", "Rajdhani", system-ui, sans-serif',
  body: '"Rajdhani", system-ui, sans-serif',
}

/** Polygon with the top-left and bottom-right corners cut off. */
export function bevelClip(cut: number): string {
  return `polygon(${cut}px 0, 100% 0, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, 0 100%, 0 ${cut}px)`
}

/** Background layers drawing border lines along the corners removed by bevelClip. */
export function bevelEdges(cut: number, color: string): string {
  const d = cut * Math.SQRT1_2
  const line = (angle: number) =>
    `linear-gradient(${angle}deg, transparent ${d - 0.5}px, ${color} ${d - 0.5}px, ${color} ${d + 1}px, transparent ${d + 1}px)`
  return `${line(135)}, ${line(315)}`
}

export const glowText = (color: string) => `0 0 6px ${alpha(color, 0.8)}, 0 0 18px ${alpha(color, 0.35)}`

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: hud.cyan, contrastText: hud.bg },
    secondary: { main: hud.amber, contrastText: hud.bg },
    error: { main: hud.danger },
    background: { default: hud.bg, paper: hud.panelSolid },
    text: { primary: hud.text, secondary: hud.textDim },
    divider: hud.cyanDim,
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: hud.body,
    fontSize: 15,
    h1: { fontFamily: hud.display, fontWeight: 900, letterSpacing: '0.12em' },
    h2: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.1em' },
    h3: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.1em' },
    h4: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.1em' },
    h5: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.1em' },
    h6: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.12em' },
    overline: { fontFamily: hud.display, fontWeight: 500, letterSpacing: '0.25em', lineHeight: 1.6 },
    button: { fontFamily: hud.display, fontWeight: 700, letterSpacing: '0.18em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: hud.bg,
          backgroundImage: `radial-gradient(ellipse at 20% 10%, rgba(40, 80, 160, 0.25), transparent 55%),
            radial-gradient(ellipse at 85% 90%, rgba(120, 40, 140, 0.18), transparent 50%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '::selection': { background: alpha(hud.cyan, 0.3) },
        '@keyframes hud-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes hud-pulse': {
          from: { transform: 'scale(0.82)', opacity: 0.9 },
          to: { transform: 'scale(1.18)', opacity: 0 },
        },
        '@keyframes hud-blink': {
          '0%, 60%': { opacity: 1 },
          '61%, 100%': { opacity: 0.25 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.hud-anim': { animation: 'none !important', display: 'none' },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          clipPath: bevelClip(8),
          border: `1px solid ${hud.cyanDim}`,
          color: hud.cyan,
          backgroundImage: `${bevelEdges(8, hud.cyanDim)}, linear-gradient(180deg, ${alpha(hud.cyan, 0.12)}, ${alpha(hud.cyan, 0.02)})`,
          padding: '8px 18px',
          transition: 'box-shadow 120ms, background-color 120ms, color 120ms',
          '&:hover': {
            backgroundColor: alpha(hud.cyan, 0.08),
            boxShadow: `inset 0 0 14px ${alpha(hud.cyan, 0.35)}`,
            textShadow: glowText(hud.cyan),
          },
          '&:active': {
            backgroundColor: alpha(hud.cyan, 0.22),
          },
          '&.Mui-focusVisible': {
            outline: `1px solid ${hud.cyan}`,
            outlineOffset: -4,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          display: 'grid',
          gap: 6,
        },
        grouped: {
          '&&': {
            margin: 0,
            border: `1px solid ${hud.cyanDim}`,
            borderRadius: 0,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: hud.display,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: hud.textDim,
          clipPath: bevelClip(6),
          backgroundImage: bevelEdges(6, hud.cyanDim),
          backgroundColor: alpha(hud.cyan, 0.03),
          padding: '8px 4px',
          transition: 'box-shadow 120ms, background-color 120ms, color 120ms',
          '&:hover': {
            color: hud.text,
            backgroundColor: alpha(hud.cyan, 0.08),
          },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: hud.cyan,
            backgroundColor: alpha(hud.cyan, 0.16),
            boxShadow: `inset 0 0 14px ${alpha(hud.cyan, 0.45)}`,
            textShadow: glowText(hud.cyan),
          },
          '&.Mui-focusVisible': {
            outline: `1px solid ${hud.cyan}`,
            outlineOffset: -4,
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 10, padding: '14px 0' },
        rail: { borderRadius: 0, opacity: 1, backgroundColor: alpha(hud.cyan, 0.12) },
        track: {
          borderRadius: 0,
          border: 'none',
          backgroundColor: 'transparent',
          backgroundImage: `repeating-linear-gradient(90deg, ${hud.cyan} 0 5px, transparent 5px 8px)`,
          filter: `drop-shadow(0 0 4px ${alpha(hud.cyan, 0.7)})`,
        },
        thumb: {
          width: 14,
          height: 24,
          borderRadius: 0,
          backgroundColor: hud.text,
          clipPath: 'polygon(50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%, 0 20%)',
          '&::before': { boxShadow: 'none' },
          '&:hover, &.Mui-focusVisible, &.Mui-active': {
            boxShadow: 'none',
            backgroundColor: hud.cyan,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: hud.panel,
          border: `1px solid ${hud.cyanDim}`,
        },
      },
    },
  },
})
