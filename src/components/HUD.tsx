import { motion } from 'framer-motion'
import { formatRoundTime, useGameStore } from '../store/gameStore'
import { useRoundTimer } from '../hooks/useRoundTimer'
import { HeartIcon, PauseIcon, SoundOffIcon, SoundOnIcon } from './icons'
import { Logo } from './Logo'

export function HUD() {
  const score = useGameStore((s) => s.score)
  const lives = useGameStore((s) => s.lives)
  const level = useGameStore((s) => s.level)
  const highScore = useGameStore((s) => s.highScore)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const setPhase = useGameStore((s) => s.setPhase)
  const roundMs = useRoundTimer()

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="surface-1 pointer-events-auto rounded-2xl px-5 py-3"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <Logo variant="mark" className="h-7 w-7 shrink-0" />
          <div>
            <div className="font-display text-[10px] font-medium uppercase tracking-[0.28em] text-ax-textMuted">
              Puntos
            </div>
            <motion.div
              key={score}
              initial={{ scale: 1.2, color: '#4BA2FF' }}
              animate={{ scale: 1, color: '#050B49' }}
              transition={{ duration: 0.25 }}
              className="font-display text-3xl font-bold leading-none tabular-nums sm:text-4xl"
            >
              {score}
            </motion.div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-ax-textDim">
          <span>Nivel {level}</span>
          <span className="text-ax-textDim/50">·</span>
          <span>Récord {highScore}</span>
          <span className="text-ax-textDim/50 sm:hidden">·</span>
          <span className="tabular-nums sm:hidden">{formatRoundTime(roundMs)}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="surface-1 pointer-events-auto hidden rounded-2xl px-5 py-3 text-center sm:block"
        aria-label="Tiempo de la ronda"
      >
        <div className="font-display text-[10px] font-medium uppercase tracking-[0.28em] text-ax-textMuted">
          Tiempo
        </div>
        <div className="font-display text-3xl font-bold leading-none tabular-nums text-ax-text sm:text-4xl">
          {formatRoundTime(roundMs)}
        </div>
      </motion.div>

      <div className="pointer-events-auto flex items-center gap-2">
        <div
          className="surface-1 flex items-center gap-1.5 rounded-2xl px-3.5 py-3"
          role="group"
          aria-label={`Vidas restantes: ${lives}`}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{
                scale: i < lives ? 1 : 0.7,
                opacity: i < lives ? 1 : 0.3,
              }}
              transition={{ duration: 0.25 }}
              className={i < lives ? 'text-ax-error' : 'text-ax-borderStrong'}
              aria-hidden
            >
              <HeartIcon className="h-5 w-5" filled={i < lives} />
            </motion.span>
          ))}
        </div>
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
          aria-pressed={soundEnabled}
          className="icon-btn"
        >
          {soundEnabled ? <SoundOnIcon className="h-5 w-5" /> : <SoundOffIcon className="h-5 w-5" />}
        </button>
        <button onClick={() => setPhase('paused')} aria-label="Pausar juego" className="icon-btn">
          <PauseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
