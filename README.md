# Fart Metronome

A metronome with a sci-fi command-console UI, and farts.

## Features

- Tempo from 30 to 300 BPM, set by dragging or scrolling the dial, the ±1 and ±5 buttons, the arrow keys, or tap tempo
- Time signatures 2/4, 3/4, 4/4, 5/4, 6/8, and 7/8 (in /8 meters the BPM counts eighth notes)
- Click a beat to cycle it through normal, accent, and mute; each time signature keeps its own pattern
- Subdivisions: ×1, ×2, triplets, and ×4
- Volume control; all settings are saved in `localStorage`
- Keyboard shortcuts: `Space` starts and stops, `T` taps the tempo, `↑`/`↓` change the BPM by 1 (hold `Shift` for 5)

## Adding sounds

Drop an audio file (`.mp3`, `.wav`, `.ogg`, `.m4a`, or `.webm`) into `src/sounds/`. It appears in the **Sound bank** panel automatically, labeled from its file name (`wet-one.mp3` becomes "wet one"). Leading silence is skipped so the sound lands on the beat; accents play it slightly deeper, subdivisions higher and quieter. Short, punchy clips (under half a second) work best at fast tempos.

`synth-fart.wav` is a synthesized placeholder.

## Development

```sh
npm install
npm run dev      # start the dev server
npm test         # run the unit tests (Vitest)
npm run build    # type-check and build for production
```

## How it works

- `src/audio/engine.ts` uses a lookahead scheduler: a 25 ms JavaScript timer queues ticks about 100 ms ahead on the `AudioContext` clock, so timing stays sample-accurate even when the UI thread is busy.
- `src/audio/voices.ts` defines the `SoundVoice` interface. Each tick (`accent`, `beat`, or `sub`) is passed to a voice. `SynthClickVoice` synthesizes a click; `SampleVoice` plays a recording. `src/audio/sounds.ts` finds the files in `src/sounds/` and loads them.
- `src/hooks/useMetronome.ts` is the bridge between React and the engine. It updates the visuals on `requestAnimationFrame`, in step with the audio clock.
- `src/theme.ts` holds the MUI theme with the sci-fi look: colors, fonts, and overrides for buttons, toggles, and sliders.
