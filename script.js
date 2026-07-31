/* ============================================================
   DEAUVE — Exclusive Previews
   Design system + layout
   ============================================================ */

:root {
  --bg: #0d0e12;
  --surface: rgba(255, 255, 255, 0.05);
  --surface-hover: rgba(255, 255, 255, 0.07);
  --border: rgba(255, 255, 255, 0.09);
  --text: #f7f8fa;
  --muted: #9aa0ab;
  --blue: #4b7cff;
  --blue2: #76d3ff;
  --gradient: linear-gradient(135deg, #4b7cff, #76d3ff);
  --glow: 0 0 40px rgba(75, 124, 255, 0.35);
  --shadow-card: 0 18px 40px rgba(0, 0, 0, 0.45);
  --radius: 16px;
  --font: "Space Grotesk", ui-sans-serif, system-ui, -apple-system, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}

body {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ---------- Ambient background ---------- */

.background {
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(circle at 50% -10%, rgba(75, 124, 255, 0.28), transparent 40%),
    radial-gradient(circle at 0% 100%, rgba(255, 60, 110, 0.12), transparent 44%),
    radial-gradient(circle at 100% 100%, rgba(0, 170, 255, 0.12), transparent 44%),
    linear-gradient(180deg, #08090c, #101218);
  animation: bgDrift 14s ease-in-out infinite alternate;
  transition: filter 0.7s ease;
  will-change: transform;
}

/* ---------- Layout ---------- */

.container {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 56px 20px 160px;
}

/* ---------- Header ---------- */

.logo {
  text-align: center;
  animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.logo h1 {
  font-size: clamp(2.75rem, 14vw, 4rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.18em;
  text-indent: 0.18em;
}

.logo p {
  margin-top: 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: var(--blue2);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(18px);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--muted);
}

.badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 14px var(--blue);
  animation: dotPulse 1.8s ease-in-out infinite;
}

/* ---------- Track list ---------- */

.tracklist {
  margin-top: 48px;
}

.track {
  animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.track:nth-child(1) { animation-delay: 0.06s; }
.track:nth-child(2) { animation-delay: 0.12s; }
.track:nth-child(3) { animation-delay: 0.18s; }
.track:nth-child(4) { animation-delay: 0.24s; }

.track-btn {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;
}

.track-btn:hover { background: var(--surface-hover); }
.track-btn.active { background: var(--surface); }

.track-play {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.track-btn:hover .track-play,
.track-btn.active .track-play {
  background: var(--gradient);
  box-shadow: var(--glow);
}

.track-btn:active .track-play { transform: scale(0.94); }

.track-play svg { width: 16px; height: 16px; fill: #fff; }

.track-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-sub {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.track-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 34px;
  height: 16px;
}

.track-time {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.divider {
  height: 1px;
  margin: 0 12px;
  background: var(--border);
}

/* ---------- Equalizer ---------- */

.eq { display: none; align-items: flex-end; gap: 3px; height: 14px; }

.eq i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 999px;
  background: var(--blue2);
  transform-origin: bottom;
  animation: eqBar 0.9s ease-in-out infinite;
}

.eq i:nth-child(2) { animation-delay: 0.18s; }
.eq i:nth-child(3) { animation-delay: 0.36s; }

.track-btn.playing .eq { display: flex; }
.track-btn.playing .track-time { display: none; }

/* ---------- Play / pause icon swap ---------- */

.ico-pause { display: none; }
.playing .ico-pause,
.player.playing .ico-pause { display: block; }
.playing .ico-play,
.player.playing .ico-play { display: none; }

/* ---------- Coming soon + footer ---------- */

.soon {
  width: 100%;
  margin-top: 40px;
  padding: 16px;
  border-radius: var(--radius);
  border: 1px dashed var(--border);
  background: var(--surface);
  color: var(--muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.42em;
  cursor: not-allowed;
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.35em;
  color: var(--muted);
}

/* ---------- Bottom player ---------- */

.player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  transform: translateY(120%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}

.player.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.player-inner {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow-card);
}

@media (min-width: 544px) {
  .player-inner { margin-bottom: 12px; }
}

.player-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.player-meta { min-width: 0; }

.player-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--blue2);
}

.player-title {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--gradient);
  box-shadow: var(--glow);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.player-btn:active { transform: scale(0.95); }
.player-btn svg { width: 16px; height: 16px; fill: #fff; }

.player-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.time {
  width: 36px;
  font-size: 10px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.time.right { text-align: right; }

.progress {
  flex: 1;
  height: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.progress-bar {
  width: 0%;
  height: 100%;
  border-radius: 999px;
  background: var(--gradient);
  box-shadow: 0 0 14px rgba(75, 124, 255, 0.65);
  transition: width 0.1s linear;
}

/* ---------- Keyframes ---------- */

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.5; }
}

@keyframes eqBar {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}

@keyframes bgDrift {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ---------- Small screens ---------- */

@media (max-width: 400px) {
  .container { padding: 44px 16px 150px; }
  .track-btn { gap: 12px; padding: 10px; }
  .track-play { width: 40px; height: 40px; }
  .track-title { font-size: 14px; }
}
