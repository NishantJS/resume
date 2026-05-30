import { FC, useEffect, useMemo, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { Vehicle, VehicleKind, MoveOutcome } from "./types";

/** Below this travel distance a pointer gesture counts as a tap, not a swipe. */
const TAP_PX = 12;

/* ════════════════════════════════════════════════════════════
   Top-down vehicle art.

   Every kind is drawn ONCE in a canonical pose: horizontal, pointing
   RIGHT (+x = forward), inside a viewBox of `length*U × U`. The whole SVG
   is then rotated / mirrored with a CSS transform to face the vehicle's
   real travel direction, so a single drawing covers all 4 directions.
   ════════════════════════════════════════════════════════════ */
const U = 100; // svg units per board cell

/** Mix a hex colour toward white (amt>0) or black (amt<0). */
function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.replace(/./g, "$&$&") : c, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt > 0 ? 255 : 0;
  const k = Math.abs(amt);
  const mix = (ch: number) => Math.round(ch + (t - ch) * k);
  const h = (v: number) => v.toString(16).padStart(2, "0");
  return `#${h(mix(r))}${h(mix(g))}${h(mix(b))}`;
}

/* ── small reusable pieces (canonical coords) ─────────────────── */
const Wheel: FC<{ cx: number; w?: number }> = ({ cx, w = 22 }) => (
  <>
    <rect x={cx - w / 2} y={3} width={w} height={19} rx={6} className="pe-tyre" />
    <rect x={cx - w / 2} y={78} width={w} height={19} rx={6} className="pe-tyre" />
  </>
);

const Lights: FC<{ W: number; color: string }> = ({ W, color }) => (
  <>
    {/* headlights — front (right) edge */}
    <rect x={W - 16} y={20} width={9} height={16} rx={4} className="pe-head" />
    <rect x={W - 16} y={64} width={9} height={16} rx={4} className="pe-head" />
    {/* taillights — rear (left) edge */}
    <rect x={9} y={22} width={7} height={14} rx={3} className="pe-tail" />
    <rect x={9} y={64} width={7} height={14} rx={3} className="pe-tail" />
    {/* bumper hint so the front reads as front */}
    <rect x={W - 9} y={30} width={4} height={40} rx={2} fill={shade(color, -0.35)} opacity={0.6} />
  </>
);

const Arrow: FC<{ W: number }> = ({ W }) => {
  const cx = W / 2;
  return (
    <path
      d={`M ${cx - 11} ${36} L ${cx + 11} ${50} L ${cx - 11} ${64}`}
      className="pe-dir"
      fill="none"
    />
  );
};

/** Cabin glass for a normal car: windshield + rear window split by a roof bar. */
function carCabin(W: number, id: string) {
  const x0 = W * 0.3, x1 = W * 0.7;
  return (
    <g key="cabin">
      <rect x={x0} y={22} width={x1 - x0} height={56} rx={14} fill={`url(#gl-${id})`} />
      {/* roof crossbar (this is the roof, NOT a sunroof split) */}
      <rect x={(x0 + x1) / 2 - W * 0.045} y={20} width={W * 0.09} height={60} rx={6} className="pe-roof" />
    </g>
  );
}

/** Long greenhouse with mullions — buses & limos. */
function longCabin(W: number, id: string, windows: number, dark: boolean) {
  const x0 = W * 0.1, x1 = W * 0.9;
  const span = x1 - x0;
  const pillars = [];
  for (let i = 1; i < windows; i++) {
    const px = x0 + (span * i) / windows;
    pillars.push(<rect key={i} x={px - W * 0.012} y={20} width={W * 0.024} height={60} className="pe-roof" />);
  }
  return (
    <g key="cabin">
      <rect x={x0} y={22} width={span} height={56} rx={12} fill={`url(#gl-${id})`} opacity={dark ? 0.92 : 1} />
      {pillars}
      {/* front windshield sits slightly proud of the side glass */}
      <rect x={x1 - W * 0.04} y={20} width={W * 0.05} height={60} rx={6} fill={`url(#gl-${id})`} />
    </g>
  );
}

