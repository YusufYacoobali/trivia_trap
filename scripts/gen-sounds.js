// Synthesizes two short WAV sound effects (correct / wrong) into assets/sounds.
// Run once with: node scripts/gen-sounds.js
const fs = require('fs');
const path = require('path');

const SR = 44100;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    let v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE((v * 32767) | 0, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

// A single tone with a configurable wave + exponential decay envelope.
function tone(freq, dur, { type = 'sine', decay = 18, gain = 0.5, startAt = 0 } = {}) {
  const n = Math.floor(SR * dur);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const phase = 2 * Math.PI * freq * t;
    let s;
    if (type === 'square') {
      // softened square (odd harmonics) for a buzzier but not harsh timbre
      s = Math.sin(phase) + 0.33 * Math.sin(3 * phase) + 0.2 * Math.sin(5 * phase);
      s *= 0.7;
    } else {
      s = Math.sin(phase);
    }
    const env = Math.exp(-decay * t) * (1 - Math.exp(-120 * t)); // quick attack, decay
    out[i] = s * env * gain;
  }
  return out;
}

// Mix several note layers, each starting at an offset (seconds), into one track.
function mix(layers, total) {
  const n = Math.floor(SR * total);
  const buf = new Array(n).fill(0);
  for (const { samples, startAt = 0 } of layers) {
    const off = Math.floor(SR * startAt);
    for (let i = 0; i < samples.length && off + i < n; i++) buf[off + i] += samples[i];
  }
  // soft clip
  return buf.map((v) => Math.tanh(v));
}

// CORRECT: bright ascending C–E–G major arpeggio (rewarding chime).
const correct = mix(
  [
    { samples: tone(523.25, 0.5, { decay: 9, gain: 0.45 }), startAt: 0.0 }, // C5
    { samples: tone(659.25, 0.5, { decay: 9, gain: 0.45 }), startAt: 0.09 }, // E5
    { samples: tone(783.99, 0.6, { decay: 7, gain: 0.5 }), startAt: 0.18 }, // G5
    { samples: tone(1046.5, 0.6, { decay: 7, gain: 0.32 }), startAt: 0.27 }, // C6 sparkle
  ],
  0.95,
);

// WRONG: short descending two-note buzz (gentle "nope").
const wrong = mix(
  [
    { samples: tone(196.0, 0.22, { type: 'square', decay: 14, gain: 0.4 }), startAt: 0.0 }, // G3
    { samples: tone(155.56, 0.34, { type: 'square', decay: 12, gain: 0.4 }), startAt: 0.16 }, // Eb3
  ],
  0.55,
);

const dir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'correct.wav'), wav(correct));
fs.writeFileSync(path.join(dir, 'wrong.wav'), wav(wrong));
console.log('Wrote assets/sounds/correct.wav and wrong.wav');
