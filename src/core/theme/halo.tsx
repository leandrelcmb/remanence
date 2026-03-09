import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

interface HaloProps {
  color?: string;
  opacity?: number;
  scale?: number;
  breathe?: boolean;
  centerY?: number; // 0..100 (en %)
  brightness?: number;           // filter: brightness(), 1.0 = normal
  brightnessTransition?: string; // CSS transition pour l'animation du brightness
}

export const Halo = ({
  color = "#1A0F2E",
  opacity = 0.2,
  scale = 1.1,
  breathe = true,
  centerY = 50,
  brightness = 1.0,
  brightnessTransition = "filter 1.5s ease-in-out",
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
    const s = 1 + Math.sin((phase * Math.PI * 2) / 12) * 0.03;
    return scale * s;
  }, [phase, scale, breathe]);

  const rgba       = toRGBA(color, opacity);
  const rgbaAmb    = toRGBA(color, opacity * 0.30); // couche ambiance très douce
  const rgbaRing   = toRGBA(color, opacity * 0.75); // anneau interne — plus visible
  const rgbaOuter  = toRGBA(color, opacity * 0.45); // anneau externe

  // ── Couche ambiance : très large radial, toujours présente ──
  const ambienceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 110% 60% at 50% ${centerY}%, ${rgbaAmb} 0%, transparent 100%)`,
    pointerEvents: "none",
    transition: "background 1.1s ease-in-out",
    willChange: "background",
  };

  // ── Gradient central principal ──
  const mainStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse 80% 70% at 50% ${centerY}%, ${rgba} 0%, ${toRGBA(color, opacity * 0.35)} 45%, rgba(0,0,0,0) 82%)`,
    transform: `scale(${breatheScale})`,
    transition: "opacity 1.1s ease-in-out, transform 1.1s ease-in-out, background 1.1s ease-in-out",
    pointerEvents: "none",
    willChange: "transform, opacity, background",
  };

  // ── Anneau néon 1 : large arc, rotation lente CW ──
  const ring1Opacity = breathe ? 0.75 + Math.sin((phase * Math.PI * 2) / 15) * 0.18 : 0.75;
  const ring1Style: CSSProperties = {
    position: "absolute",
    inset: "-20%",
    borderRadius: "50%",
    background: `conic-gradient(from 0deg, transparent 45%, ${rgbaRing} 62%, ${toRGBA(color, opacity * 0.55)} 72%, transparent 85%)`,
    filter: `blur(35px)`,
    animation: "halo-spin-cw 18s linear infinite",
    pointerEvents: "none",
    opacity: ring1Opacity,
    transition: "opacity 1.1s ease-in-out",
  };

  // ── Anneau néon 2 : large arc, rotation lente CCW, décalé ──
  const ring2Opacity = breathe ? 0.60 + Math.sin((phase * Math.PI * 2) / 20) * 0.14 : 0.60;
  const ring2Style: CSSProperties = {
    position: "absolute",
    inset: "-30%",
    borderRadius: "50%",
    background: `conic-gradient(from 120deg, transparent 40%, ${rgbaOuter} 58%, ${toRGBA(color, opacity * 0.30)} 68%, transparent 80%)`,
    filter: `blur(55px)`,
    animation: "halo-spin-ccw 26s linear infinite",
    pointerEvents: "none",
    opacity: ring2Opacity,
    transition: "opacity 1.1s ease-in-out",
  };

  return (
    <>
      <style>{`
        @keyframes halo-spin-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes halo-spin-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
      `}</style>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", filter: `brightness(${brightness})`, transition: brightnessTransition }}>
        <div style={ambienceStyle} />
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
