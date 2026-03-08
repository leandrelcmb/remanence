import { useState } from "react";
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import { formatTime, focusEmoji } from "./utils";

type Props = {
  item: JournalItem;
  backTarget: "journal" | "constellation";
  onBack: () => void;
  onEdit: (item: JournalItem) => void;
  onDelete: (item: JournalItem) => void;
};

export function DetailScreen({ item, backTarget, onBack, onEdit, onDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const displayColor = energyTint(item.colorHex, item.energy);

  return (
    <div style={{ display: "grid", gap: 30, minHeight: "70dvh", alignContent: "center" }}>
      <div style={{ display: "grid", gap: 6, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontWeight: 600 }}>{item.artistName}</h2>
        <div style={{ opacity: 0.6 }}>
          {formatTime(item.startTime)} · {item.stageName || "Scène inconnue"}
        </div>
      </div>

      <div
        style={{
          borderRadius: 20,
          padding: 18,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "grid",
          gap: 16,
        }}
      >
        {item.photo && (
          <img
            src={item.photo}
            alt="Souvenir du moment"
            style={{ width: "100%", borderRadius: 14, marginBottom: 10 }}
          />
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{focusEmoji(item.focus)}</span>
          <span>⚡ {item.energy}/10</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: displayColor,
              boxShadow: `0 0 18px ${displayColor}`,
            }}
          />
          <span>{item.style?.trim() ? item.style : "Style inconnu"}</span>
        </div>

        {item.feelingText?.trim() && (
          <div style={{ opacity: 0.88, lineHeight: 1.5 }}>
            "{item.feelingText.trim()}"
          </div>
        )}

        {item.learningText?.trim() && (
          <div style={{ opacity: 0.62, lineHeight: 1.45 }}>
            🧙 {item.learningText.trim()}
          </div>
        )}
      </div>

      {/* Actions */}
      {!confirmingDelete ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => onEdit(item)}>
                Modifier ✏️
              </RoundButton>
            </div>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => setConfirmingDelete(true)}>
                Supprimer 🗑️
              </RoundButton>
            </div>
          </div>

          <RoundButton variant="secondary" onClick={onBack}>
            {backTarget === "constellation" ? "Retour à la constellation ✨" : "Retour au carnet 📓"}
          </RoundButton>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 14,
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,59,48,0.08)",
            border: "1px solid rgba(255,59,48,0.25)",
          }}
        >
          <p style={{ margin: 0, textAlign: "center", opacity: 0.9 }}>
            Supprimer ce souvenir définitivement ?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => setConfirmingDelete(false)}>
                Annuler
              </RoundButton>
            </div>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => onDelete(item)}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  padding: "18px 20px",
                  border: "1px solid rgba(255,59,48,0.5)",
                  background: "rgba(255,59,48,0.18)",
                  color: "#FF3B30",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
