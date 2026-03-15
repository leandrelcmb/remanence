import type { Draft } from "../app/flow/types";
import { softHaptic } from "../app/flow/haptics";
import { RoundButton } from "../app/ui/RoundButton";

const STAGES = [
  { name: "Main Stage", emoji: "🌞" },
  { name: "Dragon Nest", emoji: "🐉" },
  { name: "Chill Out Dome", emoji: "🌙" },
  { name: "Pumpui", emoji: "🎪" },
];

type Props = {
  draft: Draft;
  artistSuggestions: string[];
  onChangeDraft: (patch: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function SetInfoScreen({ draft, artistSuggestions, onChangeDraft, onNext, onBack }: Props) {
  const canContinue = draft.artistName.trim().length > 0;

  return (
    <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 20, margin: 0, textAlign: "center" }}>
        🎧 Quel set viens-tu de vivre ?
      </p>

      <input
        value={draft.artistName}
        onChange={(e) => onChangeDraft({ artistName: e.target.value })}
        placeholder="Artiste (ex : Astrix)"
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 18,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: 14,
          fontSize: 16,
          fontFamily: "inherit",
          color: "white",
          outline: "none",
        }}
      />

      {artistSuggestions.length > 0 && (
        <div
          style={{
            marginTop: 8,
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          {artistSuggestions.map((artist) => (
            <div
              key={artist}
              onClick={() => onChangeDraft({ artistName: artist })}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {artist}
            </div>
          ))}
        </div>
      )}

      <p style={{ opacity: 0.6, fontSize: 12 }}>
        Si tu ne sais pas : demande autour de toi. Le nom est le sceau du souvenir ✨
      </p>

      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ opacity: 0.72, fontSize: 13, margin: 0 }}>📍 Choisis une scène</p>
        <div
          style={{
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          {STAGES.map((stage) => {
            const active = draft.stageName === stage.name;
            return (
              <div
                key={stage.name}
                onClick={() =>
                  onChangeDraft({ stageName: draft.stageName === stage.name ? "" : stage.name })
                }
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{stage.emoji} {stage.name}</span>
                {active && <span style={{ opacity: 0.8, fontSize: 12 }}>✓ sélectionnée</span>}
              </div>
            );
          })}
        </div>
      </div>

      <input
        value={draft.style}
        onChange={(e) => onChangeDraft({ style: e.target.value })}
        placeholder="Style (ex : psytrance / ambient)"
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 18,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: 14,
          fontSize: 16,
          fontFamily: "inherit",
          color: "white",
          outline: "none",
        }}
      />

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            ↪️ Retour
          </RoundButton>
        </div>
        <div style={{ flex: 1 }}>
          <RoundButton
            variant="primary"
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) { softHaptic(); return; }
              onNext();
            }}
          >
            Valider ✔️
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
