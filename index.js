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
  
  // Handle both single notes and chords
  const frequencies = Array.isArray(freq) ? freq : [freq];
  
  // If we have a chord, limit the number of notes to prevent distortion
  const limitedFrequencies = frequencies.slice(0, 3); // Max 3 notes for cleaner sound
  
  // Calculate a proper amplitude scale that won't distort
  // Using a more conservative approach to prevent clipping
  const amplitudeScale = MAX_AMPLITUDE / (limitedFrequencies.length * 1.5);
  
  // Generate a cleaner wave with harmonic balance
  for (let i = 0; i < numSamples; i++) {
    let sample = 0;
    
    // Add each frequency component with different weights
    // This creates a more balanced sound
    for (let j = 0; j < limitedFrequencies.length; j++) {
      const f = limitedFrequencies[j];
      // Apply slight envelope to avoid clicks and pops at start/end
      let envelope = 1.0;
      const fadeTime = Math.min(0.01 * sampleRate, numSamples * 0.1); // 10ms fade or 10% of duration
      
      if (i < fadeTime) {
        envelope = i / fadeTime; // Fade in
      } else if (i > numSamples - fadeTime) {
        envelope = (numSamples - i) / fadeTime; // Fade out
      }
      
      // Weight the frequencies differently for better balance
      const weight = j === 0 ? 1.0 : 0.6; // Primary note louder than harmonics
      sample += weight * envelope * Math.sin(2 * Math.PI * f * i / sampleRate);
    }
    
    // Apply a soft limiter to prevent harsh clipping
    if (sample > 1.0) sample = 1.0;
    if (sample < -1.0) sample = -1.0;
    
    // Scale and round the final sample
    buffer[i] = Math.round(amplitudeScale * sample);
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
      // For chords on Windows, we'll play sequentially with minimal overlap
      if (Array.isArray(freq)) {
        // For chords on Windows, limit to max 2 notes and focus on the main melody note
        const limitedFreq = freq.slice(0, 2);
        const { exec } = require('child_process');
        const playDuration = Math.round(duration * 1000);
        
        // On Windows, we'll just play the primary note for chords to avoid distortion
        // This preserves the melody even though we lose the harmony
        exec(`powershell -c "[console]::beep(${Math.round(limitedFreq[0])}, ${playDuration})"`, () => resolve());
        
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
                try { fs.unlinkSync(tempFile); } catch(e) {}
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
    // Na na na na - use selective chords that sound good together
    [NOTE_G, 0.3], [[NOTE_G, NOTE_E], 0.3], [NOTE_G, 0.3], [[NOTE_G, NOTE_E], 0.3],
    // Na na na na
    [NOTE_G_SHARP, 0.3], [[NOTE_G_SHARP, NOTE_F], 0.3], [NOTE_G_SHARP, 0.3], [[NOTE_G_SHARP, NOTE_F], 0.3],
    // Na na na na
    [NOTE_A, 0.3], [[NOTE_A, NOTE_F_SHARP], 0.3], [NOTE_A, 0.3], [[NOTE_A, NOTE_F_SHARP], 0.3],
    // Na na na na
    [NOTE_G, 0.3], [[NOTE_G, NOTE_E], 0.3], [NOTE_G, 0.3], [[NOTE_G, NOTE_E], 0.3],
    // BAT-MAN! - use carefully balanced triads
    [[NOTE_C * 2, NOTE_G], 0.6], [[NOTE_G, NOTE_D], 0.8]
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
