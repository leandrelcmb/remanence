export function formatTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function focusEmoji(focus: "mental" | "emotion" | "body") {
  if (focus === "mental") return "🧠";
  if (focus === "emotion") return "❤️";
  return "🕺";
}
