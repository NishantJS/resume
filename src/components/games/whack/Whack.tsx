import { FC, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./whack.css";

const HOLES = 9;
const DURATION = 30; // seconds
const SAVE_KEY = "whack-a-mole:v1";

type Status = "ready" | "playing" | "over";

const INFO: GameInfo = {
  about:
    "Moles pop out of the holes — tap each one before it ducks back down. They come faster as the clock runs, so keep scanning the whole board.",
  howTo: [
    "Press Start to begin the 30-second round.",
    "Tap a mole while it's up to bonk it and score.",
    "Miss one and it just disappears — no penalty, but no points.",
    "Rack up the highest score before time runs out.",
  ],
  controls: [{ keys: "Tap / Click", desc: "Bonk a mole" }],
  tips: ["Don't fixate on one hole — moles cluster late in the round.", "Quick taps beat careful aim."],
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

const Whack: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [status, setStatusState] = useState<Status>("ready");
  const [up, setUp] = useState<boolean[]>(() => Array(HOLES).fill(false));
  const [score, setScoreState] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);

  const statusRef = useRef<Status>("ready");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const moles = useRef<number[]>(Array(HOLES).fill(0)); // expiry timestamp, 0 = down
  const endTime = useRef(0);
  const nextSpawn = useRef(0);
  const rafRef = useRef(0);

  const setStatus = useCallback((s: Status) => { statusRef.current = s; setStatusState(s); }, []);

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => { if (d?.best) { bestRef.current = d.best; setBest(d.best); } });
  }, []);

  const start = useCallback(() => {
    const now = performance.now();
    moles.current = Array(HOLES).fill(0);
    setUp(Array(HOLES).fill(false));
    scoreRef.current = 0;
    setScoreState(0);
    endTime.current = now + DURATION * 1000;
    nextSpawn.current = now + 500;
    setTimeLeft(DURATION);
    setStatus("playing");
  }, [setStatus]);

  const whack = (i: number) => {
    if (statusRef.current !== "playing") return;
    if (moles.current[i] > performance.now()) {
      moles.current[i] = 0;
      setUp(u => { const n = [...u]; n[i] = false; return n; });
      scoreRef.current += 1;
      setScoreState(scoreRef.current);
      sfx.pop();
    }
  };

  // main loop
  useEffect(() => {
    const frame = (now: number) => {
      if (statusRef.current === "playing") {
        if (now >= endTime.current) {
          sfx.win();
          setStatus("over");
          moles.current = Array(HOLES).fill(0);
          setUp(Array(HOLES).fill(false));
          setTimeLeft(0);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBest(scoreRef.current);
            void idbSet(SAVE_KEY, { best: scoreRef.current });
          }
        } else {
          const left = Math.ceil((endTime.current - now) / 1000);
          setTimeLeft(prev => (prev === left ? prev : left));
          const elapsed = 1 - (endTime.current - now) / (DURATION * 1000);
          const interval = lerp(820, 430, elapsed);
          const dur = lerp(950, 620, elapsed);

          let changed = false;
          for (let i = 0; i < HOLES; i++) {
            if (moles.current[i] && now > moles.current[i]) { moles.current[i] = 0; changed = true; }
          }
          if (now >= nextSpawn.current) {
            const down: number[] = [];
            for (let i = 0; i < HOLES; i++) if (moles.current[i] === 0) down.push(i);
            if (down.length) {
              const i = down[Math.floor(Math.random() * down.length)];
              moles.current[i] = now + dur;
              changed = true;
            }
            nextSpawn.current = now + interval;
          }
          if (changed) setUp(moles.current.map(m => m > now));
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setStatus]);

  return (
    <GameShell
      slug="whack-a-mole"
      subtitle={status === "playing" ? "Bonk!" : status === "over" ? "Time!" : "Ready?"}
      info={INFO}
      stats={
        <>
          <span className="game-stat"><i>Score</i><b>{score}</b></span>
          <span className="game-stat"><i>Time</i><b>{timeLeft}s</b></span>
          <span className="game-stat"><i>Best</i><b>{best}</b></span>
        </>
      }
      toolbar={<button type="button" className="whk-btn" onClick={start}>{status === "ready" ? "Start" : "Restart"}</button>}
    >
      <div className="whk-play">
        <div className="whk-wrap">
          <div className="whk-board">
            {up.map((isUp, i) => (
              <button key={i} type="button" className="whk-hole" onClick={() => whack(i)} aria-label={isUp ? "Mole up — bonk it" : "Empty hole"}>
                <span className="whk-dirt" aria-hidden />
                <AnimatePresence>
                  {isUp && (
                    <motion.span
                      className="whk-mole"
                      initial={{ y: reduced ? 0 : "70%", opacity: reduced ? 1 : 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: reduced ? 0 : "75%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 460, damping: 30 }}
                      aria-hidden
                    >
                      🐹
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}

            {status !== "playing" && (
              <div className="whk-overlay">
                <p className="whk-overlay-title">{status === "over" ? "Time's up!" : "Whack-a-Mole"}</p>
                <p className="whk-overlay-sub mono">
                  {status === "over" ? `Score ${score}${score >= best && score > 0 ? " · new best!" : ""}` : "30 seconds on the clock"}
                </p>
                <button type="button" className="whk-btn primary" onClick={start}>{status === "over" ? "Play again" : "Start"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Whack;
