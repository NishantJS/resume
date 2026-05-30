import { FC, useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./block-breaker.css";

/* ── Logical playfield (everything scales from here) ──────────── */
const W = 480;
const H = 720;
const BASE_PADDLE_W = 94;
const PADDLE_H = 14;
const PADDLE_Y = H - 46;
const BALL_R = 8;
const COLS = 8;
const TOP = 86;
const SIDE = 22;
const GAP = 8;
const BRICK_H = 24;
const BRICK_W = (W - 2 * SIDE - (COLS - 1) * GAP) / COLS;
const MAX_ANGLE = (Math.PI / 180) * 60;
const MAX_BALLS = 6;
const ROW_COLORS = ["#f43f5e", "#f97316", "#f59e0b", "#22c55e", "#06b6d4", "#6366f1", "#a855f7"];

type Status = "ready" | "playing" | "paused" | "lost" | "won";
type PowerKind = "multi" | "expand" | "slow" | "life" | "shrink" | "fast";

interface Brick { x: number; y: number; hp: number; max: number; color: string; }
interface Ball { x: number; y: number; dx: number; dy: number; }
interface Power { x: number; y: number; vy: number; kind: PowerKind; }

interface GameRef {
  paddleX: number;
  paddleW: number;
  balls: Ball[];
  bricks: Brick[];
  powers: Power[];
  pointerX: number | null;
  left: boolean;
  right: boolean;
  speed: number;
  expandUntil: number;
  slowUntil: number;
  shrinkUntil: number;
  fastUntil: number;
  last: number;
}

const POWER_META: Record<PowerKind, { color: string; glyph: string; label: string; bad?: boolean }> = {
  multi: { color: "#6366f1", glyph: "+", label: "Multi-ball" },
  expand: { color: "#06b6d4", glyph: "↔", label: "Wide paddle" },
  slow: { color: "#22c55e", glyph: "≈", label: "Slow ball" },
  life: { color: "#f43f5e", glyph: "♥", label: "Extra life" },
  shrink: { color: "#9333ea", glyph: "▿", label: "Paddle shrunk!", bad: true },
  fast: { color: "#dc2626", glyph: "⚡", label: "Ball sped up!", bad: true },
};
// Mix of buffs and liabilities — catch the good, dodge the bad.
const POWER_BAG: PowerKind[] = ["multi", "expand", "slow", "life", "shrink", "fast"];

const SAVE_KEY = "block-breaker:v1";

const BB_INFO: GameInfo = {
  about:
    "A neon arcade brick-breaker. Bounce the ball off your paddle to smash every brick, across levels that get faster and tougher. Catch falling power-ups for an edge.",
  howTo: [
    "Move the paddle to keep the ball in play.",
    "Clear every brick to advance to the next level.",
    "Lit (brighter) bricks take two hits.",
    "You have three lives — lose one whenever every ball drops.",
  ],
  controls: [
    { keys: "Move / Drag", desc: "Aim the paddle" },
    { keys: "← →", desc: "Move paddle" },
    { keys: "Space", desc: "Launch / pause" },
  ],
  legend: [
    { swatch: "#6366f1", glyph: "+", label: "Multi-ball" },
    { swatch: "#06b6d4", glyph: "↔", label: "Wider paddle" },
    { swatch: "#22c55e", glyph: "≈", label: "Slower ball" },
    { swatch: "#f43f5e", glyph: "♥", label: "Extra life" },
    { swatch: "#9333ea", glyph: "▿", label: "Shrinks paddle", bad: true },
    { swatch: "#dc2626", glyph: "⚡", label: "Speeds ball up", bad: true },
  ],
  tips: [
    "Hit the ball with the paddle edge to angle your shot.",
    "Catch the buffs and dodge the liabilities — they fall in the colours shown above.",
  ],
};

function levelSpeed(level: number) { return Math.min(5.2 + (level - 1) * 0.55, 9.2); }
function levelRows(level: number) { return Math.min(3 + level, 7); }

function buildBricks(level: number): Brick[] {
  const rows = levelRows(level);
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const tough = level >= 2 && r < Math.max(1, Math.floor(rows / 3));
      bricks.push({
        x: SIDE + c * (BRICK_W + GAP),
        y: TOP + r * (BRICK_H + GAP),
        hp: tough ? 2 : 1,
        max: tough ? 2 : 1,
        color: ROW_COLORS[r % ROW_COLORS.length],
      });
    }
  }
  return bricks;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Paint one frame. Pure over its args + module constants. */
