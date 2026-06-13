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
const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M9.2 9.2a2.8 2.8 0 1 1 3.9 2.6c-.8.36-1.1.9-1.1 1.7v.3" />
    <circle cx="12" cy="17.2" r="0.4" fill="currentColor" />
  </svg>
);

const ControlChips: FC<{ controls: NonNullable<GameInfo["controls"]> }> = ({ controls }) => (
  <ul className="game-info-keys">
    {controls.map((c, i) => (
      <li key={i}><kbd>{c.keys}</kbd><span>{c.desc}</span></li>
    ))}
  </ul>
);

const LegendList: FC<{ legend: NonNullable<GameInfo["legend"]> }> = ({ legend }) => (
  <ul className="game-info-legend">
    {legend.map((l, i) => (
      <li key={i}>
        <span className="game-legend-chip" style={{ background: l.swatch }}>{l.glyph}</span>
        <span>{l.label}{l.bad ? <em> — avoid</em> : null}</span>
      </li>
    ))}
  </ul>
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
        <ControlChips controls={info.controls} />
      </section>
    )}
    {info.legend && info.legend.length > 0 && (
      <section>
        <h2 className="game-info-h">Power-ups</h2>
        <LegendList legend={info.legend} />
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

/* ── First-visit / on-demand "How to play" overlay ─────────────
   On mobile the info aside sits below the fold, so without this a new
   player gets no guidance at all. Shown once per game (localStorage),
   reopenable any time from the ? button in the top bar.              */
const HelpOverlay: FC<{ title: string; info: GameInfo; onClose: () => void }> = ({ title, info, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="game-help-backdrop" onClick={onClose} role="presentation">
      <div
        className="game-help-card"
        role="dialog"
        aria-modal="true"
        aria-label={`How to play ${title}`}
        onClick={e => e.stopPropagation()}
      >
        <p className="game-help-kicker mono">How to play</p>
        <h2 className="game-help-title">{title}</h2>
        <p className="game-help-about">{info.about}</p>
        <ol className="game-help-steps">
          {info.howTo.map((s, i) => (
            <li key={i} style={{ ["--i" as string]: i } as React.CSSProperties}>
              <span className="game-help-num" aria-hidden>{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {info.controls && info.controls.length > 0 && (
          <div className="game-help-controls">
            {info.controls.map((c, i) => (
              <span key={i} className="game-help-kbd"><kbd>{c.keys}</kbd>{c.desc}</span>
            ))}
          </div>
        )}
        {info.legend && info.legend.length > 0 && <LegendList legend={info.legend} />}
        <button type="button" className="game-help-cta" onClick={onClose} autoFocus>
          Got it — let&rsquo;s play
        </button>
      </div>
    </div>
  );
};

const helpSeenKey = (slug: string) => `game-help-seen:${slug}`;

const GameShell: FC<GameShellProps> = ({ slug, subtitle, info, stats, toolbar, children }) => {
  const meta = games.find(g => g.slug === slug);
  const title = meta?.title ?? "Game";
  const color = meta?.color ?? "#fde68a";

  const rootRef = useRef<HTMLElement>(null);
  const [isFs, setIsFs] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const [showHelp, setShowHelp] = useState<boolean>(() => {
    try { return localStorage.getItem(helpSeenKey(slug)) == null; } catch { return false; }
  });

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

  const closeHelp = useCallback(() => {
    setShowHelp(false);
    try { localStorage.setItem(helpSeenKey(slug), "1"); } catch { /* private mode */ }
  }, [slug]);

  return (
    <main
      ref={rootRef}
      className={`game-shell${isFs ? " is-fs" : ""}`}
      style={{ ["--game" as string]: color } as React.CSSProperties}
    >
      {/* Ambient backdrop — soft drifting colour orbs + film grain. */}
      <div className="game-ambient" aria-hidden>
        <span className="game-orb game-orb-a" />
        <span className="game-orb game-orb-b" />
        <span className="game-grain" />
      </div>

      <div className="game-topbar">
        <div className="game-titlewrap">
          <Link to="/games" viewTransition className="game-back mono"><span aria-hidden>←</span> Games</Link>
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
              onClick={() => setShowHelp(true)}
              aria-label="How to play"
              title="How to play"
            >
              <HelpIcon />
            </button>
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

      {showHelp && <HelpOverlay title={title} info={info} onClose={closeHelp} />}
    </main>
  );
};

export default GameShell;
