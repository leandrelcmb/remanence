import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ChasseType } from "../core/models/chasseTypes";
import type { ChasseHistoryEntry } from "../core/models/chasseTypes";
import { listChasseHistory, deleteChasseHistory } from "../core/store/repo";
import { CHASSE_TITLES } from "./ChasseScreen";

type Props = {
  onBack: () => void;
  onChasse: (type: ChasseType) => void;
  onIntrospection: () => void;
  onTreasure: () => void;
  onTheories: () => void;
  onAnecdotes: () => void;
  onDivers: () => void;
  onComingSoon: () => void;
};

type GameCard = {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  active: true;
  chasseType: ChasseType;
} | {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  active: "introspection" | "treasure" | "theories" | "anecdotes" | "divers";
} | {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  active: false;
};

const GAMES: GameCard[] = [
  { id: "tableau",       emoji: "📸", title: "Tableau du festival", sub: "Chromatique · Formes · Créatures",                   active: true,            chasseType: "chromatic"   },
  { id: "treasure",     emoji: "🗺️", title: "Chasse au Trésor",   sub: "30 secrets à révéler dans le festival",              active: "treasure"                                 },
  { id: "theories",     emoji: "🃏", title: "Théories Absurdes",   sub: "60 cartes absurdes — gratte pour révéler",           active: "theories"                                 },
  { id: "introspection",emoji: "💭", title: "Introspection",       sub: "Des questions douces pour célébrer notre existence", active: "introspection"                            },
  { id: "anecdotes",    emoji: "🎪", title: "Anecdotes",           sub: "150 cartes · Vrai ou Faux festival",                 active: "anecdotes"                                },
  { id: "divers",       emoji: "🎲", title: "Divers",              sub: "~150 cartes · Camping, Rencontres, Défis…",          active: "divers"                                   },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function GamesScreen({ onBack, onChasse, onIntrospection, onTreasure, onTheories, onAnecdotes, onDivers, onComingSoon }: Props) {
  const [history, setHistory] = useState<ChasseHistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ChasseHistoryEntry | null>(null);

  useEffect(() => {
    listChasseHistory().then(setHistory);
  }, []);

  async function handleDeleteEntry(id: string) {
    await deleteChasseHistory(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntry(null);
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>Jeux 🎮</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>Explore le festival autrement</div>
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
        >
          Home ॐ
        </button>
      </div>

      {/* ── Corps scrollable ── */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px 60px",
      }}>

        {/* Grille 2 colonnes */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}>
          {GAMES.map((game) => {
            const handleClick =
              game.active === true            ? () => onChasse(game.chasseType) :
              game.active === "introspection" ? onIntrospection :
              game.active === "treasure"      ? onTreasure :
              game.active === "theories"      ? onTheories :
              game.active === "anecdotes"     ? onAnecdotes :
              game.active === "divers"        ? onDivers :
              onComingSoon;

            return (
              <button
                key={game.id}
                onClick={handleClick}
                style={{
                  aspectRatio: "1",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: 16,
                  cursor: "pointer",
                  opacity: game.active !== false ? 1 : 0.45,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: "white",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 32, lineHeight: 1 }}>{game.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
                    {game.title}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
                    {game.sub}
                  </div>
                </div>

                {game.active === false && (
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 10,
                    opacity: 0.8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}>
                    BIENTÔT
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Historique ── */}
        {history.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontSize: 11,
              opacity: 0.45,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Tes chasses 📖
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    textAlign: "left",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                >
                  {/* Pastille couleur */}
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    background: entry.result.color,
                    boxShadow: `0 2px 10px ${entry.result.color}60`,
                    flexShrink: 0,
                  }} />

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {entry.result.icon} {entry.result.label}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                      {CHASSE_TITLES[entry.chasseType]} · {entry.photos.length} photos · {formatDate(entry.savedAt)}
                    </div>
                  </div>

                  {/* Miniature 1ère photo */}
                  {entry.photos[0] && (
                    <img
                      src={entry.photos[0]}
                      alt=""
                      style={{
                        width: 44, height: 44,
                        borderRadius: 8,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Modal détail session ── */}
      {selectedEntry && createPortal(
        <div
          onClick={() => setSelectedEntry(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.80)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "auto",
              background: "#111",
              borderRadius: "20px 20px 0 0",
              padding: "20px 16px 44px",
              maxHeight: "88dvh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            className="no-scrollbar"
          >
            {/* Header modal */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: selectedEntry.result.color,
                boxShadow: `0 3px 14px ${selectedEntry.result.color}60`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {selectedEntry.result.icon} {selectedEntry.result.label}
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
                  {selectedEntry.photos.length} photos · {formatDate(selectedEntry.savedAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                style={{
                  width: 32, height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.10)",
                  border: "none",
                  color: "white",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  padding: 0,
                }}
              >×</button>
            </div>

            {/* Grille 3 colonnes */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}>
              {selectedEntry.photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ))}
            </div>

            {/* Bouton supprimer */}
            <button
              onClick={() => handleDeleteEntry(selectedEntry.id)}
              style={{
                borderRadius: 999,
                padding: "13px",
                background: "rgba(255,59,48,0.12)",
                border: "1px solid rgba(255,59,48,0.25)",
                color: "#FF3B30",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                marginTop: 4,
              }}
            >
              Supprimer cette chasse
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
