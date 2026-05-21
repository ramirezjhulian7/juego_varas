import { useGameStore } from '../store/gameStore'
import { useT } from '../i18n/useT'

type Props = {
  className?: string
}

export function LanguageToggle({ className }: Props) {
  const locale = useGameStore((s) => s.locale)
  const setLocale = useGameStore((s) => s.setLocale)
  const t = useT()

  const next = locale === 'es' ? 'en' : 'es'

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t('langToggleAria')}
      className={`pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-ax-border bg-ax-surface/90 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ax-textMuted shadow-soft backdrop-blur-md transition-colors hover:border-ax-aquaSoft hover:text-ax-text ${className ?? ''}`}
    >
      <span
        aria-hidden
        className={`flex h-6 w-9 items-center justify-center overflow-hidden rounded-md ring-1 ring-ax-border ${
          locale === 'es' ? 'ring-2 ring-ax-electric' : ''
        }`}
      >
        <ColombiaFlag />
      </span>
      <span aria-hidden className="text-ax-textDim">/</span>
      <span
        aria-hidden
        className={`flex h-6 w-9 items-center justify-center overflow-hidden rounded-md ring-1 ring-ax-border ${
          locale === 'en' ? 'ring-2 ring-ax-electric' : ''
        }`}
      >
        <UsaFlag />
      </span>
      <span className="sr-only">{locale.toUpperCase()}</span>
    </button>
  )
}

function ColombiaFlag() {
  return (
    <svg viewBox="0 0 9 6" className="h-full w-full" preserveAspectRatio="none">
      <rect width="9" height="3" fill="#FCD116" />
      <rect y="3" width="9" height="1.5" fill="#003893" />
      <rect y="4.5" width="9" height="1.5" fill="#CE1126" />
    </svg>
  )
}

function UsaFlag() {
  // 13 stripes + canton with a small grid of stars (stylized at this size).
  return (
    <svg viewBox="0 0 19 10" className="h-full w-full" preserveAspectRatio="none">
      <rect width="19" height="10" fill="#B22234" />
      {[1, 3, 5, 7, 9].map((y) => (
        <rect key={y} y={y} width="19" height="1" fill="#ffffff" />
      ))}
      <rect width="8" height="6" fill="#3C3B6E" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={1 + col * 2}
            cy={1 + row * 2}
            r={0.45}
            fill="#ffffff"
          />
        )),
      )}
    </svg>
  )
}
