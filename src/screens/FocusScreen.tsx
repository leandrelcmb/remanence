import { useRef, useState } from "react";
import type { Draft } from "../app/flow/types";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  focus: Draft["focus"];
  haloColor: string;
  onSelect: (focus: Draft["focus"]) => void;
  onNext: () => void;
  onBack: () => void;
  onFocusFlare: () => void;
};

type FocusKey = "mental" | "emotion" | "body";

const FOCUSES: [FocusKey, string, string][] = [
  ["mental", "🧠", "Mental"],
  ["emotion", "❤️", "Émotions"],
  ["body", "🕺", "Corps"],
];

function hexToRgbStr(hex: string): string {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return "200,180,255";
  return m.slice(0, 3).map((h) => parseInt(h, 16)).join(",");
}

export function FocusScreen({ haloColor, onSelect, onNext, onBack, onFocusFlare }: Props) {
  const btnRefs = useRef<Record<FocusKey, HTMLButtonElement | null>>({} as Record<FocusKey, HTMLButtonElement | null>);
  // État local : null au montage (aucun bouton pré-sélectionné visuellement)
  // Initialisé à null → évite la pré-sélection à chaque visite du composant
  const [localFocus, setLocalFocus] = useState<FocusKey | null>(null);

  const rgb = hexToRgbStr(haloColor);

  const burstCSS = `
    @keyframes focus-burst {
      0%   { transform: scale(1);    box-shadow: 0 0 0px 0px rgba(${rgb},0); }
      22%  { transform: scale(1.07); box-shadow: 0 0 22px 10px rgba(${rgb},0.55); }
      100% { transform: scale(1);    box-shadow: 0 0 10px 4px rgba(${rgb},0.20); }
    }
  `;

  function handleSelect(f: FocusKey) {
    setLocalFocus(f);
    const el = btnRefs.current[f];
    if (el) {
      el.style.animation = "none";
      void el.offsetHeight; // force reflow → redémarre l'animation proprement
      el.style.animation = "focus-burst 0.65s cubic-bezier(0.22,1,0.36,1) forwards";
      setTimeout(() => {
        if (el) el.style.animation = "";
      }, 700);
    }
    onFocusFlare();
    onSelect(f);
  }

  return (
    <div style={{ display: "grid", gap: 120, minHeight: "85dvh", alignContent: "center" }}>
      <style>{burstCSS}</style>

      <p style={{ opacity: 0.86, fontSize: 23, margin: 0, textAlign: "center" }}>
        🎭 Où cela s'est joué ?
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {FOCUSES.map(([key, emoji, label]) => {
          const active = localFocus === key;
          return (
            <button
              key={key}
              ref={(el) => { btnRefs.current[key] = el; }}
              onClick={() => handleSelect(key)}
              style={{
                borderRadius: 22,
                padding: "20px",
                border: active
                  ? `1px solid rgba(${rgb},0.45)`
                  : "1px solid rgba(255,255,255,0.15)",
                background: active
                  ? `rgba(${rgb},0.12)`
                  : "rgba(255,255,255,0.05)",
                boxShadow: active
                  ? `inset 0 0 0 1px rgba(${rgb},0.25), 0 0 10px 3px rgba(${rgb},0.18)`
                  : undefined,
                color: "white",
                cursor: "pointer",
                transition:
                  "box-shadow 0.4s ease, border-color 0.3s ease, background 0.3s ease, transform 0.3s ease",
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
