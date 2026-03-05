export function nowISO() {
  return new Date().toISOString();
}

export function uuid(): string {
  // Simple UUID v4 (suffisant pour usage perso)
  return crypto.randomUUID();
}

export function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}