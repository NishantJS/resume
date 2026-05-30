import { FC, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./memory.css";

const EMOJIS = ["🚀", "🎮", "🎲", "🎯", "🎨", "🎵", "🏆", "🔥"];
const SAVE_KEY = "memory:v1";

interface Card { id: number; emoji: string; matched: boolean; }

const MEMORY_INFO: GameInfo = {
  about:
    "Eight pairs of cards face down. Flip them two at a time and remember where each one is to match every pair — in as few moves as you can.",
  howTo: [
    "Tap a card to flip it face up.",
    "Flip a second card to look for its match.",
    "A matching pair stays up; a mismatch flips back.",
    "Clear all eight pairs to win. Fewer moves is better.",
  ],
  controls: [{ keys: "Tap / Click", desc: "Flip a card" }],
  tips: ["Note the cards you reveal even when they don't match.", "Work in a consistent reading order to remember positions."],
};

function shuffled(): Card[] {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, id) => ({ id, emoji, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const Memory: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [cards, setCards] = useState<Card[]>(() => shuffled());
  const [flipped, setFlipped] = useState<number[]>([]); // indices currently face up & unmatched
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [gameId, setGameId] = useState(0); // bump to remount the board on New game
  const [hint, setHint] = useState<number[]>([]);
  const lock = useRef(false);
  const savedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const matchedCount = cards.filter(c => c.matched).length;
  const won = matchedCount === cards.length;

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => { if (d?.best) setBest(d.best); });
    return () => { timers.current.forEach(t => window.clearTimeout(t)); };
  }, []);

  useEffect(() => {
    if (!won || savedRef.current) return;
    savedRef.current = true;
    sfx.win();
    setBest(prev => {
      const next = prev === 0 ? moves : Math.min(prev, moves);
      void idbSet(SAVE_KEY, { best: next });
      return next;
    });
  }, [won, moves]);

  const newGame = useCallback(() => {
    clearTimers();
    lock.current = false;
    savedRef.current = false;
    setCards(shuffled());
    setFlipped([]);
    setHint([]);
    setMoves(0);
    setGameId(g => g + 1);
  }, [clearTimers]);

  // Hint: briefly reveal one matching pair (costs a move).
  const requestHint = useCallback(() => {
    if (won || lock.current || hint.length) return;
    const byEmoji: Record<string, number[]> = {};
    cards.forEach((c, i) => {
      if (c.matched || flipped.includes(i)) return;
      (byEmoji[c.emoji] ||= []).push(i);
    });
    const pair = Object.values(byEmoji).find(g => g.length >= 2);
    if (!pair) return;
    setHint([pair[0], pair[1]]);
    setMoves(m => m + 1);
    timers.current.push(window.setTimeout(() => setHint([]), 1000));
  }, [cards, flipped, won, hint.length]);

  const flip = (i: number) => {
    if (lock.current || won) return;
    if (cards[i].matched || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    sfx.click();
    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        lock.current = true;
        sfx.good();
        timers.current.push(window.setTimeout(() => {
          setCards(cs => cs.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          lock.current = false;
        }, 360));
      } else {
        lock.current = true;
        timers.current.push(window.setTimeout(() => { setFlipped([]); lock.current = false; sfx.bad(); }, 820));
      }
    }
  };

  return (
    <GameShell
      slug="memory"
      subtitle={won ? "Solved!" : "Find every pair"}
      info={MEMORY_INFO}
      stats={
        <>
          <span className="game-stat"><i>Moves</i><b>{moves}</b></span>
          <span className="game-stat"><i>Pairs</i><b>{matchedCount / 2}/{cards.length / 2}</b></span>
          <span className="game-stat"><i>Best</i><b>{best || "—"}</b></span>
        </>
      }
      toolbar={
        <>
          <button type="button" className="mem-btn ghost" onClick={requestHint} disabled={won}>Hint</button>
          <button type="button" className="mem-btn" onClick={newGame}>New game</button>
        </>
      }
    >
      <div className="mem-play">
        <div className="mem-wrap">
          <div className="mem-board" key={gameId}>
            {cards.map((card, i) => {
              const up = card.matched || flipped.includes(i) || hint.includes(i);
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`mem-card ${card.matched ? "matched" : ""}`}
                  onClick={() => flip(i)}
                  aria-label={up ? `Card ${card.emoji}` : "Hidden card"}
                >
                  <motion.div
                    className="mem-card-inner"
                    animate={{ rotateY: up ? 180 : 0 }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
                  >
                    <span className="mem-face mem-back" aria-hidden>?</span>
                    <span className="mem-face mem-front" aria-hidden>{card.emoji}</span>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Memory;
