import { lazy, Suspense, FC } from "react";
import { useParams, Link } from "react-router-dom";
import { games } from "./games.data";

/**
 * Each game is split into its own lazy chunk so the heavy game code is
 * downloaded ONLY when the visitor opens its page. The default Games index
 * stays light.
 */
const gameLoaders: Record<string, ReturnType<typeof lazy>> = {
  "parking-escape": lazy(() => import("./parking-escape/ParkingEscape")),
  "tic-tac-toe": lazy(() => import("./tic-tac-toe/TicTacToe")),
  "block-breaker": lazy(() => import("./block-breaker/BlockBreaker")),
  "2048": lazy(() => import("./g2048/G2048")),
  "memory": lazy(() => import("./memory/Memory")),
  "snake": lazy(() => import("./snake/Snake")),
  "simon": lazy(() => import("./simon/Simon")),
  "whack-a-mole": lazy(() => import("./whack/Whack")),
  "lights-out": lazy(() => import("./lights-out/LightsOut")),
  "sliding-puzzle": lazy(() => import("./sliding/Sliding")),
};

const LoadingScreen: FC<{ title: string }> = ({ title }) => (
  <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    <div className="text-center">
      <p className="mono text-xs uppercase tracking-[0.3em] text-amber-300/80">Loading</p>
      <p className="mt-2 text-2xl md:text-3xl font-semibold">{title}</p>
      <div className="mt-6 h-1 w-40 mx-auto overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 bg-amber-300/80 animate-[loader_1.2s_ease-in-out_infinite]" />
      </div>
      <style>{`@keyframes loader { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }`}</style>
    </div>
  </main>
);

const NotPlayable: FC<{ slug: string }> = ({ slug }) => (
  <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-6 text-center">
    <p className="mono text-xs uppercase tracking-[0.3em] text-zinc-500">Game not found</p>
    <h1 className="mt-2 text-3xl md:text-4xl font-semibold">No game at /{slug}</h1>
    <Link to="/games" className="mt-6 mono text-sm underline">Back to games</Link>
  </main>
);

const GamePage = () => {
  const { game: slug = "" } = useParams<{ game: string }>();
  const meta = games.find(g => g.slug === slug);
  const Loader = gameLoaders[slug];

  if (!meta || !Loader) return <NotPlayable slug={slug} />;

  return (
    <Suspense fallback={<LoadingScreen title={meta.title} />}>
      <Loader />
    </Suspense>
  );
};

export default GamePage;
