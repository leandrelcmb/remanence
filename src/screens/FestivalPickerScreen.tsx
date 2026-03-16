import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { RoundButton } from "../app/ui/RoundButton";
import type { Festival } from "../core/models/types";

interface Props {
  festivals: Festival[];
  activeFestivalId: string;
  onSwitch: (id: string) => void;
  onCreate: (params: { name: string; startDate: string; endDate: string; location?: string }) => Promise<Festival>;
  onBack: () => void;
}

function formatFestivalDates(startISO: string, endISO: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(startISO).toLocaleDateString("fr-FR", opts);
  const end = new Date(endISO).toLocaleDateString("fr-FR", opts);
  return `${start} → ${end}`;
}

export function FestivalPickerScreen({ festivals, activeFestivalId, onSwitch, onCreate, onBack }: Props) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);
    try {
      const newFest = await onCreate({ name, startDate, endDate, location: location || undefined });
      setName("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setShowForm(false);
      onSwitch(newFest.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>

      {/* Titre */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 300, margin: 0 }}>{t('festivalPicker.title')}</h2>
        <p style={{ fontSize: 13, opacity: 0.45, marginTop: 6, margin: 0 }}>
          {t('festivalPicker.subtitle')}
        </p>
      </div>

      {/* Liste des festivals */}
      <div style={{ display: "grid", gap: 10 }}>
        {festivals.map((fest) => {
          const isActive = fest.id === activeFestivalId;
          return (
            <button
              key={fest.id}
              onClick={() => { if (!isActive) onSwitch(fest.id); }}
              style={{
                background: isActive
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "16px 20px",
                textAlign: "left",
                cursor: isActive ? "default" : "pointer",
                color: "inherit",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              {/* Indicateur actif */}
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isActive ? "#7B5EA7" : "rgba(255,255,255,0.2)",
                flexShrink: 0,
              }} />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: isActive ? 500 : 400 }}>
                  {fest.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 3 }}>
                  {formatFestivalDates(fest.startDate, fest.endDate)}
                  {fest.location && ` · ${fest.location}`}
                </div>
              </div>

              {isActive && (
                <span style={{ fontSize: 11, opacity: 0.5, letterSpacing: "0.06em" }}>
                  {t('festivalPicker.active')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Formulaire de création */}
      {showForm ? (
        <div style={{
          display: "grid",
          gap: 14,
          padding: 20,
          borderRadius: 18,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{t('festivalPicker.newFestival')}</p>

          {/* Nom */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('festivalPicker.namePlaceholder')}
            maxLength={60}
            style={inputStyle}
          />

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>{t('festivalPicker.from')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('festivalPicker.to')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Lieu (optionnel) */}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('festivalPicker.locationPlaceholder')}
            maxLength={80}
            style={inputStyle}
          />

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <RoundButton
                variant="primary"
                onClick={handleCreate}
                disabled={!name.trim() || !startDate || !endDate || saving}
              >
                {saving ? t('common.loading') : t('festivalPicker.create')}
              </RoundButton>
            </div>
            <div style={{ flex: 1 }}>
              <RoundButton variant="secondary" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </RoundButton>
            </div>
          </div>
        </div>
      ) : (
        <RoundButton variant="secondary" onClick={() => setShowForm(true)}>
          {t('festivalPicker.addFestival')}
        </RoundButton>
      )}

      {/* Retour */}
      <RoundButton variant="secondary" onClick={onBack}>
        {t('festivalPicker.backHome')}
      </RoundButton>

    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 15,
  color: "inherit",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  opacity: 0.4,
  letterSpacing: "0.08em",
  marginBottom: 6,
};
