import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';
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
  onProgrammation: () => void;
  activeChasse?: ActiveChasseInfo;
  onResumeChasse: () => void;
};

// ── CSS animations ─────────────────────────────────────────────────────────────

const CSS = `
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
@keyframes ornamentSparkle {
  0%, 100% { opacity: 0.25; transform: scale(0.9); }
  50%       { opacity: 1;    transform: scale(1.3); }
}
@keyframes ornamentSparkleRotate {
  0%   { opacity: 0.30; transform: rotate(0deg)   scale(0.85); }
  50%  { opacity: 1.00; transform: rotate(180deg) scale(1.25); }
  100% { opacity: 0.30; transform: rotate(360deg) scale(0.85); }
}
@keyframes ornamentBurst {
  0%, 100% { opacity: 0.18; transform: scale(0.7);  }
  40%       { opacity: 0.90; transform: scale(1.15); }
  70%       { opacity: 0.55; transform: scale(0.95); }
}
@keyframes ornamentStarSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
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
  return [0, 255, 183];
}

function lighten(c: number, factor: number): number {
  return Math.min(255, Math.round(c + (255 - c) * factor));
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Formes SVG sparkles ────────────────────────────────────────────────────────

const STAR8    = "M0,-14 L3.5,-5.5 L13,-5.5 L5.5,0 L8.5,10 L0,5 L-8.5,10 L-5.5,0 L-13,-5.5 L-3.5,-5.5 Z";
const STAR5    = "M0,-8 L1.8,-3 L7,-3 L3,0 L4.5,5 L0,2.5 L-4.5,5 L-3,0 L-7,-3 L-1.8,-3 Z";
const SP_CROSS   = "M0,-5 L0.6,-0.6 L4,0 L0.6,0.6 L0,5 L-0.6,0.6 L-4,0 L-0.6,-0.6 Z";
const SP_DIAMOND = "M0,-3.5 L2.5,0 L0,3.5 L-2.5,0 Z";
const SP_BURST   = "M0,-5 L0,-1.8 M0,1.8 L0,5 M-5,0 L-1.8,0 M1.8,0 L5,0";
const SP_MOBILE  = "M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z";

// ── OrnamentBorder ─────────────────────────────────────────────────────────────

function OrnamentBorder({ haloColor }: { haloColor: string }) {
  const [r, g, b] = parseColor(haloColor);

  // Palette dérivée du halo : base, clair (mixé vers blanc), très clair
  const c   = (a: number) => `rgba(${r},${g},${b},${a})`;
  const rl  = lighten(r, 0.42), gl  = lighten(g, 0.42), bl  = lighten(b, 0.42);
  const rll = lighten(r, 0.72), gll = lighten(g, 0.72), bll = lighten(b, 0.72);
  const cL  = (a: number) => `rgba(${rl},${gl},${bl},${a})`;
  const cLL = (a: number) => `rgba(${rll},${gll},${bll},${a})`;

  return createPortal(
    <svg
      viewBox="0 0 375 812"
      preserveAspectRatio="none"
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw, 430px)",
        height: "100dvh",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        {/* Glow léger */}
        <filter id="og" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Glow fort */}
        <filter id="og2" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge>
            <feMergeNode in="b"/><feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Glow halo (bord adaptatif) */}
        <filter id="og-halo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14"/>
        </filter>

        {/* Circuit pour les comètes mobiles */}
        <path id="lp-orbit"
          d="M22,8 L353,8 L367,22 L367,790 L353,804 L22,804 L8,790 L8,22 Z"/>

        {/* Gradients de traîne — base, clair, très clair */}
        <linearGradient id="tail-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c(0)}/>
          <stop offset="100%" stopColor={c(0.8)}/>
        </linearGradient>
        <linearGradient id="tail-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={cL(0)}/>
          <stop offset="100%" stopColor={cL(0.8)}/>
        </linearGradient>
        <linearGradient id="tail-vlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={cLL(0)}/>
          <stop offset="100%" stopColor={cLL(0.75)}/>
        </linearGradient>

        {/* Gradients de bord — monochrome, s'estompent aux extrémités */}
        <linearGradient id="g-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c(0.3)}/>
          <stop offset="25%"  stopColor={cL(0.9)}/>
          <stop offset="75%"  stopColor={c(0.9)}/>
          <stop offset="100%" stopColor={c(0.3)}/>
        </linearGradient>
        <linearGradient id="g-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={c(0.3)}/>
          <stop offset="30%"  stopColor={c(0.9)}/>
          <stop offset="70%"  stopColor={cL(0.9)}/>
          <stop offset="100%" stopColor={c(0.3)}/>
        </linearGradient>
        <linearGradient id="g-bottom" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={c(0.3)}/>
          <stop offset="25%"  stopColor={c(0.9)}/>
          <stop offset="75%"  stopColor={cL(0.9)}/>
          <stop offset="100%" stopColor={c(0.3)}/>
        </linearGradient>
        <linearGradient id="g-left" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={c(0.3)}/>
          <stop offset="30%"  stopColor={cL(0.9)}/>
          <stop offset="70%"  stopColor={c(0.9)}/>
          <stop offset="100%" stopColor={c(0.3)}/>
        </linearGradient>
      </defs>

      {/* ── Glow halo adaptatif ── */}
      <rect x="2" y="2" width="371" height="808"
        fill="none"
        stroke={c(0.45)}
        strokeWidth="20"
        filter="url(#og-halo)"
      />

      {/* ── Bords ── */}
      <line x1="22"  y1="8"   x2="353" y2="8"   stroke="url(#g-top)"    strokeWidth="1.5" filter="url(#og)"/>
      <line x1="367" y1="22"  x2="367" y2="790" stroke="url(#g-right)"  strokeWidth="1.5" filter="url(#og)"/>
      <line x1="353" y1="804" x2="22"  y2="804" stroke="url(#g-bottom)" strokeWidth="1.5" filter="url(#og)"/>
      <line x1="8"   y1="790" x2="8"   y2="22"  stroke="url(#g-left)"   strokeWidth="1.5" filter="url(#og)"/>

      {/* ── Grande étoile top-center ── */}
      <g transform="translate(187.5, 8)" filter="url(#og2)">
        <path d={STAR8} fill={cL(0.95)}
          style={{ animation: "ornamentStarSpin 12s linear infinite", transformOrigin: "0 0" }}/>
      </g>

      {/* ── Étoiles de coins ── */}
      <g transform="translate(14, 14)"   filter="url(#og2)"><path d={STAR5} fill={c(0.9)}/></g>
      <g transform="translate(361, 14)"  filter="url(#og2)"><path d={STAR5} fill={cL(0.9)}/></g>
      <g transform="translate(14, 798)"  filter="url(#og2)"><path d={STAR5} fill={cL(0.9)}/></g>
      <g transform="translate(361, 798)" filter="url(#og2)"><path d={STAR5} fill={c(0.9)}/></g>

      {/* ── Vrilles de coins ── */}
      <g filter="url(#og)">
        <path d="M8,50 C13,28 28,13 50,8"   stroke={c(0.70)}  strokeWidth="1"   fill="none"/>
        <path d="M8,78 C20,50 45,30 78,18"   stroke={cL(0.45)} strokeWidth="0.8" fill="none"/>
        <path d="M22,8 C16,20 10,32 8,50"    stroke={c(0.35)}  strokeWidth="0.7" fill="none"/>
      </g>
      <g filter="url(#og)">
        <path d="M367,50 C362,28 347,13 325,8"  stroke={cL(0.70)} strokeWidth="1"   fill="none"/>
        <path d="M367,78 C355,50 330,30 297,18"  stroke={c(0.45)}  strokeWidth="0.8" fill="none"/>
        <path d="M353,8 C359,20 365,32 367,50"   stroke={cL(0.35)} strokeWidth="0.7" fill="none"/>
      </g>
      <g filter="url(#og)">
        <path d="M8,762 C13,784 28,799 50,804"   stroke={cL(0.70)} strokeWidth="1"   fill="none"/>
        <path d="M8,734 C20,762 45,782 78,794"   stroke={c(0.45)}  strokeWidth="0.8" fill="none"/>
        <path d="M22,804 C16,792 10,780 8,762"   stroke={cL(0.35)} strokeWidth="0.7" fill="none"/>
      </g>
      <g filter="url(#og)">
        <path d="M367,762 C362,784 347,799 325,804"  stroke={c(0.70)}  strokeWidth="1"   fill="none"/>
        <path d="M367,734 C355,762 330,782 297,794"  stroke={cL(0.45)} strokeWidth="0.8" fill="none"/>
        <path d="M353,804 C359,792 365,780 367,762"  stroke={c(0.35)}  strokeWidth="0.7" fill="none"/>
      </g>

      {/* ════ SPARKLES ════ */}

      {/* ── Croix ✦ (rotation lente) ── */}
      <g transform="translate(70, 8)" filter="url(#og2)">
        <path d={SP_CROSS} fill={cL(0.85)}
          style={{ animation: "ornamentSparkleRotate 14s ease-in-out 0s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(310, 8)" filter="url(#og2)">
        <path d={SP_CROSS} fill={c(0.85)}
          style={{ animation: "ornamentSparkleRotate 16s ease-in-out 1.2s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(367, 180)" filter="url(#og2)">
        <path d={SP_CROSS} fill={c(0.85)}
          style={{ animation: "ornamentSparkleRotate 13s ease-in-out 2.1s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(367, 660)" filter="url(#og2)">
        <path d={SP_CROSS} fill={cL(0.80)}
          style={{ animation: "ornamentSparkleRotate 17s ease-in-out 0.5s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(65, 804)" filter="url(#og2)">
        <path d={SP_CROSS} fill={cLL(0.80)}
          style={{ animation: "ornamentSparkleRotate 14s ease-in-out 3.0s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(305, 804)" filter="url(#og2)">
        <path d={SP_CROSS} fill={c(0.85)}
          style={{ animation: "ornamentSparkleRotate 15s ease-in-out 1.8s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(8, 200)" filter="url(#og2)">
        <path d={SP_CROSS} fill={cL(0.85)}
          style={{ animation: "ornamentSparkleRotate 12s ease-in-out 0.8s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(8, 620)" filter="url(#og2)">
        <path d={SP_CROSS} fill={c(0.80)}
          style={{ animation: "ornamentSparkleRotate 15s ease-in-out 2.5s infinite", transformOrigin: "0 0" }}/>
      </g>

      {/* ── Losanges ◇ (pulse doux) ── */}
      <g transform="translate(120, 8)">
        <path d={SP_DIAMOND} fill={c(0.75)}
          style={{ animation: "ornamentSparkle 6.5s ease-in-out 0.6s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(255, 8)">
        <path d={SP_DIAMOND} fill={cL(0.70)}
          style={{ animation: "ornamentSparkle 8s ease-in-out 1.8s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(367, 360)">
        <path d={SP_DIAMOND} fill={cL(0.70)}
          style={{ animation: "ornamentSparkle 7s ease-in-out 0.3s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(367, 500)">
        <path d={SP_DIAMOND} fill={c(0.75)}
          style={{ animation: "ornamentSparkle 9s ease-in-out 2.4s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(130, 804)">
        <path d={SP_DIAMOND} fill={cLL(0.70)}
          style={{ animation: "ornamentSparkle 7.5s ease-in-out 1.1s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(248, 804)">
        <path d={SP_DIAMOND} fill={c(0.70)}
          style={{ animation: "ornamentSparkle 6s ease-in-out 0.9s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(8, 320)">
        <path d={SP_DIAMOND} fill={cL(0.70)}
          style={{ animation: "ornamentSparkle 8.5s ease-in-out 3.2s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(8, 500)">
        <path d={SP_DIAMOND} fill={cLL(0.65)}
          style={{ animation: "ornamentSparkle 7s ease-in-out 1.5s infinite", transformOrigin: "0 0" }}/>
      </g>

      {/* ── Bursts + (rayons radiants) ── */}
      <g transform="translate(188, 8)" filter="url(#og)">
        <path d={SP_BURST} stroke={cL(0.80)} strokeWidth="1.2" fill="none"
          style={{ animation: "ornamentBurst 5s ease-in-out 1.2s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(367, 406)" filter="url(#og)">
        <path d={SP_BURST} stroke={c(0.80)} strokeWidth="1.2" fill="none"
          style={{ animation: "ornamentBurst 4.5s ease-in-out 0s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(188, 804)" filter="url(#og)">
        <path d={SP_BURST} stroke={cLL(0.75)} strokeWidth="1.2" fill="none"
          style={{ animation: "ornamentBurst 6s ease-in-out 2.5s infinite", transformOrigin: "0 0" }}/>
      </g>
      <g transform="translate(8, 406)" filter="url(#og)">
        <path d={SP_BURST} stroke={cL(0.75)} strokeWidth="1.2" fill="none"
          style={{ animation: "ornamentBurst 5.5s ease-in-out 1.8s infinite", transformOrigin: "0 0" }}/>
      </g>

      {/* ════ COMÈTES MOBILES ════ */}

      {/* Comète 1 — couleur base */}
      <g filter="url(#og2)">
        <line x1="-14" y1="0" x2="0" y2="0" stroke="url(#tail-base)" strokeWidth="1.8"/>
        <path d={SP_MOBILE} fill={c(0.92)}/>
        <animateMotion dur="50s" repeatCount="indefinite" rotate="auto">
          <mpath href="#lp-orbit"/>
        </animateMotion>
      </g>

      {/* Comète 2 — couleur claire */}
      <g filter="url(#og2)">
        <line x1="-14" y1="0" x2="0" y2="0" stroke="url(#tail-light)" strokeWidth="1.8"/>
        <path d={SP_MOBILE} fill={cL(0.88)}/>
        <animateMotion dur="50s" begin="-16.67s" repeatCount="indefinite" rotate="auto">
          <mpath href="#lp-orbit"/>
        </animateMotion>
      </g>

      {/* Comète 3 — très claire (presque blanc teinté) */}
      <g filter="url(#og2)">
        <line x1="-14" y1="0" x2="0" y2="0" stroke="url(#tail-vlight)" strokeWidth="1.8"/>
        <path d={SP_MOBILE} fill={cLL(0.85)}/>
        <animateMotion dur="50s" begin="-33.33s" repeatCount="indefinite" rotate="auto">
          <mpath href="#lp-orbit"/>
        </animateMotion>
      </g>

    </svg>,
    document.body
  );
}

// ── NavCard ────────────────────────────────────────────────────────────────────

function NavCard({
  emoji, label, onClick, cardId,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  cardId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-navcard={cardId}
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
        border: "none",
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
  onConstellation, onFestivalPicker, onContacts, onGames, onSante, onProgrammation,
  activeChasse, onResumeChasse,
}: Props) {
  const { t } = useTranslation();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!activeChasse) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeChasse]);

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
}
[data-navcard] {
  box-shadow:
    inset 0 0 0 1px rgba(${r},${g},${b},0.22),
    0 0 10px 3px rgba(${r},${g},${b},0.14);
}`;

  return (
    <div style={{
      height: "90dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{CSS}</style>
      <style>{glowCSS}</style>

      <OrnamentBorder haloColor={haloColor} />

      {/* ── Zone body ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "0 24px",
        zIndex: 1,
      }}>

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
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              animation: "landingCtaFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both, landingGlowBreath 3.5s ease-in-out 0.8s infinite",
            }}
          >
            {t('landing.cta')}
          </button>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          animation: "landingCtaFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both",
        }}>
          <button
            onClick={onExpressStart}
            className="remanence-btn"
            style={{
              width: "65%",
              height: 50,
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
            {t('landing.express')}
          </button>
        </div>

        <div style={{ height: 6 }} />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          animation: "landingGridFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both",
        }}>
          <NavCard emoji="💓" label={t('landing.journal')}        onClick={onJournal}       cardId="0" />
          <NavCard emoji="✨" label={t('landing.constellation')} onClick={onConstellation} cardId="1" />
          <NavCard emoji="🤝" label={t('landing.contacts')}     onClick={onContacts}      cardId="2" />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          animation: "landingGridFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both",
        }}>
          <NavCard emoji="🧠" label={t('landing.health')}  onClick={onSante}         cardId="3" />
          <NavCard emoji="🎵" label={t('landing.program')} onClick={onProgrammation} cardId="4" />
          <NavCard emoji="🎮" label={t('landing.games')}   onClick={onGames}         cardId="5" />
        </div>

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
                {activeChasse.resultIcon} {activeChasse.resultLabel} {t('landing.gameActive')}
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                {formatRemainingTime(activeChasse.timerExpiresAt)} {t('landing.gameResume')}
              </div>
            </div>
          </button>
        )}

      </div>

      {/* ── Footer festival ── */}
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
	    fontStyle: "italic",
          }}
        >
          {festivalName} · {t('landing.changeFestival')}
        </button>
      </div>

    </div>
  );
}
