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
const STICK_HEIGHT = 200
// Generous hit area: at a stand the player is far away and we collapse each
// hand to a single palm point, so the "hand" needs a fat radius to feel
// natural. Computed dynamically as a fraction of the screen height in
// updateSticks() so the feel stays consistent across screen sizes.
const HAND_HIT_RADIUS_FRAC = 0.06
const HAND_HIT_RADIUS_MIN = 48

// Tuned for "stand mode": fast and challenging, target ~30–40s rounds.
// Spawn cadence accelerates and sticks fall faster every LEVEL_INTERVAL_MS.
// Speed is expressed as fractions of the screen height per second so the
// game feels equally challenging on landscape and vertical (portrait) panels.
const BASE_SPAWN_INTERVAL = 700
const MIN_SPAWN_INTERVAL = 220
const SPAWN_INTERVAL_PER_LEVEL = 95
const BASE_SPEED_FRAC = 0.7 // screen heights per second at level 1
const SPEED_FRAC_PER_LEVEL = 0.13
const MAX_SPEED_FRAC = 1.8
const LEVEL_INTERVAL_MS = 5500
const MAX_LEVEL = 14

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

    const interval = Math.max(
      MIN_SPAWN_INTERVAL,
      BASE_SPAWN_INTERVAL - (this.level - 1) * SPAWN_INTERVAL_PER_LEVEL,
    )
    if (this.spawnTimer >= interval) {
      this.spawnStick()
      this.spawnTimer = 0
    }

    const newLevel = Math.min(MAX_LEVEL, 1 + Math.floor(this.elapsed / LEVEL_INTERVAL_MS))
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
    const frac = Math.min(MAX_SPEED_FRAC, BASE_SPEED_FRAC + (this.level - 1) * SPEED_FRAC_PER_LEVEL)
    container.speed = frac * this.scale.height
    container.caught = false

    // Pig piggy-bank palette: [body, shadow, snout, earInner, glow]
    // Each entry is a coherent set so the shading reads as one piece.
    const palette = [
      [0xf4a8b8, 0xd97aa3, 0xe89bb0, 0xfad6df, 0xffc8d4], // rosa clásico
      [0xffc8d4, 0xf09bb1, 0xeeb5c4, 0xfff0f4, 0xffe1e9], // rosa pálido
      [0xe87ea0, 0xb85574, 0xd2688d, 0xf4a8c5, 0xfbb6cf], // rosa fuerte
      [0xfbb6c1, 0xe48aa1, 0xf4a4b3, 0xffd9e2, 0xffd1da], // rosa medio
    ]
    const [bodyColor, shadowColor, snoutColor, earInner, glow] =
      palette[Phaser.Math.Between(0, palette.length - 1)]

    // Soft glow behind the piggy
    const halo = this.add.graphics()
    halo.fillStyle(glow, 0.22)
    halo.fillCircle(STICK_WIDTH / 2, STICK_HEIGHT / 2, STICK_HEIGHT * 0.55)
    container.add(halo)

    const cx = STICK_WIDTH / 2
    const headTop = STICK_HEIGHT - 60 // top of the "head" zone (head is at the bottom because piggy falls head-first)

    // --- Body (vertical capsule, side view of a piggy bank) ---
    const body = this.add.graphics()
    body.fillStyle(bodyColor, 1)
    body.fillRoundedRect(0, 0, STICK_WIDTH, STICK_HEIGHT, STICK_WIDTH / 2)

    // Right-side shading to give a 3D "side view" feel
    const shade = this.add.graphics()
    shade.fillStyle(shadowColor, 0.5)
    shade.fillRoundedRect(STICK_WIDTH * 0.58, 4, STICK_WIDTH * 0.4, STICK_HEIGHT - 8, STICK_WIDTH / 3)

    // Left-side highlight
    const highlight = this.add.graphics()
    highlight.fillStyle(0xffffff, 0.28)
    highlight.fillRoundedRect(3, 10, STICK_WIDTH * 0.22, STICK_HEIGHT - 20, 6)

    // --- Curly tail (top of the capsule, opposite end of the head) ---
    const tail = this.add.graphics()
    tail.lineStyle(3, shadowColor, 1)
    tail.beginPath()
    tail.arc(cx + 5, -2, 4, Math.PI, 0, false)
    tail.strokePath()
    tail.beginPath()
    tail.arc(cx + 5, -9, 3, 0, Math.PI, false)
    tail.strokePath()

    // --- Ear (single, side-view) on top of the head ---
    const ear = this.add.graphics()
    ear.fillStyle(shadowColor, 1)
    ear.fillTriangle(
      STICK_WIDTH * 0.62, headTop - 6, // tip pointing up-back
      STICK_WIDTH * 0.42, headTop + 8,
      STICK_WIDTH * 0.86, headTop + 10,
    )
    ear.fillStyle(earInner, 1)
    ear.fillTriangle(
      STICK_WIDTH * 0.63, headTop - 1,
      STICK_WIDTH * 0.5, headTop + 8,
      STICK_WIDTH * 0.78, headTop + 9,
    )

    // --- Eye (single, side profile) ---
    const eye = this.add.graphics()
    eye.fillStyle(0xffffff, 1)
    eye.fillCircle(STICK_WIDTH * 0.34, STICK_HEIGHT - 32, 2.8)
    eye.fillStyle(0x2b1a22, 1)
    eye.fillCircle(STICK_WIDTH * 0.32, STICK_HEIGHT - 32, 1.5)
    eye.fillStyle(0xffffff, 0.9)
    eye.fillCircle(STICK_WIDTH * 0.31, STICK_HEIGHT - 33, 0.5)

    // Cheek blush
    const cheek = this.add.graphics()
    cheek.fillStyle(shadowColor, 0.45)
    cheek.fillCircle(STICK_WIDTH * 0.32, STICK_HEIGHT - 22, 2.5)

    // --- Snout (oval at the very bottom, where the piggy is "facing") ---
    const snout = this.add.graphics()
    snout.fillStyle(snoutColor, 1)
    snout.fillEllipse(cx, STICK_HEIGHT - 10, STICK_WIDTH * 0.7, 14)
    snout.fillStyle(shadowColor, 0.55)
    snout.lineStyle(1, shadowColor, 0.6)
    snout.strokeEllipse(cx, STICK_HEIGHT - 10, STICK_WIDTH * 0.7, 14)
    // Two nostrils
    snout.fillStyle(0x6a3848, 0.85)
    snout.fillEllipse(cx - 4, STICK_HEIGHT - 10, 2.2, 3)
    snout.fillEllipse(cx + 4, STICK_HEIGHT - 10, 2.2, 3)

    container.add([body, shade, highlight, tail, ear, cheek, eye, snout])
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
    const hitRadius = Math.max(HAND_HIT_RADIUS_MIN, h * HAND_HIT_RADIUS_FRAC)
    const hitRadiusSq = hitRadius * hitRadius

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
        if (dx * dx + dy * dy <= hitRadiusSq) {
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
    // Match the hit area visually so players see what they can actually catch.
    const radius = Math.max(HAND_HIT_RADIUS_MIN, h * HAND_HIT_RADIUS_FRAC)

    while (this.handMarkers.length < points.length) {
      const arc = this.add
        .circle(0, 0, radius, 0x4ba2ff, 0.22)
        .setStrokeStyle(3, 0xffffff, 0.95)
        .setDepth(5)
      this.handMarkers.push(arc)
    }
    while (this.handMarkers.length > points.length) {
      const removed = this.handMarkers.pop()
      removed?.destroy()
    }

    points.forEach((p, i) => {
      const marker = this.handMarkers[i]
      marker.setRadius(radius)
      marker.setPosition(p.x * w, p.y * h)
    })
  }

  private spawnBurst(x: number, y: number) {
    const colors = [0xffc8d4, 0xf4a8b8, 0xe87ea0, 0xfff0f4, 0xfbb6c1]
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
