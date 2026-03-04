import type { ReactNode } from "react";
import { Colors } from "../core/theme/colors";
import { Halo } from "../core/theme/halo";

export const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div
      style={{
        backgroundColor: Colors.black,
        color: "white",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Halo />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};