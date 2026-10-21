// Calm generative ambient music, synthesized with the Web Audio API (no audio files):
// soft water/wind noise, slow pad chords and occasional chimes through an echo.

const CHORDS = [
  [130.81, 196.0, 246.94, 329.63], // Cmaj7
  [110.0, 164.81, 196.0, 261.63],  // Am7
  [87.31, 130.81, 164.81, 220.0],  // Fmaj7
  [98.0, 146.83, 196.0, 246.94],   // G
];
const CHIMES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C major pentatonic
const CHORD_SECONDS = 9;

let ctx = null;
let master = null;
let timers = [];

function brownNoise(seconds) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function startWater() {
  const src = ctx.createBufferSource();
  src.buffer = brownNoise(6);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 450;
  // A slow LFO on the filter makes the noise swell like waves.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 220;
  lfo.connect(lfoDepth).connect(filter.frequency);
  const gain = ctx.createGain();
  gain.gain.value = 0.1;
  src.connect(filter).connect(gain).connect(master);
  src.start();
  lfo.start();
}

function playChord(chord, at, out) {
  for (const freq of chord) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 12;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.035, at + 3);
    g.gain.linearRampToValueAtTime(0.03, at + CHORD_SECONDS - 1);
    g.gain.linearRampToValueAtTime(0, at + CHORD_SECONDS + 2);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + CHORD_SECONDS + 2.2);
  }
}

function playChime(out, echo) {
  const at = ctx.currentTime + 0.05;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = CHIMES[Math.floor(Math.random() * CHIMES.length)];
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(0.05, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 2.5);
  osc.connect(g);
  g.connect(out);
  g.connect(echo);
  osc.start(at);
  osc.stop(at + 2.6);
}

export function startAmbient() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 3);
  master.connect(ctx.destination);

  // Echo for the chimes and a little of the pad.
  const echo = ctx.createDelay(2);
  echo.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  echo.connect(feedback).connect(echo);
  echo.connect(wet).connect(master);

  const pad = ctx.createBiquadFilter();
  pad.type = 'lowpass';
  pad.frequency.value = 900;
  pad.connect(master);
  pad.connect(echo);

  startWater();

  let step = 0;
  const nextChord = () => {
    playChord(CHORDS[step++ % CHORDS.length], ctx.currentTime + 0.05, pad);
  };
  nextChord();
  timers.push(setInterval(nextChord, CHORD_SECONDS * 1000));

  const nextChime = () => {
    playChime(master, echo);
    timers.push(setTimeout(nextChime, 2500 + Math.random() * 4500));
  };
  timers.push(setTimeout(nextChime, 3000));
}

export function stopAmbient() {
  if (!ctx) return;
  const closing = ctx;
  timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
  timers = [];
  master.gain.cancelScheduledValues(closing.currentTime);
  master.gain.setValueAtTime(master.gain.value, closing.currentTime);
  master.gain.linearRampToValueAtTime(0, closing.currentTime + 1);
  setTimeout(() => closing.close(), 1100);
  ctx = null;
  master = null;
}
