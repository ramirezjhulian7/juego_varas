import { useEffect, useState } from 'react'
import { getCurrentRoundMs, useGameStore } from '../store/gameStore'

// Re-renders consumers ~4 times per second with the live round duration.
// We schedule updates from a timer (not from the effect body) to avoid
// the cascading-render lint rule, while still picking up the current value
// once the consumer mounts in any phase.
export function useRoundTimer() {
  const phase = useGameStore((s) => s.phase)
  const [ms, setMs] = useState(0)

  useEffect(() => {
    const update = () => setMs(getCurrentRoundMs())
    if (phase !== 'playing') {
      const t = window.setTimeout(update, 0)
      return () => window.clearTimeout(t)
    }
    const id = window.setInterval(update, 250)
    const initial = window.setTimeout(update, 0)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(initial)
    }
  }, [phase])

  return ms
}
