import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { BoltIcon, HandIcon, PlayIcon, TrophyIcon } from './icons'
import { Logo } from './Logo'

export function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const highScore = useGameStore((s) => s.highScore)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
    >
      <BackgroundDecor />

      <Logo className="mb-7 h-16" />

      <motion.section
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="surface-1 relative w-full max-w-md rounded-3xl p-8 text-center sm:p-10"
      >
        <span className="pill mb-5 text-ax-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-ax-electric shadow-[0_0_8px_rgba(75,162,255,0.7)]" />
          IA en tu navegador
        </span>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ax-text sm:text-6xl">
          Reflejos
          <br />
          <span className="bg-gradient-to-r from-ax-primary via-ax-secondary to-ax-electric bg-clip-text text-transparent">
            IA
          </span>
        </h1>

        <p className="mt-5 text-base leading-relaxed text-ax-textMuted">
          Atrapa los cerditos que caen moviendo tus manos frente a la cámara.
          Detección en tiempo real, sin instalación.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <Tip icon={<HandIcon className="h-5 w-5 text-ax-secondary" />} label="Mueve tus manos" />
          <Tip icon={<BoltIcon className="h-5 w-5 text-ax-electric" />} label="Reflejos rápidos" />
          <Tip icon={<TrophyIcon className="h-5 w-5 text-ax-primary" />} label={`Récord ${highScore}`} />
        </div>

        <button
          onClick={() => setPhase('permission')}
          className="btn-primary mt-8 w-full rounded-2xl py-4 text-[15px]"
        >
          <PlayIcon className="mr-2 h-4 w-4 text-white" />
          Comenzar a jugar
        </button>

        <p className="mt-4 text-[11px] uppercase tracking-widest text-ax-textDim">
          Necesitamos acceso a tu cámara
        </p>
      </motion.section>

      <p className="mt-6 text-center text-xs text-ax-textDim">
        Powered by <span className="font-medium text-ax-secondary">Asimetrix</span> · Visión por computadora
      </p>
    </motion.div>
  )
}

function Tip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="stat-card text-left">
      <div className="mb-1.5">{icon}</div>
      <div className="text-xs leading-tight text-ax-textMuted">{label}</div>
    </div>
  )
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-ax-electric/15 blur-3xl" />
      <div className="absolute -right-16 top-1/2 h-72 w-72 rounded-full bg-ax-aqua/15 blur-3xl" />
      <div className="absolute bottom-12 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-ax-aquaSoft/20 blur-3xl" />
    </div>
  )
}
