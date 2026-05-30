import { LEVELS } from "../src/components/games/parking-escape/levels";
import { initialState, applyMove } from "../src/components/games/parking-escape/gameLogic";
import { solveLevel, hintFrom } from "../src/components/games/parking-escape/solver";

// Simulate playing each level using the solver's optimal path, then confirm
// the stateful applyMove() actually clears the board in exactly that many moves.
let ok = true;
for (const level of LEVELS) {
  const { path } = solveLevel(level);
  if (!path) { console.log(`❌ ${level.id} unsolvable`); ok = false; continue; }

  let state = initialState(level);
  let exits = 0;
  for (const id of path) {
    const { state: next, outcome } = applyMove(state, id);
    if (outcome.kind === "none") { console.log(`❌ ${level.id} move ${id} did nothing`); ok = false; break; }
    if (outcome.kind === "exited") exits++;
    state = next;
  }
  const cleared = state.cleared && Object.keys(state.vehicles).length === 0;

  // Also verify hint from the start matches the first solver move.
  const start = initialState(level);
  const h = hintFrom(start.vehicles, level.rows, level.cols);
  const hintOk = h === path[0];

  const status = cleared && state.moves === path.length && exits === level.vehicles.length && hintOk;
  if (!status) ok = false;
  console.log(
    `${status ? "✅" : "❌"} ${level.id.padEnd(4)} solvedIn=${state.moves} ` +
      `cleared=${cleared} exits=${exits}/${level.vehicles.length} ` +
      `firstHint=${h}(${hintOk ? "matches" : "MISMATCH:" + path[0]})`,
  );
}
console.log(ok ? "\nAll playthroughs cleared the board." : "\nPLAYTHROUGH FAILURES.");
process.exit(ok ? 0 : 1);
