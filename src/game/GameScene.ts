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

    const isSausage = Phaser.Math.Between(0, 1) === 0
    const halo = this.add.graphics()
    container.add(halo)

    if (isSausage) {
      drawSausage(this, container, halo)
    } else {
      drawBacon(this, container, halo)
    }

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
    const colors = [0xffd4b6, 0xc24b3a, 0x8b3e2f, 0xf4b58a, 0xe6a07a]
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

// --- Sausage: glossy brown/pink capsule, vertical, with grill marks ---
function drawSausage(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  halo: Phaser.GameObjects.Graphics,
) {
  // [body, shadow, highlight, glow, grill]
  const palette = [
    [0xc97a52, 0x8b4a2d, 0xf3b78a, 0xf4a577, 0x5a2f1c], // bratwurst
    [0xb05a3a, 0x7a3520, 0xe89372, 0xe89070, 0x4a2010], // chorizo oscuro
    [0xd49066, 0x9a5836, 0xf7c5a1, 0xf6b08a, 0x6a3520], // salchicha clara
    [0xc06a44, 0x88412a, 0xefa782, 0xeb9c75, 0x4f2415], // ahumada
  ]
  const [body, shadow, highlight, glow, grill] = palette[Phaser.Math.Between(0, palette.length - 1)]

  halo.fillStyle(glow, 0.22)
  halo.fillCircle(STICK_WIDTH / 2, STICK_HEIGHT / 2, STICK_HEIGHT * 0.55)

  const cx = STICK_WIDTH / 2

  // Capsule body (slightly inset on left/right so the ends look pinched)
  const w = STICK_WIDTH * 0.92
  const x0 = (STICK_WIDTH - w) / 2

  const main = scene.add.graphics()
  main.fillStyle(body, 1)
  main.fillRoundedRect(x0, 0, w, STICK_HEIGHT, w / 2)

  // Right-side shadow lobe for 3D feel
  const shade = scene.add.graphics()
  shade.fillStyle(shadow, 0.55)
  shade.fillRoundedRect(x0 + w * 0.55, 6, w * 0.45, STICK_HEIGHT - 12, w / 3)

  // Left highlight strip — wet-looking sheen
  const sheen = scene.add.graphics()
  sheen.fillStyle(highlight, 0.7)
  sheen.fillRoundedRect(x0 + 3, 12, w * 0.18, STICK_HEIGHT - 24, 6)

  // Pinched-end caps (twist marks) — thin dark lines top and bottom
  const caps = scene.add.graphics()
  caps.lineStyle(1.5, shadow, 0.85)
  caps.beginPath()
  caps.arc(cx, 5, w / 2 - 1, Math.PI, 0, false)
  caps.strokePath()
  caps.beginPath()
  caps.arc(cx, STICK_HEIGHT - 5, w / 2 - 1, 0, Math.PI, false)
  caps.strokePath()

  // Grill marks — diagonal char stripes
  const marks = scene.add.graphics()
  marks.lineStyle(2, grill, 0.55)
  const stripes = 5
  for (let i = 0; i < stripes; i++) {
    const cy = 24 + i * ((STICK_HEIGHT - 48) / (stripes - 1))
    marks.beginPath()
    marks.moveTo(x0 + 2, cy - 4)
    marks.lineTo(x0 + w - 2, cy + 4)
    marks.strokePath()
  }

  container.add([main, shade, sheen, caps, marks])
}

