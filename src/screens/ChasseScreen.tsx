import { useState, useEffect, useRef, type ChangeEvent } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChasseType = "chromatic" | "formes" | "personnages";

type Phase = "spin" | "spinning" | "challenge";

type WheelItem = {
  label: string;
  color: string;
  icon: string;
  challenge: string;
};

// ── Contenu des 3 roues ───────────────────────────────────────────────────────

const WHEEL_CONTENT: Record<ChasseType, WheelItem[]> = {
  chromatic: [
    { label: "Rouge",  color: "#FF3B30", icon: "🔴", challenge: "Trouve & photographie 12 instants rouges autour de toi" },
    { label: "Orange", color: "#FF9500", icon: "🟠", challenge: "12 nuances d'orange capturées avant que le timer s'arrête" },
    { label: "Jaune",  color: "#FFD60A", icon: "🟡", challenge: "Capture 12 éclats jaunes : lumières, tenues, décors" },
    { label: "Vert",   color: "#34C759", icon: "🟢", challenge: "12 teintes vertes dans la nature ou la scénographie" },
    { label: "Cyan",   color: "#00C7BE", icon: "🩵", challenge: "Photographie 12 touches cyan autour de toi" },
    { label: "Bleu",   color: "#0A84FF", icon: "🔵", challenge: "12 bleus — ciel, tenues, light shows — en 1 heure" },
    { label: "Indigo", color: "#5E5CE6", icon: "💜", challenge: "Traque 12 nuances indigo & violet dans le camp" },
    { label: "Violet", color: "#BF5AF2", icon: "🟣", challenge: "12 instants violets : magie, mystère, lumières" },
  ],
  formes: [
    { label: "Cercle",   color: "#5E5CE6", icon: "⭕", challenge: "Photographie 12 cercles parfaits dans le festival" },
    { label: "Triangle", color: "#0A84FF", icon: "🔺", challenge: "Capture 12 triangles cachés dans les structures" },
    { label: "Étoile",   color: "#FFD60A", icon: "⭐", challenge: "Trouve 12 formes étoilées autour de toi" },
    { label: "Spirale",  color: "#FF9500", icon: "🌀", challenge: "Photographie 12 spirales — naturelles ou décoratives" },
    { label: "Losange",  color: "#BF5AF2", icon: "💠", challenge: "Capture 12 losanges dans les tenues et installations" },
    { label: "Nuage",    color: "#00C7BE", icon: "☁️", challenge: "12 formes rondes et douces, comme des nuages" },
    { label: "Arc",      color: "#34C759", icon: "🌈", challenge: "Trouve 12 courbes et arcs dans l'environnement" },
    { label: "Croix",    color: "#FF3B30", icon: "✚",  challenge: "Photographie 12 formes en croix ou intersection" },
  ],
  personnages: [
    { label: "Mystique",  color: "#5E5CE6", icon: "🔮", challenge: "Capte 12 âmes mystiques — capes, cristaux, signes" },
    { label: "Solaire",   color: "#FFD60A", icon: "☀️", challenge: "12 personnes solaires — sourires, couleurs vives, joie" },
    { label: "Tribal",    color: "#FF9500", icon: "🥁", challenge: "Photographie 12 présences tribales — peintures, plumes" },
    { label: "Électro",   color: "#0A84FF", icon: "⚡", challenge: "Capture 12 âmes électro — néons, cyberpunk, lasers" },
    { label: "Hippie",    color: "#34C759", icon: "🌸", challenge: "12 esprits hippies — fleurs, tie-dye, paix & amour" },
    { label: "Chamanique",color: "#BF5AF2", icon: "🌿", challenge: "Photographie 12 personnages chamaniques — plantes, rituels" },
    { label: "Guerrier",  color: "#FF3B30", icon: "🛡️", challenge: "Capture 12 guerriers du festival — forts, déterminés" },
    { label: "Fée",       color: "#00C7BE", icon: "🧚", challenge: "Immortalise 12 fées du camp — ailes, paillettes, magie" },
  ],
};

const CHASSE_TITLES: Record<ChasseType, string> = {
  chromatic: "Chasse Chromatique 🎨",
  formes: "Chasse des Formes 🔷",
  personnages: "Chasse des Persos 🧑",
};

// ── Composant principal ────────────────────────────────────────────────────────

type Props = {
  chasseType: ChasseType;
  onBack: () => void;
};

