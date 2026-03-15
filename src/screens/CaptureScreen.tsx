import type { ChangeEvent } from "react";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  photo?: string;
  onCameraPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  onGalleryPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearPhoto: () => void;
  onFinish: () => void;
  onBack: () => void;
};

const cardBase: React.CSSProperties = {
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  transition: "background 0.2s ease",
};

export function CaptureScreen({ photo, onCameraPhoto, onGalleryPhoto, onClearPhoto, onFinish, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 32, minHeight: "85dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
        Capture du moment 🔐
      </p>

      {!photo && (
        <div style={{ display: "grid", gap: 14 }}>
          {/* Option 1 — Caméra directe */}
          <label style={{ ...cardBase, padding: "44px 20px" }}>
            <span style={{ fontSize: 44 }}>📸</span>
            <span style={{ fontSize: 16, opacity: 0.9 }}>Prendre une photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onCameraPhoto}
              style={{ display: "none" }}
            />
          </label>

          {/* Option 2 — Galerie / fichiers */}
          <label style={{ ...cardBase, padding: "22px 20px" }}>
            <span style={{ fontSize: 28 }}>🖼️</span>
            <span style={{ fontSize: 15, opacity: 0.75 }}>Depuis ma galerie</span>
            <input
              type="file"
              accept="image/*"
              onChange={onGalleryPhoto}
              style={{ display: "none" }}
            />
          </label>
        </div>
      )}

      {photo && (
        <div style={{ display: "grid", gap: 14 }}>
          <img
            src={photo}
            alt="Capture du moment"
            style={{
              width: "100%",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              objectFit: "cover",
              maxHeight: "55dvh",
            }}
          />
          <button
            onClick={onClearPhoto}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              padding: "10px",
              cursor: "pointer",
              opacity: 0.7,
            }}
          >
            🔄 Changer la photo
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            ↪️ Retour
          </RoundButton>
        </div>
        <div
          style={{
            flex: 1,
            opacity: photo ? 1 : 0.4,
            pointerEvents: photo ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        >
          <RoundButton variant="primary" onClick={onFinish}>
            Ancrer 💌
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
