import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n/useT'
import { PlayIcon } from './icons'
import { LanguageToggle } from './LanguageToggle'
import { Logo } from './Logo'

export function MainMenu() {
  const setPhase = useGameStore((s) => s.setPhase)
  const t = useT()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
    >
      <BackgroundDecor />

      <LanguageToggle className="absolute right-5 top-5" />

      <Logo className="mb-7 h-16" />

      <motion.section
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="surface-1 relative w-full max-w-md rounded-3xl p-8 text-center sm:p-10"
      >
        <span className="pill mb-6 text-ax-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-ax-electric shadow-[0_0_8px_rgba(75,162,255,0.7)]" />
          {t('menuPill')}
        </span>

        <p className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-ax-text sm:text-4xl">
          <span className="block font-display text-6xl font-extrabold tracking-tight bg-gradient-to-r from-ax-primary via-ax-secondary to-ax-electric bg-clip-text text-transparent sm:text-7xl">
            {t('menuLeadHighlight')}
          </span>
          <span className="mt-3 block text-2xl font-semibold leading-[1.2] text-ax-textMuted sm:text-3xl">
            {t('menuLeadRest').trim()}
          </span>
        </p>

        <button
          onClick={() => setPhase('permission')}
          className="btn-primary mt-10 w-full rounded-2xl py-5 text-base"
        >
          <PlayIcon className="mr-2 h-4 w-4 text-white" />
          {t('startCta')}
        </button>

        <p className="mt-4 text-[11px] uppercase tracking-widest text-ax-textDim">
          {t('cameraNote')}
        </p>
      </motion.section>

      <p className="mt-6 text-center text-xs text-ax-textDim">{t('poweredBy')}</p>
    </motion.div>
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