export function ChasseScreen({ chasseType, onBack }: Props) {
  const segments = WHEEL_CONTENT[chasseType];

  const [phase, setPhase] = useState<Phase>("spin");
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [timer, setTimer] = useState(3600); // 60 min en secondes
  const [photos, setPhotos] = useState<(string | null)[]>(Array(12).fill(null));
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Timer countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "challenge" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, timer]);

  // ── Logique spin ─────────────────────────────────────────────────────────
  function handleSpin() {
    if (phase !== "spin") return;
    const idx = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length; // 45°
    // Angle pour centrer le segment idx sur le pointer (top = 0°)
    const toTop = 360 - (idx + 0.5) * segmentAngle;
    // Cumul des rotations pour éviter le retour en arrière
    const newRot = rotation + 5 * 360 + (toTop - (rotation % 360) + 360) % 360;
    setPhase("spinning");
    setRotation(newRot);
    setResult(segments[idx]);
    setTimeout(() => setPhase("challenge"), 3700);
  }

  // ── Logique photo ─────────────────────────────────────────────────────────
  function triggerPhoto(i: number) {
    setPendingSlot(i);
    fileRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pendingSlot === null) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotos((prev) => prev.map((p, i) => (i === pendingSlot ? dataUrl : p)));
      setPendingSlot(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const mm = Math.floor(timer / 60);
  const ss = timer % 60;
  const timerStr = `${mm}:${ss.toString().padStart(2, "0")}`;
  const photoCount = photos.filter(Boolean).length;

  // ── Rendu de la roue ──────────────────────────────────────────────────────
  const gradient = segments
    .map((s, i) => `${s.color} ${i * 45}deg ${(i + 1) * 45}deg`)
    .join(", ");

  const wheelSize = 270;
  const center = wheelSize / 2;
  const iconRadius = 88;

  function renderWheel() {
    return (
      <div style={{ position: "relative", width: wheelSize, height: wheelSize, margin: "0 auto" }}>
        {/* Pointer fixe ▼ */}
        <div style={{
          position: "absolute",
          top: -20, left: "50%",
          transform: "translateX(-50%)",
          fontSize: 22,
          zIndex: 2,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
        }}>▼</div>

        {/* Roue en rotation */}
        <div style={{
          width: "100%", height: "100%",
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
          transform: `rotate(${rotation}deg)`,
          transition: phase === "spinning"
            ? "transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)"
            : "none",
          position: "relative",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.12)",
        }}>
          {/* Émojis sur les segments (tournent avec la roue) */}
          {segments.map((s, i) => {
            const angle = (i + 0.5) * (360 / segments.length);
            const rad = (angle - 90) * (Math.PI / 180);
            const x = center + iconRadius * Math.cos(rad);
            const y = center + iconRadius * Math.sin(rad);
            return (
              <div key={i} style={{
                position: "absolute",
                left: x, top: y,
                transform: "translate(-50%, -50%)",
                fontSize: 22,
                pointerEvents: "none",
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
              }}>
                {s.icon}
              </div>
            );
          })}

          {/* Centre blanc */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 42, height: 42,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }} />
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      padding: "0 0 40px",
      overflowY: "auto",
    }}>

      {/* Input fichier caché */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ── Header ── */}
      <div style={{
        padding: "20px 20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {CHASSE_TITLES[chasseType]}
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
          ← Jeux
        </button>
      </div>

      {/* ── Phase SPIN / SPINNING ── */}
      {(phase === "spin" || phase === "spinning") && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "20px 24px",
        }}>
          {renderWheel()}

          <div style={{ width: "100%", maxWidth: 320 }}>
            <button
              onClick={handleSpin}
              disabled={phase === "spinning"}
              className="remanence-btn"
              style={{
                width: "100%",
                borderRadius: 999,
                padding: "18px 20px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: phase === "spinning"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                color: "white",
                cursor: phase === "spinning" ? "not-allowed" : "pointer",
                opacity: phase === "spinning" ? 0.5 : 1,
                fontSize: 17,
                fontWeight: 600,
                fontFamily: "inherit",
                letterSpacing: "0.03em",
              }}
            >
              {phase === "spinning" ? "La chasse est lancée…" : "Lancer la chasse 🎯"}
            </button>
          </div>
        </div>
      )}

      {/* ── Phase CHALLENGE ── */}
      {phase === "challenge" && result && (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "8px 20px 20px",
        }}>

          {/* Résultat + timer */}
          <div style={{
            borderRadius: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}>
            {/* Couleur + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: "50%",
                background: result.color,
                boxShadow: `0 4px 18px ${result.color}80`,
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{result.icon} {result.label}</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{chasseType === "chromatic" ? "Couleur tirée" : chasseType === "formes" ? "Forme tirée" : "Archétype tiré"}</div>
              </div>
            </div>

            {/* Challenge */}
            <p style={{
              margin: 0,
              fontSize: 15,
              fontStyle: "italic",
              opacity: 0.85,
              lineHeight: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 12,
            }}>
              "{result.challenge}"
            </p>

            {/* Timer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 12,
            }}>
              <div style={{ fontSize: 13, opacity: 0.55 }}>
                {photoCount}/12 photos
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: timer < 300 ? "#FF3B30" : result.color,
                letterSpacing: "0.04em",
              }}>
                {timerStr}
              </div>
            </div>
          </div>

          {/* Grille photo 3×4 */}
          <div>
            <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Ton feed
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}>
              {photos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => triggerPhoto(i)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    background: photo ? "transparent" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${photo ? "transparent" : "rgba(255,255,255,0.10)"}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      alt={`Photo ${i + 1}`}
                    />
                  ) : (
                    <span style={{ fontSize: 22, opacity: 0.35 }}>+</span>
                  )}
                  {/* Numéro de slot */}
                  {!photo && (
                    <div style={{
                      position: "absolute",
                      bottom: 4, right: 6,
                      fontSize: 10,
                      opacity: 0.3,
                      fontWeight: 600,
                    }}>
                      {i + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bouton terminer */}
          <button
            onClick={onBack}
            style={{
              borderRadius: 999,
              padding: "16px 20px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "white",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 400,
              fontFamily: "inherit",
              letterSpacing: "0.03em",
            }}
          >
            Terminer la chasse ✓
          </button>

        </div>
      )}

    </div>
  );
}
