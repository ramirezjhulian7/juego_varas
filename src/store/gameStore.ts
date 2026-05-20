import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GamePhase = 'menu' | 'permission' | 'loading' | 'playing' | 'paused' | 'gameover'

type GameStore = {
  phase: GamePhase
  score: number
  lives: number
  level: number
  highScore: number
  soundEnabled: boolean
  // Stand mode: once the player accepts permission we keep the camera on
  // for the rest of the session, so transitions are instant and gameover
  // can be operated by hand.
  cameraStarted: boolean
  // Round timer. Active while phase === 'playing'; pauses cleanly across
  // 'paused' transitions; final value snapshotted into lastRoundMs at gameover.
  roundStartedAt: number | null
  roundPausedAt: number | null
  roundPausedTotalMs: number
  lastRoundMs: number

  setPhase: (phase: GamePhase) => void
  addScore: (points: number) => void
  loseLife: () => void
  setLevel: (level: number) => void
  resetRun: () => void
  toggleSound: () => void
}

function computeRoundMs(state: {
  roundStartedAt: number | null
  roundPausedAt: number | null
  roundPausedTotalMs: number
}) {
  if (state.roundStartedAt == null) return 0
  const pausedNow = state.roundPausedAt ? Date.now() - state.roundPausedAt : 0
  return Date.now() - state.roundStartedAt - state.roundPausedTotalMs - pausedNow
}

const INITIAL_LIVES = 3

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      phase: 'menu',
      score: 0,
      lives: INITIAL_LIVES,
      level: 1,
      highScore: 0,
      soundEnabled: true,
      cameraStarted: false,
      roundStartedAt: null,
      roundPausedAt: null,
      roundPausedTotalMs: 0,
      lastRoundMs: 0,

      setPhase: (phase) =>
        set((state) => {
          const next: Partial<GameStore> = {
            phase,
            cameraStarted: state.cameraStarted || phase === 'permission',
          }
          // Pause/resume timer based on phase transitions.
          if (phase === 'paused' && state.phase === 'playing') {
            next.roundPausedAt = Date.now()
          } else if (phase === 'playing' && state.phase === 'paused' && state.roundPausedAt) {
            next.roundPausedTotalMs = state.roundPausedTotalMs + (Date.now() - state.roundPausedAt)
            next.roundPausedAt = null
          } else if (phase === 'gameover' && state.phase !== 'gameover') {
            next.lastRoundMs = computeRoundMs(state)
          }
          return next
        }),
      addScore: (points) =>
        set((state) => {
          const score = state.score + points
          return {
            score,
            highScore: Math.max(score, state.highScore),
          }
        }),
      loseLife: () =>
        set((state) => {
          const lives = state.lives - 1
          if (lives <= 0) {
            return {
              lives: 0,
              phase: 'gameover' as GamePhase,
              lastRoundMs: computeRoundMs(state),
            }
          }
          return { lives }
        }),
      setLevel: (level) => set({ level }),
      resetRun: () =>
        set({
          score: 0,
          lives: INITIAL_LIVES,
          level: 1,
          phase: 'playing',
          roundStartedAt: Date.now(),
          roundPausedAt: null,
          roundPausedTotalMs: 0,
          lastRoundMs: 0,
        }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'reflejos-ia-store',
      partialize: (state) => ({
        highScore: state.highScore,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
)

export function getCurrentRoundMs() {
  return computeRoundMs(useGameStore.getState())
}

export function formatRoundTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
