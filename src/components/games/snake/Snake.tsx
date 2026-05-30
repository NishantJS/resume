import { FC, useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./snake.css";

const GRID = 17;
const CELL = 30;
const SIZE = GRID * CELL; // logical canvas size
const SAVE_KEY = "snake:v1";

type Status = "ready" | "playing" | "paused" | "over";
interface Pt { x: number; y: number; }

interface GameRef {
  snake: Pt[];
  dir: Pt;
  queue: Pt[]; // queued direction changes (max 2) to avoid double-turn per step
  food: Pt;
  grow: number;
  acc: number;
  stepMs: number;
  last: number;
}

const SNAKE_INFO: GameInfo = {
  about:
    "Guide the snake to the food. Every bite makes it one segment longer and a little faster — survive as long as you can without hitting a wall or your own tail.",
  howTo: [
    "Steer with arrow keys, WASD, or swipes.",
    "Eat the red food to grow and score.",
    "Don't run into the walls or yourself.",
    "It speeds up as you grow — pace yourself.",
  ],
  controls: [
    { keys: "← → ↑ ↓", desc: "Turn" },
    { keys: "W A S D", desc: "Turn" },
    { keys: "Swipe", desc: "Turn" },
    { keys: "Space", desc: "Start / pause" },
  ],
  tips: ["Leave yourself an exit — don't coil into a corner.", "Use the edges to line up your next turn."],
};

function spawnFood(snake: Pt[]): Pt {
  const taken = new Set(snake.map(s => s.y * GRID + s.x));
  const free: number[] = [];
  for (let i = 0; i < GRID * GRID; i++) if (!taken.has(i)) free.push(i);
  const cell = free[Math.floor(Math.random() * free.length)] ?? 0;
  return { x: cell % GRID, y: Math.floor(cell / GRID) };
}

function initial(): GameRef {
  const snake = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ];
  return { snake, dir: { x: 1, y: 0 }, queue: [], food: spawnFood(snake), grow: 0, acc: 0, stepMs: 150, last: 0 };
}

function draw(ctx: CanvasRenderingContext2D, g: GameRef) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  // subtle grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
  }
  // food
  ctx.save();
  ctx.fillStyle = "#f43f5e";
  ctx.shadowColor = "rgba(244,63,94,0.8)";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // snake
  for (let i = g.snake.length - 1; i >= 0; i--) {
    const s = g.snake[i];
    const head = i === 0;
    ctx.fillStyle = head ? "#5eead4" : `rgba(20,184,166,${0.55 + 0.4 * (1 - i / g.snake.length)})`;
    const pad = head ? 2 : 3;
    const r = head ? 9 : 7;
    ctx.beginPath();
    ctx.roundRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, r);
    ctx.fill();
  }
}

