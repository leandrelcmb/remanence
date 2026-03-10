import { useState, useEffect, useRef, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { uuid, nowISO } from "../core/models/utils";
import { setActiveChasse, clearActiveChasse, addChasseHistory } from "../core/store/repo";
import type { ChasseType, WheelItem, ChasseActiveSession, ChasseHistoryEntry } from "../core/models/chasseTypes";

// ── Contenu des 3 roues ───────────────────────────────────────────────────────

export const WHEEL_CONTENT: Record<ChasseType, WheelItem[]> = {
  chromatic: [
    { label: "Rouge",  color: "#FF3B30", icon: "🔴", challenge: "Trouve & photographie 21 instants rouges autour de toi" },
    { label: "Orange", color: "#FF9500", icon: "🟠", challenge: "21 nuances d'orange capturées avant que le timer s'arrête" },
    { label: "Jaune",  color: "#FFD60A", icon: "🟡", challenge: "Capture 21 éclats jaunes : lumières, tenues, décors" },
    { label: "Vert",   color: "#34C759", icon: "🟢", challenge: "21 teintes vertes dans la nature ou la scénographie" },
    { label: "Cyan",   color: "#00C7BE", icon: "Ⓜ️", challenge: "Photographie 21 touches cyan autour de toi" },
    { label: "Bleu",   color: "#0A84FF", icon: "🔵", challenge: "21 bleus — ciel, tenues, light shows — en 1 heure" },
    { label: "Indigo", color: "#5E5CE6", icon: "💜", challenge: "Traque 21 nuances indigo & violet dans le camp" },
    { label: "Violet", color: "#BF5AF2", icon: "🟣", challenge: "21 instants violets : magie, mystère, lumières" },
  ],
  formes: [
    { label: "Cercle",   color: "#5E5CE6", icon: "⭕", challenge: "Photographie 21 cercles parfaits dans le festival" },
    { label: "Triangle", color: "#0A84FF", icon: "🔺", challenge: "Capture 21 triangles cachés dans les structures" },
    { label: "Étoile",   color: "#FFD60A", icon: "⭐", challenge: "Trouve 21 formes étoilées autour de toi" },
    { label: "Spirale",  color: "#FF9500", icon: "🌀", challenge: "Photographie 21 spirales — naturelles ou décoratives" },
    { label: "Losange",  color: "#BF5AF2", icon: "💠", challenge: "Capture 21 losanges dans les tenues et installations" },
    { label: "Nuage",    color: "#00C7BE", icon: "☁️", challenge: "21 formes rondes et douces, comme des nuages" },
    { label: "Arc",      color: "#34C759", icon: "🌈", challenge: "Trouve 21 courbes et arcs dans l'environnement" },
    { label: "Croix",    color: "#FF3B30", icon: "✚",  challenge: "Photographie 21 formes en croix ou intersection" },
  ],
  personnages: [
    { label: "Mystique",   color: "#5E5CE6", icon: "🔮", challenge: "Capte 21 âmes mystiques — capes, cristaux, signes" },
    { label: "Solaire",    color: "#FFD60A", icon: "☀️", challenge: "21 personnes solaires — sourires, couleurs vives, joie" },
    { label: "Tribal",     color: "#FF9500", icon: "🥁", challenge: "Photographie 21 présences tribales — peintures, plumes" },
    { label: "Électro",    color: "#0A84FF", icon: "⚡", challenge: "Capture 21 âmes électro — néons, cyberpunk, lasers" },
    { label: "Hippie",     color: "#34C759", icon: "🌸", challenge: "21 esprits hippies — fleurs, tie-dye, paix & amour" },
    { label: "Chamanique", color: "#BF5AF2", icon: "🌿", challenge: "Photographie 21 personnages chamaniques — plantes, rituels" },
    { label: "Guerrier",   color: "#FF3B30", icon: "🛡️", challenge: "Capture 21 guerriers du festival — forts, déterminés" },
    { label: "Fée",        color: "#00C7BE", icon: "🧚", challenge: "Immortalise 21 fées du camp — ailes, paillettes, magie" },
  ],
};

export const CHASSE_TITLES: Record<ChasseType, string> = {
  chromatic: "Chasse Chromatique 🎨",
  formes: "Chasse des Formes 🔷",
  personnages: "Chasse des Persos 🧑",
};

// ── Compression photo ─────────────────────────────────────────────────────────

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = url;
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "spin" | "spinning" | "challenge";

type Props = {
  chasseType: ChasseType;
  onBack: () => void;
  resumeSession?: ChasseActiveSession;
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function ChasseScreen({ chasseType, onBack, resumeSession }: Props) {
  const segments = WHEEL_CONTENT[chasseType];

  const isResuming = !!resumeSession && resumeSession.timerExpiresAt > Date.now();

  const [phase, setPhase]     = useState<Phase>(isResuming ? "challenge" : "spin");
  const [rotation, setRotation] = useState(0);
  const [result, setResult]   = useState<WheelItem | null>(resumeSession?.result ?? null);
  const [timer, setTimer]     = useState<number>(() =>
    isResuming
      ? Math.max(0, Math.floor((resumeSession!.timerExpiresAt - Date.now()) / 1000))
      : 3600
  );
  const [photos, setPhotos]   = useState<(string | null)[]>(() =>
    isResuming ? resumeSession!.photos : Array(21).fill(null)
  );
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  // ── Mode édition ──────────────────────────────────────────────────────────
  const [editMode, setEditMode]           = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Confirmation annulation ───────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Timer countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "challenge" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, timer]);

  // ── Persistance auto (à chaque changement de photos) ─────────────────────
  useEffect(() => {
    if (phase !== "challenge" || !result) return;
    const session: ChasseActiveSession = {
      chasseType,
      result,
      photos,
      timerExpiresAt: Date.now() + timer * 1000,
    };
    setActiveChasse(session); // fire-and-forget
  }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Logique spin ──────────────────────────────────────────────────────────
  function handleSpin() {
    if (phase !== "spin") return;
    const idx = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const toTop = 360 - (idx + 0.5) * segmentAngle;
    const newRot = rotation + 5 * 360 + (toTop - (rotation % 360) + 360) % 360;
    setPhase("spinning");
    setRotation(newRot);
    setResult(segments[idx]);
    setTimeout(() => {
      setPhase("challenge");
      // Persister dès le début du challenge
      const session: ChasseActiveSession = {
        chasseType,
        result: segments[idx],
        photos: Array(21).fill(null),
        timerExpiresAt: Date.now() + 3600 * 1000,
      };
      setActiveChasse(session);
    }, 3700);
  }

  // ── Logique photo ─────────────────────────────────────────────────────────
  function triggerPhoto(i: number) {
    setPendingSlot(i);
    fileRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pendingSlot === null) return;
    const dataUrl = await compressImage(file);
    setPhotos((prev) => prev.map((p, i) => (i === pendingSlot ? dataUrl : p)));
    setPendingSlot(null);
    e.target.value = "";
  }

  // ── Mode édition — long press + tap-to-swap ───────────────────────────────
  function onSlotPointerDown(i: number, e: ReactPointerEvent<HTMLDivElement>) {
    if (editMode || photos[i] === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    longPressRef.current = setTimeout(() => {
      setEditMode(true);
      setSelectedIndex(null);
    }, 500);
  }

  function onSlotPointerUp() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  function onSlotClick(i: number) {
    if (!editMode) {
      triggerPhoto(i);
      return;
    }
    if (selectedIndex === null) {
      if (photos[i] !== null) setSelectedIndex(i);
    } else {
      if (i !== selectedIndex) {
        const next = [...photos];
        [next[i], next[selectedIndex]] = [next[selectedIndex], next[i]];
        setPhotos(next);
      }
      setSelectedIndex(null);
    }
  }

  function onDelete(e: React.MouseEvent, i: number) {
    e.stopPropagation();
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? null : p)));
  }

  // ── Annuler / Sauvegarder ─────────────────────────────────────────────────
  async function handleCancel() {
    await clearActiveChasse();
    setPhase("spin");
    setResult(null);
    setPhotos(Array(21).fill(null));
    setTimer(3600);
    setEditMode(false);
    setSelectedIndex(null);
    setShowCancelConfirm(false);
  }

  async function handleSave() {
    const nonNull = photos.filter(Boolean) as string[];
    if (!result) return;
    const entry: ChasseHistoryEntry = {
      id: uuid(),
      chasseType,
      result,
      photos: nonNull,
      savedAt: nowISO(),
    };
    await addChasseHistory(entry);
    await clearActiveChasse();
    onBack();
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      paddingBottom: 40,
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

          {/* Roue */}
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

            {/* Roue */}
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
              {/* Émojis sur les segments */}
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

          {/* Bouton spin */}
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
          gap: 20,
          padding: "4px 20px 20px",
          overflowY: "auto",
        }}
          className="no-scrollbar"
        >

          {/* Résultat + timer */}
          <div style={{
            borderRadius: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            {/* Couleur + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: result.color,
                boxShadow: `0 4px 18px ${result.color}80`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{result.icon} {result.label}</div>
              </div>
              {/* Timer */}
              <div style={{
                fontSize: 26,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: timer < 300 ? "#FF3B30" : result.color,
                letterSpacing: "0.04em",
              }}>
                {timerStr}
              </div>
            </div>

            {/* Challenge text */}
            <p style={{
              margin: 0,
              fontSize: 14,
              fontStyle: "italic",
              opacity: 0.80,
              lineHeight: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 10,
            }}>
              "{result.challenge}"
            </p>

            {/* Compteur photos */}
            <div style={{ fontSize: 12, opacity: 0.50, textAlign: "right" }}>
              {photoCount}/21 photos
            </div>
          </div>

          {/* Grille 21 photos (3 × 7) */}
          <div>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Ton feed
              </div>
              {editMode && (
                <button
                  onClick={() => { setEditMode(false); setSelectedIndex(null); }}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Terminé
                </button>
              )}
              {!editMode && photoCount > 0 && (
                <div style={{ fontSize: 11, opacity: 0.4 }}>
                  Maintenir pour réorganiser
                </div>
              )}
            </div>

            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}
              onClick={(e) => {
                if (editMode && e.target === e.currentTarget) {
                  setEditMode(false);
                  setSelectedIndex(null);
                }
              }}
            >
              {photos.map((photo, i) => (
                <div
                  key={i}
                  onPointerDown={(e) => onSlotPointerDown(i, e)}
                  onPointerUp={onSlotPointerUp}
                  onPointerCancel={onSlotPointerUp}
                  onClick={() => onSlotClick(i)}
                  className={editMode && photo !== null ? "chasse-wobble" : ""}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: photo ? "transparent" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${
                      selectedIndex === i
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(255,255,255,0.10)"
                    }`,
                    boxShadow: selectedIndex === i
                      ? "0 0 0 2px rgba(255,255,255,0.3)"
                      : "none",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                >
                  {photo && (
                    <img
                      src={photo}
                      style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                      alt={`Photo ${i + 1}`}
                    />
                  )}
                  {!photo && (
                    <span style={{ fontSize: 18, opacity: 0.30, pointerEvents: "none" }}>+</span>
                  )}

                  {/* ❌ delete (mode édition) */}
                  {editMode && photo !== null && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => onDelete(e, i)}
                      style={{
                        position: "absolute", top: 3, left: 3,
                        width: 20, height: 20,
                        borderRadius: "50%",
                        background: "#FF3B30",
                        border: "1.5px solid white",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        padding: 0,
                        zIndex: 2,
                      }}
                    >×</button>
                  )}

                  {/* Numéro de slot vide */}
                  {!photo && !editMode && (
                    <div style={{
                      position: "absolute",
                      bottom: 3, right: 5,
                      fontSize: 9,
                      opacity: 0.22,
                      fontWeight: 600,
                      pointerEvents: "none",
                    }}>
                      {i + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons session */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <button
              onClick={handleSave}
              className="remanence-btn"
              style={{
                borderRadius: 999,
                padding: "16px 20px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                color: "white",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "inherit",
                letterSpacing: "0.03em",
              }}
            >
              Enregistrer le feed 💾
            </button>

            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{
                borderRadius: 999,
                padding: "14px 20px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "rgba(255,255,255,0.50)",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "inherit",
                letterSpacing: "0.03em",
              }}
            >
              Annuler la partie ✕
            </button>
          </div>

        </div>
      )}

      {/* ── Modal confirmation annulation ── */}
      {showCancelConfirm && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.70)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "20px 20px 0 0",
              padding: "28px 20px 40px",
              width: "100%",
              maxWidth: 480,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, textAlign: "center" }}>
              Annuler la partie ?
            </p>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.55, textAlign: "center", lineHeight: 1.5 }}>
              Le feed actuel ne sera pas sauvegardé.<br />Tu reviendras à l'écran de tirage.
            </p>
            <button
              onClick={handleCancel}
              style={{
                borderRadius: 999, padding: "16px",
                background: "#FF3B30", border: "none",
                color: "white", fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Oui, annuler
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              style={{
                borderRadius: 999, padding: "14px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "white", fontSize: 15, fontWeight: 400,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Continuer la chasse
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
