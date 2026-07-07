import { useRef, useCallback, useEffect } from 'react';

// Exact E-Major Pentatonic frequencies used in Grieg's opening motif
const E4 = 329.63, Fs4 = 369.99, Gs4 = 415.30, B4 = 493.88;
const Cs5 = 554.37, E5 = 659.25, Fs5 = 739.99, Gs5 = 830.61, B5 = 987.77, Cs6 = 1109.73;
const E3 = 164.81, Gs3 = 207.65, B3 = 246.94, A3 = 220.00;

// Authentic Morning Mood chord changes mapping perfectly to the phrases
const CHORDS = [
  [E3, B3, E4, Gs4],   // Phrase 1 (Home E major)
  [Gs3, B3, E4, Gs4],  // Phrase 2 (Inversion/Shift)
  [A3, Cs5, E4, Gs4],  // Phrase 3 (Lift)
  [E3, B3, E4, Gs4]    // Resolution
];

// Correct note sequence of Morning Mood in 6/8 meter
// dur: 1 = eighth note, 3 = dotted quarter note
const MELODY = [
  // First phrase line
  { note: E4, dur: 1 }, { note: Fs4, dur: 1 }, { note: Gs4, dur: 1 }, { note: B4, dur: 1 }, { note: Gs4, dur: 1 }, { note: Fs4, dur: 1 },
  { note: E4, dur: 1 }, { note: Fs4, dur: 1 }, { note: Gs4, dur: 1 }, { note: B4, dur: 1 }, { note: Gs4, dur: 2 }, { note: B4, dur: 1 },
  
  // Second phrase line (climbing up)
  { note: Gs4, dur: 1 }, { note: B4, dur: 1 }, { note: Cs5, dur: 1 }, { note: E5, dur: 1 }, { note: Cs5, dur: 1 }, { note: B4, dur: 1 },
  { note: Gs4, dur: 1 }, { note: B4, dur: 1 }, { note: Cs5, dur: 1 }, { note: E5, dur: 1 }, { note: Cs5, dur: 3 },

  // Third phrase line (High octave copy)
  { note: E5, dur: 1 }, { note: Fs5, dur: 1 }, { note: Gs5, dur: 1 }, { note: B5, dur: 1 }, { note: Gs5, dur: 1 }, { note: Fs5, dur: 1 },
  { note: E5, dur: 1 }, { note: Fs5, dur: 1 }, { note: Gs5, dur: 1 }, { note: B5, dur: 1 }, { note: Gs5, dur: 2 }, { note: B5, dur: 1 },
  
  // Resolution cascade
  { note: Gs5, dur: 1 }, { note: B5, dur: 1 }, { note: Cs6, dur: 1 }, { note: B5, dur: 1 }, { note: Gs5, dur: 1 }, { note: Fs5, dur: 1 },
  { note: E5, dur: 6 } // Long final hold
];

export default function useBackgroundMusic() {
  const audioCtxRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);
  const masterGainRef = useRef(null);
  const volumeRef = useRef(0.5);
  
  // Speed values controlled inside mutable refs to prevent drift or stuttering
  const bpmRef = useRef(88); 
  const playbackRateRef = useRef(1.0); 

  const nextNoteTimeRef = useRef(0);
  const melodyIdxRef = useRef(0);
  const accumulatedBeatsRef = useRef(0);
  const timerIdRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(volumeRef.current, audioCtxRef.current.currentTime);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    return audioCtxRef.current;
  }, []);

  // Expose a dedicated setter function to change speed on the fly (e.g., 0.5 for slow, 1.5 for fast)
  const setPlaybackSpeed = useCallback((rate) => {
    if (rate > 0) {
      playbackRateRef.current = rate;
    }
  }, []);

  const setVolume = useCallback((vol) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volumeRef.current, audioCtxRef.current.currentTime);
    }
  }, []);

  const scheduleNextEvents = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => scheduleNextEvents()).catch(() => {});
      return;
    }

    // Adjust core timings based on the customized user playback speed
    const directEighthDur = (60 / bpmRef.current);
    const eighthNoteDur = directEighthDur / playbackRateRef.current;
    const measureDur = eighthNoteDur * 6;

    while (nextNoteTimeRef.current < ctx.currentTime + 0.3) {
      const currentNote = MELODY[melodyIdxRef.current];
      const durationSeconds = currentNote.dur * eighthNoteDur;
      const t = nextNoteTimeRef.current;

      if (!isMutedRef.current) {
        const targetChordIdx = Math.floor(accumulatedBeatsRef.current / 6) % CHORDS.length;

        // Trigger Backing Chord Harmony
        if (accumulatedBeatsRef.current % 6 === 0) {
          const chord = CHORDS[targetChordIdx];
          chord.forEach((freq, idx) => {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t);
              
              const vol = idx < 2 ? 0.016 : 0.008;
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(vol, t + 0.1);
              gain.gain.setValueAtTime(vol, t + measureDur - 0.15);
              gain.gain.exponentialRampToValueAtTime(0.001, t + measureDur);
              
              osc.connect(gain);
              gain.connect(masterGainRef.current || ctx.destination);
              osc.start(t);
              osc.stop(t + measureDur);
            } catch (_) {}
          });
        }

        // Trigger Main Flute Track
        if (currentNote.note) {
          try {
            const oscSine = ctx.createOscillator();
            const oscTri = ctx.createOscillator();
            const gain = ctx.createGain();

            oscSine.type = 'sine';
            oscSine.frequency.setValueAtTime(currentNote.note, t);
            
            oscTri.type = 'triangle';
            oscTri.frequency.setValueAtTime(currentNote.note, t);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.02, t + 0.03); 
            gain.gain.setValueAtTime(0.02, t + durationSeconds * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, t + durationSeconds * 0.95);

            const triGain = ctx.createGain();
            triGain.gain.setValueAtTime(0.18, t); // Blend clean flute warmth

            oscTri.connect(triGain);
            triGain.connect(gain);
            oscSine.connect(gain);
            gain.connect(masterGainRef.current || ctx.destination);

            oscSine.start(t);
            oscSine.stop(t + durationSeconds);
            oscTri.start(t);
            oscTri.stop(t + durationSeconds);
          } catch (_) {}
        }
      }

      // Keep timeline index completely bound to variables
      accumulatedBeatsRef.current += currentNote.dur;
      nextNoteTimeRef.current += durationSeconds;
      melodyIdxRef.current = (melodyIdxRef.current + 1) % MELODY.length;

      if (melodyIdxRef.current === 0) {
        accumulatedBeatsRef.current = 0;
      }
    }

    timerIdRef.current = setTimeout(scheduleNextEvents, 45);
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    // iOS Safari: resume must be called in the same user gesture as creation
    const doStart = () => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;
      nextNoteTimeRef.current = (audioCtxRef.current?.currentTime || 0) + 0.05;
      melodyIdxRef.current = 0;
      accumulatedBeatsRef.current = 0;
      scheduleNextEvents();
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(doStart).catch(() => {});
    } else {
      doStart();
    }
  }, [getCtx, scheduleNextEvents]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  useEffect(() => {
    // iOS Safari: AudioContext gets suspended when switching tabs/apps
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (isPlayingRef.current) scheduleNextEvents();
        }).catch(() => {});
      }
    };
    const handleResume = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (isPlayingRef.current) scheduleNextEvents();
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('webkitresume', handleResume);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('webkitresume', handleResume);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stop, scheduleNextEvents]);

  return { start, stop, toggleMute, setPlaybackSpeed, setVolume, isMuted: () => isMutedRef.current };
}