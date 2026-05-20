import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { useCamera } from './hooks/useCamera'
import { useHandTracker, type HandPoint } from './hooks/useHandTracker'
import { CameraView } from './components/CameraView'
import { PhaserGame } from './components/PhaserGame'
import { HUD } from './components/HUD'
import { Logo } from './components/Logo'
import { MainMenu } from './components/MainMenu'
import { PermissionGate } from './components/PermissionGate'
import { PauseOverlay } from './components/PauseOverlay'
import { GameOver } from './components/GameOver'
import { playSound } from './lib/audio'

function App() {
  const phase = useGameStore((s) => s.phase)
  const setLevel = useGameStore((s) => s.setLevel)
  const loseLife = useGameStore((s) => s.loseLife)

  const cameraEnabled = phase === 'permission' || phase === 'playing' || phase === 'paused'
  const camera = useCamera(cameraEnabled)
  const tracker = useHandTracker(camera.videoRef, cameraEnabled && camera.ready)

  // The video element is mirrored visually (scaleX(-1)). MediaPipe sees the
  // raw stream, so we flip x landmarks to match what the player sees.
  const proxyRef = useMemo(
    () =>
      ({
        get current(): HandPoint[] {
          return tracker.landmarksRef.current.map((p) => ({ x: 1 - p.x, y: p.y }))
        },
        set current(_) {},
      }) as React.MutableRefObject<HandPoint[]>,
    [tracker.landmarksRef],
  )

  const callbacks = useMemo(
    () => ({
      onCatch: (points: number) => {
        useGameStore.getState().addScore(points)
        playSound('catch', useGameStore.getState().soundEnabled)
      },
      onMiss: () => {
        const wasLastLife = useGameStore.getState().lives === 1
        loseLife()
        playSound(wasLastLife ? 'gameover' : 'miss', useGameStore.getState().soundEnabled)
      },
      onLevelUp: (level: number) => {
        setLevel(level)
        playSound('levelup', useGameStore.getState().soundEnabled)
      },
    }),
    [loseLife, setLevel],
  )

  return (
    <div className="bg-arena bg-grid-overlay relative h-full w-full overflow-hidden">
      <CameraView videoRef={camera.videoRef} visible={phase === 'playing' || phase === 'paused'} />

      {phase === 'playing' && (
        <PhaserGame landmarksRef={proxyRef} callbacks={callbacks} active={true} />
      )}

      {phase === 'playing' && <HUD />}

      {(phase === 'playing' || phase === 'paused') && (
        <div className="pointer-events-auto fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-2xl border border-ax-border bg-ax-surface/85 px-3 py-2 shadow-card backdrop-blur-md">
          <Logo className="block h-5" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'menu' && <MainMenu key="menu" />}
        {phase === 'permission' && (
          <PermissionGate
            key="perm"
            cameraReady={camera.ready}
            trackerReady={tracker.ready}
            cameraError={camera.error}
            trackerError={tracker.error}
          />
        )}
        {phase === 'paused' && <PauseOverlay key="pause" />}
        {phase === 'gameover' && <GameOver key="over" />}
      </AnimatePresence>

      <span className="pointer-events-none fixed bottom-2 left-1/2 z-50 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.3em] text-ax-textDim">
        privacidad · la cámara nunca sale del navegador
      </span>
    </div>
  )
}

export default App
