# nananana

Play the Batman theme song from your terminal without any external dependencies!

## Installation

```bash
npx nananana
```

No installation required! Just run the command above to play the Batman theme.

If you want to install it globally:

```bash
npm install -g nananana
```

Then run:

```bash
nananana
```

## Features

- Plays the classic "Na na na na na na na na BATMAN!" theme with melodic variations
- Uses a full range of notes including sharps/flats for a more dynamic melody
- No external dependencies required to play sounds
- Works on macOS, Windows, and Linux
- Displays a cool Batman logo

## How It Works

This package uses Node.js built-in capabilities to play sound:
- On Windows, it uses PowerShell's `[console]::beep()`
- On macOS, it generates WAV files on the fly and plays them with `afplay`
- On Linux, it attempts to use the terminal bell or system beep

## License

ISC
