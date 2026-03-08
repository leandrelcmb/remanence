import { type ChangeEvent, useMemo, useState } from "react";
import type { Draft } from "../app/flow/types";
import { ARTISTS } from "../app/data/artists";

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

export function useDraftFlow() {
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

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((d) => ({ ...d, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  return { draft, setDraft, resetDraft, artistSuggestions, handlePhoto };
}
