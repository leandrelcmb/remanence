import { useRef, useState, useMemo, useEffect, type ReactNode, type TouchEvent as ReactTouchEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useTranslation } from 'react-i18next';
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RGB_COLORS } from "./ColorEnergyScreen";
import { CALENDAR_TO_FESTIVAL_DAY } from "./ProgrammationScreen";
import { formatTime } from "./utils";

// ── Filtres ───────────────────────────────────────────────────────────────────

const FOCUS_OPTIONS = [
  { key: "mental",  emoji: "🧠", tKey: "common.mental"   },
  { key: "emotion", emoji: "❤️", tKey: "common.emotions" },
  { key: "body",    emoji: "🕺", tKey: "common.body"     },
];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        lineHeight: 1,
        background: active ? "rgba(160,120,255,0.28)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? "rgba(160,120,255,0.55)" : "rgba(255,255,255,0.1)"}`,
        color: "white",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

type Props = {
  journal: JournalItem[];
  festivalStart: string; // ISO date
  festivalEnd: string;   // ISO date
  onSelectStar: (item: JournalItem) => void;
  onBack: () => void;
  /** Impose une couleur au halo de l'app (null = comportement normal) */
  onAmbientColor: (color: string | null) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTouchDistance(touches: ReactTouchEvent<HTMLDivElement>["touches"]) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(
  touches: ReactTouchEvent<HTMLDivElement>["touches"],
  rect: DOMRect
) {
  // Returns midpoint relative to container center (signed)
  const midX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left - rect.width / 2;
  const midY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top - rect.height / 2;
  return { x: midX, y: midY };
}

const CSS = `
  @keyframes starPulse {
    0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.82; }
    50%  { transform: translate(-50%, -50%) scale(1.16); opacity: 1;    }
    100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.82; }
  }
  @keyframes linkBreath {
    0%   { opacity: 0.45; }
    50%  { opacity: 1;    }
    100% { opacity: 0.45; }
  }
`;

export function ConstellationScreen({
  journal,
  festivalStart,
  festivalEnd,
  onSelectStar,
  onBack,
  onAmbientColor,
}: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"carte" | "couleurs">("carte");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [previewStar, setPreviewStar] = useState<JournalItem | null>(null);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  // ── Filtres ──
  const [activeFocus, setActiveFocus] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string[]>([]);

  function toggleFocus(key: string) {
    setPreviewStar(null);
    setActiveFocus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }
  function toggleStage(name: string) {
    setPreviewStar(null);
    setActiveStage((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  const stages = useMemo(
    () => [...new Set(journal.map((i) => i.stageName).filter(Boolean))],
    [journal]
  );

  const filteredJournal = useMemo(() => {
    return journal.filter((item) => {
      const okFocus = activeFocus.length === 0 || activeFocus.includes(item.focus);
      const okStage = activeStage.length === 0 || activeStage.includes(item.stageName);
      return okFocus && okStage;
    });
  }, [journal, activeFocus, activeStage]);

  const containerRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{
    dist: number;
    zoom: number;
    pan: { x: number; y: number };
    mid: { x: number; y: number };
    rect: DOMRect;
  } | null>(null);

  function handleTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 2) return;
    setPreviewStar(null); // le pinch ferme l'aperçu
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    pinchRef.current = {
      dist: getTouchDistance(e.touches),
      zoom,
      pan: { ...pan },
      mid: getTouchMidpoint(e.touches, rect),
      rect,
    };
    setIsPinching(true);
  }

  function handleTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();

    const { dist: startDist, zoom: startZoom, pan: startPan, mid, rect } = pinchRef.current;
    const currentDist = getTouchDistance(e.touches);
    if (!currentDist) return;

    const rawZoom = startZoom * (currentDist / startDist);
    const newZoom = clamp(rawZoom, 1, 3);

    if (newZoom <= 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    // Keep the pinch midpoint fixed in screen space.
    // Formula: pan2 = mid * (1 - ratio) + pan1 * ratio
    // where ratio = newZoom / startZoom
    const ratio = newZoom / startZoom;
    const rawPanX = mid.x * (1 - ratio) + startPan.x * ratio;
    const rawPanY = mid.y * (1 - ratio) + startPan.y * ratio;

    // Clamp so content never goes outside container bounds
    const maxPanX = (rect.width / 2) * (newZoom - 1);
    const maxPanY = (rect.height / 2) * (newZoom - 1);

    setZoom(newZoom);
    setPan({
      x: clamp(rawPanX, -maxPanX, maxPanX),
      y: clamp(rawPanY, -maxPanY, maxPanY),
    });
  }

  function handleTouchEnd() {
    pinchRef.current = null;
    setIsPinching(false);
  }

  // Y-axis bounds: use festival dates when available, fall back to entry dates.
  const festStart = festivalStart ? new Date(festivalStart).getTime() : null;
  const festEnd = festivalEnd ? new Date(festivalEnd).getTime() : null;

  const constellationBounds = useMemo(() => {
    if (filteredJournal.length === 0) return null;

    const times = filteredJournal.map((item) => new Date(item.startTime).getTime());
    const entriesMin = Math.min(...times);
    const entriesMax = Math.max(...times);

    // Use festival bounds if at least one entry falls within the festival period
    if (festStart && festEnd && festEnd > festStart) {
      const hasEntryInFestival = times.some((t) => t >= festStart && t <= festEnd);
      if (hasEntryInFestival) {
        return { min: festStart, max: festEnd };
      }
    }

    // Fallback: entry bounds with a minimum 24h span so entries don't all cluster
    const minSpan = 24 * 60 * 60 * 1000;
    return {
      min: entriesMin,
      max: Math.max(entriesMax, entriesMin + minSpan),
    };
  }, [filteredJournal, festStart, festEnd]);

  const stars = useMemo(() => {
    return filteredJournal.map((item, index) => {
      const displayColor = energyTint(item.colorHex, item.energy);
      const x = 8 + ((item.energy - 1) / 9) * 84;

      const time = new Date(item.startTime).getTime();
      let y = 50;

      if (constellationBounds && constellationBounds.max !== constellationBounds.min) {
        const clampedTime = clamp(time, constellationBounds.min, constellationBounds.max);
        const ratio =
          (clampedTime - constellationBounds.min) /
          (constellationBounds.max - constellationBounds.min);
        // bottom = day 1 (y≈92), top = last day (y≈8)
        y = 92 - ratio * 84;
      }

      const wobbleX = ((index % 3) - 1) * 2.2;
      const wobbleY = ((index % 4) - 1.5) * 1.8;
      const starSize = 16 + item.energy * 1.35;
      const glowSize = 18 + item.energy * 2.8;

      return {
        item,
        displayColor,
        x: x + wobbleX,
        y: y + wobbleY,
        starSize,
        glowSize,
      };
    });
  }, [filteredJournal, constellationBounds]);

  // ── Fil du voyage : segments chronologiques entre étoiles ──────────────────
  const journeyLinks = useMemo(() => {
    const ordered = [...stars].sort(
      (a, b) => new Date(a.item.startTime).getTime() - new Date(b.item.startTime).getTime()
    );
    const result: Array<{
      a: (typeof stars)[number];
      b: (typeof stars)[number];
      duration: number;
    }> = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      result.push({ a: ordered[i], b: ordered[i + 1], duration: 3.4 + (i % 4) * 0.7 });
    }
    return result;
  }, [stars]);

  // ── Repères de jour (10h00 locale = début de journée festival) ─────────────
  const dayLines = useMemo(() => {
    if (!constellationBounds || !festStart || !festEnd) return [];
    // Uniquement quand l'axe Y suit les bornes du festival
    if (constellationBounds.min !== festStart) return [];

    const lines: Array<{ y: number; label: string }> = [];
    const span = constellationBounds.max - constellationBounds.min;
    if (span <= 0) return lines;

    // Une frontière par jour calendaire à 10h00 (début de journée festival) ;
    // label via le mapping officiel date → Day X de la programmation
    const first = new Date(festStart);
    first.setHours(10, 0, 0, 0);

    for (let n = 0; n <= 20; n++) {
      const boundaryDate = new Date(first.getTime() + n * 24 * 60 * 60 * 1000);
      const boundary = boundaryDate.getTime();
      if (boundary > constellationBounds.max) break;
      if (boundary < constellationBounds.min) continue;
      const yyyy = boundaryDate.getFullYear();
      const mm   = String(boundaryDate.getMonth() + 1).padStart(2, "0");
      const dd   = String(boundaryDate.getDate()).padStart(2, "0");
      const label = CALENDAR_TO_FESTIVAL_DAY[`${yyyy}-${mm}-${dd}`];
      if (!label) continue; // hors période timetable → pas de repère
      const ratio = (boundary - constellationBounds.min) / span;
      lines.push({ y: 92 - ratio * 84, label });
    }
    return lines;
  }, [constellationBounds, festStart, festEnd]);

  // ── Double-tap : zoom ancré / dézoom (fond du canvas) ──────────────────────
  function handleCanvasClick(e: ReactMouseEvent<HTMLDivElement>) {
    setPreviewStar(null); // tap hors étoile → ferme l'aperçu
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const now = Date.now();
    const last = lastTapRef.current;
    lastTapRef.current = { time: now, x, y };

    if (last && now - last.time < 300 && Math.abs(x - last.x) < 30 && Math.abs(y - last.y) < 30) {
      lastTapRef.current = null;
      if (zoom > 1) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else {
        // Même formule d'ancrage que le pinch : pan2 = p*(1-ratio) + pan1*ratio
        const targetZoom = 2.2;
        const ratio = targetZoom / zoom;
        const maxPanX = (rect.width / 2) * (targetZoom - 1);
        const maxPanY = (rect.height / 2) * (targetZoom - 1);
        setZoom(targetZoom);
        setPan({
          x: clamp(x * (1 - ratio) + pan.x * ratio, -maxPanX, maxPanX),
          y: clamp(y * (1 - ratio) + pan.y * ratio, -maxPanY, maxPanY),
        });
      }
    }
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // ── Onglet Couleurs : pages groupées par couleur de souvenir ───────────────
  const colorPages = useMemo(() => {
    const groups = new Map<string, JournalItem[]>();
    for (const item of journal) {
      const key = item.colorHex;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    // Ordre du picker, puis d'éventuelles couleurs hors palette
    const orderedKeys = [
      ...RGB_COLORS.filter((c) => groups.has(c)),
      ...[...groups.keys()].filter((c) => !(RGB_COLORS as readonly string[]).includes(c)),
    ];
    return orderedKeys.map((color) => {
      const items = groups.get(color)!;
      // Artistes dédupliqués — on garde le souvenir le plus intense
      const byArtist = new Map<string, JournalItem>();
      for (const it of items) {
        const cur = byArtist.get(it.artistName);
        if (!cur || it.energy > cur.energy) byArtist.set(it.artistName, it);
      }
      const avgEnergy = Math.round(items.reduce((s, it) => s + it.energy, 0) / items.length);
      return { color, artists: [...byArtist.values()], avgEnergy };
    });
  }, [journal]);

  // Halo adaptatif : suit la page couleur active, se nettoie en quittant
  useEffect(() => {
    if (activeTab === "couleurs" && colorPages[activeColorIdx]) {
      const page = colorPages[activeColorIdx];
      onAmbientColor(energyTint(page.color, page.avgEnergy));
    } else {
      onAmbientColor(null);
    }
    return () => onAmbientColor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeColorIdx, colorPages]);

  // Swipe horizontal : index de page actif dérivé du scroll (throttlé)
  function handlePagesScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.setTimeout(() => {
      scrollRafRef.current = null;
      const idx = clamp(Math.round(el.scrollLeft / el.clientWidth), 0, colorPages.length - 1);
      setActiveColorIdx((prev) => (prev === idx ? prev : idx));
    }, 80);
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>{t('constellation.title')}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{t('constellation.subtitle')}</div>
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
          {t('common.home')}
        </button>
      </div>

      {/* ── Onglets Carte / Couleurs ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        padding: "8px 16px 0",
        gap: 6,
      }}>
        {(["carte", "couleurs"] as const).map((tab) => {
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
              {tab === "carte" ? t('constellation.tabCarte') : t('constellation.tabCouleurs')}
            </button>
          );
        })}
      </div>

      {/* ── Corps ── */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
      }}>

      {activeTab === "carte" && (
      <>

      {/* ── Filtres ── */}
      {journal.length > 0 && (
        <div style={{ display: "grid", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FOCUS_OPTIONS.map((f) => (
              <FilterChip
                key={f.key}
                active={activeFocus.includes(f.key)}
                onClick={() => toggleFocus(f.key)}
              >
                {f.emoji} {t(f.tKey)}
              </FilterChip>
            ))}
          </div>
          {stages.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {stages.map((s) => (
                <FilterChip
                  key={s}
                  active={activeStage.includes(s)}
                  onClick={() => toggleStage(s)}
                >
                  {s}
                </FilterChip>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12, opacity: 0.5 }}>
            {t('constellation.star', { count: filteredJournal.length })}
            {(activeFocus.length > 0 || activeStage.length > 0)
              ? ` · ${journal.length} ${t('constellation.total')}`
              : ` ${t('constellation.total')}`}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage:
            "linear-gradient(rgba(7,0,20,0.55), rgba(7,0,20,0.78)), url('/images/space-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgba(255,255,255,0.03)",
          touchAction: "none",
        }}
      >
        {filteredJournal.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              opacity: 0.6,
              textAlign: "center",
              padding: 20,
            }}
          >
            {journal.length === 0
              ? t('constellation.empty')
              : t('constellation.emptyFiltered')}
          </div>
        )}

        {/* Couche zoomable — reçoit la transformation de pinch */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPinching ? "none" : "transform 0.18s ease-out",
          }}
        >
          {/* Lignes de jour + fil du voyage */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {/* Repères horizontaux de jour (10h00 = début de journée festival) */}
            {dayLines.map((line) => (
              <line
                key={`day-${line.label}`}
                x1={0} y1={line.y} x2={100} y2={line.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.18"
              />
            ))}

            {/* Fil du voyage : trajectoire chronologique */}
            {journeyLinks.map((link, index) => (
              <line
                key={`${link.a.item.id}-${link.b.item.id}-${index}`}
                x1={link.a.x}
                y1={link.a.y}
                x2={link.b.x}
                y2={link.b.y}
                stroke={link.a.displayColor}
                strokeOpacity={0.22}
                strokeWidth="0.3"
                style={{ animation: `linkBreath ${link.duration}s ease-in-out infinite` }}
              />
            ))}
          </svg>

          {/* Labels "Day X" des repères de jour */}
          {dayLines.map((line) => (
            <div
              key={`daylabel-${line.label}`}
              style={{
                position: "absolute",
                left: "2%",
                top: `${line.y}%`,
                transform: "translateY(calc(-100% - 2px))",
                fontSize: 8,
                opacity: 0.25,
                letterSpacing: "0.08em",
                pointerEvents: "none",
                fontWeight: 600,
              }}
            >
              {line.label}
            </div>
          ))}

          {/* Étoiles */}
          {stars.map((star) => (
            <div
              key={star.item.id}
              onClick={(e) => {
                e.stopPropagation(); // ne pas déclencher le double-tap du canvas
                setPreviewStar((prev) => (prev?.id === star.item.id ? null : star.item));
              }}
              title={`${star.item.artistName} · ${formatTime(star.item.startTime)}`}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: "translate(-50%, -50%)",
                color: star.displayColor,
                fontSize: star.starSize,
                lineHeight: 1,
                textShadow: `0 0 ${star.glowSize}px ${star.displayColor}, 0 0 ${
                  star.glowSize * 1.7
                }px ${star.displayColor}`,
                cursor: "pointer",
                userSelect: "none",
                animation: `starPulse ${2.6 - star.item.energy * 0.12}s ease-in-out infinite`,
                filter: `drop-shadow(0 0 ${Math.max(6, star.item.energy * 1.4)}px ${star.displayColor})`,
              }}
            >
              ✦
            </div>
          ))}

          {/* Noms d'artistes — étoiles intenses (≥8) toujours visibles, les autres à partir de zoom ≥ 2.0 */}
          {stars.filter((star) => zoom >= 2.0 || star.item.energy >= 8).map((star) => (
            <div
              key={`label-${star.item.id}`}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: `translate(-50%, calc(-50% - ${star.starSize / 2 + 10}px))`,
                fontSize: zoom >= 2.0 ? 8 : 9,
                color: star.displayColor,
                opacity: zoom >= 2.0 ? Math.min(1, (zoom - 2.0) * 3) : 0.65,
                whiteSpace: "nowrap",
                textShadow: "0 0 8px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,1)",
                pointerEvents: "none",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
            >
              {star.item.artistName}
            </div>
          ))}
        </div>

        {/* ── Aperçu du souvenir sélectionné (mini-carte) ── */}
        {previewStar && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectStar(previewStar);
            }}
            style={{
              position: "absolute",
              left: 12, right: 12, bottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 16,
              background: "rgba(10,4,26,0.82)",
              backdropFilter: "blur(14px)",
              border: `1px solid ${energyTint(previewStar.colorHex, previewStar.energy)}66`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 18px ${energyTint(previewStar.colorHex, previewStar.energy)}33`,
              cursor: "pointer",
              zIndex: 5,
            }}
          >
            {previewStar.photo && (
              <img
                src={previewStar.photo}
                alt=""
                style={{
                  width: 48, height: 48,
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {previewStar.artistName}
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                {formatTime(previewStar.startTime)} · ⚡ {previewStar.energy}/10
              </div>
              <div style={{
                fontSize: 11, marginTop: 3,
                color: energyTint(previewStar.colorHex, previewStar.energy),
              }}>
                {t('constellation.previewOpen')}
              </div>
            </div>
          </div>
        )}

        {/* ── Reset zoom ── */}
        {zoom > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            aria-label={t('constellation.resetZoom')}
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              width: 36, height: 36,
              borderRadius: "50%",
              background: "rgba(10,4,26,0.72)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 5,
            }}
          >
            ⤾
          </button>
        )}
      </div>

      {/* ── Légende énergie ── */}
      {filteredJournal.length > 0 && (
        <div style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 10,
          opacity: 0.35,
          letterSpacing: "0.05em",
        }}>
          <span>{t('constellation.legendCalm')}</span>
          <span style={{ fontSize: 8 }}>✦</span>
          <span style={{ opacity: 0.6 }}>———</span>
          <span style={{ fontSize: 13 }}>✦</span>
          <span>{t('constellation.legendIntense')}</span>
        </div>
      )}

      </>
      )}

      {/* ── Onglet Couleurs : nuages d'artistes par couleur ── */}
      {activeTab === "couleurs" && (
        <>
          {colorPages.length === 0 && (
            <div style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              opacity: 0.6,
              textAlign: "center",
              padding: 20,
            }}>
              {t('constellation.empty')}
            </div>
          )}

          {colorPages.length > 0 && (
            <>
              {/* Pages swipables (scroll-snap natif) */}
              <div
                className="no-scrollbar"
                onScroll={handlePagesScroll}
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {colorPages.map((page) => (
                  <div
                    key={page.color}
                    style={{
                      flex: "0 0 100%",
                      scrollSnapAlign: "center",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      alignContent: "center",
                      justifyContent: "center",
                      gap: "14px 18px",
                      padding: 24,
                      background: `radial-gradient(circle at 50% 45%, ${page.color}26 0%, rgba(7,0,20,0.6) 70%)`,
                      overflow: "hidden",
                    }}
                  >
                    {page.artists.map((item, i) => {
                      const tinted = energyTint(page.color, item.energy);
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelectStar(item)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 14 + item.energy * 2,
                            fontWeight: item.energy >= 7 ? 700 : 400,
                            color: tinted,
                            textShadow: `0 0 ${6 + item.energy * 2.4}px ${tinted}`,
                            opacity: 0.55 + item.energy * 0.045,
                            transform: `rotate(${((i * 37) % 13) - 6}deg) translateY(${((i * 53) % 17) - 8}px)`,
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.artistName}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Indicateur de pages */}
              <div style={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                gap: 8,
                paddingTop: 2,
              }}>
                {colorPages.map((page, i) => (
                  <div
                    key={page.color}
                    style={{
                      width: i === activeColorIdx ? 14 : 7,
                      height: 7,
                      borderRadius: 999,
                      background: page.color,
                      opacity: i === activeColorIdx ? 1 : 0.35,
                      boxShadow: i === activeColorIdx ? `0 0 8px ${page.color}` : "none",
                      transition: "all 0.25s ease",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      </div>
    </div>
  );
}
