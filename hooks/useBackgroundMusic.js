import { useRef, useCallback, useEffect } from 'react';
import { getAudioContext, getMasterGain, resumeAudioContext, fullyUnlockAudio, closeAudioContext } from '../lib/audio';

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
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);
  const myGainRef = useRef(null);
  const volumeRef = useRef(0.5);
  
  // Speed values controlled inside mutable refs to prevent drift or stuttering
  const bpmRef = useRef(88); 
  const playbackRateRef = useRef(1.0); 

  const nextNoteTimeRef = useRef(0);
  const melodyIdxRef = useRef(0);
  const accumulatedBeatsRef = useRef(0);
  const timerIdRef = useRef(null);

  // Create our gain node and connect it to the shared master gain
  const getMyGain = useCallback(() => {
    if (!myGainRef.current) {
      const ctx = getAudioContext();
      myGainRef.current = ctx.createGain();
      myGainRef.current.gain.setValueAtTime(volumeRef.current, ctx.currentTime);
      myGainRef.current.connect(getMasterGain());
    }
    return myGainRef.current;
  }, []);

  const setVolume = useCallback((vol) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
    const gain = myGainRef.current;
    const ctx = getAudioContext();
    if (gain) {
      gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime);
    }
  }, []);

  // Expose a dedicated setter function to change speed on the fly (e.g., 0.5 for slow, 1.5 for fast)
  const setPlaybackSpeed = useCallback((rate) => {
    if (rate > 0) {
      playbackRateRef.current = rate;
    }
  }, []);

  const scheduleNextEvents = useCallback(() => {
    const ctx = getAudioContext();
    if (!isPlayingRef.current || !ctx) return;
    if (ctx.state === 'suspended') {
      resumeAudioContext().then(() => scheduleNextEvents()).catch(() => {});
      return;
    }
    // Ensure our gain node exists
    getMyGain();

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
              gain.connect(myGainRef.current || getMasterGain());
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
            gain.connect(myGainRef.current || getMasterGain());

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
    const ctx = getAudioContext();
    // iOS Safari: resume must be called in the same user gesture as creation
    const doStart = () => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;
      nextNoteTimeRef.current = (ctx?.currentTime || 0) + 0.05;
      melodyIdxRef.current = 0;
      accumulatedBeatsRef.current = 0;
      scheduleNextEvents();
    };
    if (ctx.state === 'suspended') {
      fullyUnlockAudio();
      ctx.resume().then(doStart).catch(() => {});
    } else {
      doStart();
    }
  }, [scheduleNextEvents]);

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
      if (document.visibilityState === 'visible') {
        fullyUnlockAudio().then(() => {
          if (isPlayingRef.current) scheduleNextEvents();
        }).catch(() => {});
      }
    };
    const handleResume = () => {
      fullyUnlockAudio().then(() => {
        if (isPlayingRef.current) scheduleNextEvents();
      }).catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('webkitresume', handleResume);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('webkitresume', handleResume);
    };
  }, [stop, scheduleNextEvents]);

  return { start, stop, toggleMute, setPlaybackSpeed, setVolume, isMuted: () => isMutedRef.current };
}