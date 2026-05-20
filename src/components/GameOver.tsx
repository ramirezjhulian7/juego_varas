import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { HomeIcon, ReloadIcon, TrophyIcon } from './icons'

export function GameOver() {
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const resetRun = useGameStore((s) => s.resetRun)
  const setPhase = useGameStore((s) => s.setPhase)
  const isNewRecord = score > 0 && score >= highScore

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-ax-primary/45 px-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Juego terminado"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="surface-1 w-full max-w-md rounded-3xl p-8 text-center"
      >
        {isNewRecord ? (
          <span className="pill text-ax-electric">
            <TrophyIcon className="h-3.5 w-3.5 text-ax-electric" />
            Nuevo récord
          </span>
        ) : (
          <span className="pill text-ax-textMuted">Fin de la partida</span>
        )}

        <h2 className="font-display mt-4 text-4xl font-bold text-ax-text">
          {isNewRecord ? 'Imparable' : 'Buen intento'}
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <Stat label="Puntos" value={score} accent />
          <Stat label="Récord" value={highScore} />
        </div>

        <div className="mt-7 grid gap-3">
          <button onClick={() => resetRun()} className="btn-primary rounded-2xl py-4 text-base">
            <ReloadIcon className="mr-2 h-4 w-4" />
            Jugar de nuevo
          </button>
          <button onClick={() => setPhase('menu')} className="btn-ghost rounded-2xl py-3 text-sm">
            <HomeIcon className="mr-2 h-4 w-4" />
            Menú principal
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="stat-card">
      <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-ax-textDim">{label}</div>
      <div
        className={`font-display mt-1 text-3xl font-bold tabular-nums ${
          accent
            ? 'bg-gradient-to-r from-ax-primary via-ax-secondary to-ax-electric bg-clip-text text-transparent'
            : 'text-ax-text'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
