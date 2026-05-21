import { useEffect, useRef } from 'react'
import type { HandPoint } from '../hooks/useHandTracker'

type Props = {
  landmarksRef: React.MutableRefObject<HandPoint[]>
}

const MAX_CURSORS = 2

// Renders small markers at the player's fingertips when the game UI is
// expecting hand-driven input (e.g. GameOver). Mirrors PhaserGame's hand
// markers so the player gets consistent visual feedback.
export function HandCursor({ landmarksRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let raf = 0

    const tick = () => {
      const points = landmarksRef.current
      const w = window.innerWidth
      const h = window.innerHeight
      const visible = Math.min(points.length, MAX_CURSORS)

      const size = 56 // visible "hand" disk; matches the hand marker's vibe.
      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i]
        if (i < visible) {
          const p = points[i]
          dot.style.transform = `translate(${p.x * w - size / 2}px, ${p.y * h - size / 2}px)`
          dot.style.opacity = '1'
        } else {
          dot.style.opacity = '0'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [landmarksRef])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-50">
      {Array.from({ length: MAX_CURSORS }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) dotsRef.current[i] = el
          }}
          className="absolute left-0 top-0 h-14 w-14 rounded-full bg-ax-electric/30 ring-4 ring-white shadow-[0_0_24px_rgba(75,162,255,0.9)] transition-opacity duration-100"
          style={{ opacity: 0 }}
          aria-hidden
        />
      ))}
    </div>
  )
}
