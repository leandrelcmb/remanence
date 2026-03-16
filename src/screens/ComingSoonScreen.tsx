import { useTranslation } from "react-i18next";

type Props = {
  onBack: () => void;
};

export function ComingSoonScreen({ onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{
      minHeight: "80dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 56 }}>🚧</div>

      <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        {t('comingSoon.title')}
      </p>

      <p style={{ fontSize: 15, opacity: 0.55, margin: 0, lineHeight: 1.6 }}>
        {t('comingSoon.message')}<br />
        {t('comingSoon.sub')}
      </p>

      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999,
          padding: "14px 32px",
          fontSize: 15,
          color: "white",
          cursor: "pointer",
          fontFamily: "inherit",
          letterSpacing: "0.03em",
        }}
      >
        {t('comingSoon.back')}
      </button>
    </div>
  );
}
