import type { Draft } from "../app/flow/types";
import { EnergyDots } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  draft: Draft;
  onChangeDraft: (patch: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function EnergyScreen({ draft, onChangeDraft, onNext, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 20, minHeight: "70dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 18, margin: 0, textAlign: "center" }}>
        ⚡ Intensité
      </p>

      <EnergyDots
        value={draft.energy}
        color={draft.colorHex}
        onChange={(n) => onChangeDraft({ energy: n })}
      />

      <div style={{ display: "flex", gap: 12 }}>
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
