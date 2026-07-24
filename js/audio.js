const AudioManager = (() => {
  let audioContext = null;
  let musicGain = null;
  let soundGain = null;
  let musicEnabled = true;
  let soundEnabled = true;
  let bgmInterval = null;
  let isPlaying = false;

  function init() {
    if (audioContext) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      musicGain = audioContext.createGain();
      soundGain = audioContext.createGain();
      musicGain.connect(audioContext.destination);
      soundGain.connect(audioContext.destination);
      musicGain.gain.value = 0.15;
      soundGain.gain.value = 0.3;

      const settings = Storage.getSettings();
      musicEnabled = settings.music;
      soundEnabled = settings.sound;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  function resume() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(frequency, duration, type = 'sine', volume = 1) {
    if (!audioContext || !soundEnabled) return;
    resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume * soundGain.gain.value, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(soundGain);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  }

  function playClick() {
    playTone(800, 0.08, 'sine', 0.5);
  }

  function playEliminate(count = 1) {
    if (!audioContext || !soundEnabled) return;
    resume();

    const baseFreq = 400 + Math.min(count, 10) * 60;
    playTone(baseFreq, 0.1, 'triangle', 0.6);
    setTimeout(() => playTone(baseFreq * 1.25, 0.08, 'sine', 0.4), 30);
    setTimeout(() => playTone(baseFreq * 1.5, 0.12, 'sine', 0.3), 60);
  }

  function playCombo(combo) {
    if (!audioContext || !soundEnabled) return;
    resume();

    const notes = [523, 659, 784, 1047];
    const step = Math.min(combo - 1, notes.length - 1);
    for (let i = 0; i <= step; i++) {
      setTimeout(() => playTone(notes[i], 0.15, 'sine', 0.5), i * 60);
    }
  }

  function playLevelComplete() {
    if (!audioContext || !soundEnabled) return;
    resume();

    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle', 0.5), i * 100);
    });
  }

  function playGameOver() {
    if (!audioContext || !soundEnabled) return;
    resume();

    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sawtooth', 0.3), i * 120);
    });
  }

  function playItemUse() {
    if (!audioContext || !soundEnabled) return;
    resume();

    playTone(600, 0.1, 'sine', 0.4);
    setTimeout(() => playTone(900, 0.1, 'sine', 0.4), 50);
    setTimeout(() => playTone(1200, 0.15, 'sine', 0.4), 100);
  }

  function playShuffle() {
    if (!audioContext || !soundEnabled) return;
    resume();

    const notes = [440, 523, 659, 784, 880, 784, 659, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.08, 'triangle', 0.35);
      }, i * 40);
    });
  }

  function playButton() {
    playTone(600, 0.05, 'sine', 0.3);
  }

  function startBGM() {
    if (!audioContext || !musicEnabled || isPlaying) return;
    resume();
    isPlaying = true;

    const melody = [
      { note: 523, dur: 0.25 },
      { note: 659, dur: 0.25 },
      { note: 784, dur: 0.25 },
      { note: 659, dur: 0.25 },
      { note: 523, dur: 0.25 },
      { note: 784, dur: 0.25 },
      { note: 659, dur: 0.5 },
      { note: 0, dur: 0.25 },
      { note: 587, dur: 0.25 },
      { note: 698, dur: 0.25 },
      { note: 880, dur: 0.25 },
      { note: 698, dur: 0.25 },
      { note: 587, dur: 0.25 },
      { note: 880, dur: 0.25 },
      { note: 698, dur: 0.5 },
      { note: 0, dur: 0.25 },
    ];

    let noteIndex = 0;

    function playNextNote() {
      if (!isPlaying) return;

      const note = melody[noteIndex];
      if (note.note > 0) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.note, audioContext.currentTime);
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(musicGain.gain.value * 0.5, audioContext.currentTime + 0.02);
        gain.gain.linearRampToValueAtTime(musicGain.gain.value * 0.3, audioContext.currentTime + note.dur * 0.8);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.dur);
        osc.connect(gain);
        gain.connect(musicGain);
        osc.start();
        osc.stop(audioContext.currentTime + note.dur);
      }

      noteIndex = (noteIndex + 1) % melody.length;
      bgmInterval = setTimeout(playNextNote, note.dur * 1000);
    }

    playNextNote();
  }

  function stopBGM() {
    isPlaying = false;
    if (bgmInterval) {
      clearTimeout(bgmInterval);
      bgmInterval = null;
    }
  }

  function setMusicEnabled(enabled) {
    musicEnabled = enabled;
    if (enabled) {
      startBGM();
    } else {
      stopBGM();
    }
    Storage.setSettings({ music: enabled });
  }

  function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    Storage.setSettings({ sound: enabled });
  }

  function isMusicEnabled() {
    return musicEnabled;
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  return {
    init,
    resume,
    playClick,
    playEliminate,
    playCombo,
    playLevelComplete,
    playGameOver,
    playItemUse,
    playShuffle,
    playButton,
    startBGM,
    stopBGM,
    setMusicEnabled,
    setSoundEnabled,
    isMusicEnabled,
    isSoundEnabled
  };
})();