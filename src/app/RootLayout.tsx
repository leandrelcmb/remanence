import type { ReactNode } from "react";
import { Colors } from "../core/theme/colors";
import { Halo } from "../core/theme/halo";

export const RootLayout = ({
  children,
  haloColor = Colors.violetDeep,
  haloOpacity = 0.35,
  haloScale = 1.1,
  haloCenterY = 50,
}: {
  children: ReactNode;
  haloColor?: string;
  haloOpacity?: number;
  haloScale?: number;
  haloCenterY?: number;
}) => {
  return (
    <div
      style={{
        backgroundColor: Colors.black,
        color: "white",
        minHeight: "100dvh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Halo color={haloColor} opacity={haloOpacity} scale={haloScale} centerY={haloCenterY} />

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};