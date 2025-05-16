#!/usr/bin/env node

/**
 * nananana - Play the Batman theme song from your terminal
 * This program uses native Node.js capabilities to play the sound
 * without any external dependencies.
 */

// ANSI escape sequences for some styling
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const BLACK_BG = '\x1b[40m';

// Define the notes frequencies for the Batman theme
const NOTE_C = 261.63;
const NOTE_C_SHARP = 277.18; // C#/Db
const NOTE_D = 293.66;
const NOTE_D_SHARP = 311.13; // D#/Eb
const NOTE_E = 329.63;
const NOTE_F = 349.23;
const NOTE_F_SHARP = 369.99; // F#/Gb
const NOTE_G = 392.00;
const NOTE_G_SHARP = 415.30; // G#/Ab
const NOTE_A = 440.00;
const NOTE_A_SHARP = 466.16; // A#/Bb
const NOTE_B = 493.88;

/**
 * Creates a PCM Wave data for a sound of specified frequency and duration
 * @param {number|number[]} freq - The frequency in Hz or array of frequencies for chords
 * @param {number} duration - The duration in seconds
 * @param {number} sampleRate - The sample rate (default 44100)
 * @returns {Int16Array} - PCM audio data
 */
function createWave(freq, duration, sampleRate = 44100) {
  const MAX_AMPLITUDE = 32760; // Maximum amplitude for 16-bit audio (slightly below max to prevent clipping)
  const numSamples = Math.ceil(sampleRate * duration);
  const buffer = new Int16Array(numSamples);

  // Handle single note case directly
  if (!Array.isArray(freq)) {
    // Simple sine wave for a single frequency
    for (let i = 0; i < numSamples; i++) {
      // Apply envelope to avoid pops
      let envelope = 1.0;
      const fadeTime = Math.min(0.005 * sampleRate, numSamples * 0.05); // 5ms fade or 5% of duration

      if (i < fadeTime) {
        envelope = i / fadeTime; // Fade in
      } else if (i > numSamples - fadeTime) {
        envelope = (numSamples - i) / fadeTime; // Fade out
      }

      buffer[i] = Math.round(MAX_AMPLITUDE * envelope * Math.sin(2 * Math.PI * freq * i / sampleRate));
    }
    return buffer;
  }

  // For chords, use a different approach with harmonics
  const frequencies = Array.isArray(freq) ? freq : [freq];

  // Sort frequencies from lowest to highest and limit to max 2 notes for clarity
  const sortedFrequencies = [...frequencies].sort((a, b) => a - b).slice(0, 2);

  // Get the root (lowest) frequency
  const rootFrequency = sortedFrequencies[0];

  // Generate a more complex waveform with harmonics based on the root note
  // This creates a richer sound that sounds like a chord without the beating effect
  for (let i = 0; i < numSamples; i++) {
    // Apply envelope for smooth start/end
    let envelope = 1.0;
    const fadeTime = Math.min(0.005 * sampleRate, numSamples * 0.05);

    if (i < fadeTime) {
      envelope = i / fadeTime; // Fade in
    } else if (i > numSamples - fadeTime) {
      envelope = (numSamples - i) / fadeTime; // Fade out
    }

    // Start with the fundamental frequency (root note)
    let sample = Math.sin(2 * Math.PI * rootFrequency * i / sampleRate);

    // If we have a second note, add it with adjustments to prevent beats
    if (sortedFrequencies.length > 1) {
      // Add harmonics based on the interval between the two notes
      const secondFreq = sortedFrequencies[1];

      // Find the ratio between frequencies (important for harmonic relationships)
      const ratio = secondFreq / rootFrequency;

      // Add the second note with reduced amplitude
      sample += 0.5 * Math.sin(2 * Math.PI * secondFreq * i / sampleRate);

      // Add a harmonic that will create a pleasing combined sound
      // This is based on the harmonic series and helps blend the notes
      sample += 0.3 * Math.sin(2 * Math.PI * rootFrequency * 2 * i / sampleRate); // First overtone

      // If the ratio is close to a perfect fifth (3:2 ~ 1.5), add that harmonic
      if (ratio > 1.4 && ratio < 1.6) {
        sample += 0.2 * Math.sin(2 * Math.PI * rootFrequency * 1.5 * i / sampleRate);
      }

      // If the ratio is close to a major third (5:4 ~ 1.25), add that harmonic
      if (ratio > 1.2 && ratio < 1.3) {
        sample += 0.15 * Math.sin(2 * Math.PI * rootFrequency * 1.25 * i / sampleRate);
      }
    }

    // Normalize the sample between -1 and 1
    sample = Math.max(-1.0, Math.min(1.0, sample / (sortedFrequencies.length > 1 ? 2.0 : 1.0)));

    // Apply envelope and scale to our amplitude range
    buffer[i] = Math.round(MAX_AMPLITUDE * envelope * sample);
  }

  return buffer;
}

