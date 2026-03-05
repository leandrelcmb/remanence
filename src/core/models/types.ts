export type UUID = string;

export type FocusType = "mental" | "emotion" | "body";

export interface Festival {
  id: UUID;
  name: string;
  location?: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  createdAt: string; // ISO
  archivedAt?: string; // ISO
}

export interface Artist {
  id: UUID;
  festivalId: UUID;
  name: string;
  stagePrimary?: string;
  style: string;
  description?: string;
  firstSeenAt: string; // ISO
}

export interface SetEntry {
  id: UUID;
  festivalId: UUID;
  artistId: UUID;

  stageName: string;
  startTime: string; // ISO
  endTime?: string;  // ISO
  createdAt: string; // ISO

  energy: number; // 1..10
  focus: FocusType;
  colorHex: string; // #RRGGBB

  feelingText: string;
  learningText: string;

  photoFileName?: string; // V1: optionnel (on fera Blob plus tard)
}

export interface UserProfile {
  id: UUID;
  displayName: string;
  deviceId: string;
  createdAt: string; // ISO
}

/** Snapshot duo (.remanence) */
export interface RemanenceSnapshotV1 {
  version: "1.0";
  exportedAt: string; // ISO
  userProfile: UserProfile;
  festival: Festival;
  artists: Artist[];
  setEntries: SetEntry[];
}