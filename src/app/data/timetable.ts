// ── Timetable Ozora 2026 ─────────────────────────────────────────────────────
// À remplir au fur et à mesure que la programmation se précise.
// Format : { artistName, scene, style, day?, startTime?, endTime? }
//
// Exemple :
//   { artistName: "Astrix", scene: "Main Stage", style: "Psytrance", day: "Fri", startTime: "22:00" },

export type TimetableEntry = {
  artistName: string;
  scene:
    | "Main Stage"
    | "Dragon Nest"
    | "Chill Out Dome"
    | "Pumpui"
    | "Cooking Groove"
    | "Ambyss";
  style:      string;   // ex: "Psytrance", "Ambient", "Downtempo"
  day?:       string;   // ex: "Thu" | "Fri" | "Sat" | "Sun"
  startTime?: string;   // ex: "22:00"
  endTime?:   string;   // ex: "23:30"
};

export const TIMETABLE: TimetableEntry[] = [
  // ← Ajoute les artistes ici au format indiqué ci-dessus
];

// ── 6 scènes officielles (+ 1 éphémère gérée côté UI) ──────────────────────
export const SCENES = [
  { key: "Main Stage",     emoji: "🌞" },
  { key: "Dragon Nest",    emoji: "🐉" },
  { key: "Chill Out Dome", emoji: "🌙" },
  { key: "Pumpui",         emoji: "🎪" },
  { key: "Cooking Groove", emoji: "🍳" },
  { key: "Ambyss",         emoji: "🌊" },
] as const;

export type SceneKey = (typeof SCENES)[number]["key"];

export function artistsByScene(scene: string): TimetableEntry[] {
  return TIMETABLE.filter((e) => e.scene === scene);
}
