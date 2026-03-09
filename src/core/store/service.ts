import type { Artist, Festival, FestivalContact, SetEntry, UserProfile, UUID, FocusType } from "../models/types";
import { clampInt, nowISO, uuid } from "../models/utils";
import {
  addFestival,
  listFestivals,
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
  deleteSetEntry,
  addContact,
  listContactsByFestival,
  deleteContact,
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
      name: existing.name,
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

/**
 * Bootstrap : initialise le festival par défaut si absent.
 * Ne crée PAS de profil automatiquement — retourne null si l'utilisateur
 * n'a pas encore choisi son pseudo (→ l'app affichera l'onboarding).
 */
export async function ensureBootstrap(): Promise<{ user: UserProfile | null; festival: Festival }> {
  const user = await getUserProfile() ?? null;

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

/**
 * Crée et persiste le profil utilisateur après l'onboarding.
 */
export async function createUserProfile(displayName: string): Promise<UserProfile> {
  const profile: UserProfile = {
    id: uuid(),
    displayName: displayName.trim(),
    deviceId: uuid(),
    createdAt: nowISO(),
  };
  await putUserProfile(profile);
  return profile;
}

/** Récupère la liste complète des festivals triés par date de création. */
export { listFestivals };

/** Crée un nouveau festival et le persiste. */
export async function addNewFestival(params: {
  name: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  location?: string;
}): Promise<Festival> {
  const fest: Festival = {
    id: uuid(),
    name: params.name.trim(),
    location: params.location?.trim() || undefined,
    startDate: new Date(params.startDate).toISOString(),
    endDate: new Date(params.endDate).toISOString(),
    createdAt: nowISO(),
  };
  await addFestival(fest);
  return fest;
}

/** Change le festival actif (met à jour la clé meta). */
export async function switchActiveFestival(id: UUID): Promise<void> {
  await setActiveFestivalId(id);
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
    focus: params.focus,
    colorHex: params.colorHex,
    feelingText: params.feelingText ?? "",
    learningText: params.learningText ?? "",
    photo: params.photo,
  };

  await addSetEntry(entry);
  return entry;
}

export async function updateJournalItem(params: {
  id: string;
  festivalId: string;
  artistName: string;
  style: string;
  stageName: string;
  energy: number;
  focus: FocusType;
  colorHex: string;
  feelingText: string;
  learningText: string;
  photo?: string;
  originalStartTime: string;
  originalCreatedAt: string;
}): Promise<void> {
  const artist = await upsertArtistByName({
    festivalId: params.festivalId,
    name: params.artistName,
    style: params.style,
    stagePrimary: params.stageName,
  });

  const entry: SetEntry = {
    id: params.id,
    festivalId: params.festivalId,
    artistId: artist.id,
    stageName: params.stageName,
    startTime: params.originalStartTime,
    createdAt: params.originalCreatedAt,
    energy: clampInt(params.energy, 1, 10),
    focus: params.focus,
    colorHex: params.colorHex,
    feelingText: params.feelingText ?? "",
    learningText: params.learningText ?? "",
    photo: params.photo,
  };

  // db.put avec le même id = mise à jour en place
  await addSetEntry(entry);
}

export async function deleteJournalItem(id: string): Promise<void> {
  await deleteSetEntry(id);
}

export async function getFestivalEntries(festivalId: UUID) {
  return listSetEntriesByFestivalSorted(festivalId);
}

export type JournalItem = {
  id: string;
  startTime: string;
  createdAt: string;
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
        createdAt: e.createdAt,
        stageName: e.stageName,
        energy: e.energy,
        focus: e.focus,
        colorHex: e.colorHex,
        photo: e.photo,
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

// ── Export photos ──────────────────────────────────────────────────────────
export type PhotoExportItem = {
  artistName: string;
  stageName: string;
  style?: string;
  photo: string; // base64 data URL
};

export async function getEntriesWithPhotos(festivalId: UUID): Promise<PhotoExportItem[]> {
  const items = await listJournalItems(festivalId);
  return items
    .filter((item) => !!item.photo)
    .map((item) => ({
      artistName: item.artistName,
      stageName: item.stageName,
      style: item.style,
      photo: item.photo as string,
    }));
}

// ── Contacts festival ──────────────────────────────────────────────────────
export async function createContact(params: {
  festivalId: UUID;
  name: string;
  photo?: string;
  note?: string;
}): Promise<FestivalContact> {
  const contact: FestivalContact = {
    id: uuid(),
    festivalId: params.festivalId,
    name: params.name.trim(),
    photo: params.photo,
    note: params.note?.trim(),
    metAt: nowISO(),
    createdAt: nowISO(),
  };
  await addContact(contact);
  return contact;
}

export async function listFestivalContacts(festivalId: UUID): Promise<FestivalContact[]> {
  const contacts = await listContactsByFestival(festivalId);
  return contacts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function removeFestivalContact(id: UUID): Promise<void> {
  await deleteContact(id);
}
