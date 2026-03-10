import { useState, useEffect } from "react";
import type { ChasseType } from "../core/models/chasseTypes";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveChasseInfo = {
  chasseType: ChasseType;
  timerExpiresAt: number;
  resultLabel: string;
  resultColor: string;
  resultIcon: string;
};

function formatRemainingTime(expiresAt: number): string {
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

type Props = {
  festivalName: string;
  haloColor?: string;
  onStart: () => void;
  onExpressStart: () => void;
  onJournal: () => void;
  onConstellation: () => void;
  onFestivalPicker: () => void;
  onContacts: () => void;
  onGames: () => void;
  onSante: () => void;
  activeChasse?: ActiveChasseInfo;
  onResumeChasse: () => void;
};

// ── CSS animations ─────────────────────────────────────────────────────────────

const CSS = `
@keyframes landingOrnamentSpin {
  from { transform: translate(-50%, -50%) rotate(0deg);   }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes landingOrnamentSpinRev {
  from { transform: translate(-50%, -50%) rotate(0deg);    }
  to   { transform: translate(-50%, -50%) rotate(-360deg); }
}
@keyframes landingDotPulse {
  0%, 100% { opacity: 0.18; transform: scale(1);   }
  50%       { opacity: 0.65; transform: scale(1.5); }
}
@keyframes landingQuoteFade {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 0.45; transform: translateY(0); }
}
@keyframes landingCtaFade {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes landingGridFade {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);    }
}
`;

// ── Utilitaires couleur ───────────────────────────────────────────────────────

function parseColor(color: string): [number, number, number] {
  const v = color.trim();
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (![r, g, b].some(Number.isNaN)) return [r, g, b];
    }
  }
  const m = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return [0, 255, 183]; // fallback neon vert
}

