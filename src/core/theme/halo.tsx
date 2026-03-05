import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

interface HaloProps {
  color?: string;
  opacity?: number;
  scale?: number;
  breathe?: boolean;
  centerY?: number; // 0..100 (en %)
}

export const Halo = ({
  color = "#1A0F2E",
  opacity = 0.2,
  scale = 1.1,
  breathe = true,
  centerY = 50,
}: HaloProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!breathe) return;

    let raf = 0;
    let start = performance.now();

    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      setPhase(elapsed);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [breathe]);

  const breatheScale = useMemo(() => {
    if (!breathe) return scale;
    const s = 1 + Math.sin((phase * Math.PI * 2) / 12) * 0.02;
    return scale * s;
  }, [phase, scale, breathe]);

  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at 50% ${centerY}%, ${hexToRGBA(
      color,
      opacity
    )} 0%, rgba(0,0,0,0) 80%)`,
    transform: `scale(${breatheScale})`,
    transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out, background 0.8s ease-in-out",
    pointerEvents: "none",
    willChange: "transform, opacity, background",
  };

  return <div style={style} />;
};

function hexToRGBA(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}