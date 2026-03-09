import type { ReactNode } from "react";

export type AnimDir = "forward" | "backward" | "neutral" | "flare";

// cubic-bezier(0.16, 1, 0.3, 1) = ease-out-expo : décélération naturelle et fluide
const SPRING = "cubic-bezier(0.16, 1, 0.3, 1)";

const ANIM: Record<AnimDir, string> = {
  forward:  `screenSlideFromRight 0.38s ${SPRING} both`,
  backward: `screenSlideFromLeft  0.38s ${SPRING} both`,
  neutral:  `screenFadeIn         0.30s ease both`,
  flare:    `screenBloomIn        0.50s ${SPRING} both`,
};

interface Props {
  screenKey: string; // change → déclenche l'animation
  direction: AnimDir;
  children: ReactNode;
}

export function ScreenTransition({ screenKey, direction, children }: Props) {
  return (
    <div key={screenKey} style={{ animation: ANIM[direction] }}>
      {children}
    </div>
  );
}
