import { useState, useEffect } from "react";
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
import { RecapScreen } from "../screens/RecapScreen";
import { GamesScreen } from "../screens/GamesScreen";
import { ChasseScreen } from "../screens/ChasseScreen";
import { IntrospectionScreen } from "../screens/IntrospectionScreen";
import { TreasureScreen } from "../screens/TreasureScreen";
import { TheoriesScreen } from "../screens/TheoriesScreen";
import { SanteScreen } from "../screens/SanteScreen";
import { ComingSoonScreen } from "../screens/ComingSoonScreen";
import type { ChasseType, ChasseActiveSession } from "../core/models/chasseTypes";
import { getActiveChasse, clearActiveChasse } from "../core/store/repo";
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
  const [fadingOut, setFadingOut] = useState(false);
  const [haloFilter, setHaloFilter] = useState("brightness(1)");
  const [haloFilterTransition, setHaloFilterTransition] = useState("filter 1.5s ease-in-out");

  // null = mode création, objet = mode édition
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);

  // true = parcours raccourci (capture → setInfo → color → energy → focus → done)
  const [expressMode, setExpressMode] = useState(false);

  // Type de chasse sélectionné depuis GamesScreen
  const [chasseType, setChasseType] = useState<ChasseType>("chromatic");

  // Session de chasse active (persistée dans IndexedDB)
  const [activeChasse, setActiveChasse] = useState<ChasseActiveSession | null>(null);

  const { draft, setDraft, resetDraft, artistSuggestions, handlePhoto } = useDraftFlow();
  const { booting, profileReady, saveProfile, user, festivalId, festival, festivals, journal, refreshJournal, createFestival, switchFestival } = useJournal();
  const { haloColor, haloOpacity, haloScale, haloCenterY, latestJournalColor } = useAmbientColor({
    screen,
    draft,
    journal,
    selectedItem,
    lastSavedColor,
  });

  // Charger la session de chasse active au montage
  useEffect(() => {
    getActiveChasse().then((s) => {
      if (s && s.timerExpiresAt > Date.now()) {
        setActiveChasse(s);
      } else if (s) {
        clearActiveChasse(); // expirée → nettoyer silencieusement
      }
    });
  }, []);

  /** Navigation avec direction d'animation */
  function navigate(target: FlowScreen, dir: AnimDir = "neutral") {
    setAnimDir(dir);
    setScreen(target);
  }

  /** Navigation avec cross-fade + flambée du halo — pour les CTA principaux */
  function navigateWithFlare(target: FlowScreen, dir: AnimDir = "flare") {
    // Spike instantané : saturate + brightness pour garder la couleur vivante (pas de blanc)
    setHaloFilterTransition("filter 0.08s ease");
    setHaloFilter("saturate(2.5) brightness(2.0)");
    setTransitioning(true); // scale boost
    setFadingOut(true);     // écran courant s'efface (0.55s)
    setTimeout(() => {
      setFadingOut(false);
      navigate(target, dir); // nouvel écran apparaît en bloom (0.75s)
      // Fade-back long et doux : léger au début, effilochement à la fin
      setHaloFilterTransition("filter 2.5s ease-in-out");
      setHaloFilter("brightness(1)");
      setTimeout(() => setTransitioning(false), 900);
    }, 550);
  }

  function startNewRemanence(express = false) {
    resetDraft();
    setSelectedItem(null);
    setEditingEntry(null);
    setExpressMode(express);
    navigateWithFlare("capture"); // "flare" par défaut → bloom cinématique
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

  // Scale boost pendant la transition (le brightness est géré via filter dans Halo)
  const effectiveScale = transitioning ? haloScale * 1.6 : haloScale;

  return (
    <RootLayout
      haloColor={haloColor}
      haloOpacity={haloOpacity}
      haloScale={effectiveScale}
      haloCenterY={haloCenterY}
      haloFilter={haloFilter}
      haloFilterTransition={haloFilterTransition}
    >
      {/* Journal : pleine largeur (pas de padding horizontal) */}
      <div style={{ position: "relative", zIndex: 1, padding: (screen === "journal" || screen === "contacts" || screen === "recap" || screen === "games" || screen === "introspection" || screen === "treasure" || screen === "theories" || screen === "sante" || screen === "chasse" || screen === "comingSoon") ? 0 : "40px 12px" }}>

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
        {/* Le div extérieur porte le fade-out (cross-fade) ; ScreenTransition porte le fade-in */}
        <div style={{ animation: fadingOut ? "screenFadeOut 0.55s ease-in-out both" : undefined }}>
        <ScreenTransition screenKey={screen} direction={animDir}>

          {screen === "landing" && (
            <LandingScreen
              festivalName={festival?.name ?? ""}
              haloColor={haloColor}
              onStart={() => startNewRemanence(false)}
              onExpressStart={() => startNewRemanence(true)}
              onJournal={() => navigate("journal", "forward")}
              onConstellation={() => navigateWithFlare("constellation", "forward")}
              onFestivalPicker={() => navigate("festivalPicker", "forward")}
              onContacts={() => navigate("contacts", "forward")}
              onGames={() => navigate("games", "forward")}
              onSante={() => navigate("sante", "forward")}
              activeChasse={activeChasse ? {
                chasseType: activeChasse.chasseType,
                timerExpiresAt: activeChasse.timerExpiresAt,
                resultLabel: activeChasse.result.label,
                resultColor: activeChasse.result.color,
                resultIcon: activeChasse.result.icon,
              } : undefined}
              onResumeChasse={() => {
                if (!activeChasse) return;
                setChasseType(activeChasse.chasseType);
                navigate("chasse", "forward");
              }}
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
              onRecap={() => navigate("recap", "forward")}
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

          {screen === "recap" && (
            <RecapScreen
              journal={journal}
              festival={festival}
              user={user}
              festivalId={festivalId ?? ""}
              onBack={() => navigate("landing", "backward")}
            />
          )}

          {screen === "games" && (
            <GamesScreen
              onBack={() => navigate("landing", "backward")}
              onChasse={(type) => { setChasseType(type); navigate("chasse", "forward"); }}
              onIntrospection={() => navigate("introspection", "forward")}
              onTreasure={() => navigate("treasure", "forward")}
              onTheories={() => navigate("theories", "forward")}
              onComingSoon={() => navigate("comingSoon", "forward")}
            />
          )}

          {screen === "introspection" && (
            <IntrospectionScreen onBack={() => navigate("games", "backward")} />
          )}

          {screen === "treasure" && (
            <TreasureScreen onBack={() => navigate("games", "backward")} />
          )}

          {screen === "theories" && (
            <TheoriesScreen onBack={() => navigate("games", "backward")} />
          )}

          {screen === "chasse" && (
            <ChasseScreen
              chasseType={chasseType}
              resumeSession={activeChasse ?? undefined}
              onBack={() => {
                // Rafraîchir l'état de la session active après annulation/sauvegarde
                setActiveChasse(null);
                getActiveChasse().then((s) =>
                  setActiveChasse(s && s.timerExpiresAt > Date.now() ? s : null)
                );
                navigate("games", "backward");
              }}
            />
          )}

          {screen === "sante" && (
            <SanteScreen onBack={() => navigate("landing", "backward")} />
          )}

          {screen === "comingSoon" && (
            <ComingSoonScreen onBack={() => navigate("games", "backward")} />
          )}

        </ScreenTransition>
        </div>
      </div>
    </RootLayout>
  );
}
