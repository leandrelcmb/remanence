import type { FlowScreen } from "../flow/types";

const FULL_STEPS: FlowScreen[]    = ["capture", "setInfo", "color", "energy", "focus", "text"];
const EXPRESS_STEPS: FlowScreen[] = ["capture", "setInfo", "color", "energy", "focus"];

export function FlowProgress({ screen, express = false }: { screen: FlowScreen; express?: boolean }) {
  const steps = express ? EXPRESS_STEPS : FULL_STEPS;
  const currentIdx = steps.indexOf(screen);
  if (currentIdx === -1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginBottom: 28,
      }}
    >
      {steps.map((_, i) => {
        const isCurrent = i === currentIdx;
        const isPast = i < currentIdx;
        return (
          <div
            key={i}
            style={{
              height: 5,
              width: isCurrent ? 20 : 5,
              borderRadius: 3,
              background: isCurrent
                ? "rgba(255,255,255,0.75)"
                : isPast
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.13)",
              transition: "all 0.25s ease",
            }}
          />
        );
      })}

      {/* Badge express discret */}
      {express && (
        <span style={{ fontSize: 11, opacity: 0.4, marginLeft: 6, letterSpacing: "0.06em" }}>
          ⚡
        </span>
      )}
    </div>
  );
}
