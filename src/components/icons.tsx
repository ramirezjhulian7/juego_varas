type IconProps = {
  className?: string
  strokeWidth?: number
}

const base = (className?: string) =>
  ['h-5 w-5 stroke-current', className].filter(Boolean).join(' ')

export const PlayIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14z" />
  </svg>
)

export const PauseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
    <rect x="6" y="5" width="4" height="14" rx="1.2" />
    <rect x="14" y="5" width="4" height="14" rx="1.2" />
  </svg>
)

export const HeartIcon = ({ filled = true, className }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden fill={filled ? 'currentColor' : 'none'} strokeWidth={2}>
    <path d="M12 21s-7.5-4.5-9.5-9C1 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 23 7.5 21.5 12c-2 4.5-9.5 9-9.5 9z" />
  </svg>
)

export const SoundOnIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
)

export const SoundOffIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    <path d="m22 9-6 6" />
    <path d="m16 9 6 6" />
  </svg>
)

export const HandIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 11V5a1.5 1.5 0 0 1 3 0v6" />
    <path d="M12 11V4a1.5 1.5 0 0 1 3 0v7" />
    <path d="M15 11V6a1.5 1.5 0 0 1 3 0v9a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-2.5a1.5 1.5 0 0 1 3 0V14" />
    <path d="M9 11.5V8a1.5 1.5 0 0 0-3 0v5" />
  </svg>
)

export const BoltIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={base(className)} aria-hidden>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
)

export const TrophyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M17 4h3v3a3 3 0 0 1-3 3" />
    <path d="M7 4H4v3a3 3 0 0 0 3 3" />
  </svg>
)

export const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

export const HomeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
)

export const ReloadIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12a9 9 0 1 1-3.5-7.1" />
    <path d="M21 4v5h-5" />
  </svg>
)
