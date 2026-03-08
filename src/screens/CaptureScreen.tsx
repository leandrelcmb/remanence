import type { ChangeEvent } from "react";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  photo?: string;
  onPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearPhoto: () => void;
  onFinish: () => void;
  onBack: () => void;
};

export function CaptureScreen({ photo, onPhoto, onClearPhoto, onFinish, onBack }: Props) {
  return (
    <div style={{ display: "grid", gap: 80, minHeight: "85dvh", alignContent: "center" }}>
      <p style={{ opacity: 0.86, fontSize: 30, margin: 0, textAlign: "center" }}>
        Capture du moment 🔐
      </p>

      {!photo && (
        <label
          style={{
            padding: "80px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <p style={{ fontSize: 50, margin: 0, textAlign: "center" }}>📸</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhoto}
            style={{ display: "none" }}
          />
        </label>
      )}

      {photo && (
        <>
          <img
            src={photo}
            alt="Capture du moment"
            style={{
              width: "100%",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <RoundButton variant="secondary" onClick={onClearPhoto}>
            🔄
          </RoundButton>
        </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            Retour
          </RoundButton>
        </div>
        <div style={{ flex: 1 }}>
          <RoundButton variant="primary" onClick={onFinish}>
            Ancrer 💌
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
