type Props = {
  onBack: () => void;
};

export function ComingSoonScreen({ onBack }: Props) {
  return (
    <div style={{
      minHeight: "80dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 56 }}>🚧</div>

      <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        En construction
      </p>

      <p style={{ fontSize: 15, opacity: 0.55, margin: 0, lineHeight: 1.6 }}>
        Ce jeu arrive bientôt.<br />
        Reste connecté à l'instant 🌱
      </p>

      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999,
          padding: "14px 32px",
          fontSize: 15,
          color: "white",
          cursor: "pointer",
          fontFamily: "inherit",
          letterSpacing: "0.03em",
        }}
      >
        Retour aux jeux
      </button>
    </div>
  );
}
