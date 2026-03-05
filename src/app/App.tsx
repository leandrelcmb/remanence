import { useEffect, useMemo, useState } from "react";
import { RootLayout } from "./RootLayout";
import { ensureBootstrap, createSetEntry } from "../core/store/service";
import type { FlowScreen, Draft } from "./flow/types";
import { softHaptic } from "./flow/haptics";
import { EnergyDots, energyColorFor } from "./ui/EnergyDots";
import { RoundButton } from "./ui/RoundButton";

// Palette “RGB” sombre mais expressive (pas flashy)
const RGB_COLORS = [
  "#FF3B30", // 
  "#FF9500", // 
  "#FFD60A", // 
  "#34C759", // 
  "#00C7BE", //
  "#0A84FF", //
  "#5E5CE6", //
  "#BF5AF2", // 
  "#FF2D55", // 
  "#FFFFFF", // 
];

export default function App() {
  const [screen, setScreen] = useState<FlowScreen>("landing");
  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");

  const [draft, setDraft] = useState<Draft>({
    energy: 7,
    focus: "body",
    // On initialise la couleur d’après l’énergie pour lisibilité immédiate
    colorHex: energyColorFor(7),
    feelingText: "",
    learningText: "",
  });

  useEffect(() => {
    (async () => {
      const { festival } = await ensureBootstrap();
      setFestivalId(festival.id);
      setStatus(`Prêt (Festival: ${festival.name})`);
    })().catch((e) => setStatus(`Erreur: ${String(e)}`));
  }, []);

const haloOpacity = useMemo(() => {
  if (screen === "energy") return 0.12 + draft.energy * 0.02; // ~0.32 max
  if (screen === "color") return 0.28;
  if (screen === "done") return 0.22;
  return 0.16;
}, [screen, draft.energy]);

const haloScale = useMemo(() => {
  if (screen === "landing") return 1.1;

  // règle officielle Rémanence : +50% max
  if (screen === "energy") {
    return 1 + (draft.energy / 10) * 0.5; // 1 → 1.5
  }

  if (screen === "color") return 1.35;
  if (screen === "done") return 1.25;

  return 1.15;
}, [screen, draft.energy]);

const haloCenterY = useMemo(() => {
  if (draft.focus === "mental") return 35;
  if (draft.focus === "emotion") return 50;
  return 65; // body
}, [draft.focus]);

  async function finish() {
    if (!festivalId) return;

    await createSetEntry({
      festivalId,
      artistName: "Unknown Artist", // Bloc 4 on fera la vraie saisie
      style: "unknown",
      stageName: "Unknown Stage",
      energy: draft.energy,
      focus: draft.focus,
      colorHex: draft.colorHex,
      feelingText: draft.feelingText,
      learningText: draft.learningText,
    });

    setScreen("done");
  }

  return (
<RootLayout
  haloColor={draft.colorHex}
  haloOpacity={haloOpacity}
  haloScale={haloScale}
  haloCenterY={haloCenterY}
>
  {/* Container mobile centré, mais plein écran en sensation */}
  <div style={{ padding: 50, maxWidth: 460, margin: "0 auto" }}>
    <div style={{ marginBottom: 25 }}>
      <h1 style={{ fontSize: 30, fontWeight: 300, margin: 0 }}>
        Pour des souvenirs uniques ✩ ♬ ₊.🎧⋆☾⋆⁺₊✧
      </h1>
      <p style={{ opacity: 0.6, marginTop: 8, fontSize: 13 }}>{status}</p>
    </div>

        {/* LANDING */}
        {screen === "landing" && (
          <div style={{ display: "grid", gap: 60, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 24, margin: 0, textAlign: "center" }}>
              🧘 “Quel es mon état d'âme?”
            </p>

            <RoundButton variant="primary" onClick={() => setScreen("energy")}>
              Entrer en rémanence 🌱
            </RoundButton>
          </div>
        )}

        {/* ENERGY (10 DOTS) */}
        {screen === "energy" && (
          <div style={{ display: "grid", gap: 20, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 18, margin: 0, textAlign: "center" }}>
              ⚡ Intensité
            </p>

            <EnergyDots
              value={draft.energy}
              onChange={(n) =>
                setDraft((d) => ({
                  ...d,
                  energy: n,
                  // Halo suit l’énergie -> contraste fort
                  colorHex: energyColorFor(n),
                }))
              }
            />

            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("landing")}>
                  ↪️Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={() => setScreen("focus")}>
                  Je valide 🖖
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* FOCUS */}
        {screen === "focus" && (
          <div style={{ display: "grid", gap: 150, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 18, margin: 0, textAlign: "center" }}>
              🎭 Où cela s’est joué ?
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {([
                ["mental", "🧠", "Mental"],
                ["emotion", "❤️", "Émotions"],
                ["body", "🕺", "Corps"],
              ] as const).map(([key, emoji, label]) => {
                const active = draft.focus === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      softHaptic();
                      setDraft((d) => ({ ...d, focus: key }));
                    }}
                    style={{
                      borderRadius: 25,
                      padding: "18px 25px",
                      border: active
                        ? "1px solid rgba(255,255,255,0.35)"
                        : "1px solid rgba(255,255,255,0.12)",
                      background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 24 }}>{emoji}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>{label}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("energy")}>
                  ↪️Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={() => setScreen("color")}>
                  Je valide 🖖
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* COLOR (RGB palette) */}
        {screen === "color" && (
          <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 25, margin: 0, textAlign: "center" }}>
              🌈 Couleur instinctive 🦄
            </p>

            <div style={{ display: "flex", gap: 23, flexWrap: "wrap", justifyContent: "center" }}>
              {RGB_COLORS.map((c) => {
                const active = draft.colorHex === c;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      softHaptic();
                      setDraft((d) => ({ ...d, colorHex: c }));
                    }}
                    aria-label={c}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 999,
                      border: active ? "2px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.14)",
                      background: c,
                      cursor: "pointer",
                      boxShadow: active ? `0 0 26px ${c}66` : "none",
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 22 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("focus")}>
                  ↪️Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={() => setScreen("text")}>
                  Je valide 🖖
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* TEXT (more spacing) */}
        {screen === "text" && (
          <div style={{ display: "grid", gap: 45, minHeight: "70dvh", alignContent: "center" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <p style={{ opacity: 0.86, fontSize: 20, margin: 0 }}>Ce que j’ai ressenti ☮</p>
              <textarea
                value={draft.feelingText}
                onChange={(e) => setDraft((d) => ({ ...d, feelingText: e.target.value }))}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 14,
                  color: "white",
                  outline: "none",
                  minHeight: 120,
                  resize: "vertical",
                }}
                placeholder="Pose une trace… "
              />
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
              <p style={{ opacity: 0.86, fontSize: 20, margin: 0 }}>
                Ce que cet artiste m’a appris 🧙🏼
              </p>
              <textarea
                value={draft.learningText}
                onChange={(e) => setDraft((d) => ({ ...d, learningText: e.target.value }))}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 14,
                  color: "white",
                  outline: "none",
                  minHeight: 96,
                  resize: "vertical",
                }}
                placeholder="Un détail, une évidence…"
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("color")}>
                  ↪️Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={() => setScreen("capture")}>
                  Je valide 🖖
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* CAPTURE */}
        {screen === "capture" && (
          <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 18, margin: 0, textAlign: "center" }}>
              📷 Capture du moment 💝
            </p>

            <div
              style={{
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 14,
                opacity: 0.8,
                fontSize: 13,
              }}
            >
              V1 : on fera l’upload photo au Bloc 4/5. Pour l’instant, on valide la trace.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("text")}>
                  ↪️ Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={finish}>
                  Ancrer 💌  
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* DONE */}
        {screen === "done" && (
          <div style={{ display: "grid", gap: 100, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.92, fontSize: 20, margin: 0, textAlign: "center" }}>
              “Ta trace est ancrée 🎁”
            </p>

            <div
              style={{
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 8,
                opacity: 0.8,
                fontSize: 22,
                textAlign: "center",
              }}
            >
              À la prochaine (づ * _*)づ♡.
            </div>

            <RoundButton variant="primary" onClick={() => setScreen("landing")}>
              Se reconnecter à l'instant 🍀
            </RoundButton>
          </div>
        )}
      </div>
    </RootLayout>
  );
}