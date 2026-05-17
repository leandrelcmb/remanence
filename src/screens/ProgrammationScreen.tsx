import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SCENES, TIMETABLE, DAY_LABELS } from "../app/data/timetable";
import type { TimetableEntry } from "../app/data/timetable";
import type { LineupRating } from "../core/store/repo";
import { listAllLineupRatings, setLineupRating } from "../core/store/repo";

// ── Types ─────────────────────────────────────────────────────────────────────
type RatingValue = "go" | "maybe" | "skip";
type RatingFilter = RatingValue | "unrated" | "";

// ── Couleurs par scène ────────────────────────────────────────────────────────
const SCENE_COLORS: Record<string, string> = {
  "Ozora Stage": "#BF5AF2",
  "Pumpui":      "#FF6B35",
  "The Dome":    "#00C7BE",
  "Dragon Nest": "#34C759",
  "Ambyss":      "#5E5CE6",
};

const RATING_EMOJI: Record<RatingValue, string> = {
  go:    "🟢",
  maybe: "🟠",
  skip:  "🔴",
};

type Props = { onBack: () => void };

// ── ArtistCard ────────────────────────────────────────────────────────────────
function ArtistCard({
  entry,
  rating,
  onClick,
}: {
  entry: TimetableEntry;
  rating?: LineupRating;
  onClick: () => void;
}) {
  const color = SCENE_COLORS[entry.scene] ?? "#ffffff";
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
      }}
    >
      {/* Dot couleur scène */}
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 7px ${color}99`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{entry.artistName}</div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 4,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {entry.style && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 999,
                background: `${color}1A`,
                color,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
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
              {entry.startTime}
              {entry.endTime ? ` – ${entry.endTime}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Badge de notation */}
      <div style={{ flexShrink: 0, fontSize: 16, lineHeight: 1 }}>
        {rating ? (
          <span>{RATING_EMOJI[rating.rating]}</span>
        ) : (
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.20)",
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── SceneSection ──────────────────────────────────────────────────────────────
function SceneSection({
  sceneKey,
  emoji,
  entries,
  ratings,
  onSelectArtist,
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color,
          }}
        >
          {sceneKey}
        </span>
        <span style={{ fontSize: 11, opacity: 0.35 }}>
          {t("programmation.artist", { count: entries.length })}
        </span>
      </div>
      {entries.map((entry) => (
        <ArtistCard
          key={`${entry.artistName}-${entry.scene}`}
          entry={entry}
          rating={ratings.get(entry.artistName)}
          onClick={() => onSelectArtist(entry)}
        />
      ))}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({
  scenes,
}: {
  scenes: ReadonlyArray<{ readonly key: string; readonly emoji: string }>;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          opacity: 0.40,
          margin: "8px 0 18px",
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        {t("programmation.comingSoon")}
      </p>
      {scenes.map(({ key, emoji }) => {
        const color = SCENE_COLORS[key] ?? "#ffffff";
        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}28`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
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

// ── ArtistDetail ──────────────────────────────────────────────────────────────
function ArtistDetail({
  entry,
  rating,
  onBack,
  onRatingChange,
}: {
  entry: TimetableEntry;
  rating?: LineupRating;
  onBack: () => void;
  onRatingChange: (newRating: RatingValue, comment: string) => void;
}) {
  const { t } = useTranslation();
  const color = SCENE_COLORS[entry.scene] ?? "#ffffff";
  const sceneInfo = [...SCENES].find((s) => s.key === entry.scene);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const currentRating = rating?.rating;

  const ratingLabels: Record<RatingValue, string> = {
    go:    t("programmation.ratingGo"),
    maybe: t("programmation.ratingMaybe"),
    skip:  t("programmation.ratingSkip"),
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("programmation.detailBack")}
        </button>
      </div>

      {/* Body */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "28px 20px 48px" }}
      >
        {/* Artiste info */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 12px ${color}99`,
              flexShrink: 0,
              marginTop: 7,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {entry.artistName}
            </div>
            <div style={{ fontSize: 13, opacity: 0.48 }}>
              {sceneInfo?.emoji} {entry.scene}
            </div>
          </div>
        </div>

        {/* Notation */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              opacity: 0.45,
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
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
                    flex: 1,
                    padding: "14px 8px",
                    borderRadius: 16,
                    border: active
                      ? "1.5px solid rgba(255,255,255,0.35)"
                      : "1px solid rgba(255,255,255,0.10)",
                    background: active
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.04)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{RATING_EMOJI[rv]}</span>
                  <span>{ratingLabels[rv]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              opacity: 0.45,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Notes
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => {
              if (currentRating) {
                onRatingChange(currentRating, comment);
              }
            }}
            placeholder={t("programmation.detailComment")}
            rows={4}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14,
              color: "white",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── ProgrammationScreen ───────────────────────────────────────────────────────
export function ProgrammationScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const [activeScene, setActiveScene] = useState<string>("");
  const [dayFilter, setDayFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("");
  const [ratings, setRatings] = useState<Map<string, LineupRating>>(new Map());
  const [selectedArtist, setSelectedArtist] = useState<TimetableEntry | null>(null);

  const scenes = [...SCENES] as Array<{ key: string; emoji: string }>;
  const hasData = TIMETABLE.length > 0;

  // Jours disponibles (extraits du TIMETABLE, triés)
  const availableDays = useMemo(() => {
    const days = new Set(TIMETABLE.filter((e) => e.day).map((e) => e.day!));
    return [...days].sort();
  }, []);

  // Charger les notations au montage
  useEffect(() => {
    listAllLineupRatings().then((list) => {
      setRatings(new Map(list.map((r) => [r.artistName, r])));
    });
  }, []);

  // Sauvegarder une notation
  async function handleRatingChange(
    artistName: string,
    newRating: RatingValue,
    comment: string
  ) {
    const updated: LineupRating = {
      artistName,
      rating: newRating,
      comment,
      updatedAt: new Date().toISOString(),
    };
    await setLineupRating(updated);
    setRatings((prev) => new Map(prev).set(artistName, updated));
  }

  function openDetail(entry: TimetableEntry) {
    setSelectedArtist(entry);
  }

  function closeDetail() {
    setSelectedArtist(null);
  }

  // Triple filtre : scène + jour + notation, avec tri par jour puis par heure
  const filteredArtists = useMemo(() => {
    return TIMETABLE
      .filter((e) => !activeScene || e.scene === activeScene)
      .filter((e) => !dayFilter || e.day === dayFilter)
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

  // Grouper par scène (pour la vue "Toutes")
  const byScene = useMemo(() => {
    const map: Record<string, TimetableEntry[]> = {};
    for (const entry of filteredArtists) {
      if (!map[entry.scene]) map[entry.scene] = [];
      map[entry.scene].push(entry);
    }
    return map;
  }, [filteredArtists]);

  // Vue détail artiste
  if (selectedArtist) {
    return (
      <ArtistDetail
        entry={selectedArtist}
        rating={ratings.get(selectedArtist.artistName)}
        onBack={closeDetail}
        onRatingChange={(newRating, comment) =>
          handleRatingChange(selectedArtist.artistName, newRating, comment)
        }
      />
    );
  }

  // Pills de filtre notation
  const ratingFilters: Array<{ value: RatingFilter; label: string }> = [
    { value: "",        label: t("programmation.ratingAll") },
    { value: "go",      label: `${RATING_EMOJI.go} ${t("programmation.ratingGo")}` },
    { value: "maybe",   label: `${RATING_EMOJI.maybe} ${t("programmation.ratingMaybe")}` },
    { value: "skip",    label: `${RATING_EMOJI.skip} ${t("programmation.ratingSkip")}` },
    { value: "unrated", label: t("programmation.ratingUnrated") },
  ];

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header fixe ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            {t("programmation.title")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
            {hasData
              ? t("programmation.subtitleData", {
                  artists: TIMETABLE.length,
                  scenes: scenes.length,
                })
              : t("programmation.comingSoon")}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("programmation.back")}
        </button>
      </div>

      {/* ── Filtres scène (pills) ── */}
      <div
        className="no-scrollbar"
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "10px 16px 6px",
        }}
      >
        <button
          onClick={() => setActiveScene("")}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 999,
            background: !activeScene
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.05)",
            border: !activeScene
              ? "1px solid rgba(255,255,255,0.30)"
              : "1px solid rgba(255,255,255,0.10)",
            color: "white",
            fontSize: 12,
            fontWeight: !activeScene ? 600 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("programmation.allScenes")}
        </button>
        {scenes.map(({ key, emoji }) => {
          const color = SCENE_COLORS[key] ?? "#ffffff";
          const active = activeScene === key;
          return (
            <button
              key={key}
              onClick={() => setActiveScene(active ? "" : key)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 999,
                background: active ? `${color}20` : "rgba(255,255,255,0.05)",
                border: active
                  ? `1px solid ${color}55`
                  : "1px solid rgba(255,255,255,0.10)",
                color: active ? color : "rgba(255,255,255,0.65)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {emoji} {key}
            </button>
          );
        })}
      </div>

      {/* ── Filtres jour (pills) ── */}
      <div
        className="no-scrollbar"
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: "4px 16px 6px",
        }}
      >
        <button
          onClick={() => setDayFilter("")}
          style={{
            flexShrink: 0,
            padding: "4px 12px",
            borderRadius: 999,
            background: !dayFilter ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
            border: !dayFilter ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
            color: !dayFilter ? "white" : "rgba(255,255,255,0.45)",
            fontSize: 11,
            fontWeight: !dayFilter ? 600 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {t("programmation.dayAll")}
        </button>
        {availableDays.map((day) => {
          const active = dayFilter === day;
          const label = DAY_LABELS[day] ?? day;
          return (
            <button
              key={day}
              onClick={() => setDayFilter(active ? "" : day)}
              style={{
                flexShrink: 0,
                padding: "4px 12px",
                borderRadius: 999,
                background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.45)",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Filtres notation (pills) ── */}
      <div
        className="no-scrollbar"
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: "4px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {ratingFilters.map(({ value, label }) => {
          const active = ratingFilter === value;
          return (
            <button
              key={value === "" ? "all" : value}
              onClick={() => setRatingFilter(value)}
              style={{
                flexShrink: 0,
                padding: "4px 12px",
                borderRadius: 999,
                background: active
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: active
                  ? "1px solid rgba(255,255,255,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: active ? "white" : "rgba(255,255,255,0.45)",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Body scrollable ── */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 40px" }}
      >
        {/* État vide : timetable pas encore remplie */}
        {!hasData && <EmptyState scenes={scenes} />}

        {/* Timetable disponible, aucun résultat pour les filtres */}
        {hasData && filteredArtists.length === 0 && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.40,
              padding: "40px 0",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            {t("programmation.noArtists")}
          </div>
        )}

        {/* Scène sélectionnée, ou filtre jour actif → liste plate triée */}
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
                key={key}
                sceneKey={key}
                emoji={emoji}
                entries={byScene[key]}
                ratings={ratings}
                onSelectArtist={openDetail}
              />
            ))
        }
      </div>
    </div>
  );
}
