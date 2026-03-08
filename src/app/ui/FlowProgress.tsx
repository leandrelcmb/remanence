import type { FlowScreen } from "../flow/types";

// Étapes du parcours de capture dans l'ordre
const FLOW_STEPS: FlowScreen[] = ["setInfo", "color", "energy", "focus", "text", "capture"];

export function FlowProgress({ screen }: { screen: FlowScreen }) {
  const currentIdx = FLOW_STEPS.indexOf(screen);
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
      {FLOW_STEPS.map((_, i) => {
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
    </div>
  );
}
