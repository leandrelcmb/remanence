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
  const bg =
    variant === "primary" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)";
  const border =
    variant === "primary" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.12)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        borderRadius: 999,
        padding: "18px 20px",
        border: `1px solid ${border}`,
        background: bg,
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontSize: 20,
      }}
    >
      {children}
    </button>
  );
}