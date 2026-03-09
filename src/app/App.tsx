import { useState } from "react";
import { RootLayout } from "./RootLayout";
import { createSetEntry, updateJournalItem, deleteJournalItem } from "../core/store/service";
import type { JournalItem } from "../core/store/service";
import { energyTint } from "./ui/EnergyDots";
import type { FlowScreen } from "./flow/types";

import { useJournal } from "../hooks/useJournal";
import { useDraftFlow } from "../hooks/useDraftFlow";
import { useAmbientColor } from "../hooks/useAmbientColor";

import { LandingScreen } from "../screens/LandingScreen";
import { SetInfoScreen } from "../screens/SetInfoScreen";
import { ColorScreen } from "../screens/ColorScreen";
import { EnergyScreen } from "../screens/EnergyScreen";
import { FocusScreen } from "../screens/FocusScreen";
import { TextScreen } from "../screens/TextScreen";
import { CaptureScreen } from "../screens/CaptureScreen";
import { DoneScreen } from "../screens/DoneScreen";
import type { LastSavedEntry } from "../screens/DoneScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { ConstellationScreen } from "../screens/ConstellationScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { FestivalPickerScreen } from "../screens/FestivalPickerScreen";
import { ContactsScreen } from "../screens/ContactsScreen";
import { FlowProgress } from "./ui/FlowProgress";
import { ScreenTransition } from "./ui/ScreenTransition";
import type { AnimDir } from "./ui/ScreenTransition";

const FULL_FLOW_SCREENS: FlowScreen[]    = ["capture", "setInfo", "color", "energy", "focus", "text"];
const EXPRESS_FLOW_SCREENS: FlowScreen[] = ["capture", "setInfo", "color", "energy", "focus"];

// Données préservées lors d'une édition (non modifiables)
type EditingEntry = {
  id: string;
  startTime: string;
  createdAt: string;
};

