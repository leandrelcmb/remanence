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

  const rgba = toRGBA(color, opacity);
  const rgbaRing = toRGBA(color, opacity * 0.55);
  const rgbaOuter = toRGBA(color, opacity * 0.28);

  // Gradient central principal (opacité augmentée)
  const mainStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at 50% ${centerY}%, ${rgba} 0%, rgba(0,0,0,0) 72%)`,
    transform: `scale(${breatheScale})`,
    transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out, background 0.8s ease-in-out",
    pointerEvents: "none",
    willChange: "transform, opacity, background",
  };

  // Anneau néon 1 — rotation lente sens horaire
  const ring1Style: CSSProperties = {
    position: "absolute",
    inset: "-20%",
    borderRadius: "50%",
    background: `conic-gradient(from 0deg, transparent 60%, ${rgbaRing} 75%, transparent 90%)`,
    filter: `blur(28px)`,
    animation: "halo-spin-cw 18s linear infinite",
    pointerEvents: "none",
    opacity: breathe ? 0.7 + Math.sin((phase * Math.PI * 2) / 15) * 0.15 : 0.7,
  };

  // Anneau néon 2 — rotation lente sens anti-horaire, décalé
  const ring2Style: CSSProperties = {
    position: "absolute",
    inset: "-30%",
    borderRadius: "50%",
    background: `conic-gradient(from 120deg, transparent 55%, ${rgbaOuter} 72%, transparent 88%)`,
    filter: `blur(40px)`,
    animation: "halo-spin-ccw 26s linear infinite",
    pointerEvents: "none",
    opacity: breathe ? 0.5 + Math.sin((phase * Math.PI * 2) / 20) * 0.12 : 0.5,
  };

  return (
    <>
      <style>{`
        @keyframes halo-spin-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes halo-spin-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
      `}</style>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={ring2Style} />
        <div style={ring1Style} />
        <div style={mainStyle} />
      </div>
    </>
  );
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
