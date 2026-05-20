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

const FINGERTIP_INDICES = [4, 8, 12, 16, 20]

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
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
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
            for (const idx of FINGERTIP_INDICES) {
              const lm = hand[idx]
              if (lm) points.push({ x: lm.x, y: lm.y })
            }
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
