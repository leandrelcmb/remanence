export type FlowScreen =
  | "landing"
  // ── Flux de capture (nouveaux écrans) ──
  | "capture"
  | "scenePicker"     // remplace setInfo (choix scène + artiste)
  | "colorEnergy"     // remplace color + energy (écran fusionné)
  | "focus"
  | "text"
  | "done"
  // ── Anciens écrans du flux (conservés pour compatibilité / édition) ──
  | "setInfo"
  | "color"
  | "energy"
  // ── Navigation principale ──
  | "journal"
  | "detail"
  | "constellation"
  | "festivalPicker"
  | "contacts"
  | "recap"
  | "games"
  | "chasse"
  | "introspection"
  | "treasure"
  | "theories"
  | "anecdotes"
  | "divers"
  | "sante"
  | "comingSoon";

export type Draft = {
  artistName: string;
  stageName: string;
  style: string;
  ephemeral: boolean; // true = scène éphémère (pas d'artiste, skip TextScreen)

  energy: number;
  focus: "mental" | "emotion" | "body";
  colorHex: string;

  feelingText: string;
  learningText: string;

  photo?: string;
};