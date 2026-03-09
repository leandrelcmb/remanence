import type { Artist, Festival, FestivalContact, SetEntry, UserProfile, UUID } from "../models/types";
import { getDB } from "./db";

export const MetaKeys = {
  ActiveFestivalId: "activeFestivalId",
  UserProfileId: "userProfileId",
} as const;

/** META */
export async function setMeta(key: string, value: any) {
  const db = await getDB();
  await db.put("meta", value, key);
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get("meta", key);
}

/** USER */
export async function putUserProfile(profile: UserProfile) {
  const db = await getDB();
  await db.put("userProfile", profile, profile.id);
  await setMeta(MetaKeys.UserProfileId, profile.id);
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  const id = await getMeta<UUID>(MetaKeys.UserProfileId);
  if (!id) return undefined;
  const db = await getDB();
  return db.get("userProfile", id);
}

/** FESTIVALS */
export async function addFestival(festival: Festival) {
  const db = await getDB();
  await db.put("festivals", festival);
}

export async function listFestivals(): Promise<Festival[]> {
  const db = await getDB();
  return db.getAllFromIndex("festivals", "by-createdAt");
}

export async function setActiveFestivalId(id: UUID) {
  await setMeta(MetaKeys.ActiveFestivalId, id);
}

export async function getActiveFestivalId(): Promise<UUID | undefined> {
  return getMeta<UUID>(MetaKeys.ActiveFestivalId);
}

export async function getFestival(id: UUID): Promise<Festival | undefined> {
  const db = await getDB();
  return db.get("festivals", id);
}

/** ARTISTS */
export async function upsertArtist(artist: Artist) {
  const db = await getDB();
  await db.put("artists", artist);
}

export async function findArtistByName(festivalId: UUID, name: string): Promise<Artist | undefined> {
  const db = await getDB();
  const key: [UUID, string] = [festivalId, name.trim().toLowerCase()];
  // ⚠️ ton index est ["festivalId", "name"] donc ça ne matchera que si artist.name est stocké en lowercase
  // Pour l’instant on ne l’utilise PAS pour éviter les bugs, on fait une recherche simple côté service.
  const found = await db.getFromIndex("artists", "by-festivalId_name", key as any);
  return found as any;
}

export async function listArtistsByFestival(festivalId: UUID): Promise<Artist[]> {
  const db = await getDB();
  return db.getAllFromIndex("artists", "by-festivalId", festivalId);
}

/** SET ENTRIES */
export async function addSetEntry(entry: SetEntry) {
  const db = await getDB();
  await db.put("setEntries", entry);
}

export async function listSetEntriesByFestival(festivalId: UUID): Promise<SetEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("setEntries", "by-festivalId", festivalId);
}

/** Version SAFE (pas de IDBKeyRange) */
export async function listSetEntriesByFestivalSorted(festivalId: UUID): Promise<SetEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex("setEntries", "by-festivalId", festivalId);
  return entries.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function listSetEntriesByArtist(artistId: UUID): Promise<SetEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("setEntries", "by-artistId", artistId);
}

export async function getArtistById(artistId: UUID) {
  const db = await getDB();
  return db.get("artists", artistId);
}

export async function deleteSetEntry(id: UUID): Promise<void> {
  const db = await getDB();
  await db.delete("setEntries", id);
}

/** CONTACTS */
export async function addContact(contact: FestivalContact): Promise<void> {
  const db = await getDB();
  await db.put("contacts", contact);
}

export async function listContactsByFestival(festivalId: UUID): Promise<FestivalContact[]> {
  const db = await getDB();
  return db.getAllFromIndex("contacts", "by-festivalId", festivalId);
}

export async function deleteContact(id: UUID): Promise<void> {
  const db = await getDB();
  await db.delete("contacts", id);
}