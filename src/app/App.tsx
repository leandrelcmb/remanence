import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { RootLayout } from "./RootLayout";
import { ensureBootstrap, createSetEntry, listJournalItems } from "../core/store/service";
import type { FlowScreen, Draft } from "./flow/types";
import type { JournalItem } from "../core/store/service";
import { softHaptic } from "./flow/haptics";
import { EnergyDots, energyTint } from "./ui/EnergyDots";
import { RoundButton } from "./ui/RoundButton";
import { ARTISTS } from "./data/artists";

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
  { name: "Pumpui", emoji: "🎪" },
];

type ExtraScreen = "detail" | "constellation";
type DetailBackTarget = "journal" | "constellation";

function createEmptyDraft(): Draft {
  return {
    artistName: "",
    stageName: "",
    style: "",
    energy: 5,
    focus: "body",
    colorHex: "#5E5CE6",
    feelingText: "",
    learningText: "",
    photo: undefined,
  };
}

export default function App() {
  const [screen, setScreen] = useState<FlowScreen | ExtraScreen>("landing");
  const [detailBackTarget, setDetailBackTarget] = useState<DetailBackTarget>("journal");

  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");

  const [journal, setJournal] = useState<JournalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<JournalItem | null>(null);

const [lastSavedColor, setLastSavedColor] = useState<string | null>(null);

const [constellationZoom, setConstellationZoom] = useState(1);
const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);

  const [draft, setDraft] = useState<Draft>(createEmptyDraft());

  const artistSuggestions = useMemo(() => {
    const value = draft.artistName.trim().toLowerCase();
    if (!value) return [];

    return ARTISTS
      .filter((a) => a.toLowerCase().includes(value))
      .filter((a) => a.toLowerCase() !== value)
      .slice(0, 5);
  }, [draft.artistName]);

  function resetDraft() {
    setDraft(createEmptyDraft());
  }

  function startNewRemanence() {
    resetDraft();
    setSelectedItem(null);
    setScreen("setInfo");
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    setDraft((d) => ({
      ...d,
      photo: reader.result as string,
    }));
  };

  reader.readAsDataURL(file);
}

function handleConstellationTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
  if (e.touches.length !== 2) return;

  pinchStartRef.current = {
    distance: getTouchDistance(e.touches),
    zoom: constellationZoom,
  };
}

function handleConstellationTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
  if (e.touches.length !== 2 || !pinchStartRef.current) return;

  e.preventDefault();

  const currentDistance = getTouchDistance(e.touches);
  if (!currentDistance) return;

  const nextZoom =
    pinchStartRef.current.zoom *
    (currentDistance / pinchStartRef.current.distance);

  setConstellationZoom(clamp(nextZoom, 1, 3));
}

function handleConstellationTouchEnd() {
  pinchStartRef.current = null;
}

  const displayDraftColor = useMemo(() => {
    return energyTint(draft.colorHex, draft.energy);
  }, [draft.colorHex, draft.energy]);

