import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  festivalName: string;
  onStart: () => void;
  onJournal: () => void;
  onConstellation: () => void;
  onFestivalPicker: () => void;
};

export function LandingScreen({ festivalName, onStart, onJournal, onConstellation, onFestivalPicker }: Props) {
  return (
    <div style={{ display: "grid", gap: 60, minHeight: "70dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
        🧘 "Ancre l'instant"
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <RoundButton variant="primary" onClick={onStart}>
          Entrer en rémanence 🌱
        </RoundButton>

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
          fontSize: 12,
          letterSpacing: "0.08em",
          textAlign: "center",
          padding: "4px 0",
          fontFamily: "inherit",
        }}
      >
        🪩 {festivalName} · changer
      </button>
    </div>
  );
}
