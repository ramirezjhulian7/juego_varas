import Phaser from 'phaser'
import type { HandPoint } from '../hooks/useHandTracker'

export type GameCallbacks = {
  onCatch: (pointsGained: number) => void
  onMiss: () => void
  onLevelUp: (level: number) => void
}

export type GameSceneData = {
  landmarksRef: { current: HandPoint[] }
  callbacks: GameCallbacks
}

type Stick = Phaser.GameObjects.Container & {
  speed: number
  caught: boolean
}

const STICK_WIDTH = 32
const STICK_HEIGHT = 130
const BASE_SPAWN_INTERVAL = 1100
const BASE_SPEED = 220
const HAND_HIT_RADIUS = 28

export class GameScene extends Phaser.Scene {
  private sticks: Stick[] = []
  private spawnTimer = 0
  private elapsed = 0
  private level = 1
  private callbacks!: GameCallbacks
  private landmarksRef!: { current: HandPoint[] }
  private handMarkers: Phaser.GameObjects.Arc[] = []

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: GameSceneData) {
    this.landmarksRef = data.landmarksRef
    this.callbacks = data.callbacks
    this.sticks = []
    this.handMarkers = []
    this.spawnTimer = 0
    this.elapsed = 0
    this.level = 1
  }

  create() {
    const { width, height } = this.scale
    // Soft top→bottom veil so the game arena reads on top of the camera feed
    // without hiding the player. Lighter at the center, slightly stronger on edges.
    const overlay = this.add.graphics()
    overlay.fillGradientStyle(0xffffff, 0xffffff, 0xf8f9fa, 0xf8f9fa, 0.28, 0.28, 0.42, 0.48)
    overlay.fillRect(0, 0, width, height)

    this.scale.on('resize', this.handleResize, this)
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.cameras.resize(gameSize.width, gameSize.height)
  }

  override update(_time: number, delta: number) {
    this.elapsed += delta
    this.spawnTimer += delta

    const interval = Math.max(450, BASE_SPAWN_INTERVAL - (this.level - 1) * 70)
    if (this.spawnTimer >= interval) {
      this.spawnStick()
      this.spawnTimer = 0
    }

    const newLevel = Math.min(10, 1 + Math.floor(this.elapsed / 15000))
    if (newLevel !== this.level) {
      this.level = newLevel
      this.callbacks.onLevelUp(newLevel)
    }

    this.updateHandMarkers()
    this.updateSticks(delta)
  }

  private spawnStick() {
    const { width } = this.scale
    const margin = STICK_WIDTH / 2 + 24
    const x = Phaser.Math.Between(margin, width - margin)

    const container = this.add.container(x, -STICK_HEIGHT) as Stick
    container.speed = BASE_SPEED + (this.level - 1) * 35
    container.caught = false

    // Asimetrix brand palette
    const palette = [
      [0x040939, 0x4ba2ff], // primary deep blue → electric
      [0x0e567b, 0x00e3ff], // secondary aqua → electric aqua
      [0x4ba2ff, 0x7ec6de], // electric → aqua soft
      [0x00e3ff, 0xffffff], // aqua highlight
    ]
    const [base, glow] = palette[Phaser.Math.Between(0, palette.length - 1)]

    const halo = this.add.graphics()
    halo.fillStyle(glow, 0.18)
    halo.fillCircle(STICK_WIDTH / 2, STICK_HEIGHT / 2, STICK_HEIGHT * 0.55)
    container.add(halo)

    const body = this.add.graphics()
    body.fillStyle(base, 1)
    body.fillRoundedRect(0, 0, STICK_WIDTH, STICK_HEIGHT, 14)

    const highlight = this.add.graphics()
    highlight.fillStyle(0xffffff, 0.22)
    highlight.fillRoundedRect(4, 6, STICK_WIDTH * 0.35, STICK_HEIGHT - 12, 8)

    const cap = this.add.graphics()
    cap.fillStyle(glow, 1)
    cap.fillCircle(STICK_WIDTH / 2, 8, STICK_WIDTH / 2 - 2)

    container.add([body, highlight, cap])
    container.setSize(STICK_WIDTH, STICK_HEIGHT)
    container.setData('halo', halo)

    this.sticks.push(container)
  }

  private updateSticks(delta: number) {
    const dt = delta / 1000
    const points = this.landmarksRef.current
    const w = this.scale.width
    const h = this.scale.height
    const remaining: Stick[] = []

    for (const stick of this.sticks) {
      if (stick.caught) {
        stick.alpha -= dt * 4
        stick.scale += dt * 1.4
        if (stick.alpha <= 0) stick.destroy()
        else remaining.push(stick)
        continue
      }

      stick.y += stick.speed * dt
      const halo = stick.getData('halo') as Phaser.GameObjects.Graphics | undefined
      if (halo) halo.alpha = 0.5 + Math.sin((this.elapsed + stick.x) * 0.005) * 0.3

      const cx = stick.x + STICK_WIDTH / 2
      const cyTop = stick.y
      const cyBot = stick.y + STICK_HEIGHT

      let caught = false
      for (const point of points) {
        const px = point.x * w
        const py = point.y * h
        const closestY = Phaser.Math.Clamp(py, cyTop, cyBot)
        const closestX = Phaser.Math.Clamp(px, stick.x, stick.x + STICK_WIDTH)
        const dx = px - closestX
        const dy = py - closestY
        if (dx * dx + dy * dy <= HAND_HIT_RADIUS * HAND_HIT_RADIUS) {
          caught = true
          this.spawnBurst(cx, cyTop + STICK_HEIGHT / 2)
          break
        }
      }

      if (caught) {
        stick.caught = true
        const gained = 10 + (this.level - 1) * 2
        this.callbacks.onCatch(gained)
        remaining.push(stick)
        continue
      }

      if (stick.y > h) {
        this.callbacks.onMiss()
        stick.destroy()
        continue
      }

      remaining.push(stick)
    }

    this.sticks = remaining
  }

  private updateHandMarkers() {
    const points = this.landmarksRef.current
    const w = this.scale.width
    const h = this.scale.height

    while (this.handMarkers.length < points.length) {
      const arc = this.add.circle(0, 0, 14, 0x4ba2ff, 0.9).setStrokeStyle(2, 0xffffff, 0.95).setDepth(5)
      this.handMarkers.push(arc)
    }
    while (this.handMarkers.length > points.length) {
      const removed = this.handMarkers.pop()
      removed?.destroy()
    }

    points.forEach((p, i) => {
      const marker = this.handMarkers[i]
      marker.setPosition(p.x * w, p.y * h)
    })
  }

  private spawnBurst(x: number, y: number) {
    const colors = [0x4ba2ff, 0x00e3ff, 0x7ec6de, 0x040939]
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14
      const speed = Phaser.Math.FloatBetween(120, 220)
      const particle = this.add.circle(x, y, Phaser.Math.Between(3, 6), colors[i % colors.length], 1).setDepth(15)
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.6,
        y: y + Math.sin(angle) * speed * 0.6,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'cubic.out',
        onComplete: () => particle.destroy(),
      })
    }
  }
}
