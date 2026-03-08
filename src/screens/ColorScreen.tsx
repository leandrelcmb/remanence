import { softHaptic } from "../app/flow/haptics";
import { RoundButton } from "../app/ui/RoundButton";

const RGB_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFD60A",
  "#34C759",
  "#00C7BE",
  "#0A84FF",
  "#5E5CE6",
  "#BF5AF2",
  "#FF2D55",
  "#FFFFFF",
];

type Props = {
  selectedColor: string;
  onSelect: (color: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function ColorScreen({ selectedColor, onSelect, onNext, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 25, margin: 0, textAlign: "center" }}>
        🌈 Couleur instinctive 🦄
      </p>

      <div style={{ display: "flex", gap: 23, flexWrap: "wrap", justifyContent: "center" }}>
        {RGB_COLORS.map((c) => {
          const active = selectedColor === c;
          return (
            <button
              key={c}
              onClick={() => {
                softHaptic();
                onSelect(c);
              }}
              aria-label={c}
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                border: active
                  ? "2px solid rgba(255,255,255,0.7)"
                  : "1px solid rgba(255,255,255,0.14)",
                background: c,
                cursor: "pointer",
                boxShadow: active ? `0 0 26px ${c}66` : "none",
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            ↪️ Retour
          </RoundButton>
        </div>
        <div style={{ flex: 1 }}>
          <RoundButton variant="primary" onClick={onNext}>
            Je valide 🖖
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
