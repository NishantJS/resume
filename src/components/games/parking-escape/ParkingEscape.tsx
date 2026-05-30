import { FC, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Board from "./Board";
import GameShell, { type GameInfo } from "../GameShell";
import { LEVELS } from "./levels";
import { useGameState } from "./useGameState";
import "./parking-escape.css";

const PE_INFO: GameInfo = {
  about:
    "A grid-lot puzzle. Every vehicle can only drive the one way its arrow points — tap it and it slides until it's blocked or escapes the lot. Clear them all.",
  howTo: [
    "Tap a vehicle to send it along its arrow.",
    "On touch you can also swipe a vehicle in its arrow direction.",
    "It slides until another vehicle blocks it or it leaves the board.",
    "Clear every vehicle to finish; fewer moves earns more stars.",
  ],
  controls: [
    { keys: "Tap / Swipe", desc: "Move a vehicle" },
    { keys: "Z", desc: "Undo" },
    { keys: "R", desc: "Restart level" },
    { keys: "H", desc: "Hint (one per level)" },
    { keys: "← →", desc: "Previous / next level" },
  ],
  tips: [
    "Bikes (1 cell) and trucks (4 cells) move the same way — just longer.",
    "Stuck? The single hint nudges the next car to move.",
  ],
};

/* ── Star icon ────────────────────────────────────────────── */
const Star: FC<{ filled?: boolean; size?: number }> = ({ filled, size = 22 }) => (
  <svg className={`pe-star ${filled ? "filled" : "empty"}`} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.6l2.96 6.5 7.04.78-5.3 4.87 1.56 6.96L12 18.27 5.74 21.7 7.3 14.75 2 9.88l7.04-.78L12 2.6z" />
  </svg>
);

/* ── Level rail ──────────────────────────────────────────── */
interface LevelRailProps {
  currentId: string;
  bestStars: Record<string, number>;
  isUnlocked: (id: string) => boolean;
  onSelect: (id: string) => void;
}
const LevelRail: FC<LevelRailProps> = ({ currentId, bestStars, isUnlocked, onSelect }) => (
  <div className="pe-rail" role="tablist" aria-label="Levels">
    {LEVELS.map((l, i) => {
      const locked = !isUnlocked(l.id);
      const active = currentId === l.id;
      const stars = bestStars[l.id] ?? 0;
      return (
        <button
          key={l.id}
          role="tab"
          aria-selected={active}
          aria-label={`Level ${i + 1}: ${l.name}, ${l.difficulty}${stars ? `, ${stars} stars` : ""}`}
          disabled={locked}
          onClick={() => !locked && onSelect(l.id)}
          className={`pe-level-chip ${active ? "active" : ""} ${locked ? "locked" : ""}`}
        >
          <span style={{ fontWeight: 600 }}>{locked ? "🔒" : i + 1}</span>
          <span className="pe-stars">
            <Star filled={stars >= 1} size={9} />
            <Star filled={stars >= 2} size={9} />
            <Star filled={stars >= 3} size={9} />
          </span>
        </button>
      );
    })}
  </div>
);

/* ── Completion overlay ──────────────────────────────────── */
interface CompleteProps {
  stars: number;
  moves: number;
  optimal: number;
  isBest: boolean;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
}
const Complete: FC<CompleteProps> = ({ stars, moves, optimal, isBest, hasNext, onNext, onReplay }) => (
  <div className="pe-overlay">
    <motion.div
      className="pe-overlay-card pe-pop"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <p className="mono text-xs uppercase tracking-[0.3em] opacity-60">Lot cleared</p>
      <h2 className="text-3xl md:text-4xl font-semibold mt-1">Well done.</h2>
      <div className="flex justify-center gap-1 mt-4">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 320, damping: 18 }}
          >
            <Star filled={i < stars} size={38} />
          </motion.span>
        ))}
      </div>
      <p className="mono text-sm mt-3 opacity-70">
        {moves} move{moves === 1 ? "" : "s"} · best {optimal}
        {isBest ? " · new record 🏁" : ""}
      </p>
      <div className="mt-5 flex gap-2 justify-center flex-wrap">
        <button className="pe-btn" onClick={onReplay} type="button">Replay</button>
        {hasNext && <button className="pe-btn primary" onClick={onNext} type="button">Next level →</button>}
      </div>
    </motion.div>
  </div>
);

