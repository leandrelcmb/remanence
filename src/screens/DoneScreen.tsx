import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  lastSavedColor: string | null;
  onHome: () => void;
};

export function DoneScreen({ lastSavedColor, onHome }: Props) {
  return (
    <div style={{ display: "grid", gap: 36, minHeight: "70dvh", alignContent: "center" }}>
      <p
        style={{
          opacity: 0.92,
          fontSize: 34,
          margin: 0,
          textAlign: "center",
          color: lastSavedColor ?? "white",
          textShadow: lastSavedColor ? `0 0 24px ${lastSavedColor}66` : "none",
        }}
      >
        "Ta trace est ancrée 🎁"
      </p>

      <div
        style={{
          borderRadius: 20,
          padding: 18,
          textAlign: "center",
          background: lastSavedColor ? `${lastSavedColor}18` : "rgba(255,255,255,0.05)",
          border: lastSavedColor
            ? `1px solid ${lastSavedColor}44`
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow: lastSavedColor ? `0 0 30px ${lastSavedColor}22` : "none",
          color: "white",
          opacity: 0.9,
        }}
      >
        Le souvenir a rejoint ta constellation ✨
      </div>

      <RoundButton variant="primary" onClick={onHome}>
        Se reconnecter à l'instant 🍀
      </RoundButton>
    </div>
  );
}
