import { useState, useMemo, useEffect, useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { SCENES, TIMETABLE, DAY_LABELS } from "../app/data/timetable";
import type { TimetableEntry } from "../app/data/timetable";
import type { LineupRating } from "../core/store/repo";
import { listAllLineupRatings, setLineupRating } from "../core/store/repo";

// ── Types ─────────────────────────────────────────────────────────────────────
type RatingValue  = "go" | "maybe" | "skip";
type RatingFilter = RatingValue | "unrated" | "";
type TabId        = "programme" | "artistes" | "reco";
type MoodFilter   = "galoper" | "poser" | "reposer" | "";

// ── Couleurs par scène ────────────────────────────────────────────────────────
const SCENE_COLORS: Record<string, string> = {
  "Ozora Stage": "#BF5AF2",
  "Pumpui":      "#FF6B35",
  "The Dome":    "#00C7BE",
  "Dragon Nest":    "#34C759",
  "Cooking Groove": "#FFD60A",
  "Ambyss":         "#5E5CE6",
};

const RATING_EMOJI: Record<RatingValue, string> = {
  go:    "🟢",
  maybe: "🟠",
  skip:  "🔴",
};

// ── Festival calendar helpers ─────────────────────────────────────────────────
// La journée festival court de 10h00 à 09h59 le lendemain.

// Exporté : les repères de jour de la Constellation réutilisent le même mapping
export const CALENDAR_TO_FESTIVAL_DAY: Record<string, string> = {
  "2026-07-25": "Day -1",
  "2026-07-26": "Day 0",
  "2026-07-27": "Day 1",
  "2026-07-28": "Day 2",
  "2026-07-29": "Day 3",
  "2026-07-30": "Day 4",
  "2026-07-31": "Day 5",
  "2026-08-01": "Day 6",
  "2026-08-02": "Day 7",
  "2026-08-03": "Day 8",
};

function getFestivalDay(now: Date): string | null {
  const h = now.getHours();
  const effective = new Date(now);
  if (h < 10) effective.setDate(effective.getDate() - 1);
  const yyyy = effective.getFullYear();
  const mm   = String(effective.getMonth() + 1).padStart(2, "0");
  const dd   = String(effective.getDate()).padStart(2, "0");
  return CALENDAR_TO_FESTIVAL_DAY[`${yyyy}-${mm}-${dd}`] ?? null;
}

// Convertit "HH:MM" (d'un jour festival donné) en objet Date réel.
// Les sets avant 10h00 sont physiquement le lendemain du jour calendaire.
function setStartToDate(festivalDay: string, startTime: string): Date | null {
  const calendarDate = Object.entries(CALENDAR_TO_FESTIVAL_DAY)
    .find(([, v]) => v === festivalDay)?.[0];
  if (!calendarDate || !startTime) return null;
  const [h, m] = startTime.split(":").map(Number);
  const base = new Date(`${calendarDate}T00:00:00`);
  if (h < 10) base.setDate(base.getDate() + 1);
  base.setHours(h, m, 0, 0);
  return base;
}

// Formate un délai en minutes en libellé lisible.
function formatTimeUntil(minutesUntil: number, t: (k: string, v?: Record<string, unknown>) => string): string {
  const rounded = Math.round(minutesUntil);
  if (rounded >= 60) {
    const h   = Math.floor(rounded / 60);
    const min = rounded % 60;
    if (min === 0) return t("programmation.recoInHoursExact", { h });
    return t("programmation.recoInHours", { h, min });
  }
  return t("programmation.recoIn", { min: rounded });
}

// ── Helpers concurrent artists ────────────────────────────────────────────────
// Convertit HH:MM en minutes depuis le début du jour festival (10h00 = 0)
function festivalMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h >= 10 ? (h - 10) * 60 + m : (h + 24 - 10) * 60 + m;
}

