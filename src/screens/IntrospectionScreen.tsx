import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";


function pickRandom(current: string, pool: string[]): string {
  const others = pool.filter((q) => q !== current);
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
  const { t } = useTranslation();
  const questions = t('introspection.questions', { returnObjects: true }) as string[];

  const [r, g, b]   = parseColor(haloColor ?? "#00FFB7");
  const haloMain    = toHex(r, g, b);
  const haloLight   = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloGlow    = `rgba(${r},${g},${b},0.22)`;
  const haloGlowSft = `rgba(${r},${g},${b},0.16)`;
  const [question, setQuestion] = useState<string>(
    () => questions[Math.floor(Math.random() * questions.length)]
  );
  const [animKey, setAnimKey] = useState(0);

  const draw = useCallback(() => {
    setQuestion((q) => pickRandom(q, questions));
    setAnimKey((k) => k + 1);
  }, [questions]);

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
            {t('introspection.title')}
          </div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
            {t('introspection.subtitle')}
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
          {t('common.home')}
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
          {t('introspection.newQuestion')}
        </button>

      </div>
    </div>
  );
}
