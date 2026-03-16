import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

// ── Utilitaires couleur (palette dynamique depuis haloColor) ─────────────────

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return [191, 90, 242]; // fallback violet
}
function lighten(c: number, factor: number): number {
  return Math.round(c + (255 - c) * factor);
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

// ── Palette fixe (feedback correct/incorrect) ─────────────────────────────────

const GREEN_CORRECT = "#34C759";
const RED_WRONG     = "#FF3B30";

// ── CSS ────────────────────────────────────────────────────────────────────────

const CSS = `
@keyframes anecdotesReveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes anecdotesCorrect {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.025); }
  100% { transform: scale(1); }
}
@keyframes anecdotesFade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ── Données ───────────────────────────────────────────────────────────────────

type AnecdoteCard = { a: string; b: string; ctx: string };

// ── Utilitaire ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = { onBack: () => void; haloColor?: string };

export function AnecdotesScreen({ onBack, haloColor }: Props) {
  const { t, i18n } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ANECDOTES = useMemo(() => t('anecdotes.items', { returnObjects: true }) as AnecdoteCard[], [i18n.language]);

  // ── Palette dynamique depuis le halo ───────────────────────────────────────
  const [r, g, b]   = parseColor(haloColor ?? "#BF5AF2");
  const haloMain    = toHex(r, g, b);
  const haloLight   = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloGlow    = `rgba(${r},${g},${b},0.22)`;
  const haloGlowSft = `rgba(${r},${g},${b},0.16)`;
  const pulseCss    = `@keyframes anecdotesPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(${r},${g},${b},0); }
  50%     { box-shadow: 0 0 22px 6px rgba(${r},${g},${b},0.38); }
}`;

  // Deck pré-calculé : mélangé + orientation aléatoire (flipped = B affiché en 1er)
  const displayCards = useMemo(
    () => shuffle(ANECDOTES).map(c => ({ ...c, flipped: Math.random() < 0.5 })),
    [ANECDOTES]
  );

  const [index,  setIndex]  = useState(0);
  const [chosen, setChosen] = useState<"first" | "second" | null>(null);
  const [score,  setScore]  = useState({ ok: 0, total: 0 });

  const card         = displayCards[index % displayCards.length];
  const opt1         = card.flipped ? card.b : card.a;
  const opt2         = card.flipped ? card.a : card.b;
  const correctChoice: "first" | "second" = card.flipped ? "second" : "first";
  const revealed     = chosen !== null;
  const isCorrect    = chosen === correctChoice;
  const cardNumber   = (index % displayCards.length) + 1;

  function handleChoose(pick: "first" | "second") {
    if (chosen) return;
    setChosen(pick);
    setScore(s => ({ ok: s.ok + (pick === correctChoice ? 1 : 0), total: s.total + 1 }));
  }

  function handleNext() {
    setIndex(i => i + 1);
    setChosen(null);
  }

  // Style d'une option selon l'état
  function optionStyle(which: "first" | "second"): React.CSSProperties {
    if (!revealed) {
      return {
        background:   "rgba(255,255,255,0.05)",
        border:       "1px solid rgba(255,255,255,0.12)",
        boxShadow:    "none",
        opacity:      1,
        animation:    "none",
        color:        "rgba(255,255,255,0.90)",
      };
    }
    const isThisCorrect = which === correctChoice;
    const isChosen      = which === chosen;

    if (isThisCorrect) return {
      background:   `rgba(52, 199, 89, 0.12)`,
      border:       `1px solid ${GREEN_CORRECT}`,
      boxShadow:    `0 0 12px rgba(52,199,89,0.20)`,
      opacity:      1,
      animation:    isChosen ? "anecdotesCorrect 0.35s ease both" : "none",
      color:        "rgba(255,255,255,0.92)",
    };
    if (isChosen && !isThisCorrect) return {
      background:   `rgba(255, 59, 48, 0.10)`,
      border:       `1px solid ${RED_WRONG}`,
      boxShadow:    "none",
      opacity:      1,
      animation:    "none",
      color:        "rgba(255,255,255,0.80)",
    };
    return {
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(255,255,255,0.06)",
      boxShadow:    "none",
      opacity:      0.38,
      animation:    "none",
      color:        "rgba(255,255,255,0.60)",
    };
  }

  function optionIcon(which: "first" | "second") {
    if (!revealed) return null;
    if (which === correctChoice) return <span style={{ color: GREEN_CORRECT, fontSize: 16, flexShrink: 0 }}>✓</span>;
    if (which === chosen)        return <span style={{ color: RED_WRONG,     fontSize: 16, flexShrink: 0 }}>✗</span>;
    return null;
  }

  const commonOptionStyle: React.CSSProperties = {
    width:         "100%",
    borderRadius:  18,
    padding:       "18px 16px",
    textAlign:     "left",
    fontSize:      14,
    lineHeight:    1.65,
    fontFamily:    "inherit",
    cursor:        revealed ? "default" : "pointer",
    fontWeight:    400,
    letterSpacing: "0.01em",
    display:       "flex",
    gap:           12,
    alignItems:    "flex-start",
    transition:    "opacity 0.2s ease, border 0.2s ease, background 0.2s ease",
  };

  return (
    <div style={{
      height:         "100dvh",
      display:        "flex",
      flexDirection:  "column",
      overflow:       "hidden",
    }}>
      <style>{CSS}</style>
      <style>{pulseCss}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink:     0,
        padding:        "20px 20px 14px",
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        borderBottom:   "1px solid rgba(255,255,255,0.07)",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.01em" }}>
            {t('anecdotes.title')}
          </div>
          {score.total > 0 && (
            <div style={{
              fontSize: 12, opacity: 0.50, marginTop: 4,
              animation: "anecdotesFade 0.3s ease both",
            }}>
              {t('anecdotes.score', { ok: score.ok, bad: score.total - score.ok, total: score.total })}
            </div>
          )}
        </div>
        <button
          onClick={onBack}
          style={{
            background:   "rgba(255,255,255,0.08)",
            border:       "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding:      "8px 16px",
            fontSize:     13,
            color:        "white",
            cursor:       "pointer",
            fontFamily:   "inherit",
            flexShrink:   0,
          }}
        >
          {t('anecdotes.back')}
        </button>
      </div>

      {/* ── Body ── */}
      <div
        className="no-scrollbar"
        style={{
          flex:            1,
          overflowY:       "auto",
          padding:         "20px 16px 40px",
          display:         "flex",
          flexDirection:   "column",
          justifyContent:  "center",
          gap:             12,
        }}
      >

        {/* Progression */}
        <div style={{
          textAlign:     "center",
          fontSize:      12,
          opacity:       0.40,
          letterSpacing: "0.08em",
          marginBottom:  4,
        }}>
          {t('anecdotes.cardNumber', { n: cardNumber, total: displayCards.length })}
        </div>

        {/* Contexte révélé — toujours dans le DOM, au-dessus des options */}
        <div style={{
          borderRadius:    16,
          padding:         "16px",
          background:      isCorrect
            ? "rgba(52,199,89,0.08)"
            : "rgba(255,59,48,0.07)",
          border:          isCorrect
            ? "1px solid rgba(52,199,89,0.25)"
            : "1px solid rgba(255,59,48,0.20)",
          display:         "flex",
          flexDirection:   "column",
          gap:             8,
          visibility:      revealed ? "visible" : "hidden",
          animation:       revealed ? "anecdotesReveal 0.4s cubic-bezier(0.22,1,0.36,1) both" : undefined,
        }}>
          <div style={{
            fontSize:      13,
            fontWeight:    700,
            color:         isCorrect ? GREEN_CORRECT : RED_WRONG,
            letterSpacing: "0.04em",
          }}>
            {isCorrect ? t('anecdotes.correct') : t('anecdotes.wrong')}
          </div>
          <p style={{
            margin:     0,
            fontSize:   13,
            lineHeight: 1.65,
            opacity:    0.80,
          }}>
            {card.ctx}
          </p>
        </div>

        {/* Option 1 */}
        <button
          onClick={() => handleChoose("first")}
          className={!revealed ? "remanence-btn" : ""}
          style={{ ...commonOptionStyle, ...optionStyle("first") }}
        >
          {optionIcon("first")}
          <span>{opt1}</span>
        </button>

        {/* Séparateur "ou" */}
        <div style={{
          textAlign:     "center",
          fontSize:      11,
          opacity:       0.30,
          letterSpacing: "0.10em",
          margin:        "-2px 0",
        }}>
          {t('anecdotes.or')}
        </div>

        {/* Option 2 */}
        <button
          onClick={() => handleChoose("second")}
          className={!revealed ? "remanence-btn" : ""}
          style={{ ...commonOptionStyle, ...optionStyle("second") }}
        >
          {optionIcon("second")}
          <span>{opt2}</span>
        </button>

        {/* Bouton suivant — toujours dans le DOM, invisible tant que pas révélé */}
        <button
          onClick={handleNext}
          className="remanence-btn"
          style={{
            width:         "100%",
            borderRadius:  999,
            padding:       "16px 20px",
            border:        "none",
            background:    `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`,
            boxShadow:     `0 0 18px ${haloGlow}, 0 4px 20px ${haloGlowSft}`,
            color:         "white",
            fontSize:      16,
            fontWeight:    600,
            cursor:        revealed ? "pointer" : "default",
            fontFamily:    "inherit",
            letterSpacing: "0.03em",
            visibility:    revealed ? "visible" : "hidden",
            pointerEvents: revealed ? "auto" : "none",
            animation:     revealed ? "anecdotesReveal 0.4s cubic-bezier(0.22,1,0.36,1) 0.15s both, anecdotesPulse 2.2s ease-in-out 0.55s infinite" : undefined,
          }}
        >
          {t('anecdotes.nextCard')}
        </button>

      </div>
    </div>
  );
}
