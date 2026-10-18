import { useCallback, useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

const isFullscreen = () => document.fullscreenElement !== null

/** Real (Fullscreen API) fullscreen for the whole page, not just a maximized browser window. */
export function useFullscreen() {
  const active = useSyncExternalStore(subscribe, isFullscreen, () => false)
  // iPhone Safari only allows fullscreen on video elements.
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled

  const toggle = useCallback(() => {
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    // Rejects if the browser refuses (e.g. not triggered by a user gesture); nothing to recover.
    request.catch(() => {})
  }, [])

  return { active, supported, toggle }
}
