import { useEffect, useState, useMemo } from "react";
import { RoundButton } from "../app/ui/RoundButton";
import { energyTint } from "../app/ui/EnergyDots";
import { focusEmoji } from "./utils";

export type LastSavedEntry = {
  artistName: string;
  stageName: string;
  energy: number;
  colorHex: string;
  focus: "mental" | "emotion" | "body";
  photo?: string;
};

type Props = {
  lastSavedColor: string | null;
  lastSavedEntry: LastSavedEntry | null;
  onHome: () => void;
};

// ── Particules flottantes ────────────────────────────────────────────────────

type Particle = {
  id: number;
  x: number;        // % left (5–95)
  y: number;        // % top (25–90)
  size: number;     // px (4–10)
  duration: number; // s (1.8–3.2)
  delay: number;    // s (0–1.5)
  dy: number;       // px négatif, monte de 80 à 140px
};

function generateParticles(): Particle[] {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x:        5  + Math.random() * 90,
    y:        25 + Math.random() * 65,
    size:     4  + Math.random() * 6,
    duration: 1.8 + Math.random() * 1.4,
    delay:    Math.random() * 1.5,
    dy:       -(80 + Math.random() * 60),
  }));
}

function ParticleField({ color }: { color: string }) {
  const particles = useMemo(() => generateParticles(), []);
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden", pointerEvents: "none", zIndex: 0,
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            ["--particle-dy" as string]: `${p.dy}px`,
            animation: `particleFloat ${p.duration}s ease-out ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ── Écran principal ──────────────────────────────────────────────────────────

export function DoneScreen({ lastSavedColor, lastSavedEntry, onHome }: Props) {
  const accentColor = lastSavedColor ?? "white";
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setGlowing(true), 100);
    const t2 = setTimeout(() => setGlowing(false), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ position: "relative", display: "grid", gap: 100, minHeight: "85dvh", alignContent: "center" }}>

      {/* Particules en arrière-plan */}
      <ParticleField color={accentColor} />

      {/* Contenu au-dessus des particules */}
      <div style={{ position: "relative", zIndex: 1, display: "contents" }}>

        {/* Titre */}
        <p style={{
          opacity: 0.92,
          fontSize: 35,
          margin: 0,
          textAlign: "center",
          color: accentColor,
          textShadow: `0 0 28px ${accentColor}55`,
        }}>
          Ta trace est ancrée 🎁
        </p>

        {/* Carte récap */}
        {lastSavedEntry && (
          <div style={{
            borderRadius: 22,
            overflow: "hidden",
            border: `1px solid ${accentColor}33`,
            boxShadow: `0 0 32px ${accentColor}18`,
          }}>
            {/* Photo si disponible */}
            {lastSavedEntry.photo && (
              <img
                src={lastSavedEntry.photo}
                alt="photo du set"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
              />
            )}

            {/* Infos */}
            <div style={{
              padding: "18px 20px",
              background: `${accentColor}10`,
              display: "grid",
              gap: 14,
            }}>
              {/* Artiste + scène */}
              <div>
                <div style={{ fontSize: 22, fontWeight: 500 }}>
                  {lastSavedEntry.artistName || "Artiste inconnu"}
                </div>
                {lastSavedEntry.stageName && (
                  <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>
                    {lastSavedEntry.stageName}
                  </div>
                )}
              </div>

              {/* Énergie + focus + couleur */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Pastille couleur */}
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: accentColor,
                  boxShadow: `0 0 10px ${accentColor}88`,
                  flexShrink: 0,
                }} />

                {/* Barre d'énergie */}
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{
                      width: 5,
                      height: i < lastSavedEntry.energy ? 14 : 8,
                      borderRadius: 3,
                      background: i < lastSavedEntry.energy
                        ? energyTint(lastSavedEntry.colorHex, lastSavedEntry.energy)
                        : "rgba(255,255,255,0.12)",
                      transition: "height 0.2s ease",
                    }} />
                  ))}
                  <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>
                    {lastSavedEntry.energy}/10
                  </span>
                </div>

                {/* Focus */}
                <span style={{ fontSize: 16, opacity: 0.7 }}>
                  {focusEmoji(lastSavedEntry.focus)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message si pas de carte */}
        {!lastSavedEntry && (
          <div style={{
            borderRadius: 20, padding: 18, textAlign: "center",
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}44`,
          }}>
            Le souvenir a rejoint ta constellation ✨
          </div>
        )}

        <div style={{
          borderRadius: 999,
          transition: "box-shadow 0.6s ease, transform 0.6s ease",
          boxShadow: glowing ? `0 0 40px ${accentColor}88, 0 0 80px ${accentColor}44` : "none",
          transform: glowing ? "scale(1.03)" : "scale(1)",
        }}>
          <RoundButton variant="primary" onClick={onHome}>
            Se reconnecter à l'instant 🍀
          </RoundButton>
        </div>

      </div>
    </div>
  );
}
