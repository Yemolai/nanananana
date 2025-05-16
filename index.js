#!/usr/b// Batman theme notation (frequency, duration in seconds)
/**
 * nanananana - Play the Batman theme song from your terminal
 * This program uses native Node.js capabilities to play the sound
 * without any external dependencies.
 */

// ANSI escape sequences for some styling
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const BLACK_BG = '\x1b[40m';

// Define the notes frequencies across multiple octaves
// Octave 2
const NOTE_C2 = 65.41;
const NOTE_Db2 = 69.30;  // Same as C#2
const NOTE_D2 = 73.42;
const NOTE_Eb2 = 77.78;  // Same as D#2
const NOTE_E2 = 82.41;
const NOTE_F2 = 87.31;
const NOTE_Gb2 = 92.50;  // Same as F#2
const NOTE_G2 = 98.00;
const NOTE_Ab2 = 103.83; // Same as G#2
const NOTE_A2 = 110.00;
const NOTE_Bb2 = 116.54; // Same as A#2
const NOTE_B2 = 123.47;

// Octave 3
const NOTE_C3 = 130.81;
const NOTE_Db3 = 138.59; // Same as C#3
const NOTE_D3 = 146.83;
const NOTE_Eb3 = 155.56; // Same as D#3
const NOTE_E3 = 164.81;
const NOTE_F3 = 174.61;
const NOTE_Gb3 = 185.00; // Same as F#3
const NOTE_G3 = 196.00;
const NOTE_Ab3 = 207.65; // Same as G#3
const NOTE_A3 = 220.00;
const NOTE_Bb3 = 233.08; // Same as A#3
const NOTE_B3 = 246.94;

// Octave 4 (middle C is C4)
const NOTE_C4 = 261.63;
const NOTE_Db4 = 277.18; // Same as C#4
const NOTE_D4 = 293.66;
const NOTE_Eb4 = 311.13; // Same as D#4
const NOTE_E4 = 329.63;
const NOTE_F4 = 349.23;
const NOTE_Gb4 = 369.99; // Same as F#4
const NOTE_G4 = 392.00;
const NOTE_Ab4 = 415.30; // Same as G#4
const NOTE_A4 = 440.00;  // A440 concert pitch standard
const NOTE_Bb4 = 466.16; // Same as A#4
const NOTE_B4 = 493.88;

// Octave 5
const NOTE_C5 = 523.25;
const NOTE_Db5 = 554.37; // Same as C#5
const NOTE_D5 = 587.33;
const NOTE_Eb5 = 622.25; // Same as D#5
const NOTE_E5 = 659.26;
const NOTE_F5 = 698.46;
const NOTE_Gb5 = 739.99; // Same as F#5
const NOTE_G5 = 783.99;
const NOTE_Ab5 = 830.61; // Same as G#5
const NOTE_A5 = 880.00;
const NOTE_Bb5 = 932.33; // Same as A#5
const NOTE_B5 = 987.77;

// Octave 6
const NOTE_C6 = 1046.50;

const basicSongParts = {
  lowNanaNanaNanaNana: [
    [[NOTE_G3, NOTE_D4, NOTE_D5], 0.22],
    [[NOTE_G3, NOTE_D4, NOTE_D5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
    [[NOTE_G3, NOTE_C4, NOTE_C5], 0.22],
    [[NOTE_G3, NOTE_C4, NOTE_C5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
  ],
  lowNanaNanaNanaNanaWithBatman: [
    [[NOTE_G3, NOTE_D4, NOTE_D5], 0.22, [NOTE_G4, NOTE_D5, NOTE_F5, NOTE_G5], 0.44], // left hand, left hand duration, right hand, diff right hand notes duration
    [[NOTE_G3, NOTE_D4, NOTE_D5], 0.22], // if no right hand, play only left hand and wait for right hand previous notes durations to finish
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22, [NOTE_G4, NOTE_D5, NOTE_F5, NOTE_G5], 1.44], // left hand, left hand duration, right hand, longer right hand duration
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
    [[NOTE_G3, NOTE_C4, NOTE_C5], 0.22],
    [[NOTE_G3, NOTE_C4, NOTE_C5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
    [[NOTE_G3, NOTE_Db4, NOTE_Db5], 0.22],
  ]
};

// Batman theme notation (frequency, duration in seconds)
// The classic "Na na na na na na na na BATMAN!"
// The classic "Na na na na na na na na BATMAN!"
const basicTheme = [
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNana,
  ...basicSongParts.lowNanaNanaNanaNanaWithBatman,
];

/**
 * Creates a PCM Wave data for a sound of specified frequency and duration
 * @param {number|number[]|null} freq - The frequency in Hz or array of frequencies for chords, null for silence
 * @param {number} duration - The duration in seconds
 * @param {number} sampleRate - The sample rate (default 44100)
 * @param {Object} options - Additional options for sound generation
 * @returns {Int16Array} - PCM audio data
 */
function createWave(freq, duration, sampleRate = 44100, options = {}) {
  const MAX_AMPLITUDE = 32760; // Maximum amplitude for 16-bit audio (slightly below max to prevent clipping)
  const numSamples = Math.ceil(sampleRate * duration);
  const buffer = new Int16Array(numSamples);

  // Set default options
  const opts = {
    fadeIn: 0.005, // 5ms default fade in (as fraction of duration)
    fadeOut: 0.05, // 5% default fade out (as fraction of duration)
    sustainLevel: 0.8, // Volume level during sustain phase (80% for piano-like sound)
    decayRate: 0.5, // How much the sound decays over time (0 = no decay, 1 = full decay)
    attackCurve: 0.8, // Attack curve shape (higher = more curved, more piano-like)
    releaseCurve: 0.7, // Release curve shape (higher = more curved)
    harmonicRichness: 0.3, // Amount of harmonic content (0-1)
    ...options
  };

  // Handle silence/rest case
  if (freq === null) {
    return buffer; // Return a buffer of zeros (silence)
  }

  // Handle single note case directly
  if (!Array.isArray(freq)) {
    // Simple sine wave for a single frequency
    for (let i = 0; i < numSamples; i++) {
      // Calculate envelope with piano-like ADSR (Attack, Decay, Sustain, Release)
      const position = i / numSamples; // Position in the sample (0 to 1)
      let envelope = 1.0;

      // Improved piano-like envelope
      const attackTime = Math.min(opts.fadeIn * numSamples, numSamples * 0.05); // Max 5% for attack
      const decayTime = Math.min(0.15 * numSamples, numSamples * 0.3); // 15-30% decay phase
      const releaseStartPosition = 0.9; // Start release at 90% of the duration
      const releaseTime = numSamples * (1 - releaseStartPosition); // Last 10% for release

      if (i < attackTime) {
        // Attack phase - curved rise for piano-like attack
        const normalizedPosition = i / attackTime;
        envelope = Math.pow(normalizedPosition, opts.attackCurve); // Curved attack
      } else if (i < attackTime + decayTime) {
        // Decay phase - exponential falloff to sustain level
        const decayPosition = (i - attackTime) / decayTime;
        envelope = 1.0 - ((1.0 - opts.sustainLevel) * decayPosition);
      } else if (position > releaseStartPosition) {
        // Release phase - exponential falloff
        const releasePosition = (i - (numSamples * releaseStartPosition)) / releaseTime;
        envelope = opts.sustainLevel * Math.pow(1.0 - releasePosition, opts.releaseCurve);
      } else {
        // Sustain phase with gentle decay throughout
        const sustainPosition = (i - (attackTime + decayTime)) / (numSamples * releaseStartPosition - (attackTime + decayTime));
        const decayAmount = opts.decayRate * sustainPosition * (1.0 - opts.sustainLevel) * 0.3;
        envelope = Math.max(opts.sustainLevel * 0.7, opts.sustainLevel - decayAmount);
      }

      buffer[i] = Math.round(MAX_AMPLITUDE * envelope * Math.sin(2 * Math.PI * freq * i / sampleRate));
    }
    return buffer;
  }

  // For chords, use a different approach with harmonics
  const frequencies = Array.isArray(freq) ? freq : [freq];

  // Sort frequencies from lowest to highest
  const sortedFrequencies = [...frequencies].sort((a, b) => a - b);

  // Get the root (lowest) frequency
  const rootFrequency = sortedFrequencies[0];

  // Generate a more complex waveform with harmonics based on the root note
  // This creates a richer sound that sounds like a chord without the beating effect
  for (let i = 0; i < numSamples; i++) {
    // Apply piano-like envelope
    const position = i / numSamples; // Position in the sample (0 to 1)
    let envelope = 1.0;

    // Improved piano-like envelope
    const attackTime = Math.min(opts.fadeIn * numSamples, numSamples * 0.05); // Max 5% for attack
    const decayTime = Math.min(0.15 * numSamples, numSamples * 0.3); // 15-30% decay phase
    const releaseStartPosition = 0.9; // Start release at 90% of the duration
    const releaseTime = numSamples * (1 - releaseStartPosition); // Last 10% for release

    if (i < attackTime) {
      // Attack phase - curved rise for piano-like attack
      const normalizedPosition = i / attackTime;
      envelope = Math.pow(normalizedPosition, opts.attackCurve); // Curved attack
    } else if (i < attackTime + decayTime) {
      // Decay phase - exponential falloff to sustain level
      const decayPosition = (i - attackTime) / decayTime;
      envelope = 1.0 - ((1.0 - opts.sustainLevel) * decayPosition);
    } else if (position > releaseStartPosition) {
      // Release phase - exponential falloff
      const releasePosition = (i - (numSamples * releaseStartPosition)) / releaseTime;
      envelope = opts.sustainLevel * Math.pow(1.0 - releasePosition, opts.releaseCurve);
    } else {
      // Sustain phase with gentle decay throughout
      const sustainPosition = (i - (attackTime + decayTime)) / (numSamples * releaseStartPosition - (attackTime + decayTime));
      const decayAmount = opts.decayRate * sustainPosition * (1.0 - opts.sustainLevel) * 0.3;
      envelope = Math.max(opts.sustainLevel * 0.7, opts.sustainLevel - decayAmount);
    }

    // Start with the fundamental frequency (root note)
    let sample = Math.sin(2 * Math.PI * rootFrequency * i / sampleRate);

    // Add all the chord tones
    for (let j = 1; j < sortedFrequencies.length; j++) {
      const noteFreq = sortedFrequencies[j];

      // Find the ratio between frequencies (important for harmonic relationships)
      const ratio = noteFreq / rootFrequency;

      // Adjust amplitude based on position in the chord (higher notes are softer)
      // This simulates the natural attenuation of higher frequencies in a piano
      const noteAmplitude = 0.7 / Math.sqrt(j + 1);

      // Add the fundamental of this note
      sample += noteAmplitude * Math.sin(2 * Math.PI * noteFreq * i / sampleRate);

      // Add the first overtone (one octave higher) for richness
      // Higher notes have less pronounced overtones (like a real piano)
      const overtoneStrength = opts.harmonicRichness * (1.0 - (j / sortedFrequencies.length) * 0.5);
      sample += noteAmplitude * overtoneStrength * 0.3 * Math.sin(2 * Math.PI * noteFreq * 2 * i / sampleRate);

      // Add subtle second overtone (octave + fifth)
      sample += noteAmplitude * overtoneStrength * 0.15 * Math.sin(2 * Math.PI * noteFreq * 3 * i / sampleRate);

      // Add harmonic interactions based on interval relationships
      // Perfect fifth (~1.5 ratio)
      if (ratio > 1.4 && ratio < 1.6) {
        sample += 0.12 * Math.sin(2 * Math.PI * rootFrequency * 1.5 * i / sampleRate);
      }
      // Octave (~2.0 ratio) 
      if (ratio > 1.9 && ratio < 2.1) {
        sample += 0.15 * Math.sin(2 * Math.PI * rootFrequency * 2 * i / sampleRate);
      }
      // Major third (~1.25 ratio)
      if (ratio > 1.24 && ratio < 1.27) {
        sample += 0.10 * Math.sin(2 * Math.PI * rootFrequency * 1.25 * i / sampleRate);
      }
    }

    // Add a bit of the first and second overtones for all chords (makes them sound richer)
    const baseOvertone = 0.2 * opts.harmonicRichness;
    sample += baseOvertone * Math.sin(2 * Math.PI * rootFrequency * 2 * i / sampleRate);
    sample += baseOvertone * 0.5 * Math.sin(2 * Math.PI * rootFrequency * 3 * i / sampleRate);

    // Piano strings also vibrate slightly at inharmonic frequencies
    // This subtle effect adds realism to the sound
    if (opts.harmonicRichness > 0.2) {
      const inharmonicity = 0.05 * opts.harmonicRichness;
      sample += inharmonicity * Math.sin(2 * Math.PI * rootFrequency * 2.01 * i / sampleRate);
      sample += inharmonicity * 0.5 * Math.sin(2 * Math.PI * rootFrequency * 3.02 * i / sampleRate);
    }

    // Normalize the sample between -1 and 1
    // Account for all added harmonics to prevent clipping
    const totalHarmonics = 1.0 + baseOvertone * 1.5 + (opts.harmonicRichness > 0.2 ? 0.075 * opts.harmonicRichness : 0);
    const normalizationFactor = totalHarmonics + (sortedFrequencies.length - 1) * 0.7;
    sample = Math.max(-1.0, Math.min(1.0, sample / normalizationFactor));

    // Apply envelope and scale to our amplitude range
    buffer[i] = Math.round(MAX_AMPLITUDE * envelope * sample);
  }

  return buffer;
}

/**
 * Plays a tone of specified frequency for a given duration
 * @param {number|number[]|null} freq - The frequency in Hz or array of frequencies for chords, null for silence
 * @param {number} duration - The duration in seconds
 * @param {Object} options - Additional options for sound generation
 * @returns {Promise} - Resolves when the tone finishes playing
 */
async function playTone(freq, duration, options = {}) {
  return new Promise(resolve => {
    // Handle silence/rest case
    if (freq === null) {
      setTimeout(resolve, duration * 1000);
      return;
    }

    // Calculate envelope options based on duration
    const envelopeOptions = {
      // For longer notes, increase the decay rate for a more natural piano-like sound
      decayRate: Math.min(0.7, duration * 0.5), // More decay for longer notes
      ...options
    };
    if (process.platform === 'win32') {
      // Windows has a native beep function, but it can only play one frequency at a time
      // For chords on Windows, we'll use the root frequency for simplicity
      if (Array.isArray(freq)) {
        // Get the most important frequency from the chord (usually the lowest)
        const mainFreq = freq[0];
        const { exec } = require('child_process');
        const playDuration = Math.round(duration * 1000);

        // Play the main note of the chord
        exec(`powershell -c "[console]::beep(${Math.round(mainFreq)}, ${playDuration})"`, () => resolve());

        if (playDuration > 50) {
          setTimeout(resolve, playDuration - 10);
        }
      } else {
        // Single note on Windows
        const { exec } = require('child_process');
        const playDuration = Math.round(duration * 1000);
        exec(`powershell -c "[console]::beep(${Math.round(freq)}, ${playDuration})"`, () => resolve());
        if (playDuration > 50) {
          setTimeout(resolve, playDuration - 10);
        }
      }
    } else {
      // For other platforms we can properly mix frequencies into a single wave
      const sampleRate = 44100;
      const wave = createWave(freq, duration, sampleRate, envelopeOptions);

      // Convert to Buffer for stdout
      const buffer = Buffer.from(wave.buffer);

      // On macOS, we can use afplay with a process
      if (process.platform === 'darwin') {
        const fs = require('fs');
        const { spawn } = require('child_process');
        const tempFile = `/tmp/nananana-${Date.now()}.wav`;

        // Simple WAV header (44 bytes)
        const header = Buffer.alloc(44);

        // RIFF chunk descriptor
        header.write('RIFF', 0);
        header.writeUInt32LE(36 + buffer.length, 4); // File size
        header.write('WAVE', 8);

        // "fmt " sub-chunk
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16); // Length of format data
        header.writeUInt16LE(1, 20); // PCM format
        header.writeUInt16LE(1, 22); // Mono channel
        header.writeUInt32LE(sampleRate, 24); // Sample rate
        header.writeUInt32LE(sampleRate * 2, 28); // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
        header.writeUInt16LE(2, 32); // Block align (NumChannels * BitsPerSample/8)
        header.writeUInt16LE(16, 34); // Bits per sample

        // "data" sub-chunk
        header.write('data', 36);
        header.writeUInt32LE(buffer.length, 40); // Data size

        // Write the WAV file
        fs.writeFileSync(tempFile, Buffer.concat([header, buffer]));

        // Play with afplay
        const play = spawn('afplay', [tempFile]);

        play.on('close', () => {
          // Cleanup the temp file
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignore errors in cleanup
          }
          resolve();
        });
      } else {
        // For Linux, we can't really do chords with the terminal bell
        // So we'll just use the first frequency if it's an array
        process.stdout.write('\u0007');

        // Try playing through aplay if available (for better Linux support)
        if (Array.isArray(freq)) {
          try {
            const { spawnSync } = require('child_process');
            // Check if aplay is available
            const checkAplay = spawnSync('which', ['aplay']);

            if (checkAplay.status === 0) {
              // aplay exists, try to use it for better sound quality
              const fs = require('fs');
              const { spawn } = require('child_process');
              const tempFile = `/tmp/nananana-${Date.now()}.wav`;

              // Create a simple WAV file similar to macOS approach
              const header = Buffer.alloc(44);

              // Same WAV header as in macOS block
              header.write('RIFF', 0);
              header.writeUInt32LE(36 + buffer.length, 4);
              header.write('WAVE', 8);
              header.write('fmt ', 12);
              header.writeUInt32LE(16, 16);
              header.writeUInt16LE(1, 20);
              header.writeUInt16LE(1, 22);
              header.writeUInt32LE(sampleRate, 24);
              header.writeUInt32LE(sampleRate * 2, 28);
              header.writeUInt16LE(2, 32);
              header.writeUInt16LE(16, 34);
              header.write('data', 36);
              header.writeUInt32LE(buffer.length, 40);

              // Write and play
              fs.writeFileSync(tempFile, Buffer.concat([header, buffer]));
              spawn('aplay', [tempFile]);

              // Cleanup after playing
              setTimeout(() => {
                try { fs.unlinkSync(tempFile); } catch (e) { }
              }, duration * 1000 + 100);
            }
          } catch (err) {
            // Fall back to default behavior
          }
        }

        // Wait for the duration to finish
        setTimeout(resolve, duration * 1000);
      }
    }
  });
}

/**
 * Plays a sequence of notes with the specified timings
 * @param {Array} sequence - Array of [frequency, duration] pairs or [leftHand, leftDuration, rightHand, rightDuration]
 */
async function playSequence(sequence) {
  for (const item of sequence) {
    if (item.length === 2) {
      // Standard format: [frequency, duration]
      const [freq, duration] = item;
      await playTone(freq, duration);
      // Minimal gap between notes (or no gap at all)
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    else if (item.length === 4) {
      // Piano-style format: [leftHand, leftDuration, rightHand, rightDuration]
      const [leftHandFreq, leftHandDuration, rightHandFreq, rightHandDuration] = item;

      // Start both hands simultaneously and track them independently
      const leftHandPromise = playTone(leftHandFreq, leftHandDuration);
      const rightHandPromise = playTone(rightHandFreq, rightHandDuration);

      // Wait for both to complete (the longer of the two will determine the total time)
      await Promise.all([leftHandPromise, rightHandPromise]);

      // Minimal gap between notes
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
}

/**
 * Displays Batman ASCII art
 */
function displayBatmanLogo() {
  const lines = `
> var alfredNumber = 867-5309;

> callAlfred(alfredNumber);

> ...
${YELLOW}${BOLD}
> NaN NaN NaN NaN NaN NaN NaN NaN

${BLACK_BG}
 ____________________________________________________________
|       _,     _   _     ,_                                  |
|   .o888P     Y8o8Y     Y888o.     BBBBB      A     TTTTTTT |
|  d88888      88888      88888b    B    B    A A       I    |
| d888888b_  _d88888b_  _d888888b   BBBBB    A   A      I    |
| 8888888888888888888888888888888   B    B  AAAAAAA     I    |
| 8888888888888888888888888888888   BBBBB  A       A    I    |
| 8888888888888888888888888888888                            |
| 'JGS8P"Y888P"Y888P"Y888P"Y8888'   MM   MM     A     NN   N |
|  Y888   '8'   Y8P   '8'   888Y    MMM MMM    A A    N N  N |
|   "8o          V          o8"     M  M  M   AAAAA   N  N N |
|     '                     '       M     M  A     A  N   NN |
|____________________________________________________________|
  ${RESET}




  `.split('\n');
  // prints a line each quarter second while music is playing
  lines.forEach((line, index) => {
    setTimeout(() => {
      process.stdout.write(line + '\n');
    }, index * ((120 / 152) * 1000));
  });
}

/**
 * Main function to play the Batman theme
 */
async function playBatmanTheme() {
  // Display Batman logo
  displayBatmanLogo();

  // Check if we should play the extended theme
  const args = process.argv.slice(2);
  const playBasic = args.includes('--basic');

  if (playBasic) {
    // Play the classic theme
    if (process.platform === 'darwin') {
      await playSequenceAsOneFile(basicTheme);
    } else {
      await playSequence(basicTheme);
    }
  } else {
    const enhancedTheme = createPianoStyleBatmanTheme();

    if (process.platform === 'darwin') {
      await playSequenceAsOneFile(enhancedTheme);
    } else {
      await playSequence(enhancedTheme);
    }
  }
}

/**
 * For macOS, plays all notes as a single continuous WAV file
 * This eliminates gaps between notes completely
 * @param {Array} sequence - Array of [frequency, duration] pairs or [leftHand, leftDuration, rightHand, rightDuration]
 */
async function playSequenceAsOneFile(sequence) {
  if (process.platform !== 'darwin') {
    return playSequence(sequence);
  }

  const fs = require('fs');
  const { spawn } = require('child_process');
  const sampleRate = 44100;

  // Calculate total duration and sample count
  let totalDuration = 0;
  for (const item of sequence) {
    if (item.length === 2) {
      // Standard [freq, duration] format
      totalDuration += item[1];
    } else if (item.length === 4) {
      // Piano-style [leftHand, leftDuration, rightHand, rightDuration]
      // Use the maximum of the two durations
      totalDuration += Math.max(item[1], item[3]);
    }
  }

  const totalSamples = Math.ceil(sampleRate * totalDuration);

  // Create a buffer for the entire sequence
  const buffer = new Int16Array(totalSamples);

  // Fill the buffer with the sequence of notes
  let sampleIndex = 0;

  // Track the previous note for crossfading
  let prevNoteBuffer = null;
  let crossfadeLength = Math.floor(sampleRate * 0.01); // 10ms crossfade

  for (const item of sequence) {
    if (item.length === 2) {
      // Standard [freq, duration] format
      const [freq, duration] = item;

      // Generate the current note with piano envelope based on duration
      const envelopeOptions = {
        decayRate: Math.min(0.7, duration * 0.5) // More decay for longer notes
      };
      const noteBuffer = createWave(freq, duration, sampleRate, envelopeOptions);

      // Apply crossfade if we have a previous note
      if (prevNoteBuffer && crossfadeLength > 0) {
        // We'll only crossfade at the beginning of this note
        // to smoothly transition from the previous note
        for (let i = 0; i < Math.min(crossfadeLength, noteBuffer.length); i++) {
          const fadeRatio = i / crossfadeLength; // 0 to 1
          const prevFadeRatio = 1 - fadeRatio;

          // Crossfade the last few samples of prev note with first few of current
          if (sampleIndex - crossfadeLength + i >= 0 && sampleIndex - crossfadeLength + i < buffer.length) {
            buffer[sampleIndex - crossfadeLength + i] =
              Math.round((prevNoteBuffer[prevNoteBuffer.length - crossfadeLength + i] * prevFadeRatio) +
                (noteBuffer[i] * fadeRatio));
          }
        }
      }

      // Copy the main part of this note (after any crossfade section)
      for (let i = (prevNoteBuffer ? crossfadeLength : 0); i < noteBuffer.length; i++) {
        if (sampleIndex < buffer.length) {
          buffer[sampleIndex++] = noteBuffer[i];
        }
      }

      // Save this note for possible crossfade with the next
      prevNoteBuffer = noteBuffer;
    }
    else if (item.length === 4) {
      // Piano-style [leftHand, leftDuration, rightHand, rightDuration]
      const [leftHandFreq, leftHandDuration, rightHandFreq, rightHandDuration] = item;

      // Generate buffers for both hands with appropriate envelopes
      const leftHandOptions = {
        decayRate: Math.min(0.7, leftHandDuration * 0.5) // More decay for longer notes
      };
      const rightHandOptions = {
        decayRate: Math.min(0.7, rightHandDuration * 0.5) // More decay for longer notes
      };

      const leftHandBuffer = createWave(leftHandFreq, leftHandDuration, sampleRate, leftHandOptions);
      const rightHandBuffer = createWave(rightHandFreq, rightHandDuration, sampleRate, rightHandOptions);

      // Mix the two hands together with crossfade from previous
      const maxDuration = Math.max(leftHandDuration, rightHandDuration);
      const maxSamples = Math.ceil(sampleRate * maxDuration);
      const mixedBuffer = new Int16Array(maxSamples);

      // First mix the two hands together
      for (let i = 0; i < maxSamples; i++) {
        let sample = 0;

        // Add left hand if still playing
        if (i < leftHandBuffer.length) {
          sample += leftHandBuffer[i] * 0.5; // Scale to prevent clipping
        }

        // Add right hand if still playing
        if (i < rightHandBuffer.length) {
          sample += rightHandBuffer[i] * 0.5; // Scale to prevent clipping
        }

        mixedBuffer[i] = Math.min(32767, Math.max(-32768, sample)); // Prevent clipping
      }

      // Apply crossfade if we have a previous note
      if (prevNoteBuffer && crossfadeLength > 0) {
        for (let i = 0; i < Math.min(crossfadeLength, mixedBuffer.length); i++) {
          const fadeRatio = i / crossfadeLength; // 0 to 1
          const prevFadeRatio = 1 - fadeRatio;

          if (sampleIndex - crossfadeLength + i >= 0 && sampleIndex - crossfadeLength + i < buffer.length) {
            buffer[sampleIndex - crossfadeLength + i] =
              Math.round((prevNoteBuffer[prevNoteBuffer.length - crossfadeLength + i] * prevFadeRatio) +
                (mixedBuffer[i] * fadeRatio));
          }
        }
      }

      // Copy the mixed buffer to the main buffer
      for (let i = (prevNoteBuffer ? crossfadeLength : 0); i < mixedBuffer.length; i++) {
        if (sampleIndex < buffer.length) {
          buffer[sampleIndex++] = mixedBuffer[i];
        }
      }

      // Save this note for possible crossfade with the next
      prevNoteBuffer = mixedBuffer;
    }
  }

  // Convert the filled buffer to a Node.js Buffer
  const audioBuffer = Buffer.from(buffer.buffer);

  // Create a temporary WAV file
  const tempFile = `/tmp/nananana-full-${Date.now()}.wav`;

  // Create WAV header
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + audioBuffer.length, 4); // File size
  header.write('WAVE', 8);

  // "fmt " sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Length of format data
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(1, 22); // Mono channel
  header.writeUInt32LE(sampleRate, 24); // Sample rate
  header.writeUInt32LE(sampleRate * 2, 28); // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
  header.writeUInt16LE(2, 32); // Block align (NumChannels * BitsPerSample/8)
  header.writeUInt16LE(16, 34); // Bits per sample

  // "data" sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(audioBuffer.length, 40); // Data size

  // Write the complete WAV file
  fs.writeFileSync(tempFile, Buffer.concat([header, audioBuffer]));

  // Play the file
  return new Promise(resolve => {
    const play = spawn('afplay', [tempFile]);

    play.on('close', () => {
      // Cleanup
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      resolve();
    });
  });
}

/**
 * Creates a demonstration of piano-style playing with independent left and right hands
 */
function createPianoStyleDemo() {
  return [
    // Simple left hand / right hand combination
    [[NOTE_C3, NOTE_E3, NOTE_G3], 0.4, [NOTE_E4, NOTE_G4], 0.2],  // Left hand chord with right hand melody
    [null, 0, [NOTE_C5], 0.2],  // Only right hand plays
    [[NOTE_G2, NOTE_B2, NOTE_D3], 0.4, [NOTE_D4, NOTE_G4], 0.2],  // Next chord with melody
    [null, 0, [NOTE_B4], 0.2],  // Only right hand plays

    // More complex example with longer right hand notes over changing left hand
    [[NOTE_C3, NOTE_G3], 0.3, [NOTE_E4, NOTE_G4, NOTE_C5], 0.9],  // Right hand holds longer
    [[NOTE_G2, NOTE_D3], 0.3, null, 0],  // Left hand changes while right hand continues
    [[NOTE_E2, NOTE_B2], 0.3, null, 0],  // Left hand changes again

    // Final chord
    [[NOTE_C3, NOTE_E3, NOTE_G3, NOTE_C4], 0.5, [NOTE_E4, NOTE_G4, NOTE_C5], 0.8]  // Final resolution with right hand lingering
  ];
}

/**
 * Creates an enhanced piano-style Batman theme with independent left and right hand parts
 * This uses the piano-style format: [leftHand, leftDuration, rightHand, rightDuration]
 */
function createPianoStyleBatmanTheme() {
  // Define the left hand bass accompaniment
  /**
   * default duration (152BPM = 1.579s per whole note)
   */
  const BPM = 152;
  const wholeNote = (240 / BPM) * 1.10; // 1.579 sec + 10% for sustain
  const halfNote = wholeNote / 2;
  const quarterNote = wholeNote / 4;
  const eightNote = wholeNote / 8;
  const emptyNote = [null, 0];

  const firstNananaBass = [
    [[NOTE_G2,  NOTE_D3,  NOTE_G3], eightNote],
    [[NOTE_Gb2, NOTE_Db3, NOTE_Gb3], eightNote],
    [[NOTE_F2,  NOTE_C3,  NOTE_F3], eightNote],
  ];
  const firstNananaMelody = [
    [NOTE_D5, eightNote],
    [NOTE_Db5, eightNote],
    [NOTE_C5, eightNote],
  ];

  const firstNanana = [
    // Na na na na na na na na
    [...firstNananaBass[0], ...firstNananaMelody[0]], // Na
    [...firstNananaBass[0], ...firstNananaMelody[0]], // na
    [...firstNananaBass[1], ...firstNananaMelody[1]], // na
    [...firstNananaBass[1], ...firstNananaMelody[1]], // na
    [...firstNananaBass[2], ...firstNananaMelody[2]], // na
    [...firstNananaBass[2], ...firstNananaMelody[2]], // na
    [...firstNananaBass[1], ...firstNananaMelody[1]], // na
    [...firstNananaBass[1], ...firstNananaMelody[1]], // na
  ];

  const firstBatManMelody =  [
    [[NOTE_G4,  NOTE_D5,  NOTE_F5, NOTE_G5], quarterNote],
    [[NOTE_G4,  NOTE_D5,  NOTE_F5, NOTE_G5], halfNote],
  ];

  const firstBatman = [
    // BATMAN!
    [...firstNananaBass[0], ...firstBatManMelody[0]], // BAT-
    [...firstNananaBass[0], ...emptyNote],
    [...firstNananaBass[1], ...firstBatManMelody[1]], // MAN!
    [...firstNananaBass[1], ...emptyNote],
    [...firstNananaBass[2], ...emptyNote],
    [...firstNananaBass[2], ...emptyNote],
    [...firstNananaBass[1], ...emptyNote],
    [...firstNananaBass[1], ...emptyNote],
  ];

  const firstNananaTransition = [
    [...firstNananaBass[0], ...firstNananaMelody[0]], // Na
    [...firstNananaBass[1], ...firstNananaMelody[1]], // na
  ];

  const leftHandBass2 = [NOTE_C4, NOTE_G4];
  const leftHandAltBass2 = [NOTE_C4, NOTE_Gb4];
  const leftHandDownBass2 = [NOTE_C4, NOTE_F4];
  const rightHandBatman2 = [NOTE_C5, NOTE_G5, NOTE_Bb5, NOTE_C6];
  const secondBatmanNanana = [
    // BATMAN!
    [leftHandBass2, 0.22, rightHandBatman2, 0.22],    // BAT-
    [leftHandBass2, 0.22, null, 0],
    [leftHandAltBass2, 0.22, null, 0],
    [leftHandAltBass2, 0.22, rightHandBatman2, 0.42], // MAN!
    [leftHandDownBass2, 0.22, null, 0],
    [leftHandDownBass2, 0.22, null, 0],
    [leftHandAltBass2, 0.22, null, 0],
    [leftHandAltBass2, 0.22, null, 0],
    // Na na na na na na na na
    [leftHandBass2, 0.22, [NOTE_D5], 0.22],                 // Na
    [leftHandBass2, 0.22, [NOTE_D5], 0.22],                 // na
    [leftHandAltBass2, 0.22, [NOTE_Db5], 0.22],             // na
    [leftHandAltBass2, 0.22, [NOTE_Db5], 0.22],             // na
    [leftHandDownBass2, 0.22, [NOTE_C5], 0.22],             // na
    [leftHandDownBass2, 0.22, [NOTE_C5], 0.22],             // na
    [leftHandAltBass2, 0.22, [NOTE_Db5], 0.22],             // na
    [leftHandAltBass2, 0.22, [NOTE_Db5], 0.22],             // na
    [leftHandBass2, 0.22, [NOTE_D5], 0.22],
  ];

  // Define the theme with piano-style independent hands
  return [
    ...firstNanana,
    ...firstNanana,
    ...firstNanana,
    ...firstNanana,
    ...firstBatman,
    ...firstNanana,
    ...firstBatman,
    ...firstNanana,
    ...firstNananaTransition,
    ...secondBatmanNanana,
    ...firstBatman,
  ];
}

// Run the theme
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
  ${YELLOW}${BOLD}nananana Theme Player${RESET}

  run ${BOLD}npx nananana${RESET} to call alfred
  
  Options:
    --basic   Play the basic piano-style Batman theme with full piano sound
    --piano      Play a demo of the piano-style playing capabilities
    --help       Show this help message
  `);
  process.exit(0);
} else if (args.includes('--piano')) {
  // Run a demo of the piano-style playing
  (async () => {
    console.log(`${YELLOW}${BOLD}Demonstrating piano-style playing with independent hands...${RESET}`);

    const pianoDemo = createPianoStyleDemo();

    // On macOS, use the optimized method
    if (process.platform === 'darwin') {
      await playSequenceAsOneFile(pianoDemo);
    } else {
      await playSequence(pianoDemo);
    }

    console.log(`${YELLOW}${BOLD}Piano demo complete!${RESET}`);
  })();
} else {
  // Run the Batman theme by default
  playBatmanTheme().catch(console.error);
}