export default function App() {
  const [screen, setScreen] = useState<FlowScreen>("landing");
  const [animDir, setAnimDir] = useState<AnimDir>("neutral");
  const [selectedItem, setSelectedItem] = useState<JournalItem | null>(null);
  const [detailBackTarget, setDetailBackTarget] = useState<"journal" | "constellation">("journal");
  const [lastSavedColor, setLastSavedColor] = useState<string | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<LastSavedEntry | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // null = mode création, objet = mode édition
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);

  // true = parcours raccourci (capture → setInfo → color → energy → focus → done)
  const [expressMode, setExpressMode] = useState(false);

  const { draft, setDraft, resetDraft, artistSuggestions, handlePhoto } = useDraftFlow();
  const { booting, profileReady, saveProfile, user, festivalId, festival, festivals, journal, refreshJournal, createFestival, switchFestival } = useJournal();
  const { haloColor, haloOpacity, haloScale, haloCenterY, latestJournalColor } = useAmbientColor({
    screen,
    draft,
    journal,
    selectedItem,
    lastSavedColor,
  });

  /** Navigation avec direction d'animation */
  function navigate(target: FlowScreen, dir: AnimDir = "neutral") {
    setAnimDir(dir);
    setScreen(target);
  }

  /** Navigation avec flambée du halo (200ms) — pour les CTA principaux */
  function navigateWithFlare(target: FlowScreen, dir: AnimDir = "forward") {
    setTransitioning(true);
    setTimeout(() => {
      navigate(target, dir);
      setTimeout(() => setTransitioning(false), 500);
    }, 220);
  }

  function startNewRemanence(express = false) {
    resetDraft();
    setSelectedItem(null);
    setEditingEntry(null);
    setExpressMode(express);
    navigateWithFlare("capture", "forward");
  }

  function openDetail(item: JournalItem, from: "journal" | "constellation") {
    setSelectedItem(item);
    setDetailBackTarget(from);
    navigate("detail", "forward");
  }

  function startEditing(item: JournalItem) {
    setDraft({
      artistName: item.artistName,
      stageName: item.stageName,
      style: item.style ?? "",
      energy: item.energy,
      focus: item.focus,
      colorHex: item.colorHex,
      feelingText: item.feelingText,
      learningText: item.learningText,
      photo: item.photo,
    });
    setEditingEntry({
      id: item.id,
      startTime: item.startTime,
      createdAt: item.createdAt,
    });
    navigate("setInfo", "forward");
  }

  async function handleDelete(item: JournalItem) {
    if (!festivalId) return;
    await deleteJournalItem(item.id);
    await refreshJournal(festivalId);
    navigate(detailBackTarget === "constellation" ? "constellation" : "journal", "backward");
  }

  async function finish() {
    if (!festivalId) return;

    if (editingEntry) {
      await updateJournalItem({
        id: editingEntry.id,
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
        originalStartTime: editingEntry.startTime,
        originalCreatedAt: editingEntry.createdAt,
      });

      await refreshJournal(festivalId);
      setEditingEntry(null);
      resetDraft();
      navigate("journal", "forward");
    } else {
      // On capture les infos AVANT de réinitialiser le draft
      const savedColor = energyTint(draft.colorHex, draft.energy);
      const savedEntry: LastSavedEntry = {
        artistName: draft.artistName,
        stageName: draft.stageName,
        energy: draft.energy,
        colorHex: draft.colorHex,
        focus: draft.focus,
        photo: draft.photo,
      };

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

      await refreshJournal(festivalId);
      setLastSavedColor(savedColor);
      setLastSavedEntry(savedEntry);
      resetDraft();
      navigate("done", "forward");
    }
  }

  // ── Pendant le boot initial : juste le halo ──
  if (booting) {
    return (
      <RootLayout haloColor="#7B5EA7" haloOpacity={0.35} haloScale={1.1} haloCenterY={50}>
        <div />
      </RootLayout>
    );
  }

  // ── Première visite : onboarding ──
  if (!profileReady) {
    return (
      <RootLayout haloColor="#7B5EA7" haloOpacity={0.35} haloScale={1.1} haloCenterY={50}>
        <div style={{ position: "relative", zIndex: 1, padding: "40px 12px" }}>
          <ScreenTransition screenKey="onboarding" direction="neutral">
            <OnboardingScreen onSave={saveProfile} />
          </ScreenTransition>
        </div>
      </RootLayout>
    );
  }

  const flowScreens = expressMode ? EXPRESS_FLOW_SCREENS : FULL_FLOW_SCREENS;
  const isFlowScreen = flowScreens.includes(screen);

  // Boost d'opacité + scale pendant la transition (flambée du halo)
  const effectiveOpacity = transitioning ? Math.min(0.9, haloOpacity * 3.2) : haloOpacity;
  const effectiveScale   = transitioning ? haloScale * 1.4 : haloScale;

  return (
    <RootLayout
      haloColor={haloColor}
      haloOpacity={effectiveOpacity}
      haloScale={effectiveScale}
      haloCenterY={haloCenterY}
    >
      {/* Journal : pleine largeur (pas de padding horizontal) */}
      <div style={{ position: "relative", zIndex: 1, padding: screen === "journal" ? 0 : "40px 12px" }}>

        {/* Header : uniquement sur la landing */}
        {screen === "landing" && (
          <div style={{ marginBottom: 25 }}>
            <h1 style={{ fontSize: 20, fontWeight: 300, margin: 0 }}>
              Pour des souvenirs uniques ♫⋆｡♪ ₊˚♬ ﾟ.
            </h1>
          </div>
        )}

        {/* Indicateur de progression dans le flux de capture */}
        {isFlowScreen && <FlowProgress screen={screen} express={expressMode} />}

        {/* ── Écran actif avec animation ── */}
        <ScreenTransition screenKey={screen} direction={animDir}>

          {screen === "landing" && (
            <LandingScreen
              festivalName={festival?.name ?? ""}
              onStart={() => startNewRemanence(false)}
              onExpressStart={() => startNewRemanence(true)}
              onJournal={() => navigate("journal", "forward")}
              onConstellation={() => navigateWithFlare("constellation", "forward")}
              onFestivalPicker={() => navigate("festivalPicker", "forward")}
              onContacts={() => navigate("contacts", "forward")}
            />
          )}

          {screen === "setInfo" && (
            <SetInfoScreen
              draft={draft}
              artistSuggestions={artistSuggestions}
              onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              onNext={() => navigate("color", "forward")}
              onBack={() => editingEntry ? navigate("detail", "backward") : navigate("capture", "backward")}
            />
          )}

          {screen === "color" && (
            <ColorScreen
              selectedColor={draft.colorHex}
              onSelect={(c) => setDraft((d) => ({ ...d, colorHex: c }))}
              onNext={() => navigate("energy", "forward")}
              onBack={() => navigate("setInfo", "backward")}
            />
          )}

          {screen === "energy" && (
            <EnergyScreen
              draft={draft}
              onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              onNext={() => navigate("focus", "forward")}
              onBack={() => navigate("color", "backward")}
            />
          )}

          {screen === "focus" && (
            <FocusScreen
              focus={draft.focus}
              onSelect={(f) => setDraft((d) => ({ ...d, focus: f }))}
              onNext={() => expressMode ? finish() : navigate("text", "forward")}
              onBack={() => navigate("energy", "backward")}
            />
          )}

          {screen === "text" && (
            <TextScreen
              feelingText={draft.feelingText}
              learningText={draft.learningText}
              onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              onNext={finish}
              onBack={() => navigate("focus", "backward")}
            />
          )}

          {screen === "capture" && (
            <CaptureScreen
              photo={draft.photo}
              onPhoto={handlePhoto}
              onClearPhoto={() => setDraft((d) => ({ ...d, photo: undefined }))}
              onFinish={() => navigate("setInfo", "forward")}
              onBack={() => navigate("landing", "backward")}
            />
          )}

          {screen === "done" && (
            <DoneScreen
              lastSavedColor={lastSavedColor}
              lastSavedEntry={lastSavedEntry}
              onHome={() => navigate("landing", "neutral")}
            />
          )}

          {screen === "journal" && (
            <JournalScreen
              journal={journal}
              latestJournalColor={latestJournalColor}
              userName={user?.displayName ?? ""}
              festivalId={festivalId ?? ""}
              onNewEntry={startNewRemanence}
              onSelectItem={(item) => openDetail(item, "journal")}
              onHome={() => navigate("landing", "backward")}
              onSavePseudo={saveProfile}
            />
          )}

          {screen === "detail" && selectedItem && (
            <DetailScreen
              item={selectedItem}
              backTarget={detailBackTarget}
              onBack={() => navigate(detailBackTarget, "backward")}
              onEdit={startEditing}
              onDelete={handleDelete}
            />
          )}

          {screen === "constellation" && (
            <ConstellationScreen
              journal={journal}
              festivalStart={festival?.startDate ?? ""}
              festivalEnd={festival?.endDate ?? ""}
              onSelectStar={(item) => openDetail(item, "constellation")}
              onBack={() => navigate("landing", "backward")}
            />
          )}

          {screen === "festivalPicker" && (
            <FestivalPickerScreen
              festivals={festivals}
              activeFestivalId={festivalId}
              onSwitch={(id) => { switchFestival(id); navigate("landing", "backward"); }}
              onCreate={createFestival}
              onBack={() => navigate("landing", "backward")}
            />
          )}

          {screen === "contacts" && (
            <ContactsScreen
              festivalId={festivalId ?? ""}
              festivalName={festival?.name ?? ""}
              onBack={() => navigate("landing", "backward")}
            />
          )}

        </ScreenTransition>
      </div>
    </RootLayout>
  );
}
