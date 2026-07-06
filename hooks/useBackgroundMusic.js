import { useRef, useCallback, useEffect } from 'react';

// Pentatonic melody notes (C major pentatonic)
const NOTES = [262, 294, 330, 392, 440, 523, 587, 659];
// Arpeggio pattern: indices into NOTES array
const PATTERN = [0, 2, 4, 6, 4, 2, 1, 3, 5, 7, 5, 3, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
const NOTE_DURATION = 0.18;
const NOTE_GAP = 0.04;
const STEP_DURATION = NOTE_DURATION + NOTE_GAP;
const VOLUME = 0.04;

export default function useBackgroundMusic() {
  const audioCtxRef = useRef(null);
  const isPlayingRef = useRef(false);
  const scheduleTimerRef = useRef(null);
  const currentStepRef = useRef(0);
  const gainNodeRef = useRef(null);
  const isMutedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const scheduleNotes = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const lookAhead = 0.1;
    const scheduleAhead = 0.5;

    while (currentStepRef.current * STEP_DURATION < now + scheduleAhead) {
      const stepTime = now + (currentStepRef.current * STEP_DURATION);
      const noteIdx = PATTERN[currentStepRef.current % PATTERN.length];
      const freq = NOTES[noteIdx];

      if (!isMutedRef.current) {
        try {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, stepTime);
          noteGain.gain.setValueAtTime(0, stepTime);
          noteGain.gain.linearRampToValueAtTime(VOLUME, stepTime + 0.02);
          noteGain.gain.setValueAtTime(VOLUME, stepTime + NOTE_DURATION - 0.03);
          noteGain.gain.exponentialRampToValueAtTime(0.001, stepTime + NOTE_DURATION);
          osc.connect(noteGain);
          noteGain.connect(ctx.destination);
          osc.start(stepTime);
          osc.stop(stepTime + NOTE_DURATION);
        } catch (_) {}
      }

      currentStepRef.current++;
    }

    // Schedule next batch
    scheduleTimerRef.current = setTimeout(scheduleNotes, 100);
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    currentStepRef.current = 0;
    scheduleNotes();
  }, [getCtx, scheduleNotes]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (scheduleTimerRef.current) {
      clearTimeout(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }
    currentStepRef.current = 0;
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  const isMuted = useCallback(() => isMutedRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stop]);

  return { start, stop, toggleMute, isMuted };
}
