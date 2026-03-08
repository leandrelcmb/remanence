import type { Draft } from "../app/flow/types";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  focus: Draft["focus"];
  onSelect: (focus: Draft["focus"]) => void;
  onNext: () => void;
  onBack: () => void;
};

const FOCUSES: [Draft["focus"], string, string][] = [
  ["mental", "🧠", "Mental"],
  ["emotion", "❤️", "Émotions"],
  ["body", "🕺", "Corps"],
];

export function FocusScreen({ focus, onSelect, onNext, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 120, minHeight: "85dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 23, margin: 0, textAlign: "center" }}>
        🎭 Où cela s'est joué ?
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {FOCUSES.map(([key, emoji, label]) => {
          const active = focus === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                borderRadius: 22,
                padding: "20px",
                border: active
                  ? "1px solid rgba(255,255,255,0.4)"
                  : "1px solid rgba(255,255,255,0.15)",
                background: active
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.05)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 30 }}>{emoji}</div>
              <div style={{ marginTop: 15, fontSize: 15 }}>{label}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            ↪️ Retour
          </RoundButton>
        </div>
        <div style={{ flex: 1 }}>
          <RoundButton variant="primary" onClick={onNext}>
            Continuer ✨
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
