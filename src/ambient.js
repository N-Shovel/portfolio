// Calm generative ambient music, synthesized with the Web Audio API (no audio files):
// sea-like noise, slow open chords, and koto-like plucks in the Japanese "in" scale, through an echo.

const CHORDS = [
  [146.83, 220.0, 293.66, 392.0],  // D  A  D  G
  [116.54, 146.83, 220.0, 293.66], // Bb D  A  D
  [98.0, 146.83, 196.0, 233.08],   // G  D  G  Bb
  [155.56, 233.08, 293.66, 392.0], // Eb Bb D  G
];
const SCALE = [440.0, 587.33, 622.25, 783.99, 880.0, 932.33, 1174.66]; // A, then D Eb G A Bb D
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

// A plucked-string note: starts slightly sharp and bright, then settles and darkens as it decays.
function playPluck(out, echo, freq, at) {
  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(freq * 1.01, at);
  body.frequency.exponentialRampToValueAtTime(freq, at + 0.08);
  const overtone = ctx.createOscillator();
  overtone.type = 'sine';
  overtone.frequency.value = freq * 2;
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.value = 0.25;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.setValueAtTime(3500, at);
  tone.frequency.exponentialRampToValueAtTime(700, at + 1.5);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(0.07, at + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, at + 2.4);
  body.connect(tone);
  overtone.connect(overtoneGain).connect(tone);
  tone.connect(env);
  env.connect(out);
  env.connect(echo);
  body.start(at);
  overtone.start(at);
  body.stop(at + 2.5);
  overtone.stop(at + 2.5);
}

export function startAmbient() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 3);
  master.connect(ctx.destination);

  // Echo for the plucks and a little of the pad.
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

  // wander through the scale in small steps, sometimes answering with the note below
  let note = 3;
  const nextPluck = () => {
    note = Math.max(0, Math.min(SCALE.length - 1, note + Math.round((Math.random() - 0.5) * 4)));
    const at = ctx.currentTime + 0.05;
    playPluck(master, echo, SCALE[note], at);
    if (note > 0 && Math.random() < 0.35) playPluck(master, echo, SCALE[note - 1], at + 0.4);
    timers.push(setTimeout(nextPluck, 2200 + Math.random() * 4000));
  };
  timers.push(setTimeout(nextPluck, 3000));
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
