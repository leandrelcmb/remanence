import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  onStart: () => void;
  onJournal: () => void;
  onConstellation: () => void;
};

export function LandingScreen({ onStart, onJournal, onConstellation }: Props) {
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
    </div>
  );
}
