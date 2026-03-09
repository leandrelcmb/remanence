import { softHaptic } from "../flow/haptics";

type Props = {
  value: number;
  color: string;
  onChange: (n: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function energyTint(color: string, energy: number) {
  const safeEnergy = clamp(energy, 1, 10);
  const factor = safeEnergy / 10;

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const newR = Math.min(255, Math.floor(r + (255 - r) * factor * 0.35));
  const newG = Math.min(255, Math.floor(g + (255 - g) * factor * 0.35));
  const newB = Math.min(255, Math.floor(b + (255 - b) * factor * 0.35));

  return `rgb(${newR}, ${newG}, ${newB})`;
}

export function energyColorFor(energy: number) {
  return energyTint("#5E5CE6", energy);
}

export function EnergyDots({ value, color, onChange }: Props) {
  const tint = energyTint(color, value);

  const sliderCss = `
    .remanence-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 14px;
      border-radius: 999px;
      outline: none;
      background:
        linear-gradient(
          90deg,
          rgba(255,255,255,0.12) 0%,
          ${tint} 100%
        );
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.08),
        0 0 28px ${tint}22;
    }

    .remanence-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.85);
      background: ${tint};
      box-shadow:
        0 0 0 6px ${tint}22,
        0 0 24px ${tint}88;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .remanence-range::-webkit-slider-thumb:hover {
      transform: scale(1.08);
    }

    .remanence-range::-moz-range-track {
      height: 14px;
      border-radius: 999px;
      border: none;
      background:
        linear-gradient(
          90deg,
          rgba(255,255,255,0.12) 0%,
          ${tint} 100%
        );
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.08),
        0 0 28px ${tint}22;
    }

    .remanence-range::-moz-range-thumb {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.85);
      background: ${tint};
      box-shadow:
        0 0 0 6px ${tint}22,
        0 0 24px ${tint}88;
      cursor: pointer;
    }
  `;

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <style>{sliderCss}</style>

      <div
        style={{
          display: "grid",
          gap: 10,
          justifyItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            background: tint,
            boxShadow: `0 0 34px ${tint}88`,
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        />

        <div style={{ fontSize: 56, fontWeight: 320, lineHeight: 1 }}>
          {value}/10
        </div>
      </div>

      <div style={{ width: "100%", display: "grid", gap: 14 }}>
        <input
          className="remanence-range"
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            softHaptic();
            onChange(n);
          }}
        />

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 34,
            opacity: 0.9,
          }}
        >
          <span>🛌🏽</span>
          <span>🏇🏽</span>
        </div>
      </div>
    </div>
  );
}