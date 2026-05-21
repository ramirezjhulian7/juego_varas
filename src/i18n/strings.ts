export type Locale = 'es' | 'en'

export const STRINGS = {
  // MainMenu
  menuPill: { es: 'IA en tu navegador', en: 'AI in your browser' },
  menuTitleA: { es: 'Reflejos', en: 'Reflex' },
  menuTitleB: { es: 'IA', en: 'AI' },
  menuLead: {
    es: 'Atrapa la tocineta y las salchichas que caen moviendo tus manos frente a la cámara. Participa por premios.',
    en: 'Catch the bacon and sausages that fall by moving your hands in front of the camera. Play to win prizes.',
  },
  menuLeadHighlight: { es: 'Atrapa', en: 'Catch' },
  menuLeadRest: {
    es: ' la tocineta y las salchichas que caen moviendo tus manos frente a la cámara. Participa por premios.',
    en: ' the bacon and sausages that fall by moving your hands in front of the camera. Play to win prizes.',
  },
  tipMove: { es: 'Mueve tus manos', en: 'Move your hands' },
  tipFast: { es: 'Reflejos rápidos', en: 'Fast reflexes' },
  tipRecord: { es: 'Récord', en: 'Best' },
  startCta: { es: 'Comenzar a jugar', en: 'Start playing' },
  cameraNote: { es: 'Necesitamos acceso a tu cámara', en: 'We need access to your camera' },
  poweredBy: {
    es: 'Powered by Asimetrix · Visión por computadora',
    en: 'Powered by Asimetrix · Computer vision',
  },

  // PermissionGate
  permPreparing: { es: 'Preparando arena', en: 'Preparing the arena' },
  permAcceptCam: {
    es: 'Acepta el permiso de cámara en tu navegador.',
    en: 'Accept the camera permission in your browser.',
  },
  permLoadingModel: {
    es: 'Cargando modelo de IA (~10 MB la primera vez).',
    en: 'Loading AI model (~10 MB the first time).',
  },
  permError: { es: 'Algo salió mal', en: 'Something went wrong' },
  permBackToMenu: { es: 'Volver al menú', en: 'Back to menu' },
  permReady: { es: '¡Todo listo!', en: 'All set!' },
  permReadyBody: {
    es: 'Posiciona tus manos frente a la cámara y atrapa la tocineta y las salchichas que caen.',
    en: 'Position your hands in front of the camera and catch the bacon and sausages that fall.',
  },
  permPlayCta: { es: '¡A jugar!', en: "Let's play!" },

  // PauseOverlay
  pausePill: { es: 'Pausa', en: 'Paused' },
  pauseTitle: { es: 'Tomate aire', en: 'Take a breath' },
  pauseBody: { es: 'El juego está esperándote.', en: 'The game is waiting for you.' },
  pauseResume: { es: 'Reanudar', en: 'Resume' },
  pauseExit: { es: 'Salir al menú', en: 'Exit to menu' },

  // GameOver
  gameOverPillRecord: { es: 'Nuevo récord', en: 'New record' },
  gameOverPillEnd: { es: 'Fin de la partida', en: 'Round over' },
  gameOverTitleRecord: { es: 'Imparable', en: 'Unstoppable' },
  gameOverTitleTry: { es: 'Buen intento', en: 'Good try' },
  statPoints: { es: 'Puntos', en: 'Points' },
  statTime: { es: 'Tiempo', en: 'Time' },
  statRecord: { es: 'Récord', en: 'Best' },
  gameOverPlayAgain: { es: 'Jugar de nuevo', en: 'Play again' },
  gameOverMainMenu: { es: 'Menú principal', en: 'Main menu' },
  gameOverHint: {
    es: 'Pasa tu mano sobre un botón para activarlo',
    en: 'Hover a button with your hand to activate it',
  },

  // HUD
  hudLevel: { es: 'Nivel', en: 'Level' },
  hudRecord: { es: 'Récord', en: 'Best' },
  hudTimeAria: { es: 'Tiempo de la ronda', en: 'Round time' },
  hudLivesAria: { es: 'Vidas restantes', en: 'Lives remaining' },
  hudMute: { es: 'Silenciar sonido', en: 'Mute sound' },
  hudUnmute: { es: 'Activar sonido', en: 'Unmute sound' },
  hudPause: { es: 'Pausar juego', en: 'Pause game' },

  // App footer
  privacy: {
    es: 'privacidad · la cámara nunca sale del navegador',
    en: 'privacy · the camera never leaves the browser',
  },

  // Language toggle
  langToggleAria: { es: 'Cambiar idioma', en: 'Change language' },
} as const

export type StringKey = keyof typeof STRINGS

export function t(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale]
}
