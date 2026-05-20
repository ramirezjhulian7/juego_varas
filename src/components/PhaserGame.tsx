import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameScene, type GameCallbacks } from '../game/GameScene'
import type { HandPoint } from '../hooks/useHandTracker'

type Props = {
  landmarksRef: React.MutableRefObject<HandPoint[]>
  callbacks: GameCallbacks
  active: boolean
}

export function PhaserGame({ landmarksRef, callbacks, active }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    if (!active || !containerRef.current) return

    const scene = new GameScene()
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
      },
      fps: { target: 60, smoothStep: true },
      scene,
    })

    game.scene.start('GameScene', {
      landmarksRef,
      callbacks: {
        onCatch: (s: number) => callbacksRef.current.onCatch(s),
        onMiss: () => callbacksRef.current.onMiss(),
        onLevelUp: (l: number) => callbacksRef.current.onLevelUp(l),
      },
    })

    gameRef.current = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [active, landmarksRef])

  return <div ref={containerRef} className="absolute inset-0" />
}
