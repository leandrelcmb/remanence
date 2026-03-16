import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

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
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DiversCard = { id: string; text: string; detail?: string; category: string };
type Mode = "tirage" | "parcourir";

// ── Catégories ────────────────────────────────────────────────────────────────

const CATS: Record<string, { emoji: string; label: string }> = {
  camping:      { emoji: "🎲", label: "Camping"      },
  rencontres:   { emoji: "🌍", label: "Rencontres"   },
  exploration:  { emoji: "🔍", label: "Exploration"  },
  connexion:    { emoji: "💛", label: "Connexion"    },
  absurde:      { emoji: "🎭", label: "Absurde"      },
  conversation: { emoji: "🧠", label: "Conversation" },
  sensoriels:   { emoji: "🌌", label: "Sensoriels"   },
  calme:        { emoji: "🌿", label: "Calme"        },
  defis:        { emoji: "🎯", label: "Défis"        },
};


// ── CSS animations ─────────────────────────────────────────────────────────────

const CSS = `
@keyframes diversFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes diversListFade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}
`;

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = { onBack: () => void; haloColor?: string };

// ── Composant ──────────────────────────────────────────────────────────────────

export function DiversScreen({ onBack, haloColor = "#00FFB7" }: Props) {
  const { t, i18n } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DIVERS_CARDS = useMemo(() => t('divers.cards', { returnObjects: true }) as DiversCard[], [i18n.language]);

  // ── Halo colors ───────────────────────────────────────────────────────────
  const [r, g, b]   = parseColor(haloColor);
  const haloMain    = toHex(r, g, b);
  const haloLight   = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloGlow    = `rgba(${r},${g},${b},0.40)`;
  const haloGlowSft = `rgba(${r},${g},${b},0.22)`;

  // ── Favoris (localStorage) ────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem("remanence_divers_fav") ?? "[]"));
    } catch { return new Set(); }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem("remanence_divers_fav", JSON.stringify([...next])); } catch { /* ok */ }
      return next;
    });
  }, []);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("tirage");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  function toggleCategory(key: string) {
    setActiveCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  // ── Deck filtré ───────────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    let cards = DIVERS_CARDS;
    if (activeCategories.length > 0)
      cards = cards.filter(c => activeCategories.includes(c.category));
    if (favoritesOnly)
      cards = cards.filter(c => favorites.has(c.id));
    return cards;
  }, [DIVERS_CARDS, activeCategories, favoritesOnly, favorites]);

  // ── Deck mélangé (Tirage) ─────────────────────────────────────────────────
  const [shuffledDeck, setShuffledDeck] = useState<DiversCard[]>(() => shuffle([...DIVERS_CARDS]));
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Re-shuffle quand les filtres changent
  useEffect(() => {
    setShuffledDeck(shuffle([...filteredCards]));
    setIndex(0);
    setAnimKey(k => k + 1);
  }, [filteredCards]);

  const card = shuffledDeck[index % Math.max(1, shuffledDeck.length)];
  const isFav = card ? favorites.has(card.id) : false;

  function handleNext() {
    setIndex(i => (i + 1) % Math.max(1, shuffledDeck.length));
    setAnimKey(k => k + 1);
  }

  // ── Mode Parcourir : carte sélectionnée ───────────────────────────────────
  const [selectedCard, setSelectedCard] = useState<DiversCard | null>(null);

  // ── Render ────────────────────────────────────────────────────────────────
  const catKeys = Object.keys(CATS);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>{t('divers.title')}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
            {t('divers.cardCount', { count: filteredCards.length })} · {activeCategories.length > 0 ? t('divers.filtered') : t('divers.allCats')}
          </div>
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
          {t('divers.home')}
        </button>
      </div>

      {/* ── Mode switch ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        gap: 6,
        padding: "10px 16px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {(["tirage", "parcourir"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              background: mode === m ? "rgba(255,255,255,0.12)" : "transparent",
              border: `1px solid ${mode === m ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}`,
              color: mode === m ? "white" : "rgba(255,255,255,0.50)",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
          >
            {m === "tirage" ? t('divers.modeDraw') : t('divers.modeBrowse')}
          </button>
        ))}
      </div>

      {/* ── Filtres catégories ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        gap: 7,
        padding: "8px 16px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {catKeys.map(key => {
          const cat = CATS[key];
          const active = activeCategories.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              style={{
                flexShrink: 0,
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 12,
                background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.09)"}`,
                color: active ? "white" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {cat.emoji} {t('divers.cats.' + key)}
            </button>
          );
        })}
        {favorites.size > 0 && (
          <button
            onClick={() => setFavoritesOnly(f => !f)}
            style={{
              flexShrink: 0,
              borderRadius: 999,
              padding: "5px 11px",
              fontSize: 12,
              background: favoritesOnly ? `rgba(${r},${g},${b},0.18)` : "rgba(255,255,255,0.05)",
              border: `1px solid ${favoritesOnly ? `rgba(${r},${g},${b},0.45)` : "rgba(255,255,255,0.09)"}`,
              color: favoritesOnly ? haloMain : "rgba(255,255,255,0.55)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: favoritesOnly ? 600 : 400,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {t('divers.favoritesCount', { count: favorites.size })}
          </button>
        )}
      </div>

      {/* ── Corps selon mode ── */}
      {mode === "tirage" ? (
        /* ── MODE TIRAGE ── */
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "16px",
          gap: 16,
          overflow: "hidden",
        }}>
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.5, padding: 20 }}>
              {t('divers.noCards')}
              {favoritesOnly && favorites.size === 0 && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {t('divers.noFavs')}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Carte */}
              <div
                key={animKey}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 24,
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  animation: "diversFadeIn 0.30s cubic-bezier(0.22,1,0.36,1) both",
                  minHeight: 160,
                  justifyContent: "center",
                }}
              >
                {/* Badge catégorie + compteur */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{
                    fontSize: 12,
                    opacity: 0.55,
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}>
                    {card && CATS[card.category]
                      ? `${CATS[card.category].emoji} ${t('divers.cats.' + card.category).toUpperCase()}`
                      : ""}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.40 }}>
                    {(index % shuffledDeck.length) + 1} / {shuffledDeck.length}
                  </span>
                </div>

                {/* Texte principal */}
                <div style={{
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  letterSpacing: "0.01em",
                }}>
                  {card?.text ?? ""}
                </div>

                {/* Détail optionnel */}
                {card?.detail && (
                  <div style={{
                    fontSize: 14,
                    opacity: 0.60,
                    lineHeight: 1.5,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 12,
                  }}>
                    {card.detail}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div style={{ display: "flex", gap: 10 }}>
                {/* Coup de cœur */}
                <button
                  onClick={() => card && toggleFavorite(card.id)}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    padding: "16px 12px",
                    border: isFav ? "none" : "1px solid rgba(255,255,255,0.14)",
                    background: isFav
                      ? `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isFav ? `0 0 16px ${haloGlow}, 0 4px 16px ${haloGlowSft}` : "none",
                    color: isFav ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.70)",
                    fontSize: 15,
                    fontWeight: isFav ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.02em",
                    transition: "all 0.18s ease",
                  }}
                >
                  {isFav ? t('divers.favorite') : t('divers.notFavorite')}
                </button>

                {/* Suivante */}
                <button
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    padding: "16px 12px",
                    border: "none",
                    background: `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`,
                    boxShadow: `0 0 18px ${haloGlow}, 0 4px 20px ${haloGlowSft}`,
                    color: "rgba(0,0,0,0.85)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.03em",
                  }}
                >
                  {t('divers.next')}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── MODE PARCOURIR ── */
        <div style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          animation: "diversListFade 0.25s ease both",
        }}>
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.5, padding: 32 }}>
              {t('divers.noCards')}
            </div>
          ) : (
            filteredCards.map(c => {
              const cat = CATS[c.category];
              const fav = favorites.has(c.id);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedCard(c)}
                >
                  {/* Emoji catégorie */}
                  <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.80 }}>
                    {cat?.emoji ?? "🎲"}
                  </span>

                  {/* Texte */}
                  <div style={{
                    flex: 1,
                    fontSize: 14,
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {c.text}
                  </div>

                  {/* Bouton favori */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(c.id); }}
                    style={{
                      flexShrink: 0,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: "4px",
                      lineHeight: 1,
                    }}
                  >
                    {fav ? "❤️" : "🤍"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modal carte (mode Parcourir) ── */}
      {selectedCard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(18,12,40,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              animation: "diversFadeIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {/* Badge catégorie */}
            <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.06em", fontWeight: 500 }}>
              {CATS[selectedCard.category]?.emoji} {t('divers.cats.' + selectedCard.category).toUpperCase()}
            </div>

            {/* Texte */}
            <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.35 }}>
              {selectedCard.text}
            </div>

            {/* Détail */}
            {selectedCard.detail && (
              <div style={{
                fontSize: 14,
                opacity: 0.62,
                lineHeight: 1.5,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 12,
              }}>
                {selectedCard.detail}
              </div>
            )}

            {/* Boutons */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => toggleFavorite(selectedCard.id)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "14px 12px",
                  border: favorites.has(selectedCard.id) ? "none" : "1px solid rgba(255,255,255,0.14)",
                  background: favorites.has(selectedCard.id)
                    ? `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`
                    : "rgba(255,255,255,0.06)",
                  boxShadow: favorites.has(selectedCard.id)
                    ? `0 0 16px ${haloGlow}, 0 4px 16px ${haloGlowSft}`
                    : "none",
                  color: favorites.has(selectedCard.id) ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.70)",
                  fontSize: 14,
                  fontWeight: favorites.has(selectedCard.id) ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {favorites.has(selectedCard.id) ? t('divers.favorite') : t('divers.notFavorite')}
              </button>

              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "14px 12px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.80)",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
