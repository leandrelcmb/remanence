import { useState } from "react";
import { createPortal } from "react-dom";

// ── Palette ───────────────────────────────────────────────────────────────────

const GOLD        = "#F0B429";
const GOLD_GLOW   = "rgba(240, 180, 41, 0.16)";
const GOLD_BORDER = "rgba(240, 180, 41, 0.45)";
const GOLD_DIM    = "rgba(240, 180, 41, 0.55)";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = "rencontres" | "découvertes" | "nature";
type Filter   = "tous" | Category;

type Secret = {
  text: string;
  cat: Category;
};

// ── Filtres disponibles ───────────────────────────────────────────────────────

const FILTERS: { key: Filter; label: string; hint: string }[] = [
  { key: "tous",        label: "Tous",           hint: "30 secrets"                       },
  { key: "rencontres",  label: "🤝 Rencontres",  hint: "Si tu veux rencontrer des gens"   },
  { key: "découvertes", label: "🔭 Découvertes",  hint: "Explorer seul·e, yeux grand ouverts" },
  { key: "nature",      label: "🌿 Nature",       hint: "Ciel, feu, lumière & animaux"    },
];

// ── Secrets à révéler ─────────────────────────────────────────────────────────
// cat: "rencontres" = implique un humain (interaction ou observation directe)
//      "découvertes" = objets, art, lieux, sons, instants visuels
//      "nature"      = ciel, feu, lumière, eau, animaux

const SECRETS: Secret[] = [
  // ── Rencontres (10) ──────────────────────────────────────────────────────────
  { cat: "rencontres",  text: "Un artiste en train de créer ou peindre une œuvre en direct" },
  { cat: "rencontres",  text: "Quelqu'un qui joue d'un instrument acoustique hors d'une scène officielle" },
  { cat: "rencontres",  text: "Un jongleur, acrobate ou artiste de feu en pleine performance" },
  { cat: "rencontres",  text: "Un vrai échange avec quelqu'un venu d'un autre continent" },
  { cat: "rencontres",  text: "Quelqu'un qui distribue gratuitement nourriture, eau ou un accessoire" },
  { cat: "rencontres",  text: "Un créateur ou artisan qui vend une œuvre entièrement faite main" },
  { cat: "rencontres",  text: "Un groupe de gens dansant en cercle, mains jointes ou bras levés" },
  { cat: "rencontres",  text: "Quelqu'un qui partage une histoire autour d'un feu ou sous les étoiles" },
  { cat: "rencontres",  text: "Quelqu'un allongé dans l'herbe, les yeux fermés, souriant au monde" },
  { cat: "rencontres",  text: "Quelqu'un en méditation profonde, immobile, au cœur du festival" },

  // ── Découvertes (13) ─────────────────────────────────────────────────────────
  { cat: "découvertes", text: "Une tenue entièrement fluorescente, brillant sous les UV de la nuit" },
  { cat: "découvertes", text: "Quelqu'un habillé en créature fantastique, tribale ou totalement mystérieuse" },
  { cat: "découvertes", text: "Une coiffure ou un chapeau absolument unique, jamais vu ailleurs" },
  { cat: "découvertes", text: "Un tatouage ou body painting qui couvre plus de la moitié du corps" },
  { cat: "découvertes", text: "Une couleur portée en vêtement que tu n'aurais jamais osée toi-même" },
  { cat: "découvertes", text: "Quelqu'un qui arbore une parure faite entièrement de matières naturelles" },
  { cat: "découvertes", text: "Une installation lumineuse ou sculpture que tu n'avais pas encore remarquée" },
  { cat: "découvertes", text: "Un totem ou décoration géante dominant le campement" },
  { cat: "découvertes", text: "Un motif ou texture qui ressemble vraiment à une fractale" },
  { cat: "découvertes", text: "Un instrument de musique posé seul, sans son propriétaire en vue" },
  { cat: "découvertes", text: "L'endroit précis où deux scènes créent une harmonie inattendue" },
  { cat: "découvertes", text: "Un objet lumineux artisanal, bioluminescent ou étrange que tu ne sais pas nommer" },
  { cat: "découvertes", text: "L'instant précis où tu te sens pleinement là — nulle part ailleurs au monde" },

  // ── Nature (7) ───────────────────────────────────────────────────────────────
  { cat: "nature",      text: "Un brasero, torche ou feu de camp allumé dans la nuit" },
  { cat: "nature",      text: "Un laser ou faisceau de lumière qui traverse l'obscurité comme une lame" },
  { cat: "nature",      text: "Le ciel étoilé visible depuis la piste de danse — sans bâtiment ni écran" },
  { cat: "nature",      text: "Un miroir naturel : flaque, lac ou surface qui reflète parfaitement le ciel" },
  { cat: "nature",      text: "Un animal sauvage : oiseau, insecte géant, renard, papillon, chat errant…" },
  { cat: "nature",      text: "Un lever ou coucher de soleil vu depuis la piste ou le campement" },
  { cat: "nature",      text: "Un espace de soin ou de silence au cœur du festival (massage, yoga, cercle)" },
];

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = { onBack: () => void };

