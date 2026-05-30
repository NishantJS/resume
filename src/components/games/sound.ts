/**
 * Tiny shared Web Audio sound-effects helper for the games. One lazily-created
 * AudioContext (started on the first user gesture), a global mute flag persisted
 * across sessions, and a handful of synthesized effects — no audio assets.
 */
let ctx: AudioContext | null = null;
let muted = false;
const MUTE_KEY = "nc-games:muted";

if (typeof window !== "undefined") {
  try { muted = window.localStorage.getItem(MUTE_KEY) === "1"; } catch { /* ignore */ }
}

function ac(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      ctx = AC ? new AC() : null;
    } catch { ctx = null; }
  }
  if (ctx && ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isMuted(): boolean { return muted; }
export function setMuted(m: boolean): void {
  muted = m;
  try { window.localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch { /* ignore */ }
}
export function toggleMuted(): boolean { setMuted(!muted); return muted; }

interface ToneOpts { freq: number; dur?: number; type?: OscillatorType; gain?: number; delay?: number; sweep?: number; }

function tone({ freq, dur = 0.12, type = "sine", gain = 0.12, delay = 0, sweep = 0 }: ToneOpts): void {
  const c = ac();
  if (!c) return;
  try {
    const t0 = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (sweep) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch { /* ignore */ }
}

function seq(notes: Array<[number, number]>, type: OscillatorType = "sine", gain = 0.12): void {
  for (const [freq, delay] of notes) tone({ freq, dur: 0.15, type, gain, delay });
}

export const sfx = {
  click: () => tone({ freq: 320, dur: 0.05, type: "triangle", gain: 0.07 }),
  pop: () => tone({ freq: 620, dur: 0.09, type: "sine", gain: 0.11 }),
  place: () => tone({ freq: 440, dur: 0.07, type: "square", gain: 0.06 }),
  move: () => tone({ freq: 240, dur: 0.06, type: "triangle", gain: 0.06 }),
  hit: () => tone({ freq: 200, dur: 0.05, type: "square", gain: 0.05, sweep: 90 }),
  bounce: () => tone({ freq: 360, dur: 0.04, type: "triangle", gain: 0.06 }),
  good: () => seq([[523, 0], [784, 0.08]], "sine", 0.11),
  bad: () => tone({ freq: 140, dur: 0.26, type: "sawtooth", gain: 0.09, sweep: -70 }),
  win: () => seq([[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]], "sine", 0.12),
  lose: () => seq([[392, 0], [311, 0.13], [196, 0.27]], "sawtooth", 0.11),
};
