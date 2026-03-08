import type { Artist, Festival, SetEntry, UUID, FocusType } from "../models/types";
import { clampInt, nowISO, uuid } from "../models/utils";
import {
  addFestival,
  getActiveFestivalId,
  getFestival,
  getUserProfile,
  putUserProfile,
  setActiveFestivalId,
  upsertArtist,
  listArtistsByFestival,
  addSetEntry,
  listSetEntriesByFestivalSorted,
  getArtistById,
} from "./repo";

function normalizeName(s: string) {
  return s.trim().toLowerCase();
}

async function upsertArtistByName(params: {
  festivalId: UUID;
  name: string;
  style: string;
  stagePrimary?: string;
  description?: string;
}): Promise<Artist> {
  const all = await listArtistsByFestival(params.festivalId);
  const n = normalizeName(params.name);
  const existing = all.find((a) => normalizeName(a.name) === n);

  if (existing) {
    const updated: Artist = {
      ...existing,
      ...params,
      name: existing.name, // garde le nom "humain"
    };
    await upsertArtist(updated);
    return updated;
  }

  const created: Artist = {
    id: uuid(),
    festivalId: params.festivalId,
    name: params.name.trim(),
    style: params.style,
    stagePrimary: params.stagePrimary,
    description: params.description,
    firstSeenAt: nowISO(),
  };

  await upsertArtist(created);
  return created;
}

export async function ensureBootstrap() {
  // UserProfile
  let user = await getUserProfile();
  if (!user) {
    user = {
      id: uuid(),
      displayName: "Moi",
      deviceId: uuid(),
      createdAt: nowISO(),
    };
    await putUserProfile(user);
  }

  // Festival actif
  let festivalId = await getActiveFestivalId();
  if (!festivalId) {
    const fest: Festival = {
      id: uuid(),
      name: "Ozora 2026",
      location: "Dádpuszta, Hongrie",
      startDate: new Date("2026-07-24").toISOString(),
      endDate: new Date("2026-08-04").toISOString(),
      createdAt: nowISO(),
    };
    await addFestival(fest);
    await setActiveFestivalId(fest.id);
    festivalId = fest.id;
  }

  const festival = await getFestival(festivalId);
  if (!festival) throw new Error("Festival actif introuvable");

  return { user, festival };
}

export async function createSetEntry(params: {
  festivalId: UUID;
  artistName: string;
  style: string;
  stageName: string;
  energy: number;
  focus: FocusType;
  colorHex: string;
  feelingText: string;
  learningText: string;
  photo?: string;
  startTime?: string;
}): Promise<SetEntry> {
  const artist = await upsertArtistByName({
    festivalId: params.festivalId,
    name: params.artistName,
    style: params.style,
    stagePrimary: params.stageName,
  });

  const entry: SetEntry = {
    id: uuid(),
    festivalId: params.festivalId,
    artistId: artist.id,
    stageName: params.stageName,
    startTime: params.startTime ?? nowISO(),
    createdAt: nowISO(),
    energy: clampInt(params.energy, 1, 10),
    photo: params.photo,
    focus: params.focus,
    colorHex: params.colorHex,
    feelingText: params.feelingText ?? "",
    learningText: params.learningText ?? "",
  };

  await addSetEntry(entry);
  return entry;
}

export async function getFestivalEntries(festivalId: UUID) {
  return listSetEntriesByFestivalSorted(festivalId);
}

export type JournalItem = {
  id: string;
  startTime: string;
  stageName: string;
  energy: number;
  focus: "mental" | "emotion" | "body";
  colorHex: string;
  feelingText: string;
  learningText: string;
  artistName: string;
  style?: string;
  photo?: string;
};

export async function listJournalItems(festivalId: string): Promise<JournalItem[]> {
  const entries = await listSetEntriesByFestivalSorted(festivalId);

  const items = await Promise.all(
    entries.map(async (e) => {
      const artist = await getArtistById(e.artistId);

      return {
        id: e.id,
        startTime: e.startTime,
        stageName: e.stageName,
        energy: e.energy,
        focus: e.focus,
        colorHex: e.colorHex,
	photo: (e as any).photo,
        feelingText: e.feelingText,
        learningText: e.learningText,
        artistName: artist?.name ?? "Artiste inconnu",
        style: artist?.style,
      } satisfies JournalItem;
    })
  );

  items.sort((a, b) => (a.startTime < b.startTime ? 1 : -1));
  return items;
}