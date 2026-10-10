# Fart Metronome

A metronome with a sci-fi command-console UI. Fart sounds are coming later; for now it ticks.

## Features

- Tempo from 30 to 300 BPM, set by dragging or scrolling the dial, the ±1 and ±5 buttons, the arrow keys, or tap tempo
- Time signatures 2/4, 3/4, 4/4, 5/4, 6/8, and 7/8, with an accented downbeat (in /8 meters the BPM counts eighth notes)
- Subdivisions: ×1, ×2, triplets, and ×4
- Volume control; all settings are saved in `localStorage`
- Keyboard shortcuts: `Space` starts and stops, `T` taps the tempo, `↑`/`↓` change the BPM by 1 (hold `Shift` for 5)

## Development

```sh
npm install
npm run dev      # start the dev server
npm test         # run the unit tests (Vitest)
npm run build    # type-check and build for production
```

## How it works

- `src/audio/engine.ts` uses a lookahead scheduler: a 25 ms JavaScript timer queues ticks about 100 ms ahead on the `AudioContext` clock, so timing stays sample-accurate even when the UI thread is busy.
- `src/audio/voices.ts` defines the `SoundVoice` interface. Each tick (`accent`, `beat`, or `sub`) is passed to a voice. The current voice is a synth click; fart samples will plug in as another voice.
- `src/hooks/useMetronome.ts` is the bridge between React and the engine. It updates the visuals on `requestAnimationFrame`, in step with the audio clock.
- `src/theme.ts` holds the MUI theme with the sci-fi look: colors, fonts, and overrides for buttons, toggles, and sliders.
