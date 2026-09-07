// A lightweight synthetic audio engine using the Web Audio API
// No external assets required.

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playClick = () => {
  try {
    initAudio();
    if (!audioCtx) return;
    
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);
  } catch (e) {
    // Ignore audio errors (e.g. strict autoplay policies)
  }
};

export const playCrunch = () => {
  try {
    initAudio();
    if (!audioCtx) return;

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  } catch (e) {
    // Ignore
  }
};

let activeHum: { osc: OscillatorNode; gain: GainNode } | null = null;

export const startWarningHum = () => {
  try {
    initAudio();
    if (!audioCtx || activeHum) return;

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, t); // Low 55Hz hum
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 1); // Fade in slowly

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    activeHum = { osc, gain };
  } catch (e) {
    // Ignore
  }
};

export const stopWarningHum = () => {
  if (!activeHum || !audioCtx) return;
  
  try {
    const t = audioCtx.currentTime;
    activeHum.gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
    activeHum.osc.stop(t + 0.5);
    activeHum = null;
  } catch (e) {
    activeHum = null;
  }
};
