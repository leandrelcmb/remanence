import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  festivalName: string;
  onStart: () => void;
  onExpressStart: () => void;
  onJournal: () => void;
  onConstellation: () => void;
  onFestivalPicker: () => void;
};

export function LandingScreen({ festivalName, onStart, onExpressStart, onJournal, onConstellation, onFestivalPicker }: Props) {
  return (
    <div style={{ display: "grid", gap: 60, minHeight: "85dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
        🧘 "Ancre l'instant"
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {/* Parcours complet */}
        <RoundButton variant="primary" onClick={onStart}>
          Entrer en rémanence 🌱
        </RoundButton>

        {/* Mode express */}
        <button
          onClick={onExpressStart}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "5px 20px",
            fontSize: 15,
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.05em",
          }}
        >
          Trace éclair ⚡
        </button>

        <div style={{ height: 25 }} />

        <RoundButton variant="secondary" onClick={onJournal}>
          Vibrations 💓
        </RoundButton>

        <RoundButton variant="secondary" onClick={onConstellation}>
          Constellations ✨
        </RoundButton>
      </div>

      {/* Festival actif — discret, en bas */}
      <button
        onClick={onFestivalPicker}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.4,
          fontSize: 15,
          letterSpacing: "0.08em",
          textAlign: "center",
          padding: "4px 0",
          fontFamily: "inherit",
        }}
      >
        {festivalName} · changer
      </button>
    </div>
  );
}