export function TreasureScreen({ onBack }: Props) {
  const [found,        setFound]        = useState<Set<number>>(() => new Set());
  const [activeFilter, setActiveFilter] = useState<Filter>("tous");
  const [lastRevealed, setLastRevealed] = useState<number | null>(null);

  const totalAll     = SECRETS.length;
  const countAll     = found.size;
  const allDone      = countAll === totalAll;

  // Indices visibles selon le filtre actif (indices dans SECRETS global)
  const visibleIndices = SECRETS.reduce<number[]>((acc, s, i) => {
    if (activeFilter === "tous" || s.cat === activeFilter) acc.push(i);
    return acc;
  }, []);

  const countVisible  = visibleIndices.filter((i) => found.has(i)).length;
  const totalVisible  = visibleIndices.length;
  const pct           = totalAll > 0 ? countAll / totalAll : 0;

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
          40%  { transform: scale(1.035); box-shadow: 0 0 22px ${GOLD}55; }
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
        .treasure-reveal { animation: treasureReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .treasure-done   { animation: treasureDone   0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .treasure-shimmer {
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

      {/* ── Compteur + barre ── */}
      <div style={{
        flexShrink: 0,
        padding: "12px 16px 0",
        background: "rgba(0,0,0,0.20)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{
            fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em",
            color: countAll > 0 ? GOLD : "rgba(255,255,255,0.45)",
            textShadow: countAll > 0 ? `0 0 20px ${GOLD}70` : "none",
            transition: "color 0.35s ease, text-shadow 0.35s ease",
          }}>
            {countAll}
          </span>
          <span style={{ fontSize: 14, opacity: 0.38, fontWeight: 300 }}>/ {totalAll} secrets révélés</span>

          {/* Indicateur filtré */}
          {activeFilter !== "tous" && (
            <span style={{
              marginLeft: "auto",
              fontSize: 11,
              color: GOLD_DIM,
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}>
              {countVisible} / {totalVisible} visibles
            </span>
          )}
        </div>

        {/* Barre shimmer */}
        <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 14 }}>
          <div
            className={pct > 0 ? "treasure-shimmer" : ""}
            style={{
              height: "100%",
              width: `${pct * 100}%`,
              borderRadius: 999,
              transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: pct > 0 ? `0 0 10px ${GOLD}80` : "none",
            }}
          />
        </div>

        {/* ── Chips de filtre ── */}
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 12,
          scrollbarWidth: "none",
        }}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                title={f.hint}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  padding: "6px 13px",
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  letterSpacing: "0.02em",
                  background: active ? GOLD_GLOW : "rgba(255,255,255,0.06)",
                  border: `1px solid ${active ? GOLD_BORDER : "rgba(255,255,255,0.10)"}`,
                  color: active ? GOLD : "rgba(255,255,255,0.65)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  boxShadow: active ? `0 0 12px ${GOLD}30` : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Liste ── */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "10px 14px 60px" }}
      >
        {/* Hint du filtre actif */}
        {activeFilter !== "tous" && (
          <p style={{
            margin: "0 0 12px",
            fontSize: 11,
            opacity: 0.4,
            letterSpacing: "0.03em",
            fontStyle: "italic",
          }}>
            {FILTERS.find((f) => f.key === activeFilter)?.hint}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visibleIndices.map((i) => {
            const secret  = SECRETS[i];
            const isFound = found.has(i);
            const isNew   = lastRevealed === i;

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={isNew ? "treasure-reveal" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "12px 13px",
                  borderRadius: 14,
                  border: isFound ? `1px solid ${GOLD_BORDER}` : "1px solid rgba(255,255,255,0.09)",
                  background: isFound ? GOLD_GLOW : "rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  color: "white",
                  fontFamily: "inherit",
                  textAlign: "left",
                  width: "100%",
                  transition: "border 0.3s ease, background 0.3s ease",
                  boxShadow: isFound ? `0 2px 14px ${GOLD}20` : "none",
                }}
              >
                {/* Numéro global */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: isFound ? GOLD_DIM : "rgba(255,255,255,0.20)",
                  minWidth: 20,
                  flexShrink: 0,
                  transition: "color 0.3s ease",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icône état */}
                <span style={{
                  fontSize: 15,
                  flexShrink: 0,
                  lineHeight: 1,
                  filter: isFound ? `drop-shadow(0 0 4px ${GOLD})` : "grayscale(1) opacity(0.35)",
                  transition: "filter 0.3s ease",
                }}>
                  {isFound ? "✨" : "🔍"}
                </span>

                {/* Texte */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: isFound ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.50)",
                  transition: "color 0.3s ease",
                }}>
                  {secret.text}
                </span>

                {/* Cercle check */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: isFound ? `2px solid ${GOLD}` : "2px solid rgba(255,255,255,0.16)",
                  background: isFound ? GOLD : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  boxShadow: isFound ? `0 0 10px ${GOLD}70` : "none",
                }}>
                  {isFound && (
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 3.5L4 6.5L10 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset discret */}
        {countAll > 0 && (
          <button
            onClick={reset}
            style={{
              display: "block",
              margin: "24px auto 0",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.22)",
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
        }}>
          <div className="treasure-done" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            maxWidth: 340,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 72, lineHeight: 1, filter: `drop-shadow(0 0 32px ${GOLD})` }}>🗝️</div>

            <div>
              <div style={{
                fontSize: 24, fontWeight: 800,
                color: GOLD,
                textShadow: `0 0 30px ${GOLD}80`,
                marginBottom: 10,
              }}>
                Tous les secrets révélés
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.6)" }}>
                Tu as traversé le festival avec tes yeux grands ouverts.<br />
                Ozora te garde dans ses mémoires.
              </p>
            </div>

            <div className="treasure-shimmer" style={{
              width: 80, height: 2, borderRadius: 999,
              boxShadow: `0 0 12px ${GOLD}80`,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              <button onClick={reset} style={{
                padding: "15px", borderRadius: 999,
                background: GOLD, border: "none",
                color: "#000", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 24px ${GOLD}55`,
              }}>
                Recommencer
              </button>
              <button onClick={onBack} style={{
                padding: "15px", borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.72)", fontSize: 15,
                cursor: "pointer", fontFamily: "inherit",
              }}>
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
