import i18n from "../i18n";

type Props = {
  onComplete: () => void;
};

export function LanguagePickerScreen({ onComplete }: Props) {
  function choose(lang: "fr" | "en") {
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
    onComplete();
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 48,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "0.01em", marginBottom: 8 }}>
          Rémanence
        </div>
        <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: "0.12em" }}>
          Choisissez votre langue · Choose your language
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <button
          onClick={() => choose("fr")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "28px 36px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.2s ease, transform 0.15s ease",
          }}
          onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onPointerUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span style={{ fontSize: 52 }}>🇫🇷</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Français</span>
        </button>

        <button
          onClick={() => choose("en")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "28px 36px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.2s ease, transform 0.15s ease",
          }}
          onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onPointerUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <span style={{ fontSize: 52 }}>🇬🇧</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>English</span>
        </button>
      </div>
    </div>
  );
}
