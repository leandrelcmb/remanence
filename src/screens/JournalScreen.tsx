import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import { formatTime, focusEmoji } from "./utils";

type Props = {
  journal: JournalItem[];
  latestJournalColor: string;
  onNewEntry: () => void;
  onSelectItem: (item: JournalItem) => void;
  onHome: () => void;
};

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
        gap: 10,
        cursor: "pointer",
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
            fontSize: 14,
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
        <div style={{ opacity: 0.62, fontSize: 13, lineHeight: 1.4 }}>
          🧙🏼 {item.learningText.trim()}
        </div>
      )}
    </div>
  );
}

export function JournalScreen({ journal, latestJournalColor, onNewEntry, onSelectItem, onHome }: Props) {
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

      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 22, minHeight: "70dvh" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontWeight: 650 }}>📓 Carnet de rémanence</h2>

          <div style={{ display: "grid", gap: 12 }}>
            <RoundButton variant="primary" onClick={onNewEntry}>
              Nouvelle vibration 💓
            </RoundButton>
            <RoundButton variant="secondary" onClick={onHome}>
              Home ॐ
            </RoundButton>
          </div>
        </div>

        {journal.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            Aucun souvenir enregistré pour le moment.
          </p>
        )}

        {journal.map((item) => (
          <JournalCard
            key={item.id}
            item={item}
            onClick={() => onSelectItem(item)}
          />
        ))}
      </div>
    </>
  );
}
