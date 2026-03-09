import type { ReactNode } from "react";
import { Colors } from "../core/theme/colors";
import { Halo } from "../core/theme/halo";

export const RootLayout = ({
  children,
  haloColor = Colors.violetDeep,
  haloOpacity = 0.35,
  haloScale = 1.1,
  haloCenterY = 50,
  haloFilter = "brightness(1)",
  haloFilterTransition = "filter 1.5s ease-in-out",
}: {
  children: ReactNode;
  haloColor?: string;
  haloOpacity?: number;
  haloScale?: number;
  haloCenterY?: number;
  haloFilter?: string;
  haloFilterTransition?: string;
}) => {
  return (
    /* Fond noir plein écran */
    <div style={{ backgroundColor: Colors.black, color: "white", minHeight: "100dvh", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Halo
          color={haloColor}
          opacity={haloOpacity}
          scale={haloScale}
          centerY={haloCenterY}
          filterBoost={haloFilter}
          filterTransition={haloFilterTransition}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </div>
    </div>
  );
};
