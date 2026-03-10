export type FlowScreen =
  | "landing"
  | "setInfo"
  | "energy"
  | "focus"
  | "color"
  | "text"
  | "capture"
  | "done"
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
  | "comingSoon";

export type Draft = {
  artistName: string;
  stageName: string;
  style: string;

  energy: number;
  focus: "mental" | "emotion" | "body";
  colorHex: string;

  feelingText: string;
  learningText: string;

  photo?: string;
};