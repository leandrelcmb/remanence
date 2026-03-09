import { useState } from "react";
import { createPortal } from "react-dom";

// ── Palette ───────────────────────────────────────────────────────────────────

const GOLD        = "#F0B429";
const GOLD_GLOW   = "rgba(240, 180, 41, 0.18)";
const GOLD_BORDER = "rgba(240, 180, 41, 0.45)";
const GOLD_DIM    = "rgba(240, 180, 41, 0.55)";

// ── Secrets à révéler ─────────────────────────────────────────────────────────

const SECRETS = [
  // ── Personnes & tenues ──────────────────────────────────────────────────────
  "Une tenue entièrement fluorescente, brillant sous les UV de la nuit",
  "Quelqu'un habillé en créature fantastique, tribale ou totalement mystérieuse",
  "Une coiffure ou un chapeau absolument unique, jamais vu ailleurs",
  "Un tatouage ou body painting qui couvre plus de la moitié du corps",
  "Une couleur portée en vêtement que tu n'aurais jamais osée toi-même",
  "Quelqu'un qui arbore une parure faite entièrement de matières naturelles",

  // ── Art & installations ──────────────────────────────────────────────────────
  "Un artiste en train de créer ou peindre une œuvre en direct",
  "Une installation lumineuse ou sculpture que tu n'avais pas encore remarquée",
  "Un totem ou décoration géante dominant le campement",
  "Un miroir ou surface réfléchissante qui capture le ciel ou la foule",
  "Un motif ou texture qui ressemble vraiment à une fractale",

  // ── Musiciens & performeurs ──────────────────────────────────────────────────
  "Quelqu'un qui joue d'un instrument acoustique hors d'une scène officielle",
  "Un jongleur, acrobate ou artiste de feu en pleine performance",
  "Un instrument de musique posé seul, sans son propriétaire en vue",
  "L'endroit précis où deux scènes créent une harmonie inattendue",

  // ── Feu & lumière ────────────────────────────────────────────────────────────
  "Un brasero, torche ou feu de camp allumé dans la nuit",
  "Un laser ou faisceau de lumière qui traverse l'obscurité comme une lame",
  "Un objet lumineux artisanal, bioluminescent ou étrange que tu ne sais pas nommer",
  "Le ciel étoilé visible depuis la piste de danse — sans bâtiment ni écran",

  // ── Nature & animaux ─────────────────────────────────────────────────────────
  "Un animal sauvage : oiseau, insecte géant, renard, papillon, chat errant…",
  "Un lever ou coucher de soleil vu depuis la piste ou le campement",
  "Une flaque, lac ou surface naturelle qui reflète parfaitement le ciel",

  // ── Rencontres humaines ──────────────────────────────────────────────────────
  "Un vrai échange avec quelqu'un venu d'un autre continent",
  "Quelqu'un qui distribue gratuitement nourriture, eau ou un accessoire",
  "Un créateur ou artisan qui vend une œuvre entièrement faite main",
  "Un groupe de gens dansant en cercle, mains jointes ou bras levés",
  "Quelqu'un qui partage une histoire autour d'un feu ou sous les étoiles",

  // ── Moments intérieurs ───────────────────────────────────────────────────────
  "Quelqu'un allongé dans l'herbe, les yeux fermés, souriant",
  "Quelqu'un en méditation profonde, immobile, au cœur du festival",
  "L'instant précis où tu te sens pleinement là — nulle part ailleurs au monde",
];

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = { onBack: () => void };

