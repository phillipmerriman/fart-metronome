import { findOnset } from '../lib/onset'
import { SampleVoice, SynthClickVoice, type SoundVoice } from './voices'

export interface SoundOption {
  id: string
  label: string
  url?: string
}

export const CLICK_SOUND: SoundOption = { id: 'click', label: 'Synth click' }

// Every audio file dropped into src/sounds/ becomes a selectable sound.
const files = import.meta.glob<string>('../sounds/*.{mp3,wav,ogg,m4a,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const SAMPLE_SOUNDS: SoundOption[] = Object.entries(files)
  .map(([path, url]) => {
    const id = path.split('/').pop()!
    const label = id
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/[.\s]+$/, '')
    return { id, label, url }
  })
  .sort((a, b) => a.label.localeCompare(b.label))

export const SOUNDS: SoundOption[] = [CLICK_SOUND, ...SAMPLE_SOUNDS]

export function findSound(id: string): SoundOption {
  return SOUNDS.find((s) => s.id === id) ?? CLICK_SOUND
}

/** The recording used for "fart" beats; falls back to the first sample, then the click. */
export function findFartSound(id: string): SoundOption {
  return SAMPLE_SOUNDS.find((s) => s.id === id) ?? SAMPLE_SOUNDS[0] ?? CLICK_SOUND
}

const cache = new Map<string, Promise<SoundVoice>>()

async function decodeSample(url: string): Promise<SoundVoice> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const data = await response.arrayBuffer()
  // Decoded AudioBuffers aren't tied to a context, so a throwaway offline one will do.
  const buffer = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(data)
  return new SampleVoice(buffer, findOnset(buffer.getChannelData(0), buffer.sampleRate))
}

export function loadVoice(sound: SoundOption): Promise<SoundVoice> {
  if (!sound.url) return Promise.resolve(new SynthClickVoice())
  let voice = cache.get(sound.id)
  if (!voice) {
    voice = decodeSample(sound.url)
    cache.set(sound.id, voice)
    voice.catch(() => cache.delete(sound.id))
  }
  return voice
}
