import { useEffect, useMemo, useState } from "react";
import type { JournalItem } from "../core/store/service";
import type { Festival, UserProfile } from "../core/models/types";
import { listFestivalContacts } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { formatTime } from "./utils";

// ── Types ───────────────────────────────────────────────────────────────────

type Props = {
  journal: JournalItem[];
  festival: Festival | null;
  user: UserProfile | null;
  festivalId: string;
  onBack: () => void;
};

// ── Constantes ───────────────────────────────────────────────────────────────

const FOCUS_CONFIG = [
  { key: "mental",  label: "Mental",  emoji: "🧠", color: "#8B5CF6" },
  { key: "emotion", label: "Émotion", emoji: "❤️", color: "#EC4899" },
  { key: "body",    label: "Corps",   emoji: "🕺", color: "#F59E0B" },
] as const;

const CARD: React.CSSProperties = {
  borderRadius: 18,
  padding: "16px 18px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  opacity: 0.40,
  margin: "0 0 12px 0",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFestivalDates(startDate?: string, endDate?: string): string | null {
  if (!startDate || !endDate) return null;
  try {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const start = new Date(startDate).toLocaleDateString("fr-FR", opts);
    const end   = new Date(endDate).toLocaleDateString("fr-FR", opts);
    return `${start} — ${end}`;
  } catch {
    return null;
  }
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function RecapHeader({ festival, onBack }: { festival: Festival | null; onBack: () => void }) {
  const dates = formatFestivalDates(festival?.startDate, festival?.endDate);
  return (
    <div style={{
      flexShrink: 0,
      padding: "20px 16px 14px",
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(22px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>Rémanence du festival 🎇</h2>
          <div style={{ fontSize: 13, opacity: 0.45, marginTop: 4 }}>
            {festival?.name ?? "Festival"}
            {dates && ` · ${dates}`}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999, padding: "8px 16px",
            color: "rgba(255,255,255,0.7)", fontSize: 15,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Home ॐ
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      borderRadius: 16, padding: "14px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "grid", gap: 6,
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function RecapScreen({ journal, festival, user, festivalId, onBack }: Props) {
  const [contactCount, setContactCount] = useState<number | null>(null);

  // Fetch du nombre de contacts (lecture seule)
  useEffect(() => {
    if (!festivalId) return;
    listFestivalContacts(festivalId).then((list) => setContactCount(list.length));
  }, [festivalId]);

  // ── Calculs ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (journal.length === 0) return null;

    const count = journal.length;
    const avgEnergy = journal.reduce((s, i) => s + i.energy, 0) / count;

    // Scène préférée
    const stageCounts: Record<string, number> = {};
    journal.forEach((i) => {
      if (i.stageName) stageCounts[i.stageName] = (stageCounts[i.stageName] ?? 0) + 1;
    });
    const favStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // Répartition focus
    const focusCounts: Record<string, number> = { mental: 0, emotion: 0, body: 0 };
    journal.forEach((i) => {
      if (i.focus in focusCounts) focusCounts[i.focus]++;
    });
    const domFocusKey = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "emotion";
    const domFocus = FOCUS_CONFIG.find((f) => f.key === domFocusKey) ?? FOCUS_CONFIG[1];

    // Top 3 par énergie
    const topSets = [...journal].sort((a, b) => b.energy - a.energy).slice(0, 3);

    // Palette (ordre chronologique)
    const palette = [...journal].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return { count, avgEnergy, favStage, domFocus, focusCounts, topSets, palette };
  }, [journal]);

  // Photos uniquement
  const photos = useMemo(() => journal.filter((i) => Boolean(i.photo)), [journal]);

  // ── État vide ────────────────────────────────────────────────────────────
  if (journal.length === 0) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <RecapHeader festival={festival} onBack={onBack} />
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 20, padding: "0 24px", textAlign: "center",
        }}>
          <p style={{ fontSize: 40, margin: 0 }}>🌿</p>
          <p style={{ fontSize: 20, opacity: 0.7, margin: 0 }}>
            Aucun set capturé pour ce festival.
          </p>
          <p style={{ fontSize: 15, opacity: 0.4, margin: 0 }}>
            Lance-toi ! Chaque set est un souvenir unique.
          </p>
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header fixe ── */}
      <RecapHeader festival={festival} onBack={onBack} />

      {/* ── Corps scrollable ── */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px 60px",
        display: "flex", flexDirection: "column", gap: 28,
      }}>

        {/* ── A. CHIFFRES CLÉS ── */}
        <section>
          <p style={SECTION_TITLE}>Chiffres clés</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatCard value={`${s.count}`} label={s.count === 1 ? "set capturé" : "sets capturés"} />
            <StatCard value={`${s.avgEnergy.toFixed(1)}/10`} label="énergie moyenne" />
            <StatCard value={`${s.domFocus.emoji} ${s.domFocus.label}`} label="focus dominant" />
            <StatCard value={s.favStage} label="scène préférée" />
            {contactCount !== null && contactCount > 0 && (
              <StatCard
                value={`${contactCount}`}
                label={contactCount === 1 ? "rencontre" : "rencontres"}
              />
            )}
          </div>
        </section>

        {/* ── B. PALETTE CHROMATIQUE ── */}
        <section>
          <p style={SECTION_TITLE}>Tes couleurs</p>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
            padding: "16px 18px", ...CARD,
          }}>
            {s.palette.map((item) => {
              const c = energyTint(item.colorHex, item.energy);
              return (
                <div
                  key={item.id}
                  title={`${item.artistName} · ${item.energy}/10`}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, flexShrink: 0,
                    boxShadow: `0 0 8px 2px ${c}55`,
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* ── C. RÉPARTITION FOCUS ── */}
        <section>
          <p style={SECTION_TITLE}>Où tu as vibré</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, ...CARD }}>
            {FOCUS_CONFIG.map(({ key, label, emoji, color }) => {
              const cnt = s.focusCounts[key] ?? 0;
              const pct = s.count > 0 ? (cnt / s.count) * 100 : 0;
              return (
                <div key={key}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 8, fontSize: 14,
                  }}>
                    <span>{emoji} {label}</span>
                    <span style={{ opacity: 0.5 }}>{cnt} set{cnt !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{
                    height: 6, borderRadius: 999,
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      minWidth: pct > 0 ? 8 : 0,
                      borderRadius: 999,
                      background: color,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── D. MOMENTS FORTS ── */}
        <section>
          <p style={SECTION_TITLE}>Tes pics d'énergie</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.topSets.map((item, rank) => {
              const c = energyTint(item.colorHex, item.energy);
              const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉";
              return (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", ...CARD,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, width: 28 }}>{medal}</span>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: c, boxShadow: `0 0 10px ${c}88`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.artistName || "Artiste inconnu"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
                      {item.stageName} · {formatTime(item.startTime)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                    padding: "3px 10px", borderRadius: 999,
                    background: `${c}22`, border: `1px solid ${c}55`,
                  }}>
                    ⚡ {item.energy}/10
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── E. PHOTOS (si existantes) ── */}
        {photos.length > 0 && (
          <section>
            <p style={SECTION_TITLE}>Instants capturés</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {photos.map((item) => (
                <div key={item.id}>
                  <img
                    src={item.photo!}
                    alt={item.artistName}
                    style={{
                      width: "100%", height: 140,
                      objectFit: "cover",
                      borderRadius: 12, display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Signature discrète */}
        {user && (
          <p style={{ textAlign: "center", fontSize: 13, opacity: 0.25, margin: 0 }}>
            Journal de {user.displayName} · {festival?.name ?? "Festival"}
          </p>
        )}

      </div>
    </div>
  );
}
