import { useState, useMemo } from "react";
import { SCENES, TIMETABLE } from "../app/data/timetable";
import type { TimetableEntry } from "../app/data/timetable";

// ── Couleurs par scène ────────────────────────────────────────────────────────
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
  onBack: () => void;
};

// ── Sous-composants ───────────────────────────────────────────────────────────

function ArtistCard({ entry }: { entry: TimetableEntry }) {
  const color = SCENE_COLORS[entry.scene] ?? "#ffffff";
  const sceneInfo = [...SCENES].find((s) => s.key === entry.scene);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 8,
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Dot couleur scène */}
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 7px ${color}99`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{entry.artistName}</div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 4,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {entry.style && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 999,
                background: `${color}1A`,
                color,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {entry.style}
            </span>
          )}
          {sceneInfo && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>
              {sceneInfo.emoji} {entry.scene}
            </span>
          )}
          {entry.day && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>{entry.day}</span>
          )}
          {entry.startTime && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>
              {entry.startTime}
              {entry.endTime ? ` – ${entry.endTime}` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SceneSection({
  sceneKey,
  emoji,
  entries,
}: {
  sceneKey: string;
  emoji: string;
  entries: TimetableEntry[];
}) {
  const color = SCENE_COLORS[sceneKey] ?? "#ffffff";
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color,
          }}
        >
          {sceneKey}
        </span>
        <span style={{ fontSize: 11, opacity: 0.35 }}>
          {entries.length} artiste{entries.length > 1 ? "s" : ""}
        </span>
      </div>
      {entries.map((entry) => (
        <ArtistCard
          key={`${entry.artistName}-${entry.scene}`}
          entry={entry}
        />
      ))}
    </div>
  );
}

function EmptyState({
  scenes,
}: {
  scenes: ReadonlyArray<{ readonly key: string; readonly emoji: string }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          opacity: 0.40,
          margin: "8px 0 18px",
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        La programmation complète arrive bientôt ✨
      </p>

      {scenes.map(({ key, emoji }) => {
        const color = SCENE_COLORS[key] ?? "#ffffff";
        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}28`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 11, opacity: 0.38, marginTop: 2 }}>
                Artistes à venir…
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export function ProgrammationScreen({ onBack }: Props) {
  const [activeScene, setActiveScene] = useState<string>("");

  const scenes = [...SCENES] as Array<{ key: string; emoji: string }>;
  const hasData = TIMETABLE.length > 0;

  // Artistes filtrés selon la scène sélectionnée
  const filteredArtists = useMemo((): TimetableEntry[] => {
    if (!activeScene) return TIMETABLE;
    return TIMETABLE.filter((e) => e.scene === activeScene);
  }, [activeScene]);

  // Map scène → artistes (pour la vue "Toutes")
  const byScene = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    for (const entry of TIMETABLE) {
      if (!map[entry.scene]) map[entry.scene] = [];
      map[entry.scene].push(entry);
    }
    return map;
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header fixe ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            Programmation 🎵
          </div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
            {hasData
              ? `${TIMETABLE.length} artiste${TIMETABLE.length > 1 ? "s" : ""} · ${scenes.length} scènes`
              : "Timetable complète à venir"}
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
          ← Retour
        </button>
      </div>

      {/* ── Filtres scène (pills) ── */}
      <div
        className="no-scrollbar"
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Pill "Toutes" */}
        <button
          onClick={() => setActiveScene("")}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 999,
            background: !activeScene
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.05)",
            border: !activeScene
              ? "1px solid rgba(255,255,255,0.30)"
              : "1px solid rgba(255,255,255,0.10)",
            color: "white",
            fontSize: 12,
            fontWeight: !activeScene ? 600 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ✦ Toutes
        </button>

        {/* Pills par scène */}
        {scenes.map(({ key, emoji }) => {
          const color = SCENE_COLORS[key] ?? "#ffffff";
          const active = activeScene === key;
          return (
            <button
              key={key}
              onClick={() => setActiveScene(active ? "" : key)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 999,
                background: active
                  ? `${color}20`
                  : "rgba(255,255,255,0.05)",
                border: active
                  ? `1px solid ${color}55`
                  : "1px solid rgba(255,255,255,0.10)",
                color: active ? color : "rgba(255,255,255,0.65)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {emoji} {key}
            </button>
          );
        })}
      </div>

      {/* ── Body scrollable ── */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 40px",
        }}
      >
        {/* ── État vide : timetable pas encore remplie ── */}
        {!hasData && <EmptyState scenes={scenes} />}

        {/* ── Timetable disponible, scène filtrée, aucun résultat ── */}
        {hasData && filteredArtists.length === 0 && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.40,
              padding: "40px 0",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Aucun artiste pour cette scène
          </div>
        )}

        {/* ── Scène sélectionnée → liste plate ── */}
        {hasData && activeScene && filteredArtists.length > 0 &&
          filteredArtists.map((entry) => (
            <ArtistCard
              key={`${entry.artistName}-${entry.scene}`}
              entry={entry}
            />
          ))
        }

        {/* ── Vue "Toutes" → groupé par scène ── */}
        {hasData && !activeScene && filteredArtists.length > 0 &&
          scenes
            .filter(({ key }) => byScene[key]?.length > 0)
            .map(({ key, emoji }) => (
              <SceneSection
                key={key}
                sceneKey={key}
                emoji={emoji}
                entries={byScene[key]}
              />
            ))
        }
      </div>
    </div>
  );
}
