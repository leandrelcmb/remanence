// Types partagés pour la feature Chasse (jeux)
// Importés par ChasseScreen, GamesScreen et App

export type ChasseType = "chromatic" | "formes" | "personnages";

export type WheelItem = {
  label: string;
  color: string;
  icon: string;
  challenge: string;
};

/** Session en cours (stockée dans IndexedDB sous la clé "current") */
export type ChasseActiveSession = {
  chasseType: ChasseType;
  result: WheelItem;
  photos: (string | null)[];   // 21 slots, null = vide
  timerExpiresAt: number;       // Date.now() + remaining_seconds * 1000
};

/** Session terminée et sauvegardée dans l'historique */
export type ChasseHistoryEntry = {
  id: string;
  chasseType: ChasseType;
  result: WheelItem;
  photos: string[];             // uniquement les photos non-nulles
  savedAt: string;              // ISO timestamp
};
