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
  onSavePseudo: (name: string) => void;
};

// ── Filtres ───────────────────────────────────────────────────────────────────

const FOCUS_OPTIONS = [
  { key: "mental",  emoji: "🧠", label: "Mental"   },
  { key: "emotion", emoji: "❤️", label: "Émotions" },
  { key: "body",    emoji: "🕺", label: "Corps"    },
];

const FOCUS_EMOJIS: Record<string, string> = {
  mental: "🧠",
  emotion: "❤️",
  body: "🕺",
};

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
        padding: "4px 10px",
        fontSize: 12,
        lineHeight: 1,
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

// ── Mini-stats ────────────────────────────────────────────────────────────────

function MiniStats({ journal }: { journal: JournalItem[] }) {
  if (journal.length === 0) return null;

  const count = journal.length;
  const avgEnergy = (journal.reduce((s, i) => s + i.energy, 0) / count).toFixed(1);

  const stageCounts: Record<string, number> = {};
  journal.forEach((i) => {
    if (i.stageName) stageCounts[i.stageName] = (stageCounts[i.stageName] || 0) + 1;
  });
  const favStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const focusCounts: Record<string, number> = {};
  journal.forEach((i) => {
    if (i.focus) focusCounts[i.focus] = (focusCounts[i.focus] || 0) + 1;
  });
  const domFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const stats = [
    { value: `${count}`,        label: count === 1 ? "set" : "sets" },
    { value: `${avgEnergy}/10`, label: "énergie moy." },
    ...(favStage ? [{ value: favStage, label: "scène fav." }] : []),
    ...(domFocus ? [{ value: `${FOCUS_EMOJIS[domFocus] ?? ""} ${domFocus}`, label: "focus" }] : []),
  ];

  return (
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        background: "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {stats.map(({ value, label }) => (
        <div key={label} style={{ display: "grid", gap: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
          <div
            style={{
              fontSize: 10,
              opacity: 0.4,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
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
        margin: "0 12px",
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
  onSavePseudo,
}: Props) {
  const [activeFocus, setActiveFocus] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string[]>([]);
  const [editingPseudo, setEditingPseudo] = useState(false);
  const [pseudoDraft, setPseudoDraft] = useState(userName);

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

  function handleSavePseudo() {
    const trimmed = pseudoDraft.trim();
    if (trimmed) onSavePseudo(trimmed);
    setEditingPseudo(false);
  }

  const stages = useMemo(
    () => [...new Set(journal.map((i) => i.stageName).filter(Boolean))],
    [journal]
  );

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
          gap: 0,
          minHeight: "100dvh",
          paddingBottom: 40,
        }}
      >
        {/* ── En-tête ── */}
        <div style={{ padding: "40px 12px 20px", display: "grid", gap: 20 }}>
          {/* Titre avec édition du pseudo */}
          {editingPseudo ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={pseudoDraft}
                onChange={(e) => setPseudoDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSavePseudo(); if (e.key === "Escape") setEditingPseudo(false); }}
                maxLength={32}
                autoFocus
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(160,120,255,0.5)",
                  borderRadius: 10,
                  padding: "6px 12px",
                  color: "white",
                  fontSize: 16,
                  fontFamily: "inherit",
                  outline: "none",
                  flex: 1,
                }}
              />
              <button
                onClick={handleSavePseudo}
                style={{ background: "rgba(160,120,255,0.3)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "inherit" }}
              >
                ✓
              </button>
              <button
                onClick={() => setEditingPseudo(false)}
                style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "6px 10px", color: "white", cursor: "pointer", fontFamily: "inherit" }}
              >
                ✗
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ margin: 0, fontWeight: 650, fontSize: 20, flex: 1 }}>
                📓 Carnet de Rémanence{userName ? ` de ${userName}` : ""}
              </h2>
              <button
                onClick={() => { setPseudoDraft(userName); setEditingPseudo(true); }}
                title="Modifier le pseudo"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: 0.4,
                  fontSize: 16,
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ✏️
              </button>
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            <RoundButton variant="primary" onClick={onNewEntry}>
              Nouvelle vibration 💓
            </RoundButton>
            <RoundButton variant="secondary" onClick={onHome}>
              Home ॐ
            </RoundButton>
          </div>
        </div>

        {/* ── Mini-stats ── */}
        <MiniStats journal={journal} />

        {/* ── Filtres ── */}
        {journal.length > 0 && (
          <div style={{ padding: "16px 12px", display: "grid", gap: 8 }}>
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

            {isFiltered && (
              <div style={{ fontSize: 12, opacity: 0.5, paddingLeft: 2 }}>
                {filtered.length} souvenir{filtered.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* ── Liste des souvenirs ── */}
        {journal.length === 0 && (
          <p style={{ opacity: 0.6, padding: "0 12px" }}>
            Aucun souvenir enregistré pour le moment.
          </p>
        )}

        {filtered.length === 0 && journal.length > 0 && (
          <p style={{ opacity: 0.5, fontSize: 14, padding: "0 12px" }}>
            Aucun souvenir ne correspond aux filtres sélectionnés.
          </p>
        )}

        <div style={{ display: "grid", gap: 12, paddingTop: 4 }}>
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