function draw(ctx: CanvasRenderingContext2D, g: GameRef) {
  ctx.clearRect(0, 0, W, H);

  for (const br of g.bricks) {
    const dim = br.max === 2 && br.hp === 1;
    ctx.save();
    ctx.globalAlpha = dim ? 0.5 : 1;
    ctx.fillStyle = br.color;
    roundRect(ctx, br.x, br.y, BRICK_W, BRICK_H, 6);
    ctx.fill();
    ctx.globalAlpha = dim ? 0.2 : 0.4;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, br.x + 3, br.y + 3, BRICK_W - 6, BRICK_H * 0.34, 4);
    ctx.fill();
    ctx.restore();
  }

  // power-up capsules
  for (const p of g.powers) {
    const meta = POWER_META[p.kind];
    ctx.save();
    ctx.fillStyle = meta.color;
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 10;
    roundRect(ctx, p.x - 15, p.y - 9, 30, 18, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Geologica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(meta.glyph, p.x, p.y + 1);
    ctx.restore();
  }

  // paddle
  ctx.save();
  const px = g.paddleX - g.paddleW / 2;
  const grad = ctx.createLinearGradient(0, PADDLE_Y, 0, PADDLE_Y + PADDLE_H);
  grad.addColorStop(0, "#fef3c7");
  grad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(245,158,11,0.5)";
  ctx.shadowBlur = 12;
  roundRect(ctx, px, PADDLE_Y, g.paddleW, PADDLE_H, 7);
  ctx.fill();
  ctx.restore();

  // balls
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 14;
  for (const b of g.balls) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

const BlockBreaker: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const [status, setStatusState] = useState<Status>("ready");
  const [score, setScoreState] = useState(0);
  const [high, setHighState] = useState(0);
  const [lives, setLivesState] = useState(3);
  const [level, setLevelState] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);

  const statusRef = useRef<Status>("ready");
  const scoreRef = useRef(0);
  const highRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);

  const game = useRef<GameRef>({
    paddleX: W / 2,
    paddleW: BASE_PADDLE_W,
    balls: [{ x: W / 2, y: PADDLE_Y - BALL_R, dx: 0, dy: 0 }],
    bricks: buildBricks(1),
    powers: [],
    pointerX: null,
    left: false,
    right: false,
    speed: levelSpeed(1),
    expandUntil: 0,
    slowUntil: 0,
    shrinkUntil: 0,
    fastUntil: 0,
    last: 0,
  });

  const setStatus = useCallback((s: Status) => { statusRef.current = s; setStatusState(s); }, []);
  const setScore = useCallback((n: number) => {
    scoreRef.current = n;
    setScoreState(n);
    if (n > highRef.current) {
      highRef.current = n;
      setHighState(n);
      void idbSet(SAVE_KEY, { high: n });
    }
  }, []);
  const setLives = useCallback((n: number) => { livesRef.current = n; setLivesState(n); }, []);
  const setLevel = useCallback((n: number) => { levelRef.current = n; setLevelState(n); }, []);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1300);
  }, []);

  useEffect(() => {
    idbGet<{ high: number }>(SAVE_KEY).then(d => {
      if (d?.high) { highRef.current = d.high; setHighState(d.high); }
    });
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const serveBall = useCallback((): Ball => {
    const g = game.current;
    const angle = (Math.random() * 0.5 - 0.25) * MAX_ANGLE;
    return {
      x: g.paddleX,
      y: PADDLE_Y - BALL_R - 1,
      dx: g.speed * Math.sin(angle),
      dy: -g.speed * Math.cos(angle),
    };
  }, []);

  const startLevel = useCallback((lvl: number, resetScore: boolean) => {
    const g = game.current;
    g.speed = levelSpeed(lvl);
    g.bricks = buildBricks(lvl);
    g.powers = [];
    g.paddleX = W / 2;
    g.paddleW = BASE_PADDLE_W;
    g.expandUntil = 0;
    g.slowUntil = 0;
    g.shrinkUntil = 0;
    g.fastUntil = 0;
    g.balls = [{ x: W / 2, y: PADDLE_Y - BALL_R, dx: 0, dy: 0 }];
    setLevel(lvl);
    if (resetScore) { setScore(0); setLives(3); }
    setStatus("ready");
  }, [setLevel, setScore, setLives, setStatus]);

  const beginPlay = useCallback(() => {
    if (statusRef.current !== "ready") return;
    game.current.balls = [serveBall()];
    setStatus("playing");
  }, [serveBall, setStatus]);

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") setStatus("paused");
    else if (statusRef.current === "paused") setStatus("playing");
  }, [setStatus]);

  /* ── input ──────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = playRef.current;
    if (!canvas || !surface) return;
    const toLogical = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return Math.max(0, Math.min(W, ((clientX - rect.left) / rect.width) * W));
    };
    // Listen on the whole play surface (not just the canvas) so you can steer
    // the paddle from anywhere in the game area, even outside the playfield.
    const onMove = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button")) return;
      game.current.pointerX = toLogical(e.clientX);
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button")) return;
      game.current.pointerX = toLogical(e.clientX);
      try { surface.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      if (statusRef.current === "ready") beginPlay();
    };
    surface.addEventListener("pointermove", onMove, { passive: true });
    surface.addEventListener("pointerdown", onDown);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft") { game.current.left = down; game.current.pointerX = null; }
      else if (e.key === "ArrowRight") { game.current.right = down; game.current.pointerX = null; }
      else if (down && (e.key === " " || e.key === "Spacebar")) {
        e.preventDefault();
        if (statusRef.current === "ready") beginPlay();
        else togglePause();
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [beginPlay, togglePause]);

  /* ── canvas sizing (DPR-aware) ──────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  /* ── main loop ──────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const applyPower = (kind: PowerKind) => {
      const g = game.current;
      const now = performance.now();
      if (kind === "multi") {
        const extra: Ball[] = [];
        for (const b of g.balls) {
          if (g.balls.length + extra.length >= MAX_BALLS) break;
          const sp = Math.hypot(b.dx, b.dy) || g.speed;
          const a = Math.atan2(b.dy, b.dx) + 0.42;
          extra.push({ x: b.x, y: b.y, dx: Math.cos(a) * sp, dy: Math.sin(a) * sp });
        }
        g.balls.push(...extra);
      } else if (kind === "expand") {
        g.expandUntil = now + 9000; g.shrinkUntil = 0;
      } else if (kind === "slow") {
        g.slowUntil = now + 7000; g.fastUntil = 0;
      } else if (kind === "life") {
        setLives(livesRef.current + 1);
      } else if (kind === "shrink") {
        g.shrinkUntil = now + 8000; g.expandUntil = 0;
      } else if (kind === "fast") {
        g.fastUntil = now + 7000; g.slowUntil = 0;
      }
      if (POWER_META[kind].bad) sfx.bad(); else sfx.good();
      flash(POWER_META[kind].label);
    };

    const step = (now: number) => {
      const g = game.current;
      const dt = g.last ? Math.min((now - g.last) / 16.67, 2.2) : 1;
      g.last = now;

      // timed effects (buffs take priority over the matching liability)
      g.paddleW = now < g.expandUntil ? BASE_PADDLE_W * 1.6
        : now < g.shrinkUntil ? BASE_PADDLE_W * 0.62
        : BASE_PADDLE_W;
      const speedMul = now < g.slowUntil ? 0.62 : now < g.fastUntil ? 1.4 : 1;

      // paddle — frozen while paused or on an overlay screen
      const st = statusRef.current;
      if (st === "playing" || st === "ready") {
        if (g.pointerX != null) g.paddleX += (g.pointerX - g.paddleX) * 0.4;
        if (g.left) g.paddleX -= 8 * dt;
        if (g.right) g.paddleX += 8 * dt;
        g.paddleX = Math.max(g.paddleW / 2, Math.min(W - g.paddleW / 2, g.paddleX));
      }

      const playing = st === "playing";
      if (playing) {
        const half = g.paddleW / 2;

        for (const b of g.balls) {
          b.x += b.dx * dt * speedMul;
          b.y += b.dy * dt * speedMul;

          if (b.x - BALL_R < 0) { b.x = BALL_R; b.dx = Math.abs(b.dx); }
          if (b.x + BALL_R > W) { b.x = W - BALL_R; b.dx = -Math.abs(b.dx); }
          if (b.y - BALL_R < 0) { b.y = BALL_R; b.dy = Math.abs(b.dy); }

          if (
            b.dy > 0 &&
            b.y + BALL_R >= PADDLE_Y &&
            b.y - BALL_R <= PADDLE_Y + PADDLE_H &&
            b.x >= g.paddleX - half - BALL_R &&
            b.x <= g.paddleX + half + BALL_R
          ) {
            const rel = Math.max(-1, Math.min(1, (b.x - g.paddleX) / half));
            const angle = rel * MAX_ANGLE;
            b.dx = g.speed * Math.sin(angle);
            b.dy = -g.speed * Math.abs(Math.cos(angle));
            b.y = PADDLE_Y - BALL_R - 1;
            sfx.bounce();
          }

          for (let i = 0; i < g.bricks.length; i++) {
            const br = g.bricks[i];
            if (
              b.x + BALL_R > br.x && b.x - BALL_R < br.x + BRICK_W &&
              b.y + BALL_R > br.y && b.y - BALL_R < br.y + BRICK_H
            ) {
              const overlapX = Math.min(b.x + BALL_R, br.x + BRICK_W) - Math.max(b.x - BALL_R, br.x);
              const overlapY = Math.min(b.y + BALL_R, br.y + BRICK_H) - Math.max(b.y - BALL_R, br.y);
              if (overlapX < overlapY) b.dx = -b.dx; else b.dy = -b.dy;
              br.hp -= 1;
              sfx.hit();
              setScore(scoreRef.current + 10);
              if (br.hp <= 0) {
                // chance to drop a power-up
                if (Math.random() < 0.16) {
                  g.powers.push({
                    x: br.x + BRICK_W / 2,
                    y: br.y + BRICK_H / 2,
                    vy: 2.6,
                    kind: POWER_BAG[Math.floor(Math.random() * POWER_BAG.length)],
                  });
                }
                g.bricks.splice(i, 1);
              }
              break;
            }
          }
        }

        // drop any ball that fell out; lose a life only when all are gone
        g.balls = g.balls.filter(b => b.y - BALL_R <= H + 24);
        if (g.balls.length === 0) {
          const livesLeft = livesRef.current - 1;
          setLives(livesLeft);
          if (livesLeft <= 0) { sfx.lose(); setStatus("lost"); }
          else {
            sfx.bad();
            g.paddleW = BASE_PADDLE_W;
            g.expandUntil = 0;
            g.slowUntil = 0;
            g.shrinkUntil = 0;
            g.fastUntil = 0;
            g.powers = [];
            g.balls = [serveBall()];
          }
        }

        // power-ups fall + get caught
        for (let i = g.powers.length - 1; i >= 0; i--) {
          const p = g.powers[i];
          p.y += p.vy * dt;
          const caught =
            p.y + 9 >= PADDLE_Y &&
            p.y - 9 <= PADDLE_Y + PADDLE_H &&
            p.x >= g.paddleX - half - 14 &&
            p.x <= g.paddleX + half + 14;
          if (caught) {
            g.powers.splice(i, 1);
            setScore(scoreRef.current + 25);
            applyPower(p.kind);
          } else if (p.y - 9 > H) {
            g.powers.splice(i, 1);
          }
        }

        if (g.bricks.length === 0) {
          setScore(scoreRef.current + 100);
          sfx.win();
          setStatus("won");
        }
      } else if (statusRef.current === "ready") {
        const b = g.balls[0];
        if (b) { b.x = g.paddleX; b.y = PADDLE_Y - BALL_R - 1; }
      }

      draw(ctx, g);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [serveBall, setScore, setStatus, setLives, flash]);

  const overlay = (() => {
    switch (status) {
      case "ready":
        return { title: level === 1 && score === 0 ? "Block Breaker" : `Level ${level}`, sub: "Move with mouse / arrows · Space to launch", btn: "Start", action: beginPlay };
      case "paused":
        return { title: "Paused", sub: "Take a breath", btn: "Resume", action: togglePause };
      case "won":
        return { title: "Level cleared! 🎉", sub: `Score ${score}`, btn: "Next level", action: () => startLevel(level + 1, false) };
      case "lost":
        return { title: "Game over", sub: `Score ${score}${score >= high && score > 0 ? " · new best!" : ""}`, btn: "Play again", action: () => startLevel(1, true) };
      default:
        return null;
    }
  })();

  const pauseDisabled = status === "ready" || status === "lost" || status === "won";

  return (
    <GameShell
      slug="block-breaker"
      subtitle={`Level ${level}`}
      info={BB_INFO}
      stats={
        <>
          <span className="game-stat"><i>Score</i><b>{score}</b></span>
          <span className="game-stat"><i>Best</i><b>{high}</b></span>
          <span className="game-stat"><i>Level</i><b>{level}</b></span>
          <span className="game-stat bb-lives" aria-label={`${lives} lives`}>
            <i>Lives</i>
            <b>{"●".repeat(Math.max(0, lives))}{"○".repeat(Math.max(0, 3 - lives))}</b>
          </span>
        </>
      }
      toolbar={
        <button type="button" className="bb-btn" onClick={togglePause} disabled={pauseDisabled}>
          {status === "paused" ? "Resume" : "Pause"}
        </button>
      }
    >
      <div className="bb-play" ref={playRef}>
        <div className="bb-stage">
          <div className="bb-frame">
            <canvas ref={canvasRef} className="bb-canvas" />
            {toast && <div className="bb-toast">{toast}</div>}
            {overlay && (
              <div className="bb-overlay">
                <p className="bb-overlay-title">{overlay.title}</p>
                <p className="bb-overlay-sub mono">{overlay.sub}</p>
                <button type="button" className="bb-btn primary" onClick={overlay.action}>{overlay.btn}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default BlockBreaker;
