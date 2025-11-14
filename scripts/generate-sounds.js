const fs = require('fs');
const path = require('path');

// Helper function to create a WAV file
function createWavFile(filename, frequency, duration, amplitude) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  
  // Generate audio samples
  const samples = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Apply envelope to avoid clicking
    const envelope = Math.min(1, Math.min(i / (sampleRate * 0.005), (numSamples - i) / (sampleRate * 0.01)));
    const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope;
    const sample = Math.floor(value * 32767);
    samples.push(sample);
  }
  
  // Create WAV file buffer
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const headerSize = 44;
  const fileSize = headerSize + dataSize;
  
  const buffer = Buffer.alloc(fileSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);
  
  // Format chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Format chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // Byte rate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // Block align
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // Data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write samples
  let offset = 44;
  for (const sample of samples) {
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }
  
  // Write file
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate click sound (regular beat)
createWavFile(
  path.join(soundsDir, 'click.wav'),
  1000, // 1kHz
  0.05, // 50ms
  0.3   // 30% amplitude
);

// Generate accent sound (first beat)
createWavFile(
  path.join(soundsDir, 'accent.wav'),
  1200, // 1.2kHz (higher pitch)
  0.05, // 50ms
  0.5   // 50% amplitude (louder)
);

console.log('Sound files generated successfully!');
