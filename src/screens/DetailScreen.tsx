import { useState } from "react";
import { useTranslation } from 'react-i18next';
import type { JournalItem } from "../core/store/service";
import { energyTint } from "../app/ui/EnergyDots";
import { RoundButton } from "../app/ui/RoundButton";
import { formatTime, focusEmoji } from "./utils";

// ── Utilitaires couleur ───────────────────────────────────────────────────────

function parseColor(color: string): [number, number, number] {
  const v = color.trim();
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (![r, g, b].some(Number.isNaN)) return [r, g, b];
    }
  }
  const m = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return [0, 255, 183];
}
function lighten(c: number, factor: number): number {
  return Math.min(255, Math.round(c + (255 - c) * factor));
}
function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

type Props = {
  item: JournalItem;
  backTarget: "journal" | "constellation";
  onBack: () => void;
  onEdit: (item: JournalItem) => void;
  onDelete: (item: JournalItem) => void;
  haloColor?: string;
};

export function DetailScreen({ item, backTarget, onBack, onEdit, onDelete, haloColor = "#00FFB7" }: Props) {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const displayColor = energyTint(item.colorHex, item.energy);

  // ── Couleurs halo ─────────────────────────────────────────────────────────
  const [hr, hg, hb] = parseColor(haloColor);
  const haloMain     = toHex(hr, hg, hb);
  const haloLight    = toHex(lighten(hr, 0.22), lighten(hg, 0.22), lighten(hb, 0.22));
  const haloGlow     = `rgba(${hr},${hg},${hb},0.40)`;
  const haloGlowSft  = `rgba(${hr},${hg},${hb},0.22)`;

  return (
    <div style={{ display: "grid", gap: 20, minHeight: "85dvh", alignContent: "center" }}>
      <div style={{ display: "grid", gap: 6, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontWeight: 600 }}>{item.artistName}</h2>
        <div style={{ opacity: 0.6 }}>
          {formatTime(item.startTime)} · {item.stageName || "Scène inconnue"}
        </div>
      </div>

      <div
        style={{
          borderRadius: 20,
          padding: 18,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "grid",
          gap: 8,
        }}
      >
        {item.photo && (
          <img
            src={item.photo}
            alt={t('detail.imgAlt')}
            style={{ width: "100%", borderRadius: 14, marginBottom: 10 }}
          />
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{focusEmoji(item.focus)}</span>
          <span>⚡ {item.energy}/10</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: displayColor,
              boxShadow: `0 0 18px ${displayColor}`,
            }}
          />
          <span>{item.style?.trim() ? item.style : t('detail.unknownStyle')}</span>
        </div>

        {item.feelingText?.trim() && (
          <div style={{ opacity: 0.88, lineHeight: 1.5 }}>
            "{item.feelingText.trim()}"
          </div>
        )}

        {item.learningText?.trim() && (
          <div style={{ opacity: 0.62, lineHeight: 1.45 }}>
            🧙 {item.learningText.trim()}
          </div>
        )}
      </div>

      {/* Actions */}
      {!confirmingDelete ? (
        <div style={{ display: "grid", gap: 30 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => onEdit(item)}>
                {t('detail.edit')}
              </RoundButton>
            </div>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => setConfirmingDelete(true)}>
                {t('detail.delete')}
              </RoundButton>
            </div>
          </div>

          <button
            onClick={onBack}
            style={{
              width: "100%",
              borderRadius: 999,
              padding: "18px 20px",
              border: "none",
              background: `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`,
              boxShadow: `0 0 18px ${haloGlow}, 0 4px 20px ${haloGlowSft}`,
              color: "rgba(0,0,0,0.85)",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
            }}
          >
            {backTarget === "constellation" ? t('detail.backConstellation') : t('detail.backJournal')}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 14,
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,59,48,0.08)",
            border: "1px solid rgba(255,59,48,0.25)",
          }}
        >
          <p style={{ margin: 0, textAlign: "center", opacity: 0.9 }}>
            {t('detail.deleteConfirm')}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => setConfirmingDelete(false)}>
                {t('detail.cancel')}
              </RoundButton>
            </div>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => onDelete(item)}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  padding: "18px 20px",
                  border: "1px solid rgba(255,59,48,0.5)",
                  background: "rgba(255,59,48,0.18)",
                  color: "#FF3B30",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                {t('detail.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
