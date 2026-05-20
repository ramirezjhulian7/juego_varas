import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { HomeIcon, PlayIcon } from './icons'

export function PauseOverlay() {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-ax-primary/40 px-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Juego en pausa"
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="surface-1 w-full max-w-sm rounded-3xl p-8 text-center"
      >
        <span className="pill text-ax-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-ax-electric" />
          Pausa
        </span>
        <h2 className="font-display mt-4 text-3xl font-bold text-ax-text">Tomate aire</h2>
        <p className="mt-2 text-sm text-ax-textMuted">El juego está esperándote.</p>
        <div className="mt-6 grid gap-3">
          <button onClick={() => setPhase('playing')} className="btn-primary rounded-2xl py-3 text-sm">
            <PlayIcon className="mr-2 h-4 w-4" />
            Reanudar
          </button>
          <button onClick={() => setPhase('menu')} className="btn-ghost rounded-2xl py-3 text-sm">
            <HomeIcon className="mr-2 h-4 w-4" />
            Salir al menú
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
