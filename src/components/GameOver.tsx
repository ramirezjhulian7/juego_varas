import { useRef } from 'react'
import { motion } from 'framer-motion'
import { formatRoundTime, useGameStore } from '../store/gameStore'
import { useT } from '../i18n/useT'
import { HomeIcon, ReloadIcon, TrophyIcon } from './icons'
import { Logo } from './Logo'
import { useHandActivate } from '../hooks/useHandActivate'
import type { HandPoint } from '../hooks/useHandTracker'

type Props = {
  landmarksRef: React.MutableRefObject<HandPoint[]>
}

export function GameOver({ landmarksRef }: Props) {
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const lastRoundMs = useGameStore((s) => s.lastRoundMs)
  const resetRun = useGameStore((s) => s.resetRun)
  const setPhase = useGameStore((s) => s.setPhase)
  const t = useT()
  const isNewRecord = score > 0 && score >= highScore

  const replayRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)

  const replayProgress = useHandActivate(replayRef, landmarksRef, () => resetRun())
  const menuProgress = useHandActivate(menuRef, landmarksRef, () => setPhase('menu'))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ax-primary/45 px-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={t('gameOverPillEnd')}
    >
      <Logo className="mb-6 h-14" />

      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="surface-1 w-full max-w-md rounded-3xl p-8 text-center"
      >
        {isNewRecord ? (
          <span className="pill text-ax-electric">
            <TrophyIcon className="h-3.5 w-3.5 text-ax-electric" />
            {t('gameOverPillRecord')}
          </span>
        ) : (
          <span className="pill text-ax-textMuted">{t('gameOverPillEnd')}</span>
        )}

        <h2 className="font-display mt-4 text-4xl font-bold text-ax-text">
          {isNewRecord ? t('gameOverTitleRecord') : t('gameOverTitleTry')}
        </h2>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <Stat label={t('statPoints')} value={score} accent />
          <Stat label={t('statTime')} value={formatRoundTime(lastRoundMs)} />
          <Stat label={t('statRecord')} value={highScore} />
        </div>

        <div className="mt-7 grid gap-3">
          <DwellButton
            buttonRef={replayRef}
            progress={replayProgress}
            onClick={() => resetRun()}
            className="btn-primary rounded-2xl py-4 text-base"
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            {t('gameOverPlayAgain')}
          </DwellButton>
          <DwellButton
            buttonRef={menuRef}
            progress={menuProgress}
            onClick={() => setPhase('menu')}
            className="btn-ghost rounded-2xl py-3 text-sm"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            {t('gameOverMainMenu')}
          </DwellButton>
        </div>

        <p className="mt-5 text-[11px] uppercase tracking-widest text-ax-textDim">
          {t('gameOverHint')}
        </p>
      </motion.div>
    </motion.div>
  )
}

function DwellButton({
  buttonRef,
  progress,
  onClick,
  className,
  children,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>
  progress: number
  onClick: () => void
  className: string
  children: React.ReactNode
}) {
  return (
    <button ref={buttonRef} onClick={onClick} className={`relative overflow-hidden ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 bg-ax-electric/30 transition-[width] duration-75"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="relative flex items-center justify-center">{children}</span>
    </button>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className="stat-card">
      <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-ax-textDim">{label}</div>
      <div
        className={`font-display mt-1 text-2xl font-bold tabular-nums ${
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