export function TreasureScreen({ onBack }: Props) {
  const [found, setFound] = useState<Set<number>>(() => new Set());
  const [lastRevealed, setLastRevealed] = useState<number | null>(null);

  const count   = found.size;
  const total   = SECRETS.length;
  const allDone = count === total;
  const pct     = total > 0 ? count / total : 0;

  function toggle(i: number) {
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
        setLastRevealed(i);
        setTimeout(() => setLastRevealed((r) => (r === i ? null : r)), 600);
      }
      return next;
    });
  }

  function reset() {
    setFound(new Set());
    setLastRevealed(null);
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── CSS local ── */}
      <style>{`
        @keyframes treasureReveal {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); box-shadow: 0 0 24px ${GOLD}60; }
          100% { transform: scale(1); }
        }
        @keyframes treasureDone {
          0%   { opacity: 0; transform: scale(0.88) translateY(24px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes treasureShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .treasure-item-reveal {
          animation: treasureReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .treasure-done-panel {
          animation: treasureDone 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .treasure-gold-bar {
          background: linear-gradient(90deg, #B8860B, ${GOLD}, #FFD700, ${GOLD}, #B8860B);
          background-size: 300% 100%;
          animation: treasureShimmer 2.8s linear infinite;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>🗺️ Chasse au Trésor</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>Explore le festival, révèle ses secrets</div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >Home ॐ</button>
      </div>

      {/* ── Barre de progression ── */}
      <div style={{
        flexShrink: 0,
        padding: "14px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.25)",
      }}>
        {/* Compteur */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span style={{
            fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em",
            color: count > 0 ? GOLD : "rgba(255,255,255,0.5)",
            textShadow: count > 0 ? `0 0 20px ${GOLD}80` : "none",
            transition: "color 0.4s ease, text-shadow 0.4s ease",
          }}>
            {count}
          </span>
          <span style={{ fontSize: 16, opacity: 0.4, fontWeight: 300 }}>/ {total} secrets révélés</span>
        </div>

        {/* Barre */}
        <div style={{
          height: 5,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          <div
            className={pct > 0 ? "treasure-gold-bar" : ""}
            style={{
              height: "100%",
              width: `${pct * 100}%`,
              borderRadius: 999,
              background: pct === 0 ? "transparent" : undefined,
              transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: pct > 0 ? `0 0 10px ${GOLD}80` : "none",
            }}
          />
        </div>
      </div>

      {/* ── Liste des secrets ── */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "14px 14px 60px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SECRETS.map((secret, i) => {
            const isFound   = found.has(i);
            const isNew     = lastRevealed === i;

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={isNew ? "treasure-item-reveal" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 14px",
                  borderRadius: 14,
                  border: isFound
                    ? `1px solid ${GOLD_BORDER}`
                    : "1px solid rgba(255,255,255,0.09)",
                  background: isFound
                    ? GOLD_GLOW
                    : "rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  color: "white",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                  transition: "border 0.3s ease, background 0.3s ease",
                  boxShadow: isFound ? `0 2px 16px ${GOLD}22` : "none",
                }}
              >
                {/* Numéro */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: isFound ? GOLD_DIM : "rgba(255,255,255,0.22)",
                  minWidth: 22,
                  flexShrink: 0,
                  transition: "color 0.3s ease",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icône état */}
                <span style={{
                  fontSize: 16,
                  flexShrink: 0,
                  lineHeight: 1,
                  filter: isFound ? "drop-shadow(0 0 4px #F0B429)" : "grayscale(1) opacity(0.4)",
                  transition: "filter 0.3s ease",
                }}>
                  {isFound ? "✨" : "🔍"}
                </span>

                {/* Texte */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: isFound ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                  transition: "color 0.3s ease",
                  textDecoration: "none",
                }}>
                  {secret}
                </span>

                {/* Check */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: isFound ? `2px solid ${GOLD}` : "2px solid rgba(255,255,255,0.18)",
                  background: isFound ? GOLD : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  boxShadow: isFound ? `0 0 10px ${GOLD}70` : "none",
                }}>
                  {isFound && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bouton reset discret */}
        {count > 0 && (
          <button
            onClick={reset}
            style={{
              display: "block",
              margin: "24px auto 0",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.25)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
            }}
          >
            Recommencer depuis le début
          </button>
        )}
      </div>

      {/* ── Célébration 30/30 ── */}
      {allDone && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.92)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          gap: 0,
        }}>
          <div
            className="treasure-done-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              maxWidth: 340,
              textAlign: "center",
            }}
          >
            {/* Emoji trésor */}
            <div style={{ fontSize: 72, lineHeight: 1, filter: `drop-shadow(0 0 30px ${GOLD})` }}>
              🗝️
            </div>

            {/* Titre */}
            <div>
              <div style={{
                fontSize: 26, fontWeight: 800,
                color: GOLD,
                textShadow: `0 0 30px ${GOLD}80`,
                marginBottom: 10,
              }}>
                Tous les secrets révélés
              </div>
              <p style={{
                margin: 0, fontSize: 15, lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)",
              }}>
                Tu as traversé le festival avec tes yeux grands ouverts.<br />
                Ozora te garde dans ses mémoires.
              </p>
            </div>

            {/* Ligne décorative */}
            <div className="treasure-gold-bar" style={{
              width: 80, height: 2, borderRadius: 999,
              boxShadow: `0 0 12px ${GOLD}80`,
            }} />

            {/* Boutons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              <button
                onClick={reset}
                style={{
                  padding: "15px",
                  borderRadius: 999,
                  background: GOLD,
                  border: "none",
                  color: "#000",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                  boxShadow: `0 4px 24px ${GOLD}60`,
                }}
              >
                Recommencer
              </button>
              <button
                onClick={onBack}
                style={{
                  padding: "15px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Retour aux Jeux
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
