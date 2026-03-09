import { RoundButton } from "../app/ui/RoundButton";
import type { ChasseType } from "../core/models/chasseTypes";

type ActiveChasseInfo = {
  chasseType: ChasseType;
  timerExpiresAt: number;
  resultLabel: string;
  resultColor: string;
  resultIcon: string;
};

function formatRemainingTime(expiresAt: number): string {
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

type Props = {
  festivalName: string;
  onStart: () => void;
  onExpressStart: () => void;
  onJournal: () => void;
  onConstellation: () => void;
  onFestivalPicker: () => void;
  onContacts: () => void;
  onGames: () => void;
  activeChasse?: ActiveChasseInfo;
  onResumeChasse: () => void;
};

export function LandingScreen({
  festivalName, onStart, onExpressStart, onJournal,
  onConstellation, onFestivalPicker, onContacts, onGames,
  activeChasse, onResumeChasse,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 60, minHeight: "85dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
        🧘 "Ancre l'instant"
      </p>

      <div style={{ display: "grid", gap: 15 }}>

        {/* ── Bannière session Chasse active ── */}
        {activeChasse && activeChasse.timerExpiresAt > Date.now() && (
          <button
            onClick={onResumeChasse}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${activeChasse.resultColor}55`,
              borderRadius: 16,
              padding: "12px 16px",
              color: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
              marginBottom: 4,
            }}
          >
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%",
              background: activeChasse.resultColor,
              boxShadow: `0 0 8px ${activeChasse.resultColor}`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {activeChasse.resultIcon} {activeChasse.resultLabel} en cours
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                {formatRemainingTime(activeChasse.timerExpiresAt)} restantes · Reprendre →
              </div>
            </div>
          </button>
        )}

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
            padding: "15px 20px",
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

        {/* Rencontres */}
        <button
          onClick={onContacts}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "15px 20px",
            fontSize: 15,
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.05em",
          }}
        >
          Rencontres 🤝
        </button>

        {/* Jeux */}
        <button
          onClick={onGames}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "15px 20px",
            fontSize: 15,
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.05em",
          }}
        >
          Jeux 🎮
        </button>

      </div>

      {/* Festival actif — discret, en bas */}
      <button
        onClick={onFestivalPicker}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.7,
          fontSize: 15,
          letterSpacing: "0.08em",
          textAlign: "center",
          padding: "1px 0",
          fontFamily: "inherit",
        }}
      >
        {festivalName} · changer
      </button>
    </div>
  );
}
