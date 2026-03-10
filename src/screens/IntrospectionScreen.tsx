import { useState, useCallback } from "react";

// ── Banque de questions ────────────────────────────────────────────────────────

const QUESTIONS = [
  // ── Mémoire & souvenir ──────────────────────────────────────────────────────
  "Qu'est-ce qui t'a le plus surpris dans ce festival jusqu'ici ?",
  "Quel son t'hantera encore après être rentré chez toi ?",
  "Si tu devais garder une seule image de ce festival, laquelle serait-ce ?",
  "Qu'est-ce que tu veux te rappeler dans dix ans ?",
  "Qu'est-ce que tu aurais peur d'oublier en premier ?",
  "Quel moment as-tu eu envie de figer pour toujours ?",
  "Si tu pouvais vivre une heure de ce festival en boucle, laquelle serait-ce ?",
  "Qu'est-ce que tu emmènes avec toi quand tu repartiras ?",

  // ── Émotions & ressentis ─────────────────────────────────────────────────────
  "Quelle émotion ne veux-tu pas oublier avant de rentrer ?",
  "Qu'est-ce que la musique te dit ce soir ?",
  "Quel mot décrit le mieux ton état en ce moment ?",
  "Qu'est-ce qui t'a fait sourire sans raison aujourd'hui ?",
  "Qu'est-ce que ton corps te dit qu'il aime ?",
  "Dans quel état arrives-tu ici ? Dans quel état repars-tu ?",
  "Quelle émotion inattendue t'a traversé aujourd'hui ?",
  "Qu'est-ce qui t'a fait danser même quand tu ne voulais pas danser ?",

  // ── Identité & introspection ─────────────────────────────────────────────────
  "Qu'est-ce que tu t'autorises ici que tu ne t'autorises pas ailleurs ?",
  "Quelle partie de toi est venue ici sans que tu l'aies invitée ?",
  "Avec quelle version de toi-même es-tu venu ici ?",
  "Qu'est-ce que ce festival t'apprend sur toi ?",
  "Quelle limite as-tu repoussée, même légèrement ?",
  "Qu'est-ce que tu gardes pour toi seul parmi tout ce que tu vis ?",
  "Qu'est-ce que tu as accepté aujourd'hui que tu refusais hier ?",
  "Qu'est-ce que tu laisses derrière toi en venant ici ?",

  // ── Connexion & monde ────────────────────────────────────────────────────────
  "À qui penses-tu en ce moment ?",
  "Qui as-tu rencontré qui t'a marqué, même brièvement ?",
  "Quel visage reste dans ta mémoire sans que tu saches pourquoi ?",
  "Quel geste ou regard d'un inconnu t'a touché ?",
  "Si tu pouvais offrir ce festival à quelqu'un, qui serait-ce ?",
  "Qu'est-ce que la foule t'apprend sur la solitude ?",
  "Qu'est-ce que tu n'aurais jamais imaginé vivre ici ?",
  "Qu'est-ce que la nuit te permet que le jour ne permet pas ?",

  // ── Sensorialité & matière ───────────────────────────────────────────────────
  "Si ce moment avait une odeur, ce serait quoi ?",
  "Quel est le silence qui t'a le plus parlé aujourd'hui ?",
  "Quel son t'a traversé plutôt que de passer à côté ?",
  "Quel sens est le plus en éveil en toi là, maintenant ?",
  "Qu'est-ce qui t'a semblé magique alors que c'était ordinaire ?",
  "Quelle texture ou lumière as-tu remarquée et que tu ne vois jamais en ville ?",

  // ── Art & création ───────────────────────────────────────────────────────────
  "Quel artiste t'a fait ressentir quelque chose d'inattendu ?",
  "Quel art ou performance t'a touché au point de t'arrêter ?",
  "Si tu devais écrire une chanson sur aujourd'hui, quel serait son titre ?",
  "Si ce festival t'écrivait une lettre, qu'y aurait-il dedans ?",
  "Si ce festival était une couleur, laquelle serait-il ?",
  "Si ce festival était une personne, comment serait-elle ?",

  // ── Présence & profondeur ────────────────────────────────────────────────────
  "Qu'est-ce qui te manque ici ? Qu'est-ce qui te remplit ?",
  "Qu'est-ce que ce lieu réveille en toi ?",
  "Si ce festival était un rêve, à quelle heure t'éveillerais-tu ?",
  "Qu'est-ce que tu ferais différemment si tu recommençais depuis le début ?",
  "Qu'est-ce que la musique a soigné en toi ?",
  "Qu'est-ce que la chose la plus belle que tu aies vue aujourd'hui ?",
];

function pickRandom(current: string): string {
  const others = QUESTIONS.filter((q) => q !== current);
  return others[Math.floor(Math.random() * others.length)];
}

// ── Utilitaires couleur ───────────────────────────────────────────────────────

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return [0, 255, 183];
}
function lighten(c: number, factor: number): number {
  return Math.round(c + (255 - c) * factor);
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = {
  onBack: () => void;
  haloColor?: string;
};

export function IntrospectionScreen({ onBack, haloColor }: Props) {
  const [r, g, b]   = parseColor(haloColor ?? "#00FFB7");
  const haloMain    = toHex(r, g, b);
  const haloLight   = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloGlow    = `rgba(${r},${g},${b},0.22)`;
  const haloGlowSft = `rgba(${r},${g},${b},0.16)`;
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
            background: `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`,
            border: "none",
            borderRadius: 999,
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.03em",
            boxShadow: `0 0 18px ${haloGlow}, 0 4px 20px ${haloGlowSft}`,
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