// ── Hook bio Wikipédia FR ─────────────────────────────────────────────────────
function useFrWikiSummary(artistName: string, enabled: boolean): string | null {
  const [summary, setSummary] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setSummary(null);
    const controller = new AbortController();
    fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artistName)}`,
      { signal: controller.signal }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { extract?: string; type?: string } | null) => {
        if (data?.extract && data.type !== "disambiguation" && data.extract.length > 80) {
          setSummary(data.extract);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [artistName, enabled]);
  return summary;
}

type RecoEntry = {
  entry:        TimetableEntry;
  status:       "now" | "soon";
  minutesUntil: number;
};

function getRecoEntries(
  now:        Date,
  moodFilter: MoodFilter,
  ratings:    Map<string, LineupRating>
): RecoEntry[] {
  const festivalDay = getFestivalDay(now);
  if (!festivalDay) return [];

  const results: RecoEntry[] = [];

  for (const entry of TIMETABLE) {
    if (!entry.day || !entry.startTime) continue;
    if (moodFilter && entry.mood !== moodFilter) continue;

    const startDate = setStartToDate(entry.day, entry.startTime);
    if (!startDate) continue;

    const minutesUntil = (startDate.getTime() - now.getTime()) / 60_000;

    if (minutesUntil >= -90 && minutesUntil < 0) {
      results.push({ entry, status: "now", minutesUntil });
    } else if (minutesUntil >= 0 && minutesUntil <= 240) {
      results.push({ entry, status: "soon", minutesUntil });
    }
  }

  // Tri : "now" en premier, puis by rating (go > maybe > unrated > skip), puis par heure
  const ratingScore: Record<string, number> = { go: 0, maybe: 1, "": 2, skip: 3 };
  results.sort((a, b) => {
    if (a.status !== b.status) return a.status === "now" ? -1 : 1;
    const ra = ratings.get(a.entry.artistName)?.rating ?? "";
    const rb = ratings.get(b.entry.artistName)?.rating ?? "";
    const diff = (ratingScore[ra] ?? 2) - (ratingScore[rb] ?? 2);
    if (diff !== 0) return diff;
    return a.minutesUntil - b.minutesUntil;
  });

  return results;
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = { onBack: () => void };

// ── ArtistCard ────────────────────────────────────────────────────────────────
function ArtistCard({
  entry,
  rating,
  onClick,
  statusLabel,
}: {
  entry:       TimetableEntry;
  rating?:     LineupRating;
  onClick:     () => void;
  statusLabel?: string;
}) {
  const { t } = useTranslation();
  const color    = SCENE_COLORS[entry.scene] ?? "#ffffff";
  const sceneInfo = [...SCENES].find((s) => s.key === entry.scene);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        marginBottom: 8,
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        position: "relative",
      }}
    >
      {/* Dot couleur scène */}
      <div
        style={{
          width: 9, height: 9,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 7px ${color}99`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Nom + badge pionnier */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{entry.artistName}</span>
          {entry.legend && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: "1px 7px", borderRadius: 999,
              background: "rgba(255,200,0,0.15)",
              color: "#FFD60A",
              border: "1px solid rgba(255,200,0,0.30)",
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}>
              {t("programmation.legendBadge")}
            </span>
          )}
        </div>

        {/* Meta pills */}
        <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
          {entry.style && (
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 999,
              background: `${color}1A`, color, fontWeight: 600, letterSpacing: "0.02em",
            }}>
              {entry.style}
            </span>
          )}
          {sceneInfo && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>
              {sceneInfo.emoji} {entry.scene}
            </span>
          )}
          {entry.day && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>{entry.day}</span>
          )}
          {entry.startTime && (
            <span style={{ fontSize: 11, opacity: 0.38 }}>
              {entry.startTime}{entry.endTime ? ` – ${entry.endTime}` : ""}
            </span>
          )}
          {/* Badge statut reco ("En cours", "Dans 15min") */}
          {statusLabel && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: "1px 8px", borderRadius: 999,
              background: "rgba(52,199,89,0.18)",
              color: "#34C759",
              border: "1px solid rgba(52,199,89,0.35)",
              letterSpacing: "0.03em",
            }}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Badge notation */}
      <div style={{ flexShrink: 0, fontSize: 16, lineHeight: 1 }}>
        {rating ? (
          <span>{RATING_EMOJI[rating.rating]}</span>
        ) : (
          <span style={{
            display: "inline-block", width: 14, height: 14,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.20)",
            verticalAlign: "middle",
          }} />
        )}
      </div>
    </div>
  );
}

