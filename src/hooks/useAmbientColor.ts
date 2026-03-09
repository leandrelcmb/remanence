import { useMemo } from "react";
import type { FlowScreen, Draft } from "../app/flow/types";
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";

export function useAmbientColor({
  screen,
  draft,
  journal,
  selectedItem,
  lastSavedColor,
}: {
  screen: FlowScreen;
  draft: Draft;
  journal: JournalItem[];
  selectedItem: JournalItem | null;
  lastSavedColor: string | null;
}) {
  const displayDraftColor = useMemo(
    () => energyTint(draft.colorHex, draft.energy),
    [draft.colorHex, draft.energy]
  );

  const latestJournalColor = useMemo(() => {
    if (journal.length === 0) return displayDraftColor;
    const latest = [...journal].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )[0];
    return energyTint(latest.colorHex, latest.energy);
  }, [journal, displayDraftColor]);

  const haloColor = useMemo(() => {
    if (screen === "detail" && selectedItem) {
      return energyTint(selectedItem.colorHex, selectedItem.energy);
    }
    if (screen === "done" && lastSavedColor) return lastSavedColor;
    if (screen === "landing" || screen === "journal" || screen === "constellation") {
      return latestJournalColor;
    }
    return displayDraftColor;
  }, [screen, selectedItem, displayDraftColor, latestJournalColor, lastSavedColor]);

  const haloOpacity = useMemo(() => {
    if (screen === "energy") return 0.18 + draft.energy * 0.028;
    if (screen === "color") return 0.45;
    if (screen === "done") return 0.38;
    if (screen === "journal") return 0.20;
    if (screen === "constellation") return 0.18;
    if (screen === "detail" && selectedItem) return 0.22 + selectedItem.energy * 0.02;
    return 0.22;
  }, [screen, draft.energy, selectedItem]);

  const haloScale = useMemo(() => {
    if (screen === "landing") return 1.1;
    if (screen === "energy") return 1 + (draft.energy / 10) * 0.5;
    if (screen === "color") return 1.35;
    if (screen === "done") return 1.25;
    if (screen === "journal") return 1.08;
    if (screen === "constellation") return 1.04;
    if (screen === "detail" && selectedItem) return 1 + (selectedItem.energy / 10) * 0.35;
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

  return { haloColor, haloOpacity, haloScale, haloCenterY, latestJournalColor };
}
