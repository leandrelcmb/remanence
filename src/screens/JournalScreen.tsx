import { useState, useMemo, type ReactNode } from "react";
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import { formatTime, focusEmoji } from "./utils";

// ── Types ────────────────────────────────────────────────────────────────────

type Props = {
  journal: JournalItem[];
  latestJournalColor: string;
  userName: string;
  onNewEntry: () => void;
  onSelectItem: (item: JournalItem) => void;
  onHome: () => void;
};

// ── Filtres ───────────────────────────────────────────────────────────────────

const FOCUS_OPTIONS = [
  { key: "mental",  emoji: "🧠", label: "Mental"   },
  { key: "emotion", emoji: "💭", label: "Émotions" },
  { key: "body",    emoji: "🫀", label: "Corps"    },
];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "5px 12px",
        fontSize: 12,
        background: active ? "rgba(160,120,255,0.28)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(160,120,255,0.55)" : "rgba(255,255,255,0.1)"}`,
        color: "white",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

// ── Carte d'un souvenir ───────────────────────────────────────────────────────

function JournalCard({ item, onClick }: { item: JournalItem; onClick: () => void }) {
  const itemColor = energyTint(item.colorHex, item.energy);

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 18,
        padding: 16,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "grid",
        gap: 15,
        cursor: "pointer",
        margin: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 20 }}>{item.artistName}</strong>
          <div style={{ opacity: 0.65, fontSize: 15 }}>
            {formatTime(item.startTime)} · {item.stageName || "Scène inconnue"}
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            padding: "5px 8px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {focusEmoji(item.focus)} ⚡ {item.energy}/10
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: itemColor,
            boxShadow: `0 0 18px ${itemColor}88`,
            flexShrink: 0,
          }}
        />
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          {item.style?.trim() ? item.style : "Style non renseigné"}
        </div>
      </div>

      {item.feelingText?.trim() && (
        <div
          style={{
            opacity: 0.88,
            lineHeight: 1.45,
            fontSize: 14,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          "{item.feelingText.trim()}"
        </div>
      )}

      {item.learningText?.trim() && (
        <div style={{ opacity: 0.62, fontSize: 15, lineHeight: 1.4 }}>
          🧙🏼 {item.learningText.trim()}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function JournalScreen({
  journal,
  latestJournalColor,
  userName,
  onNewEntry,
  onSelectItem,
  onHome,
}: Props) {
  const [activeFocus, setActiveFocus] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string[]>([]);

  function toggleFocus(key: string) {
    setActiveFocus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleStage(name: string) {
    setActiveStage((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // Scènes disponibles dans le journal courant
  const stages = useMemo(
    () => [...new Set(journal.map((i) => i.stageName).filter(Boolean))],
    [journal]
  );

  // Journal filtré
  const filtered = useMemo(() => {
    return journal.filter((item) => {
      const okFocus = activeFocus.length === 0 || activeFocus.includes(item.focus);
      const okStage = activeStage.length === 0 || activeStage.includes(item.stageName);
      return okFocus && okStage;
    });
  }, [journal, activeFocus, activeStage]);

  const isFiltered = activeFocus.length > 0 || activeStage.length > 0;

  return (
    <>
      {/* Overlay coloré lié au dernier set */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: latestJournalColor,
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: 16,
          minHeight: "100dvh",
          paddingBottom: 40,
        }}
      >
        {/* ── En-tête ── */}
        <div style={{ padding: "40px 20px 0", display: "grid", gap: 20 }}>
          <h2 style={{ margin: 0, fontWeight: 650, fontSize: 20 }}>
            📓 Carnet de Rémanence{userName ? ` de ${userName}` : ""}
          </h2>

          <div style={{ display: "grid", gap: 12 }}>
            <RoundButton variant="primary" onClick={onNewEntry}>
              Nouvelle vibration 💓
            </RoundButton>
            <RoundButton variant="secondary" onClick={onHome}>
              Home ॐ
            </RoundButton>
          </div>
        </div>

        {/* ── Filtres ── */}
        {journal.length > 0 && (
          <div style={{ padding: "0 20px", display: "grid", gap: 8 }}>
            {/* Focus */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FOCUS_OPTIONS.map((f) => (
                <FilterChip
                  key={f.key}
                  active={activeFocus.includes(f.key)}
                  onClick={() => toggleFocus(f.key)}
                >
                  {f.emoji} {f.label}
                </FilterChip>
              ))}
            </div>

            {/* Scènes (uniquement si plusieurs) */}
            {stages.length > 1 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {stages.map((s) => (
                  <FilterChip
                    key={s}
                    active={activeStage.includes(s)}
                    onClick={() => toggleStage(s)}
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            )}

            {/* Compteur quand filtré */}
            {isFiltered && (
              <div style={{ fontSize: 12, opacity: 0.5, paddingLeft: 2 }}>
                {filtered.length} souvenir{filtered.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* ── Liste des souvenirs ── */}
        {journal.length === 0 && (
          <p style={{ opacity: 0.6, padding: "0 20px" }}>
            Aucun souvenir enregistré pour le moment.
          </p>
        )}

        {filtered.length === 0 && journal.length > 0 && (
          <p style={{ opacity: 0.5, fontSize: 14, padding: "0 20px" }}>
            Aucun souvenir ne correspond aux filtres sélectionnés.
          </p>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((item) => (
            <JournalCard
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