function buildArt(kind: VehicleKind, L: number, color: string, id: string) {
  const W = L * U;
  const body = (
    <rect x={7} y={13} width={W - 14} height={74} rx={Math.min(30, W * 0.18)} fill={`url(#bd-${id})`} />
  );
  const gloss = (
    <rect x={16} y={17} width={W - 32} height={20} rx={10} fill="rgba(255,255,255,0.34)" />
  );

  switch (kind) {
    case "bike": {
      // Narrow centre-line body with two inline wheels — reads as a motorbike.
      return (
        <>
          <rect x={W * 0.16} y={42} width={W * 0.68} height={6} rx={3} fill={shade(color, -0.45)} />
          <rect x={9} y={36} width={W - 18} height={28} rx={13} fill={`url(#bd-${id})`} />
          <rect x={16} y={39} width={W - 32} height={9} rx={5} fill="rgba(255,255,255,0.3)" />
          {/* seat + tank glass dome */}
          <rect x={W * 0.34} y={40} width={W * 0.3} height={20} rx={9} fill={`url(#gl-${id})`} />
          {/* handlebars near the front */}
          <rect x={W * 0.74} y={26} width={6} height={48} rx={3} fill={shade(color, -0.3)} />
          {/* inline wheels (single track) */}
          <rect x={W * 0.1} y={34} width={W * 0.13} height={32} rx={10} className="pe-tyre" />
          <rect x={W * 0.77} y={34} width={W * 0.13} height={32} rx={10} className="pe-tyre" />
          <circle cx={W - 12} cy={50} r={6} className="pe-head" />
          <Arrow W={W} />
        </>
      );
    }
    case "truck": {
      // Cab at the front + a contrasting cargo box behind it.
      const cabX = W * 0.64;
      const cargo = shade(color, -0.22);
      return (
        <>
          <Wheel cx={W * 0.16} w={26} />
          <Wheel cx={W * 0.34} w={26} />
          <Wheel cx={W - 36} w={24} />
          {/* cargo box */}
          <rect x={9} y={11} width={cabX - 14} height={78} rx={14} fill={cargo} />
          <rect x={9} y={11} width={cabX - 14} height={16} rx={10} fill="rgba(255,255,255,0.18)" />
          {[0.28, 0.45].map((f, i) => (
            <rect key={i} x={cabX * f} y={16} width={5} height={68} rx={2} fill="rgba(0,0,0,0.18)" />
          ))}
          {/* cab */}
          <rect x={cabX - 6} y={15} width={W - cabX - 1} height={70} rx={18} fill={`url(#bd-${id})`} />
          <rect x={cabX + 4} y={24} width={W - cabX - 26} height={52} rx={10} fill={`url(#gl-${id})`} />
          <rect x={W - 15} y={22} width={8} height={14} rx={4} className="pe-head" />
          <rect x={W - 15} y={64} width={8} height={14} rx={4} className="pe-head" />
          <Arrow W={W} />
        </>
      );
    }
    case "bus": {
      return (
        <>
          <Wheel cx={W * 0.18} />
          <Wheel cx={W - 40} />
          {body}
          {gloss}
          {longCabin(W, id, Math.max(3, Math.round(L * 1.6)), false)}
          <Lights W={W} color={color} />
          <Arrow W={W} />
        </>
      );
    }
    case "limo": {
      return (
        <>
          <Wheel cx={W * 0.14} />
          <Wheel cx={W - 34} />
          {body}
          {gloss}
          {/* chrome trim line down each flank */}
          <rect x={W * 0.12} y={28} width={W * 0.76} height={3} rx={2} fill="rgba(255,255,255,0.5)" />
          <rect x={W * 0.12} y={69} width={W * 0.76} height={3} rx={2} fill="rgba(0,0,0,0.25)" />
          {longCabin(W, id, Math.max(4, Math.round(L * 2)), true)}
          <Lights W={W} color={color} />
          <Arrow W={W} />
        </>
      );
    }
    case "car":
    default: {
      return (
        <>
          <Wheel cx={W * 0.2} />
          <Wheel cx={W - W * 0.2} />
          {body}
          {gloss}
          {carCabin(W, id)}
          <Lights W={W} color={color} />
          <Arrow W={W} />
        </>
      );
    }
  }
}

interface VehicleViewProps {
  vehicle: Vehicle;
  cell: number;
  rows: number;
  cols: number;
  moveKey: number;
  outcome: MoveOutcome | null;
  blockedKey: number;
  /** True only while this vehicle is the active hint target. */
  hinted: boolean;
  /** Bumped each time a hint points at this vehicle (re-fires the nudge). */
  hintKey: number;
  onClick: () => void;
}

