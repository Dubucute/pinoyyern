// Shared AudioContext singleton for iOS compatibility.
// iOS only allows one AudioContext to play reliably — creating multiple
// instances can cause all of them to fail silently.
// MUST be created & resumed inside a user gesture on iOS.

let sharedCtx = null;
let sharedMasterGain = null;

/**
 * Create or return the shared AudioContext.
 * On iOS, call this from inside a user gesture (click/tap).
 */
export function getAudioContext() {
  if (!sharedCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    sharedCtx = new AC();
    sharedMasterGain = sharedCtx.createGain();
    sharedMasterGain.gain.setValueAtTime(1, sharedCtx.currentTime);
    sharedMasterGain.connect(sharedCtx.destination);
  }
  return sharedCtx;
}

/**
 * Get the shared master gain node (always connected to destination).
 */
export function getMasterGain() {
  if (!sharedMasterGain) getAudioContext();
  return sharedMasterGain;
}

/**
 * Resume the shared AudioContext if suspended.
 * MUST be called inside a user gesture on iOS.
 * Returns a promise that resolves when audio is ready.
 */
export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    return ctx.resume();
  }
  return Promise.resolve();
}

/**
 * Fully unlock iOS audio by resuming the context AND playing a silent buffer.
 * iOS Safari sometimes doesn't fully enable audio with resume() alone —
 * you need to actually play a short buffer to bypass the mute flag.
 * MUST be called inside a user gesture (click/tap).
 */
export async function fullyUnlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (_) {
      return;
    }
  }
  // Play a microsecond silent buffer to fully unlock the audio pipeline
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (_) {
    // Silent buffer may fail on some browsers — that's okay
  }
}

/**
 * Close and release the shared AudioContext.
 */
export function closeAudioContext() {
  if (sharedCtx) {
    sharedCtx.close().catch(() => {});
    sharedCtx = null;
    sharedMasterGain = null;
  }
}
