import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';

// ── Utilitaires couleur (palette dynamique depuis haloColor) ─────────────────

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return [240, 180, 41]; // fallback gold
}
function lighten(c: number, factor: number): number {
  return Math.round(c + (255 - c) * factor);
}
function darken(c: number, factor: number): number {
  return Math.round(c * (1 - factor));
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TheoryCategory =
  | "musique"
  | "extraterrestres"
  | "festival"
  | "cosmique"
  | "camping"
  | "absurde";

type Theory  = { text: string; cat: TheoryCategory };
// ── 60 Théories ───────────────────────────────────────────────────────────────

const THEORIES: Theory[] = [
  // 🎧 Musique (10)
  { cat: "musique", text: "Les DJs ne mixent pas vraiment : ils communiquent avec la foule par télépathie." },
  { cat: "musique", text: "La musique psytrance est un langage extraterrestre codé sur des fréquences humaines." },
  { cat: "musique", text: "Les basses sont en réalité un système de recharge énergétique pour les humains." },
  { cat: "musique", text: "Chaque drop ouvre brièvement un portail vers une autre dimension." },
  { cat: "musique", text: "Les DJs savent exactement quand quelqu'un dans la foule a besoin d'un drop." },
  { cat: "musique", text: "Les BPM contrôlent le rythme cardiaque collectif du festival." },
  { cat: "musique", text: "Les DJs testent secrètement de nouveaux styles musicaux venus du futur." },
  { cat: "musique", text: "La musique du festival influence directement la météo locale." },
  { cat: "musique", text: "Les danseurs créent la musique par leurs mouvements — les DJs ne font que suivre." },
  { cat: "musique", text: "Chaque DJ est choisi par un conseil secret de chamans musicaux." },

  // 👽 Extraterrestres (10)
  { cat: "extraterrestres", text: "Les festivals psytrance sont organisés pour accueillir des extraterrestres." },
  { cat: "extraterrestres", text: "Certains festivaliers sont en réalité des aliens infiltrés qui étudient notre bonheur." },
  { cat: "extraterrestres", text: "Les grandes décorations servent à communiquer avec une civilisation lointaine." },
  { cat: "extraterrestres", text: "Les lasers servent à envoyer des messages codés dans l'espace." },
  { cat: "extraterrestres", text: "Les extraterrestres utilisent les festivals pour repérer les humains les plus éveillés." },
  { cat: "extraterrestres", text: "La psytrance est la musique officielle de l'univers connu." },
  { cat: "extraterrestres", text: "Les aliens viennent uniquement pour les sets du lever de soleil." },
  { cat: "extraterrestres", text: "Certains DJs viennent d'autres planètes et rentrent chez eux après chaque festival." },
  { cat: "extraterrestres", text: "Les décorations fractales sont des cartes de galaxies lointaines." },
  { cat: "extraterrestres", text: "Les extraterrestres pensent que les festivals sont la forme normale de société humaine." },

  // 🌀 Festival (10)
  { cat: "festival", text: "Le festival est une simulation créée pour tester les limites de la joie humaine." },
  { cat: "festival", text: "Le temps passe différemment à l'intérieur d'un festival." },
  { cat: "festival", text: "Le festival n'existe que parce que les participants y croient collectivement." },
  { cat: "festival", text: "Le festival est une expérience sociale secrète menée depuis des décennies." },
  { cat: "festival", text: "Chaque festival crée une petite civilisation temporaire avec ses propres lois." },
  { cat: "festival", text: "Les festivals sont des répétitions générales pour une nouvelle société." },
  { cat: "festival", text: "Les gens se retrouvent dans les festivals parce qu'ils se connaissent dans d'autres vies." },
  { cat: "festival", text: "Le festival disparaît complètement de la réalité quand la dernière personne part." },
  { cat: "festival", text: "Le festival est une ville invisible qui réapparaît chaque année au même endroit." },
  { cat: "festival", text: "Le terrain du festival garde la mémoire vibratoire des années précédentes." },

  // 🌌 Cosmique (10)
  { cat: "cosmique", text: "Les festivals se produisent uniquement quand les étoiles sont parfaitement alignées." },
  { cat: "cosmique", text: "Les danseurs créent collectivement un champ énergétique visible depuis l'espace." },
  { cat: "cosmique", text: "Le lever de soleil pendant un set recharge l'équilibre de l'univers." },
  { cat: "cosmique", text: "Les festivals sont des points de convergence d'énergie terrestre." },
  { cat: "cosmique", text: "Les fractales représentent la structure réelle du cosmos — et les DJs le savent." },
  { cat: "cosmique", text: "Les festivaliers influencent inconsciemment l'équilibre énergétique de la Terre." },
  { cat: "cosmique", text: "Les rythmes psytrance suivent un rythme cosmique gravé dans la matière depuis le Big Bang." },
  { cat: "cosmique", text: "Les couchers de soleil sont plus beaux pendant les festivals parce que la Terre est heureuse." },
  { cat: "cosmique", text: "Les festivals sont des cérémonies cosmiques modernes dont plus personne ne connaît l'origine." },
  { cat: "cosmique", text: "L'univers observe les festivals pour comprendre l'humour humain." },

  // 🏕 Camping (10)
  { cat: "camping", text: "Les tentes se déplacent légèrement la nuit quand personne ne regarde." },
  { cat: "camping", text: "Les voisins de camping changent discrètement chaque nuit sans qu'on s'en rende compte." },
  { cat: "camping", text: "Les tentes sont des portails vers une version plus douce du monde du sommeil." },
  { cat: "camping", text: "Les matelas gonflables possèdent une conscience très basique mais réelle." },
  { cat: "camping", text: "Les lampes frontales attirent des créatures nocturnes que seuls les enfants peuvent voir." },
  { cat: "camping", text: "Les objets perdus dans un festival rejoignent une dimension parallèle peuplée de paires de lunettes." },
  { cat: "camping", text: "Les campings de festival sont les villages nomades les plus anciens de l'humanité moderne." },
  { cat: "camping", text: "Les moustiques sont des agents secrets qui collectent des données comportementales." },
  { cat: "camping", text: "Les tentes ont une mémoire acoustique de toutes les conversations nocturnes." },
  { cat: "camping", text: "Les meilleurs spots de camping n'apparaissent que pour les gens qui n'en ont pas besoin." },

  // 😂 Absurde (10)
  { cat: "absurde", text: "Les paillettes sont une forme de monnaie secrète utilisée par une élite de festivaliers." },
  { cat: "absurde", text: "Les lunettes de soleil à miroirs donnent des super-pouvoirs d'observation limités à 48h." },
  { cat: "absurde", text: "Les gens deviennent meilleurs danseurs après minuit parce que la gravité diminue légèrement." },
  { cat: "absurde", text: "Les festivals ont été inventés par les fabricants de chaussures confortables pour tester leurs produits." },
  { cat: "absurde", text: "Les arbres du festival sont les vrais organisateurs — les humains ne font qu'exécuter." },
  { cat: "absurde", text: "Les festivals existent uniquement pour que les humains apprennent à sourire à des inconnus." },
  { cat: "absurde", text: "Les artistes observent secrètement la foule pour apprendre à danser eux-mêmes." },
  { cat: "absurde", text: "Chaque festival crée un style de danse totalement inédit qui disparaît à la fin." },
  { cat: "absurde", text: "Les gens deviennent systématiquement plus honnêtes dans les festivals — personne ne sait pourquoi." },
  { cat: "absurde", text: "Les festivals sont la forme primitive d'une société future dont personne n'a encore le plan." },
];

// ── CSS animé ─────────────────────────────────────────────────────────────────

const CSS = `
@keyframes theoriesReveal {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes theoriesShuffle {
  0%   { transform: scale(1)    rotate(0deg);    }
  25%  { transform: scale(0.96) rotate(-1.5deg); }
  60%  { transform: scale(1.02) rotate( 0.8deg); }
  100% { transform: scale(1)    rotate(0deg);    }
}
`;

// ── ScratchCard ───────────────────────────────────────────────────────────────

type ScratchCardProps = {
  children: React.ReactNode;
  revealed: boolean;
  onReveal: () => void;
  hint: string;        // texte affiché sur la carte dorée
  borderColor: string; // couleur dynamique du bord
  glowColor: string;   // couleur dynamique du halo
  gradDark: string;    // couleur sombre du dégradé canvas
  gradMain: string;    // couleur principale du dégradé canvas
  gradLight: string;   // couleur claire du dégradé canvas
};

function ScratchCard({ children, revealed, onReveal, hint, borderColor, glowColor, gradDark, gradMain, gradLight }: ScratchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef({ count: 0, drawing: false });

  // Dessine l'overlay doré une fois monté (key extérieure déclenche remount)
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // ── Gradient dynamique (couleur du halo) ───────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0,    gradDark);
    grad.addColorStop(0.35, gradMain);
    grad.addColorStop(0.65, gradLight);
    grad.addColorStop(1,    gradDark);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // ── Motif de points subtil ─────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let x = 14; x < width; x += 22) {
      for (let y = 14; y < height; y += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Décoration centrale ────────────────────────────────────────────────
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.font      = "22px serif";
    ctx.fillText("✦  ✦  ✦", width / 2, height / 2 - 26);

    ctx.fillStyle = "rgba(0,0,0,0.48)";
    ctx.font      = "bold 13px system-ui,-apple-system,sans-serif";
    ctx.fillText(hint, width / 2, height / 2);

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.font      = "11px system-ui,-apple-system,sans-serif";
    ctx.fillText("Gratte pour révéler", width / 2, height / 2 + 22);

    stateRef.current.count = 0;
  }, []); // [] car le composant est remonté via key= à chaque shuffle

  function doScratch(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx  = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 30, 0, Math.PI * 2);
    ctx.fill();

    stateRef.current.count += 1;
    if (stateRef.current.count >= 22) {
      onReveal();
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${borderColor}`,
        background: "rgba(10,10,16,0.97)",
        boxShadow: `0 0 28px ${glowColor}`,
      }}
    >
      {/* Contenu révélé — toujours dans le DOM, visible sous l'overlay */}
      <div style={{ animation: revealed ? "theoriesReveal 0.55s cubic-bezier(.22,1,.36,1) forwards" : undefined }}>
        {children}
      </div>

      {/* Overlay canvas doré — retiré du DOM quand revealed=true */}
      {!revealed && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            touchAction: "none",
            cursor: "crosshair",
            userSelect: "none",
          }}
          onPointerDown={(e) => {
            stateRef.current.drawing = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            doScratch(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!stateRef.current.drawing) return;
            doScratch(e.clientX, e.clientY);
          }}
          onPointerUp={()     => { stateRef.current.drawing = false; }}
          onPointerCancel={()  => { stateRef.current.drawing = false; }}
        />
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

type Props = { onBack: () => void; haloColor?: string };

export function TheoriesScreen({ onBack, haloColor }: Props) {
  const { t } = useTranslation();

  // ── Traductions ──────────────────────────────────────────────────────────
  const theories = t('theories.theories', { returnObjects: true }) as string[];
  const variants = t('theories.variants', { returnObjects: true }) as Array<{ emoji: string; label: string; desc: string }>;

  // ── Métadonnées par catégorie (labels traduits) ──────────────────────────
  const CAT_META: Record<TheoryCategory, { emoji: string; label: string }> = {
    musique:         { emoji: "🎧", label: t('theories.catMusique')         },
    extraterrestres: { emoji: "👽", label: t('theories.catExtraterrestres') },
    festival:        { emoji: "🌀", label: t('theories.catFestival')        },
    cosmique:        { emoji: "🌌", label: t('theories.catCosmique')        },
    camping:         { emoji: "🏕",  label: t('theories.catCamping')         },
    absurde:         { emoji: "😂", label: t('theories.catAbsurde')         },
  };

  // ── Palette dynamique ────────────────────────────────────────────────────
  const [r, g, b]  = parseColor(haloColor ?? "#F0B429");
  const haloMain   = toHex(r, g, b);
  const haloLight  = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloDark   = toHex(darken(r, 0.28),  darken(g, 0.28),  darken(b, 0.28));
  const haloGlow   = `rgba(${r},${g},${b},0.16)`;
  const haloBorder = `rgba(${r},${g},${b},0.45)`;
  const haloDim    = `rgba(${r},${g},${b},0.55)`;
  const haloGlowMd = `rgba(${r},${g},${b},0.28)`;
  const pulseCss   = `@keyframes theoriesPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(${r},${g},${b},0); }
  50%     { box-shadow: 0 0 20px 6px rgba(${r},${g},${b},0.35); }
}`;

  const [theoryIndex, setTheoryIndex] = useState<number>(() => Math.floor(Math.random() * THEORIES.length));
  const [variantIndex, setVariantIndex] = useState<number>(() => Math.floor(Math.random() * (variants.length || 3)));

  const [theoryRevealed,  setTheoryRevealed]  = useState(false);
  const [variantRevealed, setVariantRevealed] = useState(false);
  const [shuffleKey,      setShuffleKey]      = useState(0);
  const [shuffleAnim,     setShuffleAnim]     = useState(false);

  const bothRevealed = theoryRevealed && variantRevealed;

  const theory = THEORIES[theoryIndex];
  const theoryText = Array.isArray(theories) && theories[theoryIndex] ? theories[theoryIndex] : theory.text;
  const variant = Array.isArray(variants) && variants[variantIndex] ? variants[variantIndex] : { emoji: "✨", label: "", desc: "" };
  const catMeta = CAT_META[theory.cat];

  function shuffle() {
    setTheoryIndex((prev) => {
      let next: number;
      do { next = Math.floor(Math.random() * THEORIES.length); } while (next === prev && THEORIES.length > 1);
      return next;
    });
    setVariantIndex((prev) => {
      const total = Array.isArray(variants) ? variants.length : 3;
      let next: number;
      do { next = Math.floor(Math.random() * total); } while (next === prev && total > 1);
      return next;
    });
    setTheoryRevealed(false);
    setVariantRevealed(false);
    setShuffleKey((k) => k + 1);
    setShuffleAnim(true);
    setTimeout(() => setShuffleAnim(false), 700);
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>
      <style>{pulseCss}</style>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
            {t('theories.title')}
          </div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
            60 cartes · 3 variantes
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t('common.home')}
        </button>
      </div>

      {/* ── Corps scrollable ── */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1, overflowY: "auto",
          padding: "20px 16px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >

        {/* ── Instruction ── */}
        <div style={{
          fontSize: 12, opacity: 0.5, textAlign: "center",
          lineHeight: 1.6, paddingInline: 8,
        }}>
          Gratte les deux cartes pour découvrir une théorie et comment jouer.
        </div>

        {/* ── Carte 1 : Théorie ── */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: haloDim,
            marginBottom: 8, paddingLeft: 2,
          }}>
            Théorie
          </div>

          <ScratchCard
            key={`theory-${shuffleKey}`}
            revealed={theoryRevealed}
            onReveal={() => setTheoryRevealed(true)}
            hint={`${catMeta.emoji} ${catMeta.label}`}
            borderColor={haloBorder}
            glowColor={haloGlow}
            gradDark={haloDark}
            gradMain={haloMain}
            gradLight={haloLight}
          >
            <div style={{
              padding: "22px 18px 24px",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 16,
            }}>
              {/* Badge catégorie */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{catMeta.emoji}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: haloMain,
                }}>
                  {catMeta.label}
                </span>
              </div>

              {/* Texte de la théorie */}
              <p style={{
                margin: 0,
                fontSize: 17, lineHeight: 1.6,
                color: "rgba(255,255,255,0.92)",
                fontWeight: 500,
                fontStyle: "italic",
              }}>
                « {theoryText} »
              </p>
            </div>
          </ScratchCard>
        </div>

        {/* ── Carte 2 : Variante ── */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: haloDim,
            marginBottom: 8, paddingLeft: 2,
          }}>
            Variante
          </div>

          <ScratchCard
            key={`variant-${shuffleKey}`}
            revealed={variantRevealed}
            onReveal={() => setVariantRevealed(true)}
            hint={`${variant.emoji} ${variant.label}`}
            borderColor={haloBorder}
            glowColor={haloGlow}
            gradDark={haloDark}
            gradMain={haloMain}
            gradLight={haloLight}
          >
            <div style={{
              padding: "22px 18px 24px",
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}>
              {/* En-tête variante */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 30, lineHeight: 1 }}>{variant.emoji}</span>
                <span style={{
                  fontSize: 16, fontWeight: 700,
                  color: haloMain, letterSpacing: "0.02em",
                }}>
                  {variant.label}
                </span>
              </div>

              {/* Description */}
              <p style={{
                margin: 0,
                fontSize: 15, lineHeight: 1.65,
                color: "rgba(255,255,255,0.82)",
              }}>
                {variant.desc}
              </p>
            </div>
          </ScratchCard>
        </div>

        {/* ── Message si tout révélé ── */}
        {bothRevealed && (
          <div style={{
            textAlign: "center",
            fontSize: 12,
            color: haloMain,
            opacity: 0.75,
            letterSpacing: "0.04em",
            animation: "theoriesReveal 0.5s ease forwards",
          }}>
            ✦ Bonne théorie ! Cliquez pour une nouvelle paire ✦
          </div>
        )}

        {/* ── Bouton Shuffle ── */}
        <button
          onClick={shuffle}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${haloDark}, ${haloMain} 45%, ${haloLight})`,
            border: "none",
            color: "#0a0a10",
            fontSize: 16, fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.03em",
            animation: shuffleAnim
              ? "theoriesShuffle 0.65s cubic-bezier(.22,1,.36,1) forwards"
              : (bothRevealed ? "theoriesPulse 2s ease-in-out infinite" : undefined),
            boxShadow: `0 4px 20px ${haloGlowMd}`,
          }}
        >
          {t('theories.newCard')}
        </button>

        {/* ── Légende des variantes ── */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", opacity: 0.4, marginBottom: 2,
          }}>
            Les 3 variantes possibles
          </div>
          {(Array.isArray(variants) ? variants : []).map((v, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{v.emoji}</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: haloMain, opacity: 0.85 }}>
                  {v.label} —{" "}
                </span>
                <span style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.5 }}>
                  {v.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
