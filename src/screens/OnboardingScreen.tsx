import { useState } from "react";
import { RoundButton } from "../app/ui/RoundButton";

interface Props {
  onSave: (displayName: string) => Promise<void>;
}

export function OnboardingScreen({ onSave }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await onSave(trimmed);
  }

  return (
    <div style={{ display: "grid", gap: 36, paddingTop: 20 }}>

      {/* Titre */}
      <div>
        <h1 style={{ fontSize: 45, fontWeight: 200, letterSpacing: "0.04em", margin: 0 }}>
          Rémanence
        </h1>
        <p style={{ fontSize: 15, opacity: 0.45, marginTop: 6, letterSpacing: "0.08em" }}>
          CE QUI RESTE QUAND LA MUSIQUE S'ARRÊTE
        </p>
      </div>

      {/* Texte d'ambiance */}
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.85, margin: 0 }}>
          Tu vas vivre des choses difficiles à nommer.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
          Des sets qui te traversent. Une énergie brute, presque physique. Des moments
          où le temps se dilate — et parfois, l'épuisement qui suit.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.55, margin: 0 }}>
          Rémanence est là pour en garder la trace. Dans ta langue, ta perception et avec tes mots.
        </p>
      </div>

      {/* Champ pseudo */}
      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, opacity: 0.5, letterSpacing: "0.1em" }}>
          QUEL NOM ÉCRIRE SUR TON CARNET DE VOYAGE ?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ton prénom ou pseudo"
          autoFocus
          maxLength={32}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: 17,
            color: "inherit",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Bouton */}
      <RoundButton
        variant="primary"
        onClick={handleSubmit}
        disabled={!name.trim() || saving}
      >
        {saving ? "…" : "Créer mon espace →"}
      </RoundButton>

    </div>
  );
}
