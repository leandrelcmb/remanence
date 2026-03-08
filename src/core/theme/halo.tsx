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
    background: `radial-gradient(circle at 50% ${centerY}%, ${toRGBA(
      color,
      opacity
    )} 0%, rgba(0,0,0,0) 80%)`,
    transform: `scale(${breatheScale})`,
    transition:
      "opacity 0.8s ease-in-out, transform 0.8s ease-in-out, background 0.8s ease-in-out",
    pointerEvents: "none",
    willChange: "transform, opacity, background",
  };

  return <div style={style} />;
};

function toRGBA(color: string, opacity: number) {
  const value = color.trim();

  if (value.startsWith("#")) {
    return hexToRGBA(value, opacity);
  }

  if (value.startsWith("rgb(") || value.startsWith("rgba(")) {
    return rgbStringToRGBA(value, opacity);
  }

  return `rgba(26,15,46,${opacity})`;
}

function hexToRGBA(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(26,15,46,${opacity})`;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(26,15,46,${opacity})`;
  }

  return `rgba(${r},${g},${b},${opacity})`;
}

function rgbStringToRGBA(rgb: string, opacity: number) {
  const match = rgb.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);

  if (!match) {
    return `rgba(26,15,46,${opacity})`;
  }

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);

  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(26,15,46,${opacity})`;
  }

  return `rgba(${r},${g},${b},${opacity})`;
}