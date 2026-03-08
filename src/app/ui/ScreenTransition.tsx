import type { ReactNode } from "react";

export type AnimDir = "forward" | "backward" | "neutral";

const ANIM: Record<AnimDir, string> = {
  forward:  "screenSlideFromRight 0.27s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
  backward: "screenSlideFromLeft  0.27s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
  neutral:  "screenFadeIn         0.22s ease both",
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