function lighten(c: number, factor: number): number {
  return Math.min(255, Math.round(c + (255 - c) * factor));
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Ornement mystique ──────────────────────────────────────────────────────────

const DOT_POSITIONS: {
  top: number; left: number; size: number; blur: number;
  opacity: number; dur: number; delay: number;
}[] = [
  { top:  8, left: 15, size: 2, blur: 5, opacity: 0.28, dur: 3.5, delay: 0   },
  { top: 12, left: 78, size: 3, blur: 7, opacity: 0.22, dur: 4.2, delay: 0.8 },
  { top: 22, left:  5, size: 2, blur: 4, opacity: 0.18, dur: 3.8, delay: 1.5 },
  { top: 28, left: 90, size: 2, blur: 5, opacity: 0.25, dur: 5.0, delay: 0.3 },
  { top: 42, left:  2, size: 2, blur: 3, opacity: 0.14, dur: 5.5, delay: 2.8 },
  { top: 58, left: 94, size: 2, blur: 3, opacity: 0.14, dur: 4.1, delay: 3.0 },
  { top: 70, left:  8, size: 3, blur: 6, opacity: 0.20, dur: 4.5, delay: 2.1 },
  { top: 78, left: 86, size: 2, blur: 4, opacity: 0.22, dur: 3.2, delay: 1.2 },
  { top: 88, left: 30, size: 2, blur: 5, opacity: 0.18, dur: 4.8, delay: 0.6 },
  { top: 92, left: 66, size: 3, blur: 7, opacity: 0.16, dur: 3.9, delay: 1.9 },
];

function MysticOrnament({ accentColor }: { accentColor: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      pointerEvents: "none", overflow: "hidden", zIndex: 0,
    }}>
      {/* Arc intérieur — rotation lente */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 340, height: 340,
        borderRadius: "50%",
        border: `1px solid ${accentColor}1A`,
        animation: "landingOrnamentSpin 45s linear infinite",
      }} />
      {/* Arc extérieur — contre-rotation très lente */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 560, height: 560,
        borderRadius: "50%",
        border: `1px solid ${accentColor}0D`,
        animation: "landingOrnamentSpinRev 70s linear infinite",
      }} />
      {/* Micro-points lumineux */}
      {DOT_POSITIONS.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${d.top}%`, left: `${d.left}%`,
            width: d.size, height: d.size,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 ${d.blur}px ${accentColor}`,
            opacity: d.opacity,
            animation: `landingDotPulse ${d.dur}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── NavCard ────────────────────────────────────────────────────────────────────

function NavCard({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="remanence-btn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "14px 6px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(10px)",
        color: "rgba(255,255,255,0.86)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.03em",
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export function LandingScreen({
  festivalName, haloColor = "#00FFB7",
  onStart, onExpressStart, onJournal,
  onConstellation, onFestivalPicker, onContacts, onGames, onSante,
  activeChasse, onResumeChasse,
}: Props) {
  // Timer live : se met à jour chaque seconde quand une session est active
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!activeChasse) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeChasse]);

  // ── Couleurs CTA dérivées du halo ─────────────────────────────────────────
  const [r, g, b]   = parseColor(haloColor ?? "#00FFB7");
  const ctaStart    = toHex(r, g, b);
  const ctaEnd      = toHex(lighten(r, 0.38), lighten(g, 0.38), lighten(b, 0.38));
  const ctaGlow     = `rgba(${r},${g},${b},0.45)`;
  const ctaGlowSoft = `rgba(${r},${g},${b},0.28)`;
  const ctaGlowHot  = `rgba(${r},${g},${b},0.65)`;
  const luminance   = 0.299 * r + 0.587 * g + 0.114 * b;
  const ctaText     = luminance > 150
    ? toHex(Math.round(r * 0.08), Math.round(g * 0.08), Math.round(b * 0.08))
    : "rgba(255,255,255,0.95)";

  const glowCSS = `
@keyframes landingGlowBreath {
  0%, 100% { box-shadow: 0 0 18px ${ctaGlow}, 0 4px 24px ${ctaGlowSoft}; }
  50%       { box-shadow: 0 0 30px ${ctaGlowHot}, 0 4px 36px ${ctaGlow}; }
}`;

  return (
    <div style={{
      height: "80dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{CSS}</style>
      <style>{glowCSS}</style>

      {/* ── Ornement mystique (z-0, no pointer) ── */}
      <MysticOrnament accentColor={haloColor} />

      {/* ── Zone header — quote ── */}
      <div style={{
        flexShrink: 0,
        padding: "52px 24px 0",
        textAlign: "center",
        zIndex: 1,
      }}>
        <p style={{
          margin: 0,
          fontSize: 13,
          fontStyle: "italic",
          opacity: 0.45,
          letterSpacing: "0.10em",
          lineHeight: 1.6,
          animation: "landingQuoteFade 1.2s ease both",
        }}>
          ❝ Ancre l'instant ❞
        </p>
      </div>

      {/* ── Zone body — navigation ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "0 24px",
        zIndex: 1,
      }}>

        {/* ── CTA principal ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          animation: "landingCtaFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both",
        }}>
          <button
            onClick={onStart}
            className="remanence-btn"
            style={{
              width: "80%",
              height: 64,
              borderRadius: 32,
              border: "none",
              background: `linear-gradient(135deg, ${ctaStart} 0%, ${ctaEnd} 100%)`,
              boxShadow: `0 0 18px ${ctaGlow}, 0 4px 24px ${ctaGlowSoft}`,
              color: ctaText,
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              animation: "landingCtaFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both, landingGlowBreath 3.5s ease-in-out 0.8s infinite",
            }}
          >
            Entrer en rémanence 🌱
          </button>
        </div>

        {/* ── Trace éclair ── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          animation: "landingCtaFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both",
        }}>
          <button
            onClick={onExpressStart}
            className="remanence-btn"
            style={{
              width: "58%",
              height: 46,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              color: "rgba(255,255,255,0.72)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
            }}
          >
            Trace éclair ⚡
          </button>
        </div>

        {/* ── Séparateur ── */}
        <div style={{ height: 6 }} />

        {/* ── Grille souvenirs — 3 colonnes ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          animation: "landingGridFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both",
        }}>
          <NavCard emoji="💓" label="Vibrations"    onClick={onJournal}       />
          <NavCard emoji="✨" label="Constellations" onClick={onConstellation} />
          <NavCard emoji="🤝" label="Rencontres"    onClick={onContacts}      />
        </div>

        {/* ── Grille expériences — 2 colonnes ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          animation: "landingGridFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both",
        }}>
          <NavCard emoji="🧠" label="Santé" onClick={onSante} />
          <NavCard emoji="🎮" label="Jeux"  onClick={onGames} />
        </div>

        {/* ── Bannière session Chasse active ── */}
        {activeChasse && activeChasse.timerExpiresAt > Date.now() && (
          <button
            onClick={onResumeChasse}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${activeChasse.resultColor}55`,
              borderRadius: 16,
              padding: "12px 16px",
              color: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
              marginTop: 4,
            }}
          >
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%",
              background: activeChasse.resultColor,
              boxShadow: `0 0 8px ${activeChasse.resultColor}`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {activeChasse.resultIcon} {activeChasse.resultLabel} en cours
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                {formatRemainingTime(activeChasse.timerExpiresAt)} restantes · Reprendre →
              </div>
            </div>
          </button>
        )}

      </div>

      {/* ── Zone footer — festival picker ── */}
      <div style={{
        flexShrink: 0,
        padding: "0 24px 36px",
        textAlign: "center",
        zIndex: 1,
      }}>
        <button
          onClick={onFestivalPicker}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            opacity: 0.40,
            fontSize: 12,
            letterSpacing: "0.10em",
            textAlign: "center",
            padding: "8px 16px",
            fontFamily: "inherit",
          }}
        >
          {festivalName} · changer
        </button>
      </div>

    </div>
  );
}