// --- Bacon: twisted strip with bold red/cream stripes ---
// The strip is a closed polygon with an S-curve centerline. Instead of using
// a clip mask (Phaser geometry masks don't track Container transforms reliably),
// each color band is drawn as its own polygon that follows the strip silhouette
// only in its Y range, so colors can never spill outside the strip.
function drawBacon(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  halo: Phaser.GameObjects.Graphics,
) {
  // [meatDark, meat, fat, fatShadow, edge, glow]
  const palette = [
    [0x7a1f15, 0xc62b1f, 0xfdecd0, 0xe9c89a, 0x3a0d05, 0xe07561], // tocineta clásica
    [0x6b1a12, 0xae2418, 0xf6e0bd, 0xdfba8b, 0x2e0903, 0xc95f4b], // ahumada
    [0x8b2820, 0xd83a2a, 0xfff1d8, 0xeec8a0, 0x4a1208, 0xeb8369], // tostada
    [0x73160c, 0xb52415, 0xfae1be, 0xe2bd8c, 0x360903, 0xd56757], // crujiente
  ]
  const [meatDark, meat, fat, fatShadow, edge, glow] =
    palette[Phaser.Math.Between(0, palette.length - 1)]

  halo.fillStyle(glow, 0.28)
  halo.fillCircle(STICK_WIDTH / 2, STICK_HEIGHT / 2, STICK_HEIGHT * 0.55)

  const baseHalf = STICK_WIDTH * 0.36
  const sideAmp = STICK_WIDTH * 0.18
  const edgeAmp = 3.5
  const phaseA = Phaser.Math.FloatBetween(0, Math.PI * 2)
  const phaseB = Phaser.Math.FloatBetween(0, Math.PI * 2)

  // Closed-form left/right edges at any y so each band can sample the
  // silhouette at exactly its boundaries.
  function edgesAt(y: number) {
    const t = y / STICK_HEIGHT
    const center = STICK_WIDTH / 2 + Math.sin(t * Math.PI * 1.5 + phaseA) * sideAmp
    const wobL = Math.sin(t * Math.PI * 6 + phaseB) * edgeAmp
    const wobR = Math.sin(t * Math.PI * 6 + phaseB + Math.PI) * edgeAmp
    return { left: center - baseHalf + wobL, right: center + baseHalf + wobR }
  }

  // Outline polygon points (used for stroke + base silhouette fill).
  const outlineSegs = 36
  const leftPts: { x: number; y: number }[] = []
  const rightPts: { x: number; y: number }[] = []
  for (let i = 0; i <= outlineSegs; i++) {
    const y = (i / outlineSegs) * STICK_HEIGHT
    const e = edgesAt(y)
    leftPts.push({ x: e.left, y })
    rightPts.push({ x: e.right, y })
  }

  const tracePath = (g: Phaser.GameObjects.Graphics) => {
    g.beginPath()
    g.moveTo(leftPts[0].x, leftPts[0].y)
    for (let i = 1; i < leftPts.length; i++) g.lineTo(leftPts[i].x, leftPts[i].y)
    for (let i = rightPts.length - 1; i >= 0; i--) g.lineTo(rightPts[i].x, rightPts[i].y)
    g.closePath()
  }

  // Base silhouette in meat color — fallback in case bands ever leave a gap.
  const silhouette = scene.add.graphics()
  silhouette.fillStyle(meat, 1)
  tracePath(silhouette)
  silhouette.fillPath()

  // Bands: each one is its own clipped polygon that hugs the strip outline.
  const stripeCount = 6
  const samplesPerBand = 8
  const bandLayer = scene.add.graphics()
  for (let b = 0; b < stripeCount; b++) {
    const yStart = (b / stripeCount) * STICK_HEIGHT
    const yEnd = ((b + 1) / stripeCount) * STICK_HEIGHT
    const isFat = b % 2 === 1

    bandLayer.fillStyle(isFat ? fat : meat, 1)
    bandLayer.beginPath()

    // Left edge top→bottom
    for (let s = 0; s <= samplesPerBand; s++) {
      const y = yStart + (s / samplesPerBand) * (yEnd - yStart)
      const e = edgesAt(y)
      if (s === 0) bandLayer.moveTo(e.left, y)
      else bandLayer.lineTo(e.left, y)
    }
    // Right edge bottom→top
    for (let s = samplesPerBand; s >= 0; s--) {
      const y = yStart + (s / samplesPerBand) * (yEnd - yStart)
      const e = edgesAt(y)
      bandLayer.lineTo(e.right, y)
    }
    bandLayer.closePath()
    bandLayer.fillPath()
  }

  // Thin shadow line at each band transition, also clipped to the strip
  // by sampling the edges exactly at that Y.
  const transitions = scene.add.graphics()
  transitions.lineStyle(2, meatDark, 0.6)
  for (let b = 1; b < stripeCount; b++) {
    const y = (b / stripeCount) * STICK_HEIGHT
    const e = edgesAt(y)
    const color = b % 2 === 1 ? fatShadow : meatDark
    transitions.lineStyle(2, color, 0.55)
    transitions.beginPath()
    transitions.moveTo(e.left, y)
    transitions.lineTo(e.right, y)
    transitions.strokePath()
  }

  // Outline — accentuates the curl.
  const outline = scene.add.graphics()
  outline.lineStyle(2, edge, 0.95)
  tracePath(outline)
  outline.strokePath()

  // Subtle highlight along the left edge — also drawn as a strip-shaped
  // polygon so it stays inside the silhouette.
  const sheen = scene.add.graphics()
  sheen.fillStyle(0xffffff, 0.22)
  sheen.beginPath()
  for (let i = 0; i <= outlineSegs; i++) {
    const y = (i / outlineSegs) * STICK_HEIGHT
    const e = edgesAt(y)
    if (i === 0) sheen.moveTo(e.left, y)
    else sheen.lineTo(e.left, y)
  }
  for (let i = outlineSegs; i >= 0; i--) {
    const y = (i / outlineSegs) * STICK_HEIGHT
    const e = edgesAt(y)
    const x = e.left + Math.min(6, (e.right - e.left) * 0.22)
    sheen.lineTo(x, y)
  }
  sheen.closePath()
  sheen.fillPath()

  container.add([silhouette, bandLayer, transitions, sheen, outline])
}