const Snake: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const game = useRef<GameRef>(initial());

  const [status, setStatusState] = useState<Status>("ready");
  const [score, setScoreState] = useState(0);
  const [high, setHigh] = useState(0);

  const statusRef = useRef<Status>("ready");
  const scoreRef = useRef(0);
  const highRef = useRef(0);

  const setStatus = useCallback((s: Status) => { statusRef.current = s; setStatusState(s); }, []);
  const setScore = useCallback((n: number) => {
    scoreRef.current = n;
    setScoreState(n);
    if (n > highRef.current) { highRef.current = n; setHigh(n); void idbSet(SAVE_KEY, { high: n }); }
  }, []);

  useEffect(() => {
    idbGet<{ high: number }>(SAVE_KEY).then(d => { if (d?.high) { highRef.current = d.high; setHigh(d.high); } });
  }, []);

  const reset = useCallback(() => {
    game.current = initial();
    setScore(0);
    setStatus("ready");
  }, [setScore, setStatus]);

  const begin = useCallback(() => {
    const st = statusRef.current;
    if (st !== "ready" && st !== "over") return;
    if (st === "over") { game.current = initial(); setScore(0); }
    setStatus("playing");
  }, [setScore, setStatus]);

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") setStatus("paused");
    else if (statusRef.current === "paused") setStatus("playing");
  }, [setStatus]);

  const turn = useCallback((nx: number, ny: number) => {
    const g = game.current;
    const cur = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
    if (cur.x === -nx && cur.y === -ny) return; // no reversing
    if (cur.x === nx && cur.y === ny) return;
    if (g.queue.length < 2) g.queue.push({ x: nx, y: ny });
  }, []);

  // input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); turn(0, -1); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); turn(0, 1); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); turn(-1, 0); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); turn(1, 0); }
      else if (k === " " || k === "Spacebar") {
        e.preventDefault();
        if (statusRef.current === "playing" || statusRef.current === "paused") togglePause();
        else begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, togglePause, begin]);

  // swipe — native listeners on the play container so capture works from any child
  const playRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = playRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button")) return;
      swipeStart.current = { x: e.clientX, y: e.clientY };
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      if (statusRef.current === "ready" || statusRef.current === "over") begin();
    };
    const onUp = (e: PointerEvent) => {
      const d = swipeStart.current; swipeStart.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [begin, turn]);

  // canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const step = () => {
      const g = game.current;
      const dir = g.queue.shift() ?? g.dir;
      g.dir = dir;
      const head = { x: g.snake[0].x + dir.x, y: g.snake[0].y + dir.y };
      // collisions
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) { sfx.lose(); setStatus("over"); return; }
      if (g.snake.some((s, idx) => idx < g.snake.length - 1 && s.x === head.x && s.y === head.y)) { sfx.lose(); setStatus("over"); return; }
      g.snake.unshift(head);
      if (head.x === g.food.x && head.y === g.food.y) {
        sfx.pop();
        setScore(scoreRef.current + 1);
        g.stepMs = Math.max(70, g.stepMs - 4);
        g.food = spawnFood(g.snake);
      } else {
        g.snake.pop();
      }
    };

    const frame = (now: number) => {
      const g = game.current;
      const dt = g.last ? now - g.last : 0;
      g.last = now;
      if (statusRef.current === "playing") {
        g.acc += dt;
        while (g.acc >= g.stepMs && statusRef.current === "playing") {
          g.acc -= g.stepMs;
          step();
        }
      } else {
        g.acc = 0;
      }
      draw(ctx, g);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setScore, setStatus]);

  const overlay = (() => {
    switch (status) {
      case "ready": return { title: "Snake", sub: "Swipe or arrow keys to steer", btn: "Start", action: begin };
      case "paused": return { title: "Paused", sub: "Catch your breath", btn: "Resume", action: togglePause };
      case "over": return { title: "Game over", sub: `Score ${score}${score >= high && score > 0 ? " · new best!" : ""}`, btn: "Play again", action: begin };
      default: return null;
    }
  })();

  return (
    <GameShell
      slug="snake"
      subtitle={`Length ${score + 3}`}
      info={SNAKE_INFO}
      stats={
        <>
          <span className="game-stat"><i>Score</i><b>{score}</b></span>
          <span className="game-stat"><i>Best</i><b>{high}</b></span>
        </>
      }
      toolbar={
        <button type="button" className="snake-btn" onClick={togglePause} disabled={status === "ready" || status === "over"}>
          {status === "paused" ? "Resume" : "Pause"}
        </button>
      }
    >
      <div ref={playRef} className="snake-play">
        <div className="snake-stage">
          <div className="snake-frame">
            <canvas ref={canvasRef} className="snake-canvas" />
            {overlay && (
              <div className="snake-overlay">
                <p className="snake-overlay-title">{overlay.title}</p>
                <p className="snake-overlay-sub mono">{overlay.sub}</p>
                <button type="button" className="snake-btn primary" onClick={overlay.action}>{overlay.btn}</button>
                {status !== "ready" && <button type="button" className="snake-btn ghost" onClick={reset}>Reset</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Snake;
