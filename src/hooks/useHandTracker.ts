import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker, type HandLandmarkerResult } from '@mediapipe/tasks-vision'

export type HandPoint = { x: number; y: number }

export type TrackerState = {
  ready: boolean
  error: string | null
  landmarksRef: React.MutableRefObject<HandPoint[]>
}

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'

// Stand mode: the player is standing and may be 1–3m from the camera, so
// per-fingertip tracking is unreliable. We collapse each detected hand into
// a single "palm" point (average of wrist + four MCP joints), which is the
// most stable region across distance and motion.
const PALM_INDICES = [0, 5, 9, 13, 17]

export function useHandTracker(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean): TrackerState {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const landmarksRef = useRef<HandPoint[]>([])
  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number>(-1)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL)
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          // Lower thresholds let small/far-away hands keep being detected at
          // a stand where the player can step back from the camera.
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        })
        if (cancelled) {
          landmarker.close()
          return
        }
        landmarkerRef.current = landmarker
        setReady(true)
        loop()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'No se pudo inicializar el detector de manos.'
        setError(message)
      }
    }

    function loop() {
      const video = videoRef.current
      const landmarker = landmarkerRef.current
      if (!video || !landmarker) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      if (video.readyState >= 2 && video.currentTime !== lastTimestampRef.current) {
        lastTimestampRef.current = video.currentTime
        const ts = performance.now()
        let result: HandLandmarkerResult | null = null
        try {
          result = landmarker.detectForVideo(video, ts)
        } catch {
          result = null
        }
        if (result) {
          const points: HandPoint[] = []
          for (const hand of result.landmarks) {
            let sx = 0
            let sy = 0
            let n = 0
            for (const idx of PALM_INDICES) {
              const lm = hand[idx]
              if (lm) {
                sx += lm.x
                sy += lm.y
                n++
              }
            }
            if (n > 0) points.push({ x: sx / n, y: sy / n })
          }
          landmarksRef.current = points
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    init()

    return () => {
      cancelled = true
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      landmarkerRef.current?.close()
      landmarkerRef.current = null
      setReady(false)
    }
  }, [enabled, videoRef])

  return { ready, error, landmarksRef }
}
