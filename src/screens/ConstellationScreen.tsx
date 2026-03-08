import { useRef, useState, useMemo, type ReactNode, type TouchEvent as ReactTouchEvent } from "react";
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import { formatTime } from "./utils";

// ── Filtres ───────────────────────────────────────────────────────────────────

const FOCUS_OPTIONS = [
  { key: "mental",  emoji: "🧠", label: "Mental"   },
  { key: "emotion", emoji: "❤️", label: "Émotions" },
  { key: "body",    emoji: "🕺", label: "Corps"    },
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
        padding: "5px 12px",
        fontSize: 15,
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
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  // ── Filtres ──
  const [activeFocus, setActiveFocus] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string[]>([]);

  function toggleFocus(key: string) {
    setActiveFocus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }
  function toggleStage(name: string) {
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

  const links = useMemo(() => {
    const result: Array<{
      a: (typeof stars)[number];
      b: (typeof stars)[number];
      opacity: number;
      duration: number;
    }> = [];

    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i];
        const b = stars[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 18;

        if (distance < maxDistance) {
          const ratio = 1 - distance / maxDistance;
          const opacity = 0.03 + ratio * 0.24;
          const duration = 3.4 + ((i + j) % 4) * 0.7;
          result.push({ a, b, opacity, duration });
        }
      }
    }

    return result;
  }, [stars]);

  return (
    <div style={{ display: "grid", gap: 20, minHeight: "100dvh", alignContent: "start" }}>
      <style>{CSS}</style>

      <h2 style={{ margin: 2 }}>✨ Constellation personnalisée ✨</h2>

      {/* ── Filtres ── */}
      {journal.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FOCUS_OPTIONS.map((f) => (
              <FilterChip
                key={f.key}
                active={activeFocus.includes(f.key)}
                onClick={() => toggleFocus(f.key)}
              >
                {f.emoji} {f.label}
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
          {(activeFocus.length > 0 || activeStage.length > 0) && (
            <div style={{ fontSize: 12, opacity: 0.5 }}>
              {filteredJournal.length} étoile{filteredJournal.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          position: "relative",
          height: "min(600px, calc(100dvh - 220px))",
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
              ? "Ta constellation apparaîtra ici après tes premiers souvenirs ✨"
              : "Aucune étoile ne correspond aux filtres sélectionnés."}
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
          {/* Liaisons entre étoiles proches */}
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
            {links.map((link, index) => (
              <line
                key={`${link.a.item.id}-${link.b.item.id}-${index}`}
                x1={link.a.x}
                y1={link.a.y}
                x2={link.b.x}
                y2={link.b.y}
                stroke={link.a.displayColor}
                strokeOpacity={link.opacity}
                strokeWidth="0.22"
                style={{ animation: `linkBreath ${link.duration}s ease-in-out infinite` }}
              />
            ))}
          </svg>

          {/* Étoiles */}
          {stars.map((star) => (
            <div
              key={star.item.id}
              onClick={() => onSelectStar(star.item)}
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

          {/* Noms d'artistes — apparaissent à partir de zoom ≥ 2.0 */}
          {zoom >= 2.0 && stars.map((star) => (
            <div
              key={`label-${star.item.id}`}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: `translate(-50%, calc(-50% - ${star.starSize / 2 + 10}px))`,
                fontSize: 8,
                color: star.displayColor,
                opacity: Math.min(1, (zoom - 2.0) * 3),
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
      </div>

      <RoundButton variant="secondary" onClick={onBack}>
        Home ॐ
      </RoundButton>
    </div>
  );
}
