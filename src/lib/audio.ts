import { Howl } from 'howler'

type SoundName = 'catch' | 'miss' | 'levelup' | 'gameover'

const SOUND_DATA: Record<SoundName, () => Howl> = {
  catch: () => makeBeep([880, 1320], 0.18, 'sine'),
  miss: () => makeBeep([220, 165], 0.32, 'sawtooth'),
  levelup: () => makeBeep([523, 659, 784, 1047], 0.5, 'triangle'),
  gameover: () => makeBeep([392, 311, 233, 174], 0.9, 'square'),
}

const cache = new Map<SoundName, Howl>()

function makeBeep(frequencies: number[], duration: number, type: OscillatorType): Howl {
  const sampleRate = 44100
  const totalSamples = Math.floor(sampleRate * duration)
  const buffer = new Float32Array(totalSamples)
  const segmentSamples = Math.floor(totalSamples / frequencies.length)

  frequencies.forEach((freq, idx) => {
    const start = idx * segmentSamples
    const end = idx === frequencies.length - 1 ? totalSamples : start + segmentSamples
    for (let i = start; i < end; i++) {
      const t = (i - start) / sampleRate
      const env = Math.sin((Math.PI * (i - start)) / (end - start))
      let sample = 0
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * freq * t)
          break
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * freq * t))
          break
        case 'sawtooth':
          sample = 2 * (t * freq - Math.floor(t * freq + 0.5))
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1
          break
      }
      buffer[i] = sample * env * 0.4
    }
  })

  const wav = encodeWav(buffer, sampleRate)
  const dataUrl = 'data:audio/wav;base64,' + wav
  return new Howl({ src: [dataUrl], volume: 0.6 })
}

function encodeWav(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return
  let sound = cache.get(name)
  if (!sound) {
    sound = SOUND_DATA[name]()
    cache.set(name, sound)
  }
  sound.stop()
  sound.play()
}
