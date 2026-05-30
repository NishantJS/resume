import { LEVELS } from "../src/components/games/parking-escape/levels";
import { validateLevel } from "../src/components/games/parking-escape/solver";

let ok = true;
for (const level of LEVELS) {
  const v = validateLevel(level);
  const status = v.overlaps.length === 0 && v.outOfBounds.length === 0 && v.solvable;
  if (!status) ok = false;
  console.log(
    `${status ? "✅" : "❌"} ${level.id.padEnd(4)} ${level.name.padEnd(14)} ` +
      `${level.difficulty.padEnd(7)} ` +
      `cars=${v.vehicleCount} optimal=${v.optimal} explored=${v.explored} ` +
      `${v.overlaps.length ? `OVERLAP=${JSON.stringify(v.overlaps)}` : ""}` +
      `${v.outOfBounds.length ? `OOB=${JSON.stringify(v.outOfBounds)}` : ""}` +
      `${!v.solvable ? "UNSOLVABLE" : ""}`,
  );
}
console.log(ok ? "\nAll levels valid." : "\nSOME LEVELS INVALID.");
process.exit(ok ? 0 : 1);