const VehicleView: FC<VehicleViewProps> = ({
  vehicle,
  cell,
  rows,
  cols,
  moveKey,
  outcome,
  blockedKey,
  hinted,
  hintKey,
  onClick,
}) => {
  const reduced = useReducedMotion();
  const innerCtrl = useAnimationControls();

  // Pointer-gesture state: a tap moves the car; a swipe in the car's arrow
  // direction also moves it; a swipe the wrong way does nothing.
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const swallowClickRef = useRef(false);

  const isH = vehicle.orientation === "h";
  const L = vehicle.length;
  const w = isH ? L * cell : cell;
  const h = !isH ? L * cell : cell;

  const x = vehicle.col * cell;
  const y = vehicle.row * cell;

  // ── Exit target — slides STRAIGHT along the travel axis so it never moves
  //    diagonally when it escapes the lot.
  const runway = cell * (Math.max(rows, cols) + 2);
  const exitTarget = isH
    ? { x: vehicle.direction === 1 ? x + runway : -w - cell, y }
    : { x, y: vehicle.direction === 1 ? y + runway : -h - cell };

  // Canonical drawing is horizontal pointing right; rotate / mirror to match.
  const rot = isH ? 0 : vehicle.direction === 1 ? 90 : -90;
  const flip = isH && vehicle.direction === -1 ? -1 : 1;
  const svgTransform = `translate(-50%, -50%) rotate(${rot}deg) scaleX(${flip})`;

  const art = useMemo(
    () => buildArt(vehicle.kind, L, vehicle.color, vehicle.id),
    [vehicle.kind, L, vehicle.color, vehicle.id],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    downRef.current = { x: e.clientX, y: e.clientY };
    swallowClickRef.current = false;
    // Capture so a swipe that ends outside the vehicle still reports pointerup.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = downRef.current;
    downRef.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) < TAP_PX) return; // tap → let the native click move it
    // It's a swipe: suppress the trailing click and decide by direction.
    swallowClickRef.current = true;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const dir = isH ? (horizontal ? Math.sign(dx) : 0) : (!horizontal ? Math.sign(dy) : 0);
    if (dir === vehicle.direction) onClick();
  };
  const onPointerCancel = () => { downRef.current = null; };
  const handleActivate = () => {
    if (swallowClickRef.current) { swallowClickRef.current = false; return; }
    onClick();
  };

  // Squash/stretch pulse on move (screen-space; stretch along the travel axis).
  useEffect(() => {
    if (moveKey === 0 || reduced) return;
    if (!outcome || outcome.kind === "none") return;
    const stretch = [1, 1.07, 1];
    const squash = [1, 0.95, 1];
    innerCtrl.start({
      scaleX: isH ? stretch : squash,
      scaleY: isH ? squash : stretch,
      transition: { duration: 0.32, times: [0, 0.45, 1], ease: [0.22, 0.61, 0.36, 1] },
    });
  }, [moveKey, outcome, innerCtrl, isH, reduced]);

  // Wiggle when blocked.
  useEffect(() => {
    if (blockedKey === 0 || reduced) return;
    const amp = cell * 0.05;
    const seq = [0, amp, -amp, amp * 0.6, -amp * 0.4, 0];
    innerCtrl.start({
      x: isH ? seq : 0,
      y: isH ? 0 : seq,
      transition: { duration: 0.34, ease: [0.36, 0.07, 0.19, 0.97] },
    });
  }, [blockedKey, innerCtrl, isH, cell, reduced]);

  // Hint nudge — a couple of bounces in the travel direction + glow class.
  useEffect(() => {
    if (hintKey === 0 || reduced) return;
    const amp = cell * 0.12;
    const dir = vehicle.direction;
    const seq = [0, amp * dir, 0, amp * dir, 0];
    innerCtrl.start({
      x: isH ? seq : 0,
      y: isH ? 0 : seq,
      transition: { duration: 0.7, ease: "easeInOut" },
    });
  }, [hintKey, innerCtrl, isH, cell, vehicle.direction, reduced]);

  return (
    <motion.button
      type="button"
      className={`pe-vehicle ${hinted ? "pe-hinted" : ""}`}
      style={{ width: w, height: h } as React.CSSProperties}
      initial={{ x, y, scale: reduced ? 1 : 0.55, opacity: 0 }}
      animate={{ x, y, scale: 1, opacity: 1 }}
      exit={{
        ...exitTarget,
        opacity: 0,
        transition: { duration: reduced ? 0 : 0.4, ease: [0.4, 0.0, 0.2, 1] },
      }}
      whileHover={reduced ? undefined : { scale: 1.04 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      transition={{
        x: { type: "spring", stiffness: 360, damping: 30, mass: 0.55 },
        y: { type: "spring", stiffness: 360, damping: 30, mass: 0.55 },
        scale: { type: "spring", stiffness: 480, damping: 22 },
        opacity: { duration: 0.25 },
      }}
      onClick={handleActivate}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      aria-label={`${vehicle.kind} pointing ${
        isH ? (vehicle.direction === 1 ? "right" : "left") : vehicle.direction === 1 ? "down" : "up"
      }`}
    >
      {/* Everything visual is non-interactive: the button itself owns the full
          footprint, so a click anywhere on the vehicle registers. */}
      <motion.div className="pe-inner" animate={innerCtrl}>
        <svg
          className="pe-svg"
          width={isH ? w : h}
          height={isH ? h : w}
          viewBox={`0 0 ${L * U} ${U}`}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: svgTransform,
          }}
          aria-hidden
        >
          <defs>
            <linearGradient id={`bd-${vehicle.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={shade(vehicle.color, 0.34)} />
              <stop offset="42%" stopColor={vehicle.color} />
              <stop offset="100%" stopColor={shade(vehicle.color, -0.32)} />
            </linearGradient>
            <linearGradient id={`gl-${vehicle.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cfe9f5" />
              <stop offset="45%" stopColor="#7fa6c0" />
              <stop offset="100%" stopColor="#2b3c4d" />
            </linearGradient>
          </defs>
          {art}
        </svg>
      </motion.div>
    </motion.button>
  );
};

export default VehicleView;
