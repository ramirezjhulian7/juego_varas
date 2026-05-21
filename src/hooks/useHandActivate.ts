import { useEffect, useRef, useState } from 'react'
import type { HandPoint } from './useHandTracker'

type Options = {
  active?: boolean
  dwellMs?: number
}

// Activates a button when at least one hand point dwells inside its
// bounding rect for `dwellMs`. Used to make GameOver buttons selectable
// without touching the screen at the stand.
export function useHandActivate(
  targetRef: React.RefObject<HTMLElement | null>,
  landmarksRef: React.MutableRefObject<HandPoint[]>,
  onActivate: () => void,
  { active = true, dwellMs = 700 }: Options = {},
) {
  const [progress, setProgress] = useState(0)
  const onActivateRef = useRef(onActivate)
  useEffect(() => {
    onActivateRef.current = onActivate
  }, [onActivate])

  useEffect(() => {
    if (!active) return
    let raf = 0
    let dwellStart = 0
    let triggered = false
    let lastEmitted = -1

    const emit = (p: number) => {
      if (p !== lastEmitted) {
        lastEmitted = p
        setProgress(p)
      }
    }

    const tick = () => {
      const el = targetRef.current
      if (!el) {
        raf = requestAnimationFrame(tick)
        return
      }
      const rect = el.getBoundingClientRect()
      const points = landmarksRef.current
      const w = window.innerWidth
      const h = window.innerHeight

      let hovering = false
      for (const p of points) {
        const px = p.x * w
        const py = p.y * h
        if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
          hovering = true
          break
        }
      }

      const now = performance.now()
      if (hovering) {
        if (dwellStart === 0) dwellStart = now
        const p = Math.min(1, (now - dwellStart) / dwellMs)
        emit(p)
        if (p >= 1 && !triggered) {
          triggered = true
          onActivateRef.current()
        }
      } else {
        if (dwellStart !== 0) dwellStart = 0
        if (triggered) triggered = false
        emit(0)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, dwellMs, landmarksRef, targetRef])

  return progress
}
