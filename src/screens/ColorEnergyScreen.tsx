import { softHaptic } from "../app/flow/haptics";
import { EnergyDots } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import type { Draft } from "../app/flow/types";

// ── Palette ───────────────────────────────────────────────────────────────────
const RGB_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFD60A",
  "#34C759",
  "#00C7BE",
  "#0A84FF",
  "#5E5CE6",
  "#BF5AF2",
];

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = {
  draft: Draft;
  onChangeDraft: (patch: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
};

// ── Composant ─────────────────────────────────────────────────────────────────
export function ColorEnergyScreen({ draft, onChangeDraft, onNext, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 40, minHeight: "90dvh", alignContent: "center" }}>

      {/* ── Couleur ── */}
      <div style={{ display: "grid", gap: 18 }}>
        <p style={{ opacity: 0.86, fontSize: 28, margin: 0, textAlign: "center" }}>
          🌈 Couleur instinctive
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {RGB_COLORS.map((c) => {
            const active = draft.colorHex === c;
            return (
              <button
                key={c}
                onClick={() => {
                  softHaptic();
                  onChangeDraft({ colorHex: c });
                }}
                aria-label={c}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 999,
                  border: active
                    ? "2px solid rgba(255,255,255,0.75)"
                    : "1px solid rgba(255,255,255,0.14)",
                  background: c,
                  cursor: "pointer",
                  boxShadow: active ? `0 0 24px ${c}66` : "none",
                  transition: "box-shadow 0.15s, border 0.15s, transform 0.1s",
                  transform: active ? "scale(1.10)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "0 16px" }} />

      {/* ── Énergie ── */}
      <div style={{ display: "grid", gap: 18 }}>
        <p style={{ opacity: 0.86, fontSize: 28, margin: 0, textAlign: "center" }}>
          ⚡ Intensité
        </p>
        <EnergyDots
          value={draft.energy}
          color={draft.colorHex}
          onChange={(n) => onChangeDraft({ energy: n })}
        />
      </div>

      {/* ── Navigation ── */}
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
