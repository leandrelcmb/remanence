import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Artist, Festival, FestivalContact, SetEntry, UserProfile, UUID } from "../models/types";

interface RemanenceDB extends DBSchema {
  meta: {
    key: string; // e.g. "activeFestivalId"
    value: any;
  };
  userProfile: {
    key: UUID;
    value: UserProfile;
  };
  festivals: {
    key: UUID;
    value: Festival;
    indexes: { "by-createdAt": string };
  };
  artists: {
    key: UUID;
    value: Artist;
    indexes: { "by-festivalId": UUID; "by-festivalId_name": [UUID, string] };
  };
  setEntries: {
    key: UUID;
    value: SetEntry;
    indexes: {
      "by-festivalId": UUID;
      "by-festivalId_startTime": [UUID, string];
      "by-artistId": UUID;
    };
  };
  contacts: {
    key: UUID;
    value: FestivalContact;
    indexes: { "by-festivalId": UUID };
  };
}

let dbPromise: Promise<IDBPDatabase<RemanenceDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RemanenceDB>("remanence-db", 2, {
      upgrade(db, oldVersion) {
        // ── v1 : stores initiaux ──────────────────────────────────────────────
        if (oldVersion < 1) {
          db.createObjectStore("meta");
          db.createObjectStore("userProfile");

          const festivals = db.createObjectStore("festivals", { keyPath: "id" });
          festivals.createIndex("by-createdAt", "createdAt");

          const artists = db.createObjectStore("artists", { keyPath: "id" });
          artists.createIndex("by-festivalId", "festivalId");
          artists.createIndex("by-festivalId_name", ["festivalId", "name"]);

          const setEntries = db.createObjectStore("setEntries", { keyPath: "id" });
          setEntries.createIndex("by-festivalId", "festivalId");
          setEntries.createIndex("by-festivalId_startTime", ["festivalId", "startTime"]);
          setEntries.createIndex("by-artistId", "artistId");
        }

        // ── v2 : contacts festival ────────────────────────────────────────────
        if (oldVersion < 2) {
          const contacts = db.createObjectStore("contacts", { keyPath: "id" });
          contacts.createIndex("by-festivalId", "festivalId");
        }
      },
    });
  }
  return dbPromise;
}
