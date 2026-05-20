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

  setPhase: (phase: GamePhase) => void
  addScore: (points: number) => void
  loseLife: () => void
  setLevel: (level: number) => void
  resetRun: () => void
  toggleSound: () => void
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

      setPhase: (phase) => set({ phase }),
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
            return { lives: 0, phase: 'gameover' as GamePhase }
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
