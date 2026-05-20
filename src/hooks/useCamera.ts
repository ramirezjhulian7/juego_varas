import { useEffect, useRef, useState } from 'react'

type CameraState = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  ready: boolean
  error: string | null
}

export function useCamera(enabled: boolean): CameraState {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let stream: MediaStream | null = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        if (cancelled || !videoRef.current) {
          stream?.getTracks().forEach((t) => t.stop())
          return
        }
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setReady(true)
        }
      } catch (e) {
        const message =
          e instanceof Error
            ? e.name === 'NotAllowedError'
              ? 'Necesitamos permiso para usar tu cámara.'
              : e.message
            : 'No se pudo acceder a la cámara.'
        setError(message)
      }
    }

    start()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setReady(false)
    }
  }, [enabled])

  return { videoRef, ready, error }
}
