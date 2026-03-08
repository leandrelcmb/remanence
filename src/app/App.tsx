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
import { FlowProgress } from "./ui/FlowProgress";

// Écrans qui font partie du flux de capture
const FLOW_SCREENS: FlowScreen[] = ["setInfo", "color", "energy", "focus", "text", "capture"];

// Données préservées lors d'une édition (non modifiables)
type EditingEntry = {
  id: string;
  startTime: string;
  createdAt: string;
};

export default function App() {
  const [screen, setScreen] = useState<FlowScreen>("landing");
  const [selectedItem, setSelectedItem] = useState<JournalItem | null>(null);
  const [detailBackTarget, setDetailBackTarget] = useState<"journal" | "constellation">("journal");
  const [lastSavedColor, setLastSavedColor] = useState<string | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<LastSavedEntry | null>(null);

  // null = mode création, objet = mode édition
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);

  const { draft, setDraft, resetDraft, artistSuggestions, handlePhoto } = useDraftFlow();
  const { booting, profileReady, saveProfile, user, status, festivalId, festival, festivals, journal, refreshJournal, createFestival, switchFestival } = useJournal();
  const { haloColor, haloOpacity, haloScale, haloCenterY, latestJournalColor } = useAmbientColor({
    screen,
    draft,
    journal,
    selectedItem,
    lastSavedColor,
  });

  function startNewRemanence() {
    resetDraft();
    setSelectedItem(null);
    setEditingEntry(null);
    setScreen("setInfo");
  }

  function openDetail(item: JournalItem, from: "journal" | "constellation") {
    setSelectedItem(item);
    setDetailBackTarget(from);
    setScreen("detail");
  }

  // Pré-remplit le draft avec les données existantes et lance le flux d'édition
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
    setScreen("setInfo");
  }

  async function handleDelete(item: JournalItem) {
    if (!festivalId) return;
    await deleteJournalItem(item.id);
    await refreshJournal(festivalId);
    setScreen(detailBackTarget === "constellation" ? "constellation" : "journal");
  }

  async function finish() {
    if (!festivalId) return;

    if (editingEntry) {
      // Mode édition : mise à jour de l'entrée existante
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
      setScreen("journal");
    } else {
      // Mode création : on capture les infos du draft AVANT de le réinitialiser
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
      setScreen("done");
    }
  }

  // ── Pendant le boot initial : juste le halo, rien d'autre ──
  if (booting) {
    return (
      <RootLayout haloColor="#7B5EA7" haloOpacity={0.35} haloScale={1.1} haloCenterY={50}>
        <div />
      </RootLayout>
    );
  }

  // ── Première visite : onboarding (choix du pseudo) ──
  if (!profileReady) {
    return (
      <RootLayout haloColor="#7B5EA7" haloOpacity={0.35} haloScale={1.1} haloCenterY={50}>
        <div style={{ position: "relative", zIndex: 1, padding: 50, maxWidth: 460, margin: "0 auto" }}>
          <OnboardingScreen onSave={saveProfile} />
        </div>
      </RootLayout>
    );
  }

  const isFlowScreen = FLOW_SCREENS.includes(screen);

  return (
    <RootLayout
      haloColor={haloColor}
      haloOpacity={haloOpacity}
      haloScale={haloScale}
      haloCenterY={haloCenterY}
    >
      <div style={{ position: "relative", zIndex: 1, padding: 50, maxWidth: 460, margin: "0 auto" }}>

        {/* Header : uniquement sur la landing */}
        {screen === "landing" && (
          <div style={{ marginBottom: 25 }}>
            <h1 style={{ fontSize: 30, fontWeight: 300, margin: 0 }}>
              Pour des souvenirs uniques ✩ ♬ ₊.🎧⋆☾⋆⁺₊✧
            </h1>
            <p style={{ opacity: 0.6, marginTop: 8, fontSize: 13 }}>{status}</p>
          </div>
        )}

        {/* Indicateur de progression dans le flux de capture */}
        {isFlowScreen && <FlowProgress screen={screen} />}

        {screen === "landing" && (
          <LandingScreen
            festivalName={festival?.name ?? ""}
            onStart={startNewRemanence}
            onJournal={() => setScreen("journal")}
            onConstellation={() => setScreen("constellation")}
            onFestivalPicker={() => setScreen("festivalPicker")}
          />
        )}

        {screen === "setInfo" && (
          <SetInfoScreen
            draft={draft}
            artistSuggestions={artistSuggestions}
            onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onNext={() => setScreen("color")}
            onBack={() => setScreen("landing")}
          />
        )}

        {screen === "color" && (
          <ColorScreen
            selectedColor={draft.colorHex}
            onSelect={(c) => setDraft((d) => ({ ...d, colorHex: c }))}
            onNext={() => setScreen("energy")}
            onBack={() => setScreen("setInfo")}
          />
        )}

        {screen === "energy" && (
          <EnergyScreen
            draft={draft}
            onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onNext={() => setScreen("focus")}
            onBack={() => setScreen("color")}
          />
        )}

        {screen === "focus" && (
          <FocusScreen
            focus={draft.focus}
            onSelect={(f) => setDraft((d) => ({ ...d, focus: f }))}
            onNext={() => setScreen("text")}
            onBack={() => setScreen("energy")}
          />
        )}

        {screen === "text" && (
          <TextScreen
            feelingText={draft.feelingText}
            learningText={draft.learningText}
            onChangeDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onNext={() => setScreen("capture")}
            onBack={() => setScreen("focus")}
          />
        )}

        {screen === "capture" && (
          <CaptureScreen
            photo={draft.photo}
            onPhoto={handlePhoto}
            onClearPhoto={() => setDraft((d) => ({ ...d, photo: undefined }))}
            onFinish={finish}
            onBack={() => setScreen("text")}
          />
        )}

        {screen === "done" && (
          <DoneScreen
            lastSavedColor={lastSavedColor}
            lastSavedEntry={lastSavedEntry}
            onHome={() => setScreen("landing")}
          />
        )}

        {screen === "journal" && (
          <JournalScreen
            journal={journal}
            latestJournalColor={latestJournalColor}
            userName={user?.displayName ?? ""}
            onNewEntry={startNewRemanence}
            onSelectItem={(item) => openDetail(item, "journal")}
            onHome={() => setScreen("landing")}
          />
        )}

        {screen === "detail" && selectedItem && (
          <DetailScreen
            item={selectedItem}
            backTarget={detailBackTarget}
            onBack={() => setScreen(detailBackTarget)}
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
            onBack={() => setScreen("landing")}
          />
        )}

        {screen === "festivalPicker" && (
          <FestivalPickerScreen
            festivals={festivals}
            activeFestivalId={festivalId}
            onSwitch={(id) => { switchFestival(id); setScreen("landing"); }}
            onCreate={createFestival}
            onBack={() => setScreen("landing")}
          />
        )}
      </div>
    </RootLayout>
  );
}