const latestJournalColor = useMemo(() => {
  if (journal.length === 0) return displayDraftColor;

  const latest = [...journal].sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0];

  return energyTint(latest.colorHex, latest.energy);
}, [journal, displayDraftColor]);

  const constellationBounds = useMemo(() => {
    if (journal.length === 0) return null;

    const times = journal.map((item) => new Date(item.startTime).getTime());
    return {
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }, [journal]);

  const constellationStars = useMemo(() => {
    return journal.map((item, index) => {
      const displayColor = energyTint(item.colorHex, item.energy);
      const x = 8 + ((item.energy - 1) / 9) * 84;

      const time = new Date(item.startTime).getTime();

      let y = 50;
      if (constellationBounds && constellationBounds.max !== constellationBounds.min) {
        const ratio =
          (time - constellationBounds.min) /
          (constellationBounds.max - constellationBounds.min);

        y = 92 - ratio * 84;
      }

      const wobbleX = ((index % 3) - 1) * 2.2;
      const wobbleY = ((index % 4) - 1.5) * 1.8;
      const starSize = 16 + item.energy * 1.35;
      const glowSize = 18 + item.energy * 2.8;

      return {
        item,
        displayColor,
        x: x + wobbleX,
        y: y + wobbleY,
        starSize,
        glowSize,
      };
    });
  }, [journal, constellationBounds]);

  const constellationLinks = useMemo(() => {
    const links: Array<{
      a: (typeof constellationStars)[number];
      b: (typeof constellationStars)[number];
      opacity: number;
      duration: number;
    }> = [];

    for (let i = 0; i < constellationStars.length; i++) {
      for (let j = i + 1; j < constellationStars.length; j++) {
        const a = constellationStars[i];
        const b = constellationStars[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 18;

        if (distance < maxDistance) {
          const ratio = 1 - distance / maxDistance;
          const opacity = 0.03 + ratio * 0.24;
          const duration = 3.4 + ((i + j) % 4) * 0.7;

          links.push({ a, b, opacity, duration });
        }
      }
    }

    return links;
  }, [constellationStars]);

  const haloOpacity = useMemo(() => {
    if (screen === "energy") return 0.12 + draft.energy * 0.02;
    if (screen === "color") return 0.28;
    if (screen === "done") return 0.22;
    if (screen === "journal") return 0.12;
    if (screen === "constellation") return 0.1;
    if (screen === "detail" && selectedItem) {
      return 0.16 + selectedItem.energy * 0.015;
    }
    return 0.16;
  }, [screen, draft.energy, selectedItem]);

  const haloScale = useMemo(() => {
    if (screen === "landing") return 1.1;

    if (screen === "energy") {
      return 1 + (draft.energy / 10) * 0.5;
    }

    if (screen === "color") return 1.35;
    if (screen === "done") return 1.25;
    if (screen === "journal") return 1.08;
    if (screen === "constellation") return 1.04;
    if (screen === "detail" && selectedItem) {
      return 1 + (selectedItem.energy / 10) * 0.35;
    }

    return 1.15;
  }, [screen, draft.energy, selectedItem]);

  const haloCenterY = useMemo(() => {
    if (screen === "detail" && selectedItem) {
      if (selectedItem.focus === "mental") return 35;
      if (selectedItem.focus === "emotion") return 50;
      return 65;
    }

    if (draft.focus === "mental") return 35;
    if (draft.focus === "emotion") return 50;
    return 65;
  }, [screen, draft.focus, selectedItem]);

  const haloColor = useMemo(() => {
  if (screen === "detail" && selectedItem) {
    return energyTint(selectedItem.colorHex, selectedItem.energy);
  }

  if (screen === "done" && lastSavedColor) {
    return lastSavedColor;
  }

  if (
    screen === "landing" ||
    screen === "journal" ||
    screen === "constellation"
  ) {
    return latestJournalColor;
  }

  return displayDraftColor;
}, [screen, selectedItem, displayDraftColor, latestJournalColor, lastSavedColor]);

  const canContinueSetInfo = draft.artistName.trim().length > 0;

  const constellationCss = `
    @keyframes starPulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.82;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.16);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.82;
      }
    }

    @keyframes linkBreath {
      0% {
        opacity: 0.45;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.45;
      }
    }
  `;

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
      photo: draft.photo,
    });

    const items = await listJournalItems(festivalId);
setJournal(items);

setLastSavedColor(energyTint(draft.colorHex, draft.energy));
resetDraft();
setScreen("done");
  }

  return (
    <RootLayout
      haloColor={haloColor}
      haloOpacity={haloOpacity}
      haloScale={haloScale}
      haloCenterY={haloCenterY}
    >
      <style>{constellationCss}</style>

{screen === "journal" && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: latestJournalColor,
      opacity: 0.12,
      pointerEvents: "none",
      zIndex: 0,
    }}
  />
)}

<div
  style={{
    position: "relative",
    zIndex: 1,
    padding: 50,
    maxWidth: 460,
    margin: "0 auto",
  }}
