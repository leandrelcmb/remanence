import { useState, useCallback } from "react";

// ── Banque de questions ────────────────────────────────────────────────────────

const QUESTIONS = [
  "Qu'est-ce qui t'a le plus surpris dans ce festival jusqu'ici ?",
  "Quel son t'hantera encore après être rentré chez toi ?",
  "Si ce festival était une couleur, laquelle serait-il ?",
  "Qu'est-ce que tu laisses derrière toi en venant ici ?",
  "Quel moment as-tu eu envie de figer pour toujours ?",
  "À qui penses-tu en ce moment ?",
  "Qu'est-ce que la musique te dit ce soir ?",
  "Quelle émotion ne veux-tu pas oublier avant de rentrer ?",
  "Qu'est-ce que ce festival t'apprend sur toi ?",
  "Si tu devais garder une seule image de ce festival, laquelle serait-ce ?",
  "Qui as-tu rencontré qui t'a marqué, même brièvement ?",
  "Qu'est-ce qui te manque ici ? Qu'est-ce qui te remplit ?",
  "Quel artiste t'a fait ressentir quelque chose d'inattendu ?",
  "Si tu pouvais vivre une heure de ce festival en boucle, laquelle serait-ce ?",
  "Qu'est-ce que tu emmènes avec toi quand tu repartiras ?",
  "Quel est le silence qui t'a le plus parlé aujourd'hui ?",
  "Si ce moment avait une odeur, ce serait quoi ?",
  "Qu'est-ce que tu t'autorises ici que tu ne t'autorises pas ailleurs ?",
  "Quel mot décrit le mieux ton état en ce moment ?",
  "Qu'est-ce qui t'a fait sourire sans raison aujourd'hui ?",
  "Si ce festival t'écrivait une lettre, qu'y aurait-il dedans ?",
  "Qu'est-ce que tu veux te rappeler dans dix ans ?",
];

function pickRandom(current: string): string {
  const others = QUESTIONS.filter((q) => q !== current);
  return others[Math.floor(Math.random() * others.length)];
}

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = {
  onBack: () => void;
};

export function IntrospectionScreen({ onBack }: Props) {
  const [question, setQuestion] = useState<string>(
    () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  );
  const [animKey, setAnimKey] = useState(0);

  const draw = useCallback(() => {
    setQuestion((q) => pickRandom(q));
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── CSS local ── */}
      <style>{`
        @keyframes introspectionFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .introspection-question {
          animation: introspectionFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            💭 Introspection
          </div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
            Des questions douces pour célébrer notre existence
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Home ॐ
        </button>
      </div>

      {/* ── Corps centré ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        gap: 48,
      }}>

        {/* Carte question */}
        <div
          key={animKey}
          className="introspection-question"
          style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 24,
            padding: "36px 28px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
          }}
        >
          {/* Grand emoji */}
          <div style={{ fontSize: 52, lineHeight: 1 }}>💭</div>

          {/* Texte de la question */}
          <p style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.55,
            textAlign: "center",
            fontWeight: 400,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.01em",
          }}>
            {question}
          </p>
        </div>

        {/* Bouton retirer */}
        <button
          onClick={draw}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "14px 28px",
            fontSize: 15,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.03em",
            transition: "opacity 0.15s ease, transform 0.1s ease",
          }}
          onPointerDown={(e) => (e.currentTarget.style.opacity = "0.65")}
          onPointerUp={(e)   => (e.currentTarget.style.opacity = "1")}
          onPointerLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span style={{ fontSize: 18 }}>🔀</span>
          Nouvelle question
        </button>

      </div>
    </div>
  );
}
