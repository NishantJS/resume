/* ── 15-puzzle solver (staged A*) ────────────────────────────────
   Produces a COMPLETE solution path from any reachable position, so the
   hint button can always point at a move that provably leads to the
   solved board (the previous greedy Manhattan hint could loop forever).

   It solves the way a person does — in stages, freezing what's done:
     1 · 2 · [3,4]      (top row; the 3+4 pair needs the rotate trick)
     5 · 6 · [7,8]      (second row)
     [9,13] · [10,14]   (left columns of the bottom two rows, as pairs)
     [11,12,15]         (the final 2×2 block)
   Each stage is a small A* search over board states where the already
   placed tiles are locked, so every stage is tiny and always solvable
   for a reachable position. */

const N = 4;
const SIZE = N * N;

const STAGES: number[][] = [
  [1], [2], [3, 4],
  [5], [6], [7, 8],
  [9, 13], [10, 14],
  [11, 12, 15],
];

function manhattanOf(board: number[], targets: number[]): number {
  let d = 0;
  let nearestToBlank = 0;
  const e = board.indexOf(0);
  for (const v of targets) {
    const p = board.indexOf(v);
    const t = v - 1;
    const tileDist = Math.abs(((p / N) | 0) - ((t / N) | 0)) + Math.abs((p % N) - (t % N));
    d += tileDist;
    if (tileDist > 0) {
      // The blank must reach a misplaced tile before it can push it.
      const blankDist = Math.abs(((p / N) | 0) - ((e / N) | 0)) + Math.abs((p % N) - (e % N)) - 1;
      if (nearestToBlank === 0 || blankDist < nearestToBlank) nearestToBlank = Math.max(blankDist, 0);
    }
  }
  return d + nearestToBlank;
}

interface StageResult {
  /** Tile values to slide, in order. */
  moves: number[];
  /** Board after the stage completes. */
  end: number[];
}

/** A* over board states with locked cells. `weight` > 1 trades optimality
 *  for speed (the hint path doesn't need to be shortest, just correct). */
function solveStage(
  start: number[],
  targets: number[],
  locked: boolean[],
  weight: number,
  maxNodes: number,
): StageResult | null {
  const goalMet = (b: number[]) => targets.every(v => b[v - 1] === v);
  if (goalMet(start)) return { moves: [], end: start };

  interface Node { board: number[]; g: number; parent: number; moved: number }
  const nodes: Node[] = [{ board: start, g: 0, parent: -1, moved: 0 }];
  const visited = new Set<string>([start.join(".")]);

  // Bucket priority queue keyed by integer f = g + weight·h.
  const buckets: number[][] = [];
  let fMin = weight * manhattanOf(start, targets);
  const push = (i: number, f: number) => {
    (buckets[f] ||= []).push(i);
    if (f < fMin) fMin = f;
  };
  push(0, fMin);

  let expanded = 0;
  while (expanded < maxNodes) {
    while (fMin < buckets.length && !(buckets[fMin]?.length)) fMin++;
    if (fMin >= buckets.length) return null; // queue exhausted
    const idx = buckets[fMin].pop()!;
    const node = nodes[idx];
    expanded++;

    const b = node.board;
    const e = b.indexOf(0);
    const r = (e / N) | 0, c = e % N;
    const nbrs: number[] = [];
    if (r > 0) nbrs.push(e - N);
    if (r < N - 1) nbrs.push(e + N);
    if (c > 0) nbrs.push(e - 1);
    if (c < N - 1) nbrs.push(e + 1);

    for (const s of nbrs) {
      if (locked[s]) continue;
      const nb = b.slice();
      nb[e] = nb[s];
      nb[s] = 0;
      const key = nb.join(".");
      if (visited.has(key)) continue;
      visited.add(key);
      const ci = nodes.push({ board: nb, g: node.g + 1, parent: idx, moved: nb[e] }) - 1;
      if (goalMet(nb)) {
        const moves: number[] = [];
        let cur = ci;
        while (nodes[cur].parent !== -1) {
          moves.push(nodes[cur].moved);
          cur = nodes[cur].parent;
        }
        moves.reverse();
        return { moves, end: nb };
      }
      push(ci, nodes[ci].g + weight * manhattanOf(nb, targets));
    }
  }
  return null; // node budget blown
}

/** Full solution path (tile values to slide, in order) or null if the
 *  board is unreachable/corrupt. Runs in a few ms for any scramble. */
export function solvePath(board: number[]): number[] | null {
  if (board.length !== SIZE) return null;
  let b = board;
  const locked = Array<boolean>(SIZE).fill(false);
  const all: number[] = [];
  for (const targets of STAGES) {
    const res =
      solveStage(b, targets, locked, 3, 60_000) ??
      solveStage(b, targets, locked, 1, 300_000);
    if (!res) return null;
    all.push(...res.moves);
    b = res.end;
    for (const v of targets) locked[v - 1] = true;
  }
  return all;
}
