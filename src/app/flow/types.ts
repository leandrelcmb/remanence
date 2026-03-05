export type FlowScreen =
  | "landing"
  | "energy"
  | "focus"
  | "color"
  | "text"
  | "capture"
  | "done";

export type Draft = {
  energy: number; // 1..10
  focus: "mental" | "emotion" | "body";
  colorHex: string;
  feelingText: string;
  learningText: string;
};