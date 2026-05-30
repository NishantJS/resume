import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import VehicleView from "./Vehicle";
import Particles, { type Burst } from "./Particles";
import type { GameState, MoveOutcome } from "./types";

interface BoardProps {
  state: GameState;
  lastOutcome: { id: string; outcome: MoveOutcome; ts: number } | null;
  blocked: { id: string; ts: number } | null;
  hint: { id: string; ts: number } | null;
  onClickVehicle: (id: string) => void;
}

/**
 * Cell size derived from the *available* board area (both width and height)
 * so the whole board always fits its container without scrolling.
 */
function useCellSize(containerRef: React.RefObject<HTMLDivElement | null>, rows: number, cols: number) {
  const [cell, setCell] = useState(56);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      // Use the container's own clientWidth — it already accounts for all
      // parent padding and flex sizing, so the board never exceeds the stage.
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      // Floor to an integer, cap at 96 px. No minimum: a tiny cell is better
      // than a board that overflows the stage on large level grids.
      const c = Math.min(96, Math.floor(Math.min(w / cols, h / rows)));
      const sized = c > 0 ? c : 1;
      setCell(prev => (prev === sized ? prev : sized));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [containerRef, rows, cols]);

  return cell;
}

/** Stable per-id bump counters driven by a {id, ts} signal. */
function useBumpCounters(signal: { id: string; ts: number } | null) {
  const ref = useRef<{ counts: Record<string, number>; lastKey: string }>({ counts: {}, lastKey: "" });
  if (signal) {
    const key = `${signal.id}:${signal.ts}`;
    if (ref.current.lastKey !== key) {
      ref.current.lastKey = key;
      ref.current.counts[signal.id] = (ref.current.counts[signal.id] || 0) + 1;
    }
  }
  return ref.current.counts;
}

const Board: FC<BoardProps> = ({ state, lastOutcome, blocked, hint, onClickVehicle }) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cell = useCellSize(areaRef, state.level.rows, state.level.cols);
  const width = cell * state.level.cols;
  const height = cell * state.level.rows;

  const moveCounts = useBumpCounters(lastOutcome ? { id: lastOutcome.id, ts: lastOutcome.ts } : null);
  const blockedCounts = useBumpCounters(blocked);
  const hintCounts = useBumpCounters(hint);

  /* ── particle bursts at exit point ────────────────────────── */
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);

  useEffect(() => {
    if (!lastOutcome || lastOutcome.outcome.kind !== "exited") return;
    const oc = lastOutcome.outcome;
    const veh = state.level.vehicles.find(v => v.id === lastOutcome.id);
    if (!veh) return;

    const isH = veh.orientation === "h";
    // Center of the cell the vehicle's leading edge passes through as it exits.
    let px: number;
    let py: number;
    if (isH) {
      const col = veh.direction === 1 ? state.level.cols : -1;
      px = (col + 0.5) * cell;
      py = (oc.exitAt.row + 0.5) * cell;
    } else {
      const row = veh.direction === 1 ? state.level.rows : -1;
      py = (row + 0.5) * cell;
      px = (oc.exitAt.col + 0.5) * cell;
    }

    const vector = { dx: isH ? veh.direction : 0, dy: !isH ? veh.direction : 0 };
    const id = ++burstIdRef.current;
    setBursts(prev => [...prev, { id, x: px, y: py, color: veh.color, vector }]);

    // Camera kick toward the exit direction.
    const stage = stageRef.current;
    if (stage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const kx = vector.dx * 7;
      const ky = vector.dy * 7;
      stage.animate(
        [
          { transform: "translate(0,0)" },
          { transform: `translate(${kx}px, ${ky}px)` },
          { transform: "translate(0,0)" },
        ],
        { duration: 300, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      );
    }
  }, [lastOutcome, cell, state.level]);

  const removeBurst = (id: number) => setBursts(prev => prev.filter(b => b.id !== id));

  /* ── which sides have exit zones (for the dashed edge markers) ── */
  const exitEdges = useMemo(() => {
    const sides = { top: false, bottom: false, left: false, right: false };
    for (const v of state.level.vehicles) {
      if (v.orientation === "h") {
        if (v.direction === 1) sides.right = true;
        else sides.left = true;
      } else {
        if (v.direction === 1) sides.bottom = true;
        else sides.top = true;
      }
    }
    return sides;
  }, [state.level]);

  return (
    <div ref={areaRef} className="pe-stage">
      <div ref={stageRef} style={{ position: "relative" }}>
        {/* Keyed by level id: switching levels remounts the board so the new
            vehicles pop in at their own positions instead of sliding across
            from wherever the previous level's same-id vehicle sat. */}
        <div
          key={state.level.id}
          className="pe-board"
          style={{ width, height, ["--pe-cell" as string]: `${cell}px` } as React.CSSProperties}
        >
          {exitEdges.top && <span className="pe-edge" style={{ top: -10, left: 14, right: 14, height: 5 }} />}
          {exitEdges.bottom && <span className="pe-edge" style={{ bottom: -10, left: 14, right: 14, height: 5 }} />}
          {exitEdges.left && <span className="pe-edge" style={{ left: -10, top: 14, bottom: 14, width: 5 }} />}
          {exitEdges.right && <span className="pe-edge" style={{ right: -10, top: 14, bottom: 14, width: 5 }} />}

          <Particles bursts={bursts} onComplete={removeBurst} />

          <AnimatePresence>
            {state.order.map(id => {
              const v = state.vehicles[id];
              if (!v) return null;
              return (
                <VehicleView
                  key={id}
                  vehicle={v}
                  cell={cell}
                  rows={state.level.rows}
                  cols={state.level.cols}
                  moveKey={moveCounts[id] || 0}
                  outcome={lastOutcome && lastOutcome.id === id ? lastOutcome.outcome : null}
                  blockedKey={blockedCounts[id] || 0}
                  hinted={hint?.id === id}
                  hintKey={hintCounts[id] || 0}
                  onClick={() => onClickVehicle(id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Board;
