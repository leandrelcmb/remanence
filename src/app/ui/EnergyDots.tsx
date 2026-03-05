import { softHaptic } from "../flow/haptics";

type Props = {
  value: number; // 1..5
  onChange: (n: number) => void;
};


const ENERGY_COLORS: string[] = [
  "#0F0614", // 1 orange sombre
  "#2B1037", // 2 orange 
  "#461B5A", // 3 jaune clair
  "#672885", // 4 jaune
  "#7D30A1", // 5 jaune-vert
  "#993BC4", // 1 orange sombre
  "#AB5ECF", // 2 orange 
  "#BE81D9", // 3 jaune clair
  "#E2C8EF", // 4 jaune
  "#F5EBF9", // 5 jaune-vert
];

export function EnergyDots({ value, onChange }: Props) {
  return (
    <div style={{ display: "grid", gap: 45, justifyItems: "center" }}>
      {/* Valeur au centre */}
      <div style={{ fontSize: 75, fontWeight: 350, lineHeight: 1.5 }}>
        {value}
      </div>

      {/* Pastilles */}
      <div style={{ display: "flex", gap: 25, flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = n <= value;

          return (
            <button
              key={n}
              onClick={() => {
                softHaptic();
                onChange(n);
              }}
              aria-label={`Intensité ${n}`}
              style={{
                width: 45,
                height: 45,
                borderRadius: 999,
                border: active ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.12)",
                background: active ? ENERGY_COLORS[i] : "rgba(255,255,255,0.10)",
                boxShadow: active ? `0 0 22px ${ENERGY_COLORS[i]}55` : "none",
                transform: active && n === value ? "scale(1.18)" : "scale(1)",
                transition: "transform 120ms ease, box-shadow 180ms ease, background 180ms ease",
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>

      {/* Labels emojis */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          opacity: 1,
          fontSize: 40,
          padding: "0 6px",
          maxWidth: 400,
        }}
      >
        <span>🛌🏽</span>
        <span>🏇🏽</span>
      </div>
    </div>
  );
}

export const energyColorFor = (energy: number) => ENERGY_COLORS[Math.max(1, Math.min(10, energy)) - 1];