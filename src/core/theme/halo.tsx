import type { CSSProperties } from "react";

interface HaloProps {
  color?: string;
  opacity?: number;
  scale?: number;
}

export const Halo = ({
  color = "#1A0F2E",
  opacity = 0.2,
  scale = 1
}: HaloProps) => {

  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at center, ${hexToRGBA(color, opacity)} 0%, rgba(0,0,0,0) 70%)`,
    transform: `scale(${scale})`,
    transition: "all 0.8s ease-in-out",
    pointerEvents: "none"
  };

  return <div style={style} />;
};

function hexToRGBA(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${opacity})`;
}