const ParkingEscape: FC = () => {
  const api = useGameState();
  const reduced = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);

  // Screen shake on level completion.
  useEffect(() => {
    if (!api.showComplete || reduced) return;
    const el = shellRef.current;
    if (!el) return;
    el.classList.remove("pe-shake");
    void el.offsetWidth;
    el.classList.add("pe-shake");
  }, [api.showComplete, reduced]);

  // Keyboard: Z = undo, R = restart, H = hint, ←/→ = prev/next level.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea/i.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "z") { e.preventDefault(); api.undo(); }
      else if (k === "r") { e.preventDefault(); api.restart(); }
      else if (k === "h") { e.preventDefault(); api.requestHint(); }
      else if (e.key === "]" || e.key === "ArrowRight") {
        const i = LEVELS.findIndex(l => l.id === api.state.level.id);
        if (i >= 0 && i < LEVELS.length - 1 && api.isLevelUnlocked(LEVELS[i + 1].id)) api.loadLevel(LEVELS[i + 1].id);
      } else if (e.key === "[" || e.key === "ArrowLeft") {
        const i = LEVELS.findIndex(l => l.id === api.state.level.id);
        if (i > 0) api.loadLevel(LEVELS[i - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [api]);

  const levelIdx = useMemo(() => LEVELS.findIndex(l => l.id === api.state.level.id), [api.state.level.id]);
  const hasNext = levelIdx >= 0 && levelIdx < LEVELS.length - 1;
  const bestMoves = api.savedata.bestMoves[api.state.level.id];
  const isBest = typeof bestMoves === "number" && bestMoves >= api.state.moves;

  return (
    <GameShell
      slug="parking-escape"
      subtitle={`${api.state.level.name} · Level ${levelIdx + 1}/${LEVELS.length} · ${api.state.level.difficulty}`}
      info={PE_INFO}
      stats={
        <>
          <span className="game-stat"><i>Moves</i><b>{api.state.moves}</b></span>
          <span className="game-stat"><i>Best</i><b>{typeof bestMoves === "number" ? bestMoves : "—"}</b></span>
        </>
      }
      toolbar={
        <>
          <button
            type="button"
            className="pe-btn hint"
            onClick={api.requestHint}
            disabled={!api.canHint}
            aria-label={api.canHint ? "Show a hint" : "No hints left for this level"}
          >
            <BulbIcon /> Hint{api.hintsLeft > 0 ? "" : " used"}
          </button>
          <button type="button" className="pe-btn" onClick={api.undo} disabled={!api.canUndo} aria-label="Undo last move">
            <UndoIcon /> Undo
          </button>
          <button type="button" className="pe-btn" onClick={api.restart} aria-label="Restart level">
            <RestartIcon /> Restart
          </button>
        </>
      }
    >
      <div className="pe-play" ref={shellRef}>
        {/* ── Play area (fills remaining height) ──────────────── */}
        <div className="pe-stage-wrap">
          <Board
            state={api.state}
            lastOutcome={api.lastOutcome}
            blocked={api.blocked}
            hint={api.hint}
            onClickVehicle={api.click}
          />
          <AnimatePresence>
            {api.showComplete && (
              <Complete
                key="complete"
                stars={api.stars}
                moves={api.state.moves}
                optimal={api.optimal}
                isBest={isBest}
                hasNext={hasNext}
                onNext={api.goNextLevel}
                onReplay={api.restart}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Level rail ──────────────────────────────────────── */}
        <LevelRail
          currentId={api.state.level.id}
          bestStars={api.savedata.bestStars}
          isUnlocked={api.isLevelUnlocked}
          onSelect={api.loadLevel}
        />
      </div>
    </GameShell>
  );
};

const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" />
  </svg>
);
const RestartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" />
  </svg>
);
const BulbIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 18h6" /><path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
  </svg>
);

export default ParkingEscape;
