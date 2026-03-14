import { useState } from "react";
import type { Draft } from "../app/flow/types";
import { SCENES, artistsByScene } from "../app/data/timetable";
import { ARTISTS } from "../app/data/artists";
import { softHaptic } from "../app/flow/haptics";

// ── Couleur d'accent par scène ────────────────────────────────────────────────
const SCENE_COLORS: Record<string, string> = {
  "Main Stage":     "#FFD60A",
  "Dragon Nest":    "#FF6B35",
  "Chill Out Dome": "#5E5CE6",
  "Pumpui":         "#34C759",
  "Cooking Groove": "#FF9500",
  "Ambyss":         "#00C7BE",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  draft: Draft;
  onChangeDraft: (patch: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
};

// ── Composant ─────────────────────────────────────────────────────────────────
export function ScenePickerScreen({ draft, onChangeDraft, onNext, onBack }: Props) {
  const [phase, setPhase]               = useState<"scene" | "artist">("scene");
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [query, setQuery]               = useState("");

  // ── Navigation interne ──────────────────────────────────────────────────────
  function goToArtist(sceneName: string) {
    softHaptic();
    setSelectedScene(sceneName);
    onChangeDraft({ stageName: sceneName, artistName: "", style: "", ephemeral: false });
    setQuery("");
    setPhase("artist");
  }

  function goBackToScene() {
    setPhase("scene");
    setQuery("");
    onChangeDraft({ artistName: "", stageName: "", style: "", ephemeral: false });
  }

  function handleEphemeral() {
    softHaptic();
    onChangeDraft({ artistName: "", stageName: "Éphémère", style: "", ephemeral: true });
    onNext();
  }

  function handleArtistTap(artistName: string, style: string) {
    softHaptic();
    onChangeDraft({ artistName, style });
  }

  function handleValidate() {
    if (!draft.artistName.trim()) return;
    onNext();
  }

  // ── Listes d'artistes ───────────────────────────────────────────────────────
  const sceneArtists  = artistsByScene(selectedScene);
  const hasSceneData  = sceneArtists.length > 0;

  // Avec timetable → filtrage sur sceneArtists
  const filteredTimetable = hasSceneData
    ? (query
        ? sceneArtists.filter((a) => a.artistName.toLowerCase().includes(query.toLowerCase()))
        : sceneArtists)
    : [];

  // Sans timetable → fallback sur la liste générale (saisie libre)
  const filteredFallback = !hasSceneData && query.length > 1
    ? ARTISTS.filter((a) => a.toLowerCase().includes(query.toLowerCase())).slice(0, 15)
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  const sceneEmoji = [...SCENES].find((s) => s.key === selectedScene)?.emoji ?? "";

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
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            {phase === "scene" ? "Où étais-tu ? 🎪" : `${selectedScene} ${sceneEmoji}`}
          </div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
            {phase === "scene" ? "Choisis ta scène" : "Quel artiste ?"}
          </div>
        </div>
        <button
          onClick={phase === "scene" ? onBack : goBackToScene}
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
          {phase === "scene" ? "← Retour" : "← Scène"}
        </button>
      </div>

      {/* ── Body scrollable ── */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >

        {/* ── Phase 1 : choix de la scène ── */}
        {phase === "scene" && (
          <>
            {([...SCENES] as Array<{ key: string; emoji: string }>).map(({ key, emoji }) => {
              const color = SCENE_COLORS[key] ?? "#ffffff";
              return (
                <button
                  key={key}
                  onClick={() => goToArtist(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    borderRadius: 20,
                    padding: "18px 20px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${color}40`,
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                    transition: "background 0.12s",
                  }}
                >
                  <span style={{
                    fontSize: 26,
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {emoji}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{key}</span>
                </button>
              );
            })}

            {/* Moment éphémère */}
            <button
              onClick={handleEphemeral}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderRadius: 20,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(191,90,242,0.35)",
                color: "white",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                width: "100%",
                marginTop: 6,
              }}
            >
              <span style={{
                fontSize: 26,
                width: 44, height: 44,
                borderRadius: 12,
                background: "rgba(191,90,242,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                ✨
              </span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>Moment éphémère</div>
                <div style={{ fontSize: 12, opacity: 0.50, marginTop: 2 }}>
                  Hors des scènes · Souvenir libre
                </div>
              </div>
            </button>
          </>
        )}

        {/* ── Phase 2 : choix de l'artiste ── */}
        {phase === "artist" && (
          <>
            {/* Champ recherche / saisie libre */}
            <input
              type="text"
              placeholder={hasSceneData ? "Rechercher un artiste…" : "Nom de l'artiste…"}
              value={hasSceneData ? query : (draft.artistName || query)}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!hasSceneData) {
                  onChangeDraft({ artistName: e.target.value, style: "" });
                }
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "14px 16px",
                color: "white",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 15,
              }}
            />

            {/* Artistes de la timetable */}
            {hasSceneData && filteredTimetable.map((entry) => {
              const selected = draft.artistName === entry.artistName;
              return (
                <button
                  key={entry.artistName}
                  onClick={() => handleArtistTap(entry.artistName, entry.style)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    padding: "14px 16px",
                    background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: selected
                      ? "1px solid rgba(255,255,255,0.28)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: selected ? 600 : 400 }}>
                      {entry.artistName}
                    </div>
                    {entry.style && (
                      <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
                        {entry.style}
                      </div>
                    )}
                  </div>
                  {selected && <span style={{ fontSize: 16, opacity: 0.70 }}>✓</span>}
                </button>
              );
            })}

            {/* Fallback ARTISTS (pas de timetable) */}
            {!hasSceneData && filteredFallback.map((name) => {
              const selected = draft.artistName === name;
              return (
                <button
                  key={name}
                  onClick={() => handleArtistTap(name, "")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 14,
                    padding: "12px 16px",
                    background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: selected
                      ? "1px solid rgba(255,255,255,0.28)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                    fontSize: 15,
                  }}
                >
                  {name}
                </button>
              );
            })}

            {/* Placeholder si timetable vide et pas de saisie */}
            {!hasSceneData && !query && (
              <div style={{
                textAlign: "center",
                opacity: 0.35,
                fontSize: 13,
                padding: "24px 0",
                fontStyle: "italic",
              }}>
                Tape le nom de l'artiste pour continuer
              </div>
            )}

            {/* Bouton de validation */}
            <div style={{ marginTop: 8 }}>
              <button
                onClick={handleValidate}
                disabled={!draft.artistName.trim()}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  padding: "16px 20px",
                  border: "none",
                  background: draft.artistName.trim()
                    ? "rgba(255,255,255,0.90)"
                    : "rgba(255,255,255,0.12)",
                  color: draft.artistName.trim()
                    ? "rgba(0,0,0,0.85)"
                    : "rgba(255,255,255,0.35)",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: draft.artistName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                }}
              >
                Je valide 🖖
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
