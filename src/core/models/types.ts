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

export type SetEntry = {
  id: UUID;
  festivalId: UUID;
  artistId: UUID;
  stageName: string;
  startTime: string;
  createdAt: string;
  energy: number;
  focus: FocusType;
  colorHex: string;
  feelingText: string;
  learningText: string;
  photo?: string;
};

export interface UserProfile {
  id: UUID;
  displayName: string;
  deviceId: string;
  createdAt: string; // ISO
}

export interface FestivalContact {
  id: UUID;
  festivalId: UUID;
  name: string;       // prénom / pseudo
  photo?: string;     // base64 optionnelle
  note?: string;      // texte libre court
  metAt?: string;     // ISO timestamp
  createdAt: string;  // ISO
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