/**
 * Plays a tone of specified frequency for a given duration
 * @param {number|number[]} freq - The frequency in Hz or array of frequencies for chords
 * @param {number} duration - The duration in seconds
 * @returns {Promise} - Resolves when the tone finishes playing
 */
async function playTone(freq, duration) {
  return new Promise(resolve => {
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
      const wave = createWave(freq, duration, sampleRate);

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
 * @param {Array} sequence - Array of [frequency, duration] pairs
 */
async function playSequence(sequence) {
  for (const [freq, duration] of sequence) {
    await playTone(freq, duration);
    // Minimal gap between notes (or no gap at all)
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

/**
 * Displays Batman ASCII art
 */
function displayBatmanLogo() {
  console.log(`${YELLOW}${BOLD}${BLACK_BG}
      _,    _   _    ,_
  .o888P     Y8o8Y     Y888o.
 d88888      88888      88888b
d888888b_  _d88888b_  _d888888b
8888888888888888888888888888888
8888888888888888888888888888888
YJGS8P"Y888P"Y888P"Y888P"Y8888P
 Y888   '8'   Y8P   '8'   888Y
  "8o          V          o8"
    \`                     \`
  ${RESET}
  `);
}

/**
 * Main function to play the Batman theme
 */
async function playBatmanTheme() {
  // Display Batman logo
  displayBatmanLogo();

  console.log(`${YELLOW}${BOLD}Playing Batman Theme...${RESET}`);

  // Batman theme notation (frequency, duration in seconds)
  // The classic "Na na na na na na na na BATMAN!"
  const batmanTheme = [
    // Na na na na - Use perfect fifths for clean harmony
    [NOTE_G, 0.3], [NOTE_E, 0.3], [NOTE_G, 0.3], [NOTE_E, 0.3],
    // Na na na na - Use major thirds for bright harmony
    [NOTE_G_SHARP, 0.3], [NOTE_F, 0.3], [NOTE_G_SHARP, 0.3], [NOTE_F, 0.3],
    // Na na na na - Perfect fifths again
    [NOTE_A, 0.3], [NOTE_F_SHARP, 0.3], [NOTE_A, 0.3], [NOTE_F_SHARP, 0.3],
    // Na na na na - Use perfect fifths for clean harmony
    [NOTE_G, 0.3], [NOTE_E, 0.3], [NOTE_G, 0.3], [NOTE_E, 0.3],
    // BAT-MAN! - Use octaves and fifths for dramatic ending
    [[NOTE_C * 2, NOTE_C], 0.6], [[NOTE_G, NOTE_G / 2], 0.8]
  ];

  // Special handling for macOS to create a single WAV file with all notes
  if (process.platform === 'darwin') {
    await playSequenceAsOneFile(batmanTheme);
  } else {
    await playSequence(batmanTheme);
  }

  console.log(`${YELLOW}${BOLD}BATMAN!${RESET}`);
}

/**
 * For macOS, plays all notes as a single continuous WAV file
 * This eliminates gaps between notes completely
 * @param {Array} sequence - Array of [frequency, duration] pairs
 */
async function playSequenceAsOneFile(sequence) {
  if (process.platform !== 'darwin') {
    return playSequence(sequence);
  }

  const fs = require('fs');
  const { spawn } = require('child_process');
  const sampleRate = 44100;

  // Calculate total duration and sample count
  const totalDuration = sequence.reduce((sum, [_, duration]) => sum + duration, 0);
  const totalSamples = Math.ceil(sampleRate * totalDuration);

  // Create a buffer for the entire sequence
  const buffer = new Int16Array(totalSamples);

  // Fill the buffer with the sequence of notes
  let sampleIndex = 0;

  // Track the previous note for crossfading
  let prevNoteBuffer = null;
  let crossfadeLength = Math.floor(sampleRate * 0.01); // 10ms crossfade

  for (const [freq, duration] of sequence) {
    // Generate the current note
    const noteBuffer = createWave(freq, duration, sampleRate);

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

// Run the theme
playBatmanTheme().catch(console.error);
