import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { games } from "./games.data";
import { isMuted, toggleMuted } from "./sound";
import "./game-shell.css";

export interface GameInfo {
  /** One or two sentences on what the game is. */
  about: string;
  /** Ordered "how to play" steps. */
  howTo: string[];
  /** Optional control reference (keyboard / pointer). */
  controls?: { keys: string; desc: string }[];
  /** Optional extra tips. */
  tips?: string[];
  /** Optional colour legend (e.g. power-ups), matching the in-game colours. */
  legend?: { swatch: string; glyph: string; label: string; bad?: boolean }[];
}

interface GameShellProps {
  /** Matches a slug in games.data — supplies the title + theme colour. */
  slug: string;
  /** Small line under the title (level, mode…). */
  subtitle?: ReactNode;
  info: GameInfo;
  /** Live stat chips (score / best / lives…) shown in the top bar. */
  stats?: ReactNode;
  /** Game-specific action controls rendered in the top bar. */
  toolbar?: ReactNode;
  children: ReactNode;
}

const FsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);
const ExitFsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M21 16h-3a2 2 0 0 0-2 2v3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);
const SoundIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
  </svg>
);
const MutedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M22 9l-6 6M16 9l6 6" />
  </svg>
);

const InfoPanel: FC<{ info: GameInfo }> = ({ info }) => (
  <div className="game-info">
    <section>
      <h2 className="game-info-h">About</h2>
      <p className="game-info-p">{info.about}</p>
    </section>
    <section>
      <h2 className="game-info-h">How to play</h2>
      <ol className="game-info-steps">
        {info.howTo.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </section>
    {info.controls && info.controls.length > 0 && (
      <section>
        <h2 className="game-info-h">Controls</h2>
        <ul className="game-info-keys">
          {info.controls.map((c, i) => (
            <li key={i}><kbd>{c.keys}</kbd><span>{c.desc}</span></li>
          ))}
        </ul>
      </section>
    )}
    {info.legend && info.legend.length > 0 && (
      <section>
        <h2 className="game-info-h">Power-ups</h2>
        <ul className="game-info-legend">
          {info.legend.map((l, i) => (
            <li key={i}>
              <span className="game-legend-chip" style={{ background: l.swatch }}>{l.glyph}</span>
              <span>{l.label}{l.bad ? <em> — avoid</em> : null}</span>
            </li>
          ))}
        </ul>
      </section>
    )}
    {info.tips && info.tips.length > 0 && (
      <section>
        <h2 className="game-info-h">Tips</h2>
        <ul className="game-info-tips">
          {info.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>
    )}
  </div>
);

const GameShell: FC<GameShellProps> = ({ slug, subtitle, info, stats, toolbar, children }) => {
  const meta = games.find(g => g.slug === slug);
  const title = meta?.title ?? "Game";
  const color = meta?.color ?? "#fde68a";

  const rootRef = useRef<HTMLElement>(null);
  const [isFs, setIsFs] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const onToggleMute = useCallback(() => setMuted(toggleMuted()), []);

  const toggleFs = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  return (
    <main
      ref={rootRef}
      className={`game-shell${isFs ? " is-fs" : ""}`}
      style={{ ["--game" as string]: color } as React.CSSProperties}
    >
      <div className="game-topbar">
        <div className="game-titlewrap">
          <Link to="/games" viewTransition className="game-back mono">← Games</Link>
          <h1 className="game-title">{title}</h1>
          {subtitle != null && <p className="game-subtitle mono">{subtitle}</p>}
        </div>
        <div className="game-topbar-aside">
          {stats != null && <div className="game-stats">{stats}</div>}
          <div className="game-toolbar">
            {toolbar}
            <button
              type="button"
              className="game-fsbtn"
              onClick={onToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>
            <button
              type="button"
              className="game-fsbtn"
              onClick={toggleFs}
              aria-label={isFs ? "Exit full screen" : "Enter full screen"}
              title={isFs ? "Exit full screen" : "Full screen"}
            >
              {isFs ? <ExitFsIcon /> : <FsIcon />}
            </button>
          </div>
        </div>
      </div>

      <div className="game-body">
        <div className="game-stage">{children}</div>
        <aside className="game-aside" aria-label={`About ${title} and how to play`}>
          <InfoPanel info={info} />
        </aside>
      </div>
    </main>
  );
};

export default GameShell;
