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
        border: isPrimary
          ? "1px solid rgba(var(--halo-rgb, 100,200,200), 0.30)"
          : "1px solid rgba(255,255,255,0.12)",
        background: isPrimary
          ? "linear-gradient(135deg, rgba(var(--halo-rgb, 100,200,200), 0.72) 0%, rgba(var(--halo-rgb, 100,200,200), 0.50) 100%)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(10px)",
        boxShadow: isPrimary
          ? "0 0 16px rgba(var(--halo-rgb, 100,200,200), 0.35), 0 4px 20px rgba(var(--halo-rgb, 100,200,200), 0.15)"
          : undefined,
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
