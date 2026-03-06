import { useEffect, useMemo, useState } from "react";
import { RootLayout } from "./RootLayout";
import { ensureBootstrap, createSetEntry, listJournalItems } from "../core/store/service";
import type { FlowScreen, Draft } from "./flow/types";
import type { JournalItem } from "../core/store/service";
import { softHaptic } from "./flow/haptics";
import { EnergyDots, energyColorFor } from "./ui/EnergyDots";
import { RoundButton } from "./ui/RoundButton";
import { ARTISTS } from "./data/artists";

// Palette couleurs
const RGB_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFD60A",
  "#34C759",
  "#00C7BE",
  "#0A84FF",
  "#5E5CE6",
  "#BF5AF2",
  "#FF2D55",
  "#FFFFFF",
];

const STAGES = [
  { name: "Main Stage", emoji: "🌞" },
  { name: "Dragon Nest", emoji: "🐉" },
  { name: "Chill Out Dome", emoji: "🌙" },
  { name: "Pumpui", emoji: "🪐" },
];

export default function App() {
  const [screen, setScreen] = useState<FlowScreen | "journal">("landing");
  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");

  const [journal, setJournal] = useState<JournalItem[]>([]);

  const [draft, setDraft] = useState<Draft>({
    artistName: "",
    stageName: "",
    style: "",
    energy: 7,
    focus: "body",
    colorHex: energyColorFor(7),
    feelingText: "",
    learningText: "",
  });

  const artistSuggestions = useMemo(() => {
    const value = draft.artistName.trim().toLowerCase();
    if (!value) return [];

    return ARTISTS
      .filter((a) => a.toLowerCase().includes(value))
      .filter((a) => a.toLowerCase() !== value)
      .slice(0, 5);
  }, [draft.artistName]);

  const haloOpacity = useMemo(() => {
    if (screen === "energy") return 0.12 + draft.energy * 0.02;
    if (screen === "color") return 0.28;
    if (screen === "done") return 0.22;
    if (screen === "journal") return 0.12;
    return 0.16;
  }, [screen, draft.energy]);

  const haloScale = useMemo(() => {
    if (screen === "landing") return 1.1;

    if (screen === "energy") {
      return 1 + (draft.energy / 10) * 0.5;
    }

    if (screen === "color") return 1.35;
    if (screen === "done") return 1.25;
    if (screen === "journal") return 1.08;

    return 1.15;
  }, [screen, draft.energy]);

  const haloCenterY = useMemo(() => {
    if (draft.focus === "mental") return 35;
    if (draft.focus === "emotion") return 50;
    return 65;
  }, [draft.focus]);

  const canContinueSetInfo = draft.artistName.trim().length > 0;

  useEffect(() => {
    (async () => {
      const { festival } = await ensureBootstrap();

      setFestivalId(festival.id);

      const items = await listJournalItems(festival.id);
      setJournal(items);

      setStatus(`Prêt (Festival: ${festival.name})`);
    })().catch((e) => setStatus(`Erreur: ${String(e)}`));
  }, []);

  async function finish() {
    if (!festivalId) return;

    await createSetEntry({
      festivalId,
      artistName: draft.artistName,
      style: draft.style,
      stageName: draft.stageName,
      energy: draft.energy,
      focus: draft.focus,
      colorHex: draft.colorHex,
      feelingText: draft.feelingText,
      learningText: draft.learningText,
    });

    const items = await listJournalItems(festivalId);
    setJournal(items);

    setScreen("done");
  }

  return (
    <RootLayout
      haloColor={draft.colorHex}
      haloOpacity={haloOpacity}
      haloScale={haloScale}
      haloCenterY={haloCenterY}
    >
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
              🧘 “Ancre l'instant”
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <RoundButton variant="primary" onClick={() => setScreen("setInfo")}>
                Entrer en rémanence 🌱
              </RoundButton>

              <RoundButton variant="secondary" onClick={() => setScreen("journal")}>
                Mes vibrations 💓
              </RoundButton>
            </div>
          </div>
        )}

        {/* SET INFO */}
        {screen === "setInfo" && (
          <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 20, margin: 0, textAlign: "center" }}>
              🎧 Quel set viens-tu de vivre ?
            </p>

            <input
              value={draft.artistName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, artistName: e.target.value }))
              }
              placeholder="Artiste (ex : Ott)"
              style={{
                width: "100%",
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 14,
                color: "white",
                outline: "none",
              }}
            />

            {artistSuggestions.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                }}
              >
                {artistSuggestions.map((artist) => (
                  <div
                    key={artist}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        artistName: artist,
                      }))
                    }
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {artist}
                  </div>
                ))}
              </div>
            )}

            <p style={{ opacity: 0.6, fontSize: 12 }}>
              Si tu ne sais pas : demande autour de toi. Le nom est le sceau du souvenir ✨
            </p>

            {/* STAGES DROPDOWN UNIQUEMENT */}
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ opacity: 0.72, fontSize: 13, margin: 0 }}>
                📍 Choisis une scène (optionnel)
              </p>

              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                }}
              >
                {STAGES.map((stage) => {
                  const active = draft.stageName === stage.name;

                  return (
                    <div
                      key={stage.name}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          stageName: d.stageName === stage.name ? "" : stage.name,
                        }))
                      }
                      style={{
                        padding: "12px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {stage.emoji} {stage.name}
                      </span>

                      {active ? (
                        <span style={{ opacity: 0.8, fontSize: 12 }}>✓ sélectionnée</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <p style={{ opacity: 0.55, fontSize: 12, margin: 0 }}>
                Reclique sur la scène choisie pour la retirer.
              </p>
            </div>

            <input
              value={draft.style}
              onChange={(e) =>
                setDraft((d) => ({ ...d, style: e.target.value }))
              }
              placeholder="Style (ex : psytrance / ambient)"
              style={{
                width: "100%",
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 14,
                color: "white",
                outline: "none",
              }}
            />

            <RoundButton
              variant="primary"
              disabled={!canContinueSetInfo}
              onClick={() => {
                if (!canContinueSetInfo) {
                  softHaptic();
                  return;
                }
                setScreen("energy");
              }}
            >
              Continuer 🌙
            </RoundButton>
          </div>
        )}

        {/* ENERGY */}
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
                  colorHex: energyColorFor(n),
                }))
              }
            />

            <RoundButton variant="primary" onClick={() => setScreen("focus")}>
              Je valide 🖖
            </RoundButton>
          </div>
        )}

        {/* FOCUS */}
        {screen === "focus" && (
          <div style={{ display: "grid", gap: 120, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 20, margin: 0, textAlign: "center" }}>
              🎭 Où cela s’est joué ?
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                ["mental", "🧠", "Mental"],
                ["emotion", "❤️", "Émotions"],
                ["body", "🕺", "Corps"],
              ].map(([key, emoji, label]) => {
                const active = draft.focus === key;

                return (
                  <button
                    key={key}
                    onClick={() =>
                      setDraft((d) => ({ ...d, focus: key as Draft["focus"] }))
                    }
                    style={{
                      borderRadius: 22,
                      padding: "20px",
                      border: active
                        ? "1px solid rgba(255,255,255,0.4)"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: active
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,0.05)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{emoji}</div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>{label}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("energy")}>
                  ↪️ Retour
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={() => setScreen("color")}>
                  Continuer ✨
                </RoundButton>
              </div>
            </div>
          </div>
        )}

        {/* COLOR */}
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
                  ↪️ Retour
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

        {/* TEXT */}
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
                  ↪️ Retour
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
              V1 : on fera l’upload photo plus tard. Pour l’instant, on valide la trace.
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

            <RoundButton variant="primary" onClick={() => setScreen("landing")}>
              Se reconnecter à l'instant 🍀
            </RoundButton>
          </div>
        )}

        {/* JOURNAL */}
        {screen === "journal" && (
          <div style={{ display: "grid", gap: 22, minHeight: "70dvh" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0, fontWeight: 650 }}>
                📓 Carnet de rémanence
              </h2>

              <div style={{ display: "grid", gap: 12 }}>
                <RoundButton variant="primary" onClick={() => setScreen("setInfo")}>
                  Nouvelle vibration 💓
                </RoundButton>

                <RoundButton variant="secondary" onClick={() => setScreen("landing")}>
                  Home ॐ
                </RoundButton>
              </div>
            </div>

            {journal.length === 0 && (
              <p style={{ opacity: 0.6 }}>
                Aucun souvenir enregistré pour le moment.
              </p>
            )}

            {journal.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong style={{ fontSize: 20 }}>{item.artistName}</strong>

                    <div style={{ opacity: 0.65, fontSize: 15 }}>
                      {formatTime(item.startTime)} · {item.stageName || "Scène inconnue"}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      padding: "5px 8px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {focusEmoji(item.focus)} ⚡ {item.energy}/10
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      background: item.colorHex,
                      boxShadow: `0 0 18px ${item.colorHex}88`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ opacity: 0.7, fontSize: 13 }}>
                    {item.style?.trim() ? item.style : "Style non renseigné"}
                  </div>
                </div>

                {item.feelingText?.trim() && (
                  <div
                    style={{
                      opacity: 0.88,
                      lineHeight: 1.45,
                      fontSize: 14,
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    “{item.feelingText.trim()}”
                  </div>
                )}

                {item.learningText?.trim() && (
                  <div style={{ opacity: 0.62, fontSize: 13, lineHeight: 1.4 }}>
                    🧙🏼 {item.learningText.trim()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RootLayout>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function focusEmoji(focus: "mental" | "emotion" | "body") {
  if (focus === "mental") return "🧠";
  if (focus === "emotion") return "❤️";
  return "🕺";
}