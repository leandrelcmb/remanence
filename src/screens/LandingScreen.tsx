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
@keyframes ornamentBreath {
  0%, 100% { opacity: 0.65; }
  50%       { opacity: 1;    }
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

const STAR5    = "M0,-8 L1.8,-3 L7,-3 L3,0 L4.5,5 L0,2.5 L-4.5,5 L-3,0 L-7,-3 L-1.8,-3 Z";
const SP_CROSS   = "M0,-5 L0.6,-0.6 L4,0 L0.6,0.6 L0,5 L-0.6,0.6 L-4,0 L-0.6,-0.6 Z";
const SP_DIAMOND = "M0,-3.5 L2.5,0 L0,3.5 L-2.5,0 Z";
const SP_BURST   = "M0,-5 L0,-1.8 M0,1.8 L0,5 M-5,0 L-1.8,0 M1.8,0 L5,0";
const SP_MOBILE  = "M0,-3.5 L0.8,-0.8 L3.5,0 L0.8,0.8 L0,3.5 L-0.8,0.8 L-3.5,0 L-0.8,-0.8 Z";

// ── OrnamentBorder ─────────────────────────────────────────────────────────────

// Motif "graine de vie" partielle pour un coin : 3 cercles entrelacés + spirale
// fine. Dessiné pour le coin haut-gauche, réutilisé via translate + scale(±1).
function CornerSacred({ c, cL }: { c: (a: number) => string; cL: (a: number) => string }) {
  return (
    <>
      <circle cx="30" cy="30" r="16" stroke={c(0.40)}  strokeWidth="0.8" fill="none"/>
      <circle cx="46" cy="24" r="16" stroke={cL(0.26)} strokeWidth="0.6" fill="none"/>
      <circle cx="24" cy="46" r="16" stroke={cL(0.26)} strokeWidth="0.6" fill="none"/>
      {/* Spirale d'approche depuis le coin */}
      <path
        d="M12,12 Q34,10 40,28 Q44,42 32,46 Q22,49 19,40 Q17,32 25,31 Q30,30.5 31,35"
        stroke={c(0.32)} strokeWidth="0.7" fill="none"
      />
    </>
  );
}

function OrnamentBorder({ haloColor }: { haloColor: string }) {
  const [r, g, b] = parseColor(haloColor);

  // Dimensions réelles du viewport (largeur plafonnée comme le wrapper de l'app)
  // → viewBox exact, plus aucune déformation des cercles / étoiles
  const [size, setSize] = useState(() => ({
    w: Math.min(window.innerWidth, 430),
    h: window.innerHeight,
  }));
  useEffect(() => {
    const onResize = () =>
      setSize({ w: Math.min(window.innerWidth, 430), h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const { w, h } = size;

  // Palette dérivée du halo : base, clair (mixé vers blanc), très clair
  const c   = (a: number) => `rgba(${r},${g},${b},${a})`;
  const rl  = lighten(r, 0.42), gl  = lighten(g, 0.42), bl  = lighten(b, 0.42);
  const rll = lighten(r, 0.72), gll = lighten(g, 0.72), bll = lighten(b, 0.72);
  const cL  = (a: number) => `rgba(${rl},${gl},${bl},${a})`;
  const cLL = (a: number) => `rgba(${rll},${gll},${bll},${a})`;

  // Scintillements : positions fractionnaires + délais organiques (pas de motif répétitif)
  const crosses = [
    { x: w * 0.19, y: 8 },        { x: w * 0.83, y: 8 },
    { x: w - 8,    y: h * 0.22 }, { x: w - 8,    y: h * 0.81 },
    { x: w * 0.17, y: h - 8 },    { x: w * 0.81, y: h - 8 },
    { x: 8,        y: h * 0.25 }, { x: 8,        y: h * 0.76 },
  ];
  const diamonds = [
    { x: w * 0.32, y: 8 },        { x: w * 0.68, y: 8 },
    { x: w - 8,    y: h * 0.44 }, { x: w - 8,    y: h * 0.62 },
    { x: w * 0.35, y: h - 8 },    { x: w * 0.66, y: h - 8 },
    { x: 8,        y: h * 0.39 }, { x: 8,        y: h * 0.62 },
  ];
  const bursts = [
    { x: w * 0.5, y: 8 },     { x: w - 8, y: h * 0.5 },
    { x: w * 0.5, y: h - 8 }, { x: 8,     y: h * 0.5 },
  ];
  const palette = [c, cL, cLL];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw, 430px)",
        height: "100dvh",
        pointerEvents: "none",
        zIndex: 0,
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

        {/* Circuit pour les comètes mobiles — suit les dimensions réelles */}
        <path id="lp-orbit"
          d={`M22,8 L${w - 22},8 L${w - 8},22 L${w - 8},${h - 22} L${w - 22},${h - 8} L22,${h - 8} L8,${h - 22} L8,22 Z`}/>

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

      {/* ── Glow halo adaptatif — respire avec le halo central ── */}
      <g style={{ animation: "ornamentBreath 5.5s ease-in-out infinite" }}>
        <rect x="2" y="2" width={w - 4} height={h - 4}
          fill="none"
          stroke={c(0.45)}
          strokeWidth="20"
          filter="url(#og-halo)"
        />
      </g>

      {/* ── Bords ── */}
      <line x1={22}    y1={8}     x2={w - 22} y2={8}     stroke="url(#g-top)"    strokeWidth="1.5" filter="url(#og)"/>
      <line x1={w - 8} y1={22}    x2={w - 8}  y2={h - 22} stroke="url(#g-right)"  strokeWidth="1.5" filter="url(#og)"/>
      <line x1={w - 22} y1={h - 8} x2={22}    y2={h - 8}  stroke="url(#g-bottom)" strokeWidth="1.5" filter="url(#og)"/>
      <line x1={8}     y1={h - 22} x2={8}     y2={22}     stroke="url(#g-left)"   strokeWidth="1.5" filter="url(#og)"/>

      {/* ── Rosette "graine de vie" top-center (rotation lente) ── */}
      <g transform={`translate(${w / 2}, 8)`} filter="url(#og2)">
        <g style={{ animation: "ornamentStarSpin 12s linear infinite", transformOrigin: "0 0" }}>
          <circle cx="0" cy="0" r="5.5" stroke={cL(0.9)} strokeWidth="0.8" fill="none"/>
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={5.5 * Math.cos(rad)}
                cy={5.5 * Math.sin(rad)}
                r="5.5"
                stroke={cL(0.55)}
                strokeWidth="0.6"
                fill="none"
              />
            );
          })}
        </g>
      </g>

      {/* ── Étoiles de coins ── */}
      <g transform={`translate(14, 14)`}             filter="url(#og2)"><path d={STAR5} fill={c(0.9)}/></g>
      <g transform={`translate(${w - 14}, 14)`}      filter="url(#og2)"><path d={STAR5} fill={cL(0.9)}/></g>
      <g transform={`translate(14, ${h - 14})`}      filter="url(#og2)"><path d={STAR5} fill={cL(0.9)}/></g>
      <g transform={`translate(${w - 14}, ${h - 14})`} filter="url(#og2)"><path d={STAR5} fill={c(0.9)}/></g>

      {/* ── Coins : graine de vie + spirale (géométrie sacrée) ── */}
      <g filter="url(#og)" transform="translate(0, 0)">
        <CornerSacred c={c} cL={cL}/>
      </g>
      <g filter="url(#og)" transform={`translate(${w}, 0) scale(-1, 1)`}>
        <CornerSacred c={cL} cL={c}/>
      </g>
      <g filter="url(#og)" transform={`translate(0, ${h}) scale(1, -1)`}>
        <CornerSacred c={cL} cL={c}/>
      </g>
      <g filter="url(#og)" transform={`translate(${w}, ${h}) scale(-1, -1)`}>
        <CornerSacred c={c} cL={cL}/>
      </g>

      {/* ════ SPARKLES — délais et durées organiques dérivés de l'index ════ */}

      {/* ── Croix ✦ (rotation lente) ── */}
      {crosses.map((p, i) => (
        <g key={`cross-${i}`} transform={`translate(${p.x}, ${p.y})`} filter="url(#og2)">
          <path d={SP_CROSS} fill={palette[i % 3](0.85 - (i % 4) * 0.02)}
            style={{
              animation: `ornamentSparkleRotate ${12 + ((i * 2.3) % 5.6)}s ease-in-out ${(i * 1.7) % 5.3}s infinite`,
              transformOrigin: "0 0",
            }}/>
        </g>
      ))}

      {/* ── Losanges ◇ (pulse doux) ── */}
      {diamonds.map((p, i) => (
        <g key={`diamond-${i}`} transform={`translate(${p.x}, ${p.y})`}>
          <path d={SP_DIAMOND} fill={palette[(i + 1) % 3](0.75 - (i % 3) * 0.03)}
            style={{
              animation: `ornamentSparkle ${6 + ((i * 1.9) % 3.4)}s ease-in-out ${(i * 2.1) % 4.7}s infinite`,
              transformOrigin: "0 0",
            }}/>
        </g>
      ))}

      {/* ── Bursts + (rayons radiants) ── */}
      {bursts.map((p, i) => (
        <g key={`burst-${i}`} transform={`translate(${p.x}, ${p.y})`} filter="url(#og)">
          <path d={SP_BURST} stroke={palette[i % 3](0.78)} strokeWidth="1.2" fill="none"
            style={{
              animation: `ornamentBurst ${4.5 + ((i * 1.3) % 2.2)}s ease-in-out ${(i * 1.55) % 3.8}s infinite`,
              transformOrigin: "0 0",
            }}/>
        </g>
      ))}

      {/* ════ COMÈTES MOBILES — tête + 2 particules suiveuses chacune ════ */}

      {([
        { tail: "url(#tail-base)",   fill: c,   base: 0 },
        { tail: "url(#tail-light)",  fill: cL,  base: -16.67 },
        { tail: "url(#tail-vlight)", fill: cLL, base: -33.33 },
      ] as const).map((comet, i) => (
        <g key={`comet-${i}`}>
          {/* Tête */}
          <g filter="url(#og2)">
            <line x1="-14" y1="0" x2="0" y2="0" stroke={comet.tail} strokeWidth="1.8"/>
            <path d={SP_MOBILE} fill={comet.fill(0.9)}/>
            <animateMotion dur="50s" begin={`${comet.base}s`} repeatCount="indefinite" rotate="auto">
              <mpath href="#lp-orbit"/>
            </animateMotion>
          </g>
          {/* Particules suiveuses (traînée) */}
          <g opacity="0.5">
            <path d={SP_MOBILE} fill={comet.fill(0.7)} transform="scale(0.55)"/>
            <animateMotion dur="50s" begin={`${comet.base + 0.5}s`} repeatCount="indefinite" rotate="auto">
              <mpath href="#lp-orbit"/>
            </animateMotion>
          </g>
          <g opacity="0.25">
            <path d={SP_MOBILE} fill={comet.fill(0.6)} transform="scale(0.32)"/>
            <animateMotion dur="50s" begin={`${comet.base + 1}s`} repeatCount="indefinite" rotate="auto">
              <mpath href="#lp-orbit"/>
            </animateMotion>
          </g>
        </g>
      ))}

    </svg>
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

      {createPortal(<OrnamentBorder haloColor={haloColor} />, document.body)}

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

        {activeChasse && (
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
              // Dernier de la séquence d'entrée (0.1 → 0.22 → 0.35 → 0.45 → 0.55)
              animation: "landingGridFade 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both",
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
                {activeChasse.timerExpiresAt > Date.now()
                  ? `${formatRemainingTime(activeChasse.timerExpiresAt)} ${t('landing.gameResume')}`
                  : t('landing.gameResumeFree')}
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
