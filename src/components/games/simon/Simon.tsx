import { FC, useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { isMuted } from "../sound";
import "./simon.css";

const SAVE_KEY = "simon:v1";
type Status = "idle" | "showing" | "input" | "over";

const PADS = [
  { name: "green", freq: 329.63 },
  { name: "red", freq: 261.63 },
  { name: "yellow", freq: 220.0 },
  { name: "blue", freq: 164.81 },
];

const SIMON_INFO: GameInfo = {
  about:
    "Simon flashes a growing pattern of colours and tones. Watch it, then repeat it back. Each round adds one more step — how far can your memory stretch?",
  howTo: [
    "Press Start, then watch the pads light up in order.",
    "Repeat the sequence by tapping the pads.",
    "Get it right and the sequence grows by one.",
    "One wrong pad ends the run.",
  ],
  controls: [{ keys: "Tap / Click", desc: "Press a pad" }],
  tips: ["Say the colours to yourself as they flash.", "Find a rhythm — the timing helps you remember."],
};

const Simon: FC = () => {
  const [status, setStatusState] = useState<Status>("idle");
  const [round, setRound] = useState(0);
  const [best, setBest] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const statusRef = useRef<Status>("idle");
  const seqRef = useRef<number[]>([]);
  const inputRef = useRef(0);
  const timers = useRef<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  const setStatus = useCallback((s: Status) => { statusRef.current = s; setStatusState(s); }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; }, []);

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => { if (d?.best) setBest(d.best); });
    return () => { timers.current.forEach(t => window.clearTimeout(t)); };
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) audioRef.current = new AC();
    } catch { /* no audio */ }
  }, []);

  const beep = useCallback((pad: number) => {
    if (isMuted()) return;
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = PADS[pad].freq;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.start(t); o.stop(t + 0.34);
    } catch { /* ignore */ }
  }, []);

  const lightPad = useCallback((pad: number, ms = 330) => {
    setActive(pad);
    beep(pad);
    const t = window.setTimeout(() => setActive(null), ms);
    timers.current.push(t);
  }, [beep]);

  const showSequence = useCallback(() => {
    setStatus("showing");
    const seq = seqRef.current;
    let delay = 520;
    seq.forEach(pad => {
      const on = window.setTimeout(() => { setActive(pad); beep(pad); }, delay);
      const off = window.setTimeout(() => setActive(null), delay + 340);
      timers.current.push(on, off);
      delay += 620;
    });
    const done = window.setTimeout(() => { inputRef.current = 0; setStatus("input"); }, delay + 120);
    timers.current.push(done);
  }, [beep, setStatus]);

  const nextRound = useCallback(() => {
    seqRef.current = [...seqRef.current, Math.floor(Math.random() * 4)];
    setRound(seqRef.current.length);
    const t = window.setTimeout(showSequence, 600);
    timers.current.push(t);
  }, [showSequence]);

  const start = useCallback(() => {
    clearTimers();
    ensureAudio();
    seqRef.current = [];
    inputRef.current = 0;
    setRound(0);
    setStatus("showing");
    nextRound();
  }, [clearTimers, ensureAudio, nextRound, setStatus]);

  const press = useCallback((pad: number) => {
    if (statusRef.current !== "input") return;
    lightPad(pad);
    const seq = seqRef.current;
    if (pad === seq[inputRef.current]) {
      inputRef.current += 1;
      if (inputRef.current === seq.length) {
        setStatus("showing");
        const t = window.setTimeout(nextRound, 720);
        timers.current.push(t);
      }
    } else {
      clearTimers();
      setStatus("over");
      const completed = seq.length - 1;
      setBest(prev => {
        const nb = Math.max(prev, completed);
        if (nb !== prev) void idbSet(SAVE_KEY, { best: nb });
        return nb;
      });
    }
  }, [clearTimers, lightPad, nextRound, setStatus]);

  const message =
    status === "idle" ? "Press start" :
    status === "showing" ? "Watch…" :
    status === "input" ? "Your turn" :
    "Game over";

  const padsLocked = status !== "input";

  return (
    <GameShell
      slug="simon"
      subtitle={message}
      info={SIMON_INFO}
      stats={
        <>
          <span className="game-stat"><i>Round</i><b>{round}</b></span>
          <span className="game-stat"><i>Best</i><b>{best}</b></span>
        </>
      }
      toolbar={
        <button type="button" className="simon-btn" onClick={start}>
          {status === "idle" ? "Start" : "Restart"}
        </button>
      }
    >
      <div className="simon-play">
        <div className="simon-wrap">
          <div className={`simon-board ${padsLocked ? "locked" : ""}`}>
            {PADS.map((pad, i) => (
              <button
                key={pad.name}
                type="button"
                className={`simon-pad ${pad.name} ${active === i ? "active" : ""}`}
                onClick={() => press(i)}
                disabled={padsLocked}
                aria-label={pad.name}
              />
            ))}
            <div className="simon-hub">
              <span className="simon-hub-round">{round}</span>
              <span className="simon-hub-label mono">{status === "over" ? "over" : "round"}</span>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Simon;
