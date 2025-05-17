# nanananana

Play the Batman theme song from your terminal without any external dependencies!

## Installation

```bash
npx nanananana
```

No installation required! Just run the command above to play the Batman theme.

## Features

- Plays the classic "Na na na na na na na na BATMAN!" theme
- Uses a full range of notes including sharps/flats
- Piano-like sound with proper Attack-Decay-Sustain-Release envelope
- Implements gradual piano-like fading for notes that mimics real piano acoustics
- Supports sequenced music patterns
- Features alternating patterns that simulate multi-channel playback
- Uses music theory principles to create clean, non-vibrating chord sounds
- No external dependencies required to play sounds
- Works on macOS, Windows, and Linux
- Displays a cool Batman logo
- Seamless note transitions with no audible gaps between notes

## Command Line Options

- `npx nanananana` - Play the classic Batman theme
- `npx nanananana --basic` - Play the basic piano-style version without extra features
- `npx nanananana --piano` - Demonstrate piano-style playing with independent hands
- `npx nanananana --help` - Show command line options

## How It Works

This package uses Node.js built-in capabilities to play sound:
- On Windows, it uses PowerShell's `[console]::beep()`
- On macOS, it generates WAV files on the fly and plays them with `afplay`
- On Linux, it attempts to use the terminal bell or `aplay` when available

For chords and multi-note playback, it implements:
- Proper harmonic synthesis that mimics the way piano strings resonate together
- Piano-like envelope shaping with realistic attack, decay, sustain, and release phases
- Independent left and right hand parts with different note durations
- Gradual fading of notes that simulates real piano acoustics
- Detailed overtone generation based on musical intervals

For multi-part sequences, it uses carefully timed patterns with silences and alternating notes to create the impression of multiple tracks playing simultaneously, while maintaining pristine audio quality.

## License

MIT

The song rights are obviously reserved to the original song owners, this is just a fun project to try to generate audio from scratch using node.js and I don't claim this song is mine at all, I'm using notes to represent it as a form of making my own version with a synthetizer.
