import { useRef, useCallback } from 'react';
import { getAudioContext, getMasterGain, resumeAudioContext } from '../lib/audio';

export default function useSound() {
  const volumeRef = useRef(1.0);

  const setVolume = useCallback((vol) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
  }, []);

  const playTone = useCallback((freq, duration, type = 'square', gain = 0.15) => {
    try {
      const ctx = getAudioContext();
      resumeAudioContext(); // Fire-and-forget — iOS resume is async
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain * volumeRef.current, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(getMasterGain());
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }, []);

  const playClick = useCallback(() => playTone(880, 0.06, 'square', 0.12), [playTone]);

  const playBuy = useCallback(() => {
    const ctx = getAudioContext();
    resumeAudioContext();
    try {
      [523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.12 * volumeRef.current, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
        osc.connect(g);
        g.connect(getMasterGain());
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.15);
      });
    } catch (_) {}
  }, []);

  const playUpgrade = useCallback(() => {
    const ctx = getAudioContext();
    resumeAudioContext();
    try {
      [440, 554, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        g.gain.setValueAtTime(0.13 * volumeRef.current, ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(g);
        g.connect(getMasterGain());
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (_) {}
  }, []);

  const playSlotUpgrade = useCallback(() => {
    const ctx = getAudioContext();
    resumeAudioContext();
    try {
      [1200, 900, 1200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        g.gain.setValueAtTime(0.1 * volumeRef.current, ctx.currentTime + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
        osc.connect(g);
        g.connect(getMasterGain());
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.12);
      });
    } catch (_) {}
  }, []);

  const playLocationChange = useCallback(() => {
    const ctx = getAudioContext();
    resumeAudioContext();
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.12 * volumeRef.current, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(g);
      g.connect(getMasterGain());
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  }, []);

  return { playClick, playBuy, playUpgrade, playSlotUpgrade, playLocationChange, setVolume };
}
