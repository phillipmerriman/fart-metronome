import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  speed: number
  phase: number
}

const LAYERS = [
  { count: 140, r: 0.6, speed: 4 },
  { count: 60, r: 1.1, speed: 9 },
  { count: 18, r: 1.7, speed: 18 },
]

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let stars: Star[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = LAYERS.flatMap((layer) =>
        Array.from({ length: layer.count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: layer.r * (0.6 + Math.random() * 0.8),
          speed: layer.speed,
          phase: Math.random() * Math.PI * 2,
        })),
      )
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      for (const s of stars) {
        const twinkle = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t / 900 + s.phase)
        ctx.globalAlpha = twinkle
        ctx.fillStyle = s.r > 1.5 ? '#bff8ff' : '#e6f4ff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduceMotion) {
      draw(0)
      return () => window.removeEventListener('resize', resize)
    }

    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      for (const s of stars) {
        s.x -= s.speed * dt
        if (s.x < -2) {
          s.x = width + 2
          s.y = Math.random() * height
        }
      }
      draw(now)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
