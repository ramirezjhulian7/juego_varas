type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  visible: boolean
}

export function CameraView({ videoRef, visible }: Props) {
  return (
    <video
      ref={videoRef}
      playsInline
      muted
      autoPlay
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        transform: 'scaleX(-1)',
        opacity: visible ? 0.62 : 0,
        transition: 'opacity 400ms ease',
        filter: 'saturate(0.95) brightness(1.05) contrast(1.02)',
      }}
    />
  )
}
