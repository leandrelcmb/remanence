import { useTranslation } from "react-i18next";
import type { Draft } from "../app/flow/types";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  feelingText: string;
  learningText: string;
  onChangeDraft: (patch: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 18,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: 14,
  color: "white",
  outline: "none",
  minHeight: 150,
  resize: "vertical",
};

export function TextScreen({ feelingText, learningText, onChangeDraft, onNext, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ display: "grid", gap: 45, minHeight: "85dvh", alignContent: "center" }}>
      <div style={{ display: "grid", gap: 10 }}>
        <p style={{ opacity: 0.86, fontSize: 20, margin: 0 }}>{t("text.feelingTitle")}</p>
        <textarea
          value={feelingText}
          onChange={(e) => onChangeDraft({ feelingText: e.target.value })}
          style={textareaStyle}
          placeholder={t("text.feelingPlaceholder")}
        />
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        <p style={{ opacity: 0.86, fontSize: 20, margin: 0 }}>
          {t("text.learningTitle")}
        </p>
        <textarea
          value={learningText}
          onChange={(e) => onChangeDraft({ learningText: e.target.value })}
          style={{ ...textareaStyle, minHeight: 96 }}
          placeholder={t("text.learningPlaceholder")}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <div style={{ flex: 1 }}>
          <RoundButton variant="secondary" onClick={onBack}>
            {t("text.back")}
          </RoundButton>
        </div>
        <div style={{ flex: 1 }}>
          <RoundButton variant="primary" onClick={onNext}>
            {t("text.validate")}
          </RoundButton>
        </div>
      </div>
    </div>
  );
}