// ── SceneSection ──────────────────────────────────────────────────────────────
function SceneSection({
  sceneKey, emoji, entries, ratings, onSelectArtist,
}: {
  sceneKey: string;
  emoji: string;
  entries: TimetableEntry[];
  ratings: Map<string, LineupRating>;
  onSelectArtist: (e: TimetableEntry) => void;
}) {
  const { t } = useTranslation();
  const color = SCENE_COLORS[sceneKey] ?? "#ffffff";

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color }}>
          {sceneKey}
        </span>
        <span style={{ fontSize: 11, opacity: 0.35 }}>
          {t("programmation.artist", { count: entries.length })}
        </span>
      </div>
      {entries.map((entry) => (
        <ArtistCard
          key={`${entry.artistName}-${entry.scene}-${entry.day ?? ""}`}
          entry={entry}
          rating={ratings.get(entry.artistName)}
          onClick={() => onSelectArtist(entry)}
        />
      ))}
    </div>
  );
}

// ── ArtistDetail ──────────────────────────────────────────────────────────────
function ArtistDetail({
  entry, rating, ratings, onBack, onRatingChange, onSelectArtist,
}: {
  entry:           TimetableEntry;
  rating?:         LineupRating;
  ratings:         Map<string, LineupRating>;
  onBack:          () => void;
  onRatingChange:  (newRating: RatingValue, comment: string) => void;
  onSelectArtist:  (e: TimetableEntry) => void;
}) {
  const { t, i18n } = useTranslation();
  const isFr     = i18n.language.startsWith("fr");
  const color     = SCENE_COLORS[entry.scene] ?? "#ffffff";
  const sceneInfo = [...SCENES].find((s) => s.key === entry.scene);
  const [comment, setComment]       = useState(rating?.comment ?? "");
  const [wikiExpanded, setWikiExpanded] = useState(false);
  const currentRating = rating?.rating;

  // ── Artistes en même temps ────────────────────────────────────────────────
  const concurrent = useMemo(() => {
    if (!entry.day || !entry.startTime) return [];
    const base = festivalMinutes(entry.startTime);
    return TIMETABLE
      .filter((e) =>
        e.scene !== entry.scene &&
        e.day === entry.day &&
        e.startTime !== undefined &&
        Math.abs(festivalMinutes(e.startTime!) - base) <= 90
      )
      .sort((a, b) =>
        Math.abs(festivalMinutes(a.startTime!) - base) -
        Math.abs(festivalMinutes(b.startTime!) - base)
      );
  }, [entry]);

  // ── Bio Wikipédia (FR uniquement) ────────────────────────────────────────
  const wikiSummary = useFrWikiSummary(entry.artistName, isFr);

  const ratingLabels: Record<RatingValue, string> = {
    go:    t("programmation.ratingGo"),
    maybe: t("programmation.ratingMaybe"),
    skip:  t("programmation.ratingSkip"),
  };

  return (
    <div style={{
      height: "100dvh",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13, color: "white", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {t("programmation.detailBack")}
        </button>
      </div>

      {/* Body scrollable */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "28px 20px 48px" }}>

        {/* Artiste info */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 11, height: 11, borderRadius: "50%",
            background: color, boxShadow: `0 0 12px ${color}99`,
            flexShrink: 0, marginTop: 7,
          }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
                {entry.artistName}
              </div>
              {entry.legend && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 999,
                  background: "rgba(255,200,0,0.15)",
                  color: "#FFD60A",
                  border: "1px solid rgba(255,200,0,0.30)",
                  letterSpacing: "0.03em",
                }}>
                  {t("programmation.legendBadge")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, opacity: 0.48 }}>
              {sceneInfo?.emoji} {entry.scene}
              {entry.day && entry.startTime && (
                <span style={{ marginLeft: 8, opacity: 0.6 }}>
                  · {entry.day} {entry.startTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notation */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
            opacity: 0.45, marginBottom: 14, textTransform: "uppercase",
          }}>
            {t("programmation.detailRateTitle")}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["go", "maybe", "skip"] as RatingValue[]).map((rv) => {
              const active = currentRating === rv;
              return (
                <button
                  key={rv}
                  onClick={() => onRatingChange(rv, comment)}
                  style={{
                    flex: 1, padding: "14px 8px", borderRadius: 16,
                    border: active
                      ? "1.5px solid rgba(255,255,255,0.35)"
                      : "1px solid rgba(255,255,255,0.10)",
                    background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                    color: "white",
                    fontSize: 12, fontWeight: active ? 700 : 400,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{RATING_EMOJI[rv]}</span>
                  <span>{ratingLabels[rv]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
            opacity: 0.45, marginBottom: 10, textTransform: "uppercase",
          }}>
            Notes
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => { if (currentRating) onRatingChange(currentRating, comment); }}
            placeholder={t("programmation.detailComment")}
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "14px 16px",
              fontSize: 14, color: "white", fontFamily: "inherit",
              resize: "none", outline: "none", lineHeight: 1.5,
            }}
          />
        </div>

        {/* ── Bio Wikipedia (FR uniquement) ── */}
        {isFr && wikiSummary && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
              opacity: 0.45, marginBottom: 10, textTransform: "uppercase",
            }}>
              {t("programmation.wikiAbout")}
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.65, opacity: 0.68,
              display: wikiExpanded ? "block" : "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: wikiExpanded ? undefined : 4,
              WebkitBoxOrient: wikiExpanded ? undefined : "vertical",
            } as React.CSSProperties}>
              {wikiSummary}
            </div>
            {wikiSummary.length > 280 && (
              <button
                onClick={() => setWikiExpanded((v) => !v)}
                style={{
                  marginTop: 6, fontSize: 12, color: "#BF5AF2",
                  background: "none", border: "none",
                  cursor: "pointer", padding: 0, fontFamily: "inherit",
                }}
              >
                {wikiExpanded ? t("programmation.wikiCollapse") : t("programmation.wikiReadMore")}
              </button>
            )}
          </div>
        )}

        {/* ── Artistes en même temps ── */}
        {concurrent.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
              opacity: 0.45, marginBottom: 12, textTransform: "uppercase",
            }}>
              {t("programmation.concurrent")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {concurrent.map((e) => {
                const c   = SCENE_COLORS[e.scene] ?? "#ffffff";
                const r   = ratings.get(e.artistName);
                const diffMin = festivalMinutes(e.startTime!) - festivalMinutes(entry.startTime!);
                const diffLabel = diffMin === 0
                  ? "●"
                  : diffMin > 0
                    ? `+${diffMin}min`
                    : `${diffMin}min`;
                return (
                  <button
                    key={`${e.artistName}-${e.scene}`}
                    onClick={() => onSelectArtist(e)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${c}30`,
                      color: "white", cursor: "pointer",
                      fontFamily: "inherit", textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: c, boxShadow: `0 0 6px ${c}88`, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{e.artistName}</span>
                        {e.legend && (
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            padding: "1px 5px", borderRadius: 999,
                            background: "rgba(255,200,0,0.15)", color: "#FFD60A",
                            border: "1px solid rgba(255,200,0,0.25)",
                          }}>⭐</span>
                        )}
                        {r && <span style={{ fontSize: 13 }}>{RATING_EMOJI[r.rating]}</span>}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.42, marginTop: 2 }}>
                        {e.scene} · {e.startTime}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, opacity: 0.38, flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {diffLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bouton SoundCloud */}
        <a
          href={`https://soundcloud.com/search?q=${encodeURIComponent(entry.artistName)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center",
            padding: "14px 16px", borderRadius: 16,
            background: "rgba(255,85,0,0.10)",
            border: "1px solid rgba(255,85,0,0.28)",
            color: "#FF5500",
            fontSize: 14, fontWeight: 600,
            textDecoration: "none", fontFamily: "inherit",
          }}
        >
          {t("programmation.soundcloudBtn")}
        </a>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ scenes }: {
  scenes: ReadonlyArray<{ readonly key: string; readonly emoji: string }>;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{
        textAlign: "center", fontSize: 13, opacity: 0.40,
        margin: "8px 0 18px", fontStyle: "italic", lineHeight: 1.5,
      }}>
        {t("programmation.comingSoon")}
      </p>
      {scenes.map(({ key, emoji }) => {
        const color = SCENE_COLORS[key] ?? "#ffffff";
        return (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,0.04)", border: `1px solid ${color}28`,
          }}>
            <span style={{
              fontSize: 24, width: 44, height: 44, borderRadius: 12,
              background: `${color}14`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 11, opacity: 0.38, marginTop: 2 }}>
                {t("programmation.comingArtists")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ProgrammationScreen ───────────────────────────────────────────────────────
export function ProgrammationScreen({ onBack }: Props) {
  const { t } = useTranslation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState<TabId>("programme");
  const [activeScene,     setActiveScene]     = useState<string>("");
  const [dayFilter,       setDayFilter]       = useState<string>("");
  const [ratingFilter,    setRatingFilter]    = useState<RatingFilter>("");
  const [artistSearch,    setArtistSearch]    = useState<string>("");
  const [showLegendsOnly, setShowLegendsOnly] = useState<boolean>(false);
  const [recoMood,        setRecoMood]        = useState<MoodFilter>("");
  const [now,             setNow]             = useState<Date>(() => new Date());
  const [ratings,         setRatings]         = useState<Map<string, LineupRating>>(new Map());
  const [selectedArtist,  setSelectedArtist]  = useState<TimetableEntry | null>(null);
  const [ioMsg,           setIoMsg]           = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const scenes  = [...SCENES] as Array<{ key: string; emoji: string }>;
  const hasData = TIMETABLE.length > 0;

  // ── Effets ─────────────────────────────────────────────────────────────────

  // Charger notations au montage
  useEffect(() => {
    listAllLineupRatings().then((list) => {
      setRatings(new Map(list.map((r) => [r.artistName, r])));
    });
  }, []);

  // Rafraîchir l'heure chaque minute (pour le tab Reco)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────

  const availableDays = useMemo(() => {
    const days = new Set(TIMETABLE.filter((e) => e.day).map((e) => e.day!));
    return [...days].sort();
  }, []);

  // Tab Programme : triple filtre + tri
  const filteredArtists = useMemo(() => {
    return TIMETABLE
      .filter((e) => !activeScene   || e.scene === activeScene)
      .filter((e) => !dayFilter     || e.day   === dayFilter)
      .filter((e) => {
        if (!ratingFilter) return true;
        const r = ratings.get(e.artistName);
        if (ratingFilter === "unrated") return !r;
        return r?.rating === ratingFilter;
      })
      .sort((a, b) => {
        if (a.day !== b.day) return (a.day ?? "").localeCompare(b.day ?? "");
        return (a.startTime ?? "").localeCompare(b.startTime ?? "");
      });
  }, [activeScene, dayFilter, ratingFilter, ratings]);

  // Grouper par scène (vue "Toutes" du Programme)
  const byScene = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    for (const e of filteredArtists) {
      if (!map[e.scene]) map[e.scene] = [];
      map[e.scene].push(e);
    }
    return map;
  }, [filteredArtists]);

  // Tab Artistes : dédupliqué par nom + filtre + tri alpha
  const artistsDeduped = useMemo(() => {
    const seen = new Set<string>();
    const result: TimetableEntry[] = [];
    for (const entry of TIMETABLE) {
      if (activeScene && entry.scene !== activeScene) continue;
      if (!seen.has(entry.artistName)) {
        seen.add(entry.artistName);
        result.push(entry);
      }
    }
    return result.sort((a, b) => a.artistName.localeCompare(b.artistName));
  }, [activeScene]);

  const artistsFiltered = useMemo(() => {
    return artistsDeduped
      .filter((e) => !artistSearch    || e.artistName.toLowerCase().includes(artistSearch.toLowerCase()))
      .filter((e) => !showLegendsOnly || e.legend === true);
  }, [artistsDeduped, artistSearch, showLegendsOnly]);

  // Tab Reco
  const recoEntries = useMemo(() => {
    return getRecoEntries(now, recoMood, ratings);
  }, [now, recoMood, ratings]);

  const isInFestival = getFestivalDay(now) !== null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleRatingChange(artistName: string, newRating: RatingValue, comment: string) {
    const updated: LineupRating = {
      artistName, rating: newRating, comment,
      updatedAt: new Date().toISOString(),
    };
    await setLineupRating(updated);
    setRatings((prev) => new Map(prev).set(artistName, updated));
  }

  function openDetail(entry: TimetableEntry) { setSelectedArtist(entry); }
  function closeDetail()                      { setSelectedArtist(null); }

  // ── Export / import des notations (sauvegarde avant réinstallation) ────────
  function flashIoMsg(msg: string) {
    setIoMsg(msg);
    setTimeout(() => setIoMsg(null), 3500);
  }

  function handleExportRatings() {
    const list = [...ratings.values()];
    const payload = {
      format: "remanence-lineup-ratings",
      version: 1,
      exportedAt: new Date().toISOString(),
      ratings: list,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "remanence-notes-artistes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flashIoMsg(t("programmation.exportDone", { count: list.length }));
  }

  async function handleImportRatings(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list: unknown = Array.isArray(data) ? data : data?.ratings;
      if (!Array.isArray(list)) throw new Error("format");
      let count = 0;
      const next = new Map(ratings);
      for (const r of list) {
        if (!r || typeof r.artistName !== "string" || !["go", "maybe", "skip"].includes(r.rating)) continue;
        const clean: LineupRating = {
          artistName: r.artistName,
          rating:     r.rating,
          comment:    typeof r.comment   === "string" ? r.comment   : "",
          updatedAt:  typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
        };
        await setLineupRating(clean);
        next.set(clean.artistName, clean);
        count++;
      }
      setRatings(next);
      flashIoMsg(t("programmation.importDone", { count }));
    } catch {
      flashIoMsg(t("programmation.importError"));
    }
  }

  // ── Pills de filtre notation ───────────────────────────────────────────────
  const ratingFilters: Array<{ value: RatingFilter; label: string }> = [
    { value: "",        label: t("programmation.ratingAll") },
    { value: "go",      label: `${RATING_EMOJI.go} ${t("programmation.ratingGo")}` },
    { value: "maybe",   label: `${RATING_EMOJI.maybe} ${t("programmation.ratingMaybe")}` },
    { value: "skip",    label: `${RATING_EMOJI.skip} ${t("programmation.ratingSkip")}` },
    { value: "unrated", label: t("programmation.ratingUnrated") },
  ];

  // ── Vue détail artiste (overlay full-screen) ───────────────────────────────
  if (selectedArtist) {
    return (
      <ArtistDetail
        entry={selectedArtist}
        rating={ratings.get(selectedArtist.artistName)}
        ratings={ratings}
        onBack={closeDetail}
        onRatingChange={(newRating, comment) =>
          handleRatingChange(selectedArtist.artistName, newRating, comment)
        }
        onSelectArtist={(e) => setSelectedArtist(e)}
      />
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            {t("programmation.title")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
            {hasData
              ? t("programmation.subtitleData", { artists: TIMETABLE.length, scenes: scenes.length })
              : t("programmation.comingSoon")}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Export / import des notations */}
          <button
            onClick={handleExportRatings}
            title={t("programmation.exportRatings")}
            aria-label={t("programmation.exportRatings")}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999, width: 36, height: 36,
              fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            💾
          </button>
          <button
            onClick={() => importFileRef.current?.click()}
            title={t("programmation.importRatings")}
            aria-label={t("programmation.importRatings")}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999, width: 36, height: 36,
              fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            📥
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={handleImportRatings}
          />
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999, padding: "8px 16px",
              fontSize: 13, color: "white", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t("common.home")}
          </button>
        </div>
      </div>

      {/* ── Confirmation export/import ── */}
      {ioMsg && (
        <div style={{
          flexShrink: 0,
          padding: "8px 16px",
          fontSize: 12,
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
          background: "rgba(52,199,89,0.14)",
          borderBottom: "1px solid rgba(52,199,89,0.25)",
        }}>
          {ioMsg}
        </div>
      )}

      {/* ── Onglets ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        padding: "8px 16px 0",
        gap: 6,
      }}>
        {(["programme", "artistes", "reco"] as TabId[]).map((tab) => {
          const labels: Record<TabId, string> = {
            programme: t("programmation.tabProgramme"),
            artistes:  t("programmation.tabArtistes"),
            reco:      t("programmation.tabReco"),
          };
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: 10,
                background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: active ? 700 : 400,
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── Filtres scène — Programme + Artistes ── */}
      {(activeTab === "programme" || activeTab === "artistes") && (
        <div className="no-scrollbar" style={{
          flexShrink: 0, display: "flex", gap: 8, overflowX: "auto",
          padding: "10px 16px 6px",
        }}>
          <button
            onClick={() => setActiveScene("")}
            style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: 999,
              background: !activeScene ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
              border: !activeScene ? "1px solid rgba(255,255,255,0.30)" : "1px solid rgba(255,255,255,0.10)",
              color: "white",
              fontSize: 12, fontWeight: !activeScene ? 600 : 400,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t("programmation.allScenes")}
          </button>
          {scenes.map(({ key, emoji }) => {
            const color  = SCENE_COLORS[key] ?? "#ffffff";
            const active = activeScene === key;
            return (
              <button key={key} onClick={() => setActiveScene(active ? "" : key)} style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 999,
                background: active ? `${color}20` : "rgba(255,255,255,0.05)",
                border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.10)",
                color: active ? color : "rgba(255,255,255,0.65)",
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
                {emoji} {key}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filtres jour — Programme uniquement ── */}
      {activeTab === "programme" && (
        <div className="no-scrollbar" style={{
          flexShrink: 0, display: "flex", gap: 6, overflowX: "auto",
          padding: "4px 16px 6px",
        }}>
          <button
            onClick={() => setDayFilter("")}
            style={{
              flexShrink: 0, padding: "4px 12px", borderRadius: 999,
              background: !dayFilter ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              border: !dayFilter ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
              color: !dayFilter ? "white" : "rgba(255,255,255,0.45)",
              fontSize: 11, fontWeight: !dayFilter ? 600 : 400,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}
          >
            {t("programmation.dayAll")}
          </button>
          {availableDays.map((day) => {
            const active = dayFilter === day;
            return (
              <button key={day} onClick={() => setDayFilter(active ? "" : day)} style={{
                flexShrink: 0, padding: "4px 12px", borderRadius: 999,
                background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.45)",
                fontSize: 11, fontWeight: active ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
                {DAY_LABELS[day] ?? day}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filtres notation — Programme uniquement ── */}
      {activeTab === "programme" && (
        <div className="no-scrollbar" style={{
          flexShrink: 0, display: "flex", gap: 6, overflowX: "auto",
          padding: "4px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {ratingFilters.map(({ value, label }) => {
            const active = ratingFilter === value;
            return (
              <button key={value === "" ? "all" : value} onClick={() => setRatingFilter(value)} style={{
                flexShrink: 0, padding: "4px 12px", borderRadius: 999,
                background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.45)",
                fontSize: 11, fontWeight: active ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Barre de recherche + filtre légendes — Artistes ── */}
      {activeTab === "artistes" && (
        <div style={{ flexShrink: 0, padding: "6px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            type="search"
            value={artistSearch}
            onChange={(e) => setArtistSearch(e.target.value)}
            placeholder={t("programmation.searchPlaceholder")}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "10px 14px",
              fontSize: 14, color: "white", fontFamily: "inherit", outline: "none",
              marginBottom: 8,
            }}
          />
          <button
            onClick={() => setShowLegendsOnly((v) => !v)}
            style={{
              padding: "4px 14px", borderRadius: 999,
              background: showLegendsOnly ? "rgba(255,200,0,0.15)" : "rgba(255,255,255,0.05)",
              border: showLegendsOnly ? "1px solid rgba(255,200,0,0.35)" : "1px solid rgba(255,255,255,0.10)",
              color: showLegendsOnly ? "#FFD60A" : "rgba(255,255,255,0.55)",
              fontSize: 12, fontWeight: showLegendsOnly ? 700 : 400,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t("programmation.legendFilter")}
          </button>
        </div>
      )}

      {/* ── Body scrollable ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 40px" }}>

        {/* ══ TAB PROGRAMME ══ */}
        {activeTab === "programme" && (
          <>
            {!hasData && <EmptyState scenes={scenes} />}

            {hasData && filteredArtists.length === 0 && (
              <div style={{ textAlign: "center", opacity: 0.40, padding: "40px 0", fontSize: 13, fontStyle: "italic" }}>
                {t("programmation.noArtists")}
              </div>
            )}

            {/* Scène sélectionnée ou filtre jour → liste plate triée */}
            {hasData && (activeScene || dayFilter) && filteredArtists.length > 0 &&
              filteredArtists.map((entry) => (
                <ArtistCard
                  key={`${entry.artistName}-${entry.scene}-${entry.day ?? ""}`}
                  entry={entry}
                  rating={ratings.get(entry.artistName)}
                  onClick={() => openDetail(entry)}
                />
              ))
            }

            {/* Vue "Toutes" sans filtre jour → groupé par scène */}
            {hasData && !activeScene && !dayFilter && filteredArtists.length > 0 &&
              scenes
                .filter(({ key }) => byScene[key]?.length > 0)
                .map(({ key, emoji }) => (
                  <SceneSection
                    key={key} sceneKey={key} emoji={emoji}
                    entries={byScene[key]}
                    ratings={ratings}
                    onSelectArtist={openDetail}
                  />
                ))
            }
          </>
        )}

        {/* ══ TAB ARTISTES ══ */}
        {activeTab === "artistes" && (
          <>
            {artistsFiltered.length === 0 ? (
              <div style={{ textAlign: "center", opacity: 0.40, padding: "40px 0", fontSize: 13, fontStyle: "italic" }}>
                {t("programmation.noArtists")}
              </div>
            ) : (
              artistsFiltered.map((entry) => (
                <ArtistCard
                  key={`${entry.artistName}-${entry.scene}`}
                  entry={entry}
                  rating={ratings.get(entry.artistName)}
                  onClick={() => openDetail(entry)}
                />
              ))
            )}
          </>
        )}

        {/* ══ TAB RECO ══ */}
        {activeTab === "reco" && (
          <>
            {/* Contexte horaire */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, opacity: 0.45, marginBottom: 4 }}>
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {getFestivalDay(now)
                  ? `${getFestivalDay(now)} — ${DAY_LABELS[getFestivalDay(now)!] ?? ""}`
                  : t("programmation.recoOutsideFestival")}
              </div>
            </div>

            {/* Boutons mood */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {([
                { value: "galoper",  label: t("programmation.moodGaloper")  },
                { value: "poser",    label: t("programmation.moodPoser")    },
                { value: "reposer",  label: t("programmation.moodReposer")  },
              ] as Array<{ value: MoodFilter; label: string }>).map(({ value, label }) => {
                const active = recoMood === value;
                return (
                  <button
                    key={value}
                    onClick={() => setRecoMood(active ? "" : value)}
                    style={{
                      flex: 1, padding: "12px 6px", borderRadius: 14,
                      background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                      border: active ? "1px solid rgba(255,255,255,0.30)" : "1px solid rgba(255,255,255,0.10)",
                      color: active ? "white" : "rgba(255,255,255,0.50)",
                      fontSize: 12, fontWeight: active ? 700 : 400,
                      cursor: "pointer", fontFamily: "inherit",
                      textAlign: "center", lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* État hors festival */}
            {!isInFestival && (
              <div style={{ textAlign: "center", opacity: 0.40, padding: "32px 0", fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>
                {t("programmation.recoOutsideFestival")}
                <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                  Ozora 2026 · 25 juillet – 3 août
                </div>
              </div>
            )}

            {/* Recommandations */}
            {isInFestival && recoEntries.length === 0 && (
              <div style={{ textAlign: "center", opacity: 0.40, padding: "32px 0", fontSize: 13, fontStyle: "italic" }}>
                {recoMood ? t("programmation.recoNoMood") : t("programmation.recoEmpty")}
              </div>
            )}

            {isInFestival && recoEntries.map(({ entry, status, minutesUntil }) => {
              const label = status === "now"
                ? t("programmation.recoNow")
                : formatTimeUntil(minutesUntil, t);
              return (
                <ArtistCard
                  key={`${entry.artistName}-${entry.scene}-${entry.day ?? ""}`}
                  entry={entry}
                  rating={ratings.get(entry.artistName)}
                  onClick={() => openDetail(entry)}
                  statusLabel={label}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
