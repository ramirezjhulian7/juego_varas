import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { AlertIcon, CheckIcon, HomeIcon, PlayIcon } from './icons'
import { Logo } from './Logo'

type Props = {
  cameraReady: boolean
  trackerReady: boolean
  cameraError: string | null
  trackerError: string | null
}

export function PermissionGate({ cameraReady, trackerReady, cameraError, trackerError }: Props) {
  const setPhase = useGameStore((s) => s.setPhase)
  const resetRun = useGameStore((s) => s.resetRun)
  const error = cameraError || trackerError
  const ready = cameraReady && trackerReady

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
    >
      <Logo className="mb-6 inline-block h-8" />

      <div
        className="surface-1 w-full max-w-md rounded-3xl p-8 text-center"
        role="alert"
        aria-live="polite"
      >
        {!error && !ready && (
          <>
            <Spinner />
            <h2 className="font-display mt-6 text-2xl font-bold text-ax-text">Preparando arena</h2>
            <p className="mt-3 text-sm text-ax-textMuted">
              {!cameraReady ? 'Acepta el permiso de cámara en tu navegador.' : null}
              {cameraReady && !trackerReady ? 'Cargando modelo de IA (~10 MB la primera vez).' : null}
            </p>
            <ProgressTrack stage={cameraReady ? 1 : 0} />
          </>
        )}

        {error && (
          <>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-ax-error ring-1 ring-ax-error/30">
              <AlertIcon className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ax-text">Algo salió mal</h2>
            <p className="mt-3 text-sm text-ax-textMuted">{error}</p>
            <button
              onClick={() => setPhase('menu')}
              className="btn-ghost mt-6 w-full rounded-2xl py-3 text-sm"
            >
              <HomeIcon className="mr-2 h-4 w-4" />
              Volver al menú
            </button>
          </>
        )}

        {ready && !error && (
          <>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ax-electric/10 text-ax-electric ring-1 ring-ax-electric/30">
              <CheckIcon className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ax-text">¡Todo listo!</h2>
            <p className="mt-3 text-sm text-ax-textMuted">
              Posiciona tus manos frente a la cámara y atrapa los bastones que caen.
            </p>
            <button
              onClick={() => resetRun()}
              className="btn-primary mt-6 w-full rounded-2xl py-4 text-base"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              ¡A jugar!
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

function Spinner() {
  return (
    <div className="mx-auto h-14 w-14">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        className="h-full w-full rounded-full border-2 border-ax-border border-t-ax-electric"
      />
    </div>
  )
}

function ProgressTrack({ stage }: { stage: 0 | 1 }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2" aria-hidden>
      <div
        className={`h-1.5 rounded-full transition-colors duration-300 ${
          stage >= 0 ? 'bg-ax-electric' : 'bg-ax-border'
        }`}
      />
      <div
        className={`h-1.5 rounded-full transition-colors duration-300 ${
          stage >= 1 ? 'bg-ax-aqua' : 'bg-ax-border'
        }`}
      />
    </div>
  )
}
