// Web Audio API Synthesizer - Real-time acoustic & haptic feedback without external audio files
const AudioFeedback = (() => {
  let audioCtx = null;

  function initCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Pleasant crystal chime for successful barcode scan
  function playSuccess() {
    try {
      initCtx();
      if (!audioCtx) return;
      
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6

      osc2.frequency.setValueAtTime(1760, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.04);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      // Trigger mobile haptic
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
  }

  // Deep buzz for barcode mismatch or warning
  function playWarning() {
    try {
      initCtx();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);

      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 120]);
      }
    } catch (e) {
      console.warn('Audio warning error:', e);
    }
  }

  // Attention ping for customer substitution request
  function playAlert() {
    try {
      initCtx();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      [660, 880, 1100].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const start = now + (idx * 0.09);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.18);
      });

      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 150]);
      }
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // Victory fanfare on order completion / checkout
  function playComplete() {
    try {
      initCtx();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const start = now + (i * 0.1);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });

      if (navigator.vibrate) {
        navigator.vibrate([70, 50, 70, 50, 120]);
      }
    } catch (e) {
      console.warn('Audio complete error:', e);
    }
  }

  return {
    init: initCtx,
    success: playSuccess,
    warning: playWarning,
    alert: playAlert,
    complete: playComplete
  };
})();

// Allow first user click/touch to unlock Web Audio API on mobile
window.addEventListener('click', () => AudioFeedback.init(), { once: true });
window.addEventListener('touchstart', () => AudioFeedback.init(), { once: true });
