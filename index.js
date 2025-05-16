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
 * @param {number} freq - The frequency in Hz
 * @param {number} duration - The duration in seconds
 * @param {number} sampleRate - The sample rate (default 44100)
 * @returns {Int16Array} - PCM audio data
 */
function createWave(freq, duration, sampleRate = 44100) {
  const amplitude = 32760; // Maximum amplitude for 16-bit audio
  const numSamples = Math.ceil(sampleRate * duration);
  const buffer = new Int16Array(numSamples);
  
  // Generate a sine wave
  for (let i = 0; i < numSamples; i++) {
    buffer[i] = Math.round(amplitude * Math.sin(2 * Math.PI * freq * i / sampleRate));
  }
  
  return buffer;
}

/**
 * Plays a tone of specified frequency for a given duration
 * @param {number} freq - The frequency in Hz
 * @param {number} duration - The duration in seconds
 * @returns {Promise} - Resolves when the tone finishes playing
 */
async function playTone(freq, duration) {
  return new Promise(resolve => {
    if (process.platform === 'win32') {
      // Windows has a native beep function
      const { exec } = require('child_process');
      exec(`powershell -c "[console]::beep(${Math.round(freq)}, ${Math.round(duration * 1000)})"`, resolve);
    } else {
      // For other platforms we'll use stdout to output the sound
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
          fs.unlinkSync(tempFile);
          resolve();
        });
      } else {
        // For Linux, output ASCII bell character or use system beep
        process.stdout.write('\u0007');
        
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
    // Small gap between notes
    await new Promise(resolve => setTimeout(resolve, 50));
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
    // Na na na na
    [NOTE_G, 0.3], [NOTE_E, 0.3], [NOTE_G, 0.3], [NOTE_E, 0.3],
    // Na na na na
    [NOTE_G_SHARP, 0.3], [NOTE_F, 0.3], [NOTE_G_SHARP, 0.3], [NOTE_F, 0.3],
    // Na na na na
    [NOTE_A, 0.3], [NOTE_F_SHARP, 0.3], [NOTE_A, 0.3], [NOTE_F_SHARP, 0.3],
    // Na na na na
    [NOTE_G, 0.3], [NOTE_E, 0.3], [NOTE_G, 0.3], [NOTE_E, 0.3],
    // BAT-MAN!
    [NOTE_C * 2, 0.6], [NOTE_G, 0.8]
  ];
  
  await playSequence(batmanTheme);
  
  console.log(`${YELLOW}${BOLD}BATMAN!${RESET}`);
}

// Run the theme
playBatmanTheme().catch(console.error);
