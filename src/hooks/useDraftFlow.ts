import { type ChangeEvent, useMemo, useState } from "react";
import type { Draft } from "../app/flow/types";
import { ARTISTS } from "../app/data/artists";

function createEmptyDraft(): Draft {
  return {
    artistName: "",
    stageName: "",
    style: "",
    ephemeral: false,
    energy: 5,
    focus: null,
    colorHex: "#5E5CE6",
    feelingText: "",
    learningText: "",
    photo: undefined,
    photoTime: undefined,
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

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>, source: "camera" | "gallery") {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      let photoTime: string | undefined;

      if (source === "gallery") {
        try {
          const exifr = await import("exifr");
          const exif = await exifr.parse(file, ["DateTimeOriginal"]);
          if (exif?.DateTimeOriginal instanceof Date) {
            photoTime = exif.DateTimeOriginal.toISOString();
          }
        } catch {
          // Pas d'EXIF ou parse échoué → photoTime reste undefined → nowISO() au save
        }
      }

      setDraft((d) => ({ ...d, photo: reader.result as string, photoTime }));
    };
    reader.readAsDataURL(file);
  }

  const handleCameraPhoto = (e: ChangeEvent<HTMLInputElement>) => handlePhoto(e, "camera");
  const handleGalleryPhoto = (e: ChangeEvent<HTMLInputElement>) => handlePhoto(e, "gallery");

  return { draft, setDraft, resetDraft, artistSuggestions, handleCameraPhoto, handleGalleryPhoto };
}