>
        <div style={{ marginBottom: 25 }}>
          <h1 style={{ fontSize: 30, fontWeight: 300, margin: 0 }}>
            Pour des souvenirs uniques ✩ ♬ ₊.🎧⋆☾⋆⁺₊✧
          </h1>
          <p style={{ opacity: 0.6, marginTop: 8, fontSize: 13 }}>{status}</p>
        </div>

        {screen === "landing" && (
          <div style={{ display: "grid", gap: 60, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
              🧘 “Ancre l'instant”
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <RoundButton variant="primary" onClick={startNewRemanence}>
                Entrer en rémanence 🌱
              </RoundButton>

              <RoundButton variant="secondary" onClick={() => setScreen("journal")}>
                Vibrations 💓
              </RoundButton>

              <RoundButton
  variant="secondary"
  onClick={() => {
    setConstellationZoom(1);
    setScreen("constellation");
  }}
>
  Constellations ✨
</RoundButton>
            </div>
          </div>
        )}

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
              placeholder="Artiste (ex : Astrix)"
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

            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ opacity: 0.72, fontSize: 13, margin: 0 }}>
                📍 Choisis une scène
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
                setScreen("color");
              }}
            >
              Valider ✔️
            </RoundButton>
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
        <RoundButton variant="secondary" onClick={() => setScreen("setInfo")}>
          ↪️ Retour
        </RoundButton>
      </div>
      <div style={{ flex: 1 }}>
        <RoundButton variant="primary" onClick={() => setScreen("energy")}>
          Je valide 🖖
        </RoundButton>
      </div>
    </div>
  </div>
)}

        {screen === "energy" && (
          <div style={{ display: "grid", gap: 20, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 18, margin: 0, textAlign: "center" }}>
              ⚡ Intensité
            </p>

            <EnergyDots
              value={draft.energy}
              color={draft.colorHex}
              onChange={(n) =>
                setDraft((d) => ({
                  ...d,
                  energy: n,
                }))
              }
            />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setScreen("color")}>
                  ↪️ Retour
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
                <RoundButton variant="primary" onClick={() => setScreen("text")}>
                  Continuer ✨
                </RoundButton>
              </div>
            </div>
          </div>
        )}

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
                <RoundButton variant="secondary" onClick={() => setScreen("focus")}>
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

        {screen === "capture" && (
          <div style={{ display: "grid", gap: 18, minHeight: "70dvh", alignContent: "center" }}>
            <p style={{ opacity: 0.86, fontSize: 25, margin: 0, textAlign: "center" }}>
              Capture du moment 📸
            </p>

            {!draft.photo && (
              <label
                style={{
                  padding: "80px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontSize: 45, margin: 0, textAlign: "center" }}>
                  📤
                </p>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhoto}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {draft.photo && (
              <>
                <img
                  src={draft.photo}
                  alt="Capture du moment"
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />

                <RoundButton
                  variant="secondary"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      photo: undefined,
                    }))
                  }
                >
                  🔄
                </RoundButton>
              </>
            )}

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

        {screen === "done" && (
  <div style={{ display: "grid", gap: 36, minHeight: "70dvh", alignContent: "center" }}>
    <p
      style={{
        opacity: 0.92,
        fontSize: 34,
        margin: 0,
        textAlign: "center",
        color: lastSavedColor ?? "white",
        textShadow: lastSavedColor ? `0 0 24px ${lastSavedColor}66` : "none",
      }}
    >
      “Ta trace est ancrée 🎁”
    </p>

    <div
      style={{
        borderRadius: 20,
        padding: 18,
        textAlign: "center",
        background: lastSavedColor ? `${lastSavedColor}18` : "rgba(255,255,255,0.05)",
        border: lastSavedColor
          ? `1px solid ${lastSavedColor}44`
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: lastSavedColor ? `0 0 30px ${lastSavedColor}22` : "none",
        color: "white",
        opacity: 0.9,
      }}
    >
      Le souvenir a rejoint ta constellation ✨
    </div>

    <RoundButton variant="primary" onClick={() => setScreen("landing")}>
      Se reconnecter à l'instant 🍀
    </RoundButton>
  </div>
)}

        {screen === "journal" && (
  <div style={{ display: "grid", gap: 22, minHeight: "70dvh" }}>
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, fontWeight: 650 }}>
        📓 Carnet de rémanence
      </h2>

      <div style={{ display: "grid", gap: 12 }}>
        <RoundButton variant="primary" onClick={startNewRemanence}>
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

    {journal.map((item) => {
      const itemDisplayColor = energyTint(item.colorHex, item.energy);

      return (
        <div
          key={item.id}
          onClick={() => {
            setSelectedItem(item);
            setDetailBackTarget("journal");
            setScreen("detail");
          }}
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "grid",
            gap: 10,
            cursor: "pointer",
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
                background: itemDisplayColor,
                boxShadow: `0 0 18px ${itemDisplayColor}88`,
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
      );
    })}
  </div>
)}

        {screen === "constellation" && (
          <div style={{ display: "grid", gap: 20, minHeight: "70dvh" }}>
            <h2 style={{ margin: 0 }}>
              ✨ Ta constellation personnalisée
            </h2>

            <div
  onTouchStart={handleConstellationTouchStart}
  onTouchMove={handleConstellationTouchMove}
  onTouchEnd={handleConstellationTouchEnd}
  onTouchCancel={handleConstellationTouchEnd}
  style={{
    position: "relative",
    height: 500,
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundImage:
      "linear-gradient(rgba(7,0,20,0.55), rgba(7,0,20,0.78)), url('/images/space-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "rgba(255,255,255,0.03)",
    touchAction: "none",
  }}
>
              {journal.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    opacity: 0.6,
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  Ta constellation apparaîtra ici après tes premiers souvenirs ✨
                </div>
              )}

              <div
  style={{
    position: "absolute",
    inset: 0,
    transform: `scale(${constellationZoom})`,
    transformOrigin: "center center",
    transition: pinchStartRef.current ? "none" : "transform 0.18s ease-out",
  }}
>
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
  >
    {constellationLinks.map((link, index) => (
      <line
        key={`${link.a.item.id}-${link.b.item.id}-${index}`}
        x1={link.a.x}
        y1={link.a.y}
        x2={link.b.x}
        y2={link.b.y}
        stroke={link.a.displayColor}
        strokeOpacity={link.opacity}
        strokeWidth="0.22"
        style={{
          animation: `linkBreath ${link.duration}s ease-in-out infinite`,
        }}
      />
    ))}
  </svg>

  {constellationStars.map((star) => (
    <div
      key={star.item.id}
      onClick={() => {
        setSelectedItem(star.item);
        setDetailBackTarget("constellation");
        setScreen("detail");
      }}
      style={{
        position: "absolute",
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: "translate(-50%, -50%)",
        color: star.displayColor,
        fontSize: star.starSize,
        lineHeight: 1,
        textShadow: `0 0 ${star.glowSize}px ${star.displayColor}, 0 0 ${
          star.glowSize * 1.7
        }px ${star.displayColor}`,
        cursor: "pointer",
        userSelect: "none",
        animation: `starPulse ${2.6 - star.item.energy * 0.12}s ease-in-out infinite`,
        filter: `drop-shadow(0 0 ${Math.max(
          6,
          star.item.energy * 1.4
        )}px ${star.displayColor})`,
      }}
      title={`${star.item.artistName} · ${formatTime(star.item.startTime)}`}
    >
      ✦
    </div>
  ))}
</div>
            </div>

            <RoundButton variant="secondary" onClick={() => setScreen("landing")}>
              Home ॐ
            </RoundButton>
          </div>
        )}

        {screen === "detail" && selectedItem && (
          <div style={{ display: "grid", gap: 30, minHeight: "70dvh", alignContent: "center" }}>
            <div style={{ display: "grid", gap: 6, textAlign: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 600 }}>
                {selectedItem.artistName}
              </h2>

              <div style={{ opacity: 0.6 }}>
                {formatTime(selectedItem.startTime)} · {selectedItem.stageName || "Scène inconnue"}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                padding: 18,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "grid",
                gap: 16,
              }}
            >
              {selectedItem.photo && (
                <img
                  src={selectedItem.photo}
                  alt="Souvenir du moment"
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    marginBottom: 10,
                  }}
                />
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{focusEmoji(selectedItem.focus)}</span>
                <span>⚡ {selectedItem.energy}/10</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: energyTint(selectedItem.colorHex, selectedItem.energy),
                    boxShadow: `0 0 18px ${energyTint(selectedItem.colorHex, selectedItem.energy)}`,
                  }}
                />
                <span>{selectedItem.style?.trim() ? selectedItem.style : "Style inconnu"}</span>
              </div>

              {selectedItem.feelingText?.trim() && (
                <div style={{ opacity: 0.88, lineHeight: 1.5 }}>
                  “{selectedItem.feelingText.trim()}”
                </div>
              )}

              {selectedItem.learningText?.trim() && (
                <div style={{ opacity: 0.62, lineHeight: 1.45 }}>
                  🧙 {selectedItem.learningText.trim()}
                </div>
              )}
            </div>

            <RoundButton
              variant="secondary"
              onClick={() => setScreen(detailBackTarget)}
            >
              {detailBackTarget === "constellation" ? "Retour à la constellation ✨" : "Retour au carnet 📓"}
            </RoundButton>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
 
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTouchDistance(touches: ReactTouchEvent<HTMLDivElement>["touches"]) {
  if (touches.length < 2) return 0;

  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;

  return Math.sqrt(dx * dx + dy * dy);
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