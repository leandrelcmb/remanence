import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export function RoundButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <button
      className="remanence-btn"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%",
        borderRadius: 999,
        padding: "18px 20px",
        border: `1px solid ${isPrimary ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.12)"}`,
        background: isPrimary ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(10px)",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontSize: 17,
        fontWeight: isPrimary ? 600 : 400,
        fontFamily: "inherit",
        letterSpacing: "0.03em",
      }}
    >
      {children}
    </button>
  );
}
