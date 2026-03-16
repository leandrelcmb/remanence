import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

// ── Utilitaire couleur ────────────────────────────────────────────────────────
// energyTint() renvoie du rgb(...) → on convertit en rgba() pour les CSS inline
function toRgba(color: string, alpha: number): string {
  const v = color.trim();
  if (v.startsWith("rgb(")) {
    return v.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (![r, g, b].some(Number.isNaN)) return `rgba(${r},${g},${b},${alpha})`;
    }
  }
  return `rgba(0,255,183,${alpha})`; // fallback
}

// ── Session mood (persist tant que l'app est ouverte, pas par session de composant) ─
let _sessionMood: CheckinMood | null = null;

// ── Types ─────────────────────────────────────────────────────────────────────

type SanteView    = "checkin" | "hub" | "mantras" | "inspiration" | "reconnexion" | "nuit";
type CheckinMood  = "super" | "bof" | "pas-top";
type SanteSection = "mantras" | "inspiration" | "reconnexion" | "nuit";

type Mantra = {
  text: string;
  tags: string[];
};

type Exercise = {
  id: string;
  group: "observation" | "respiration" | "présence";
  short: string;   // label court (list item)
  full: string;    // instruction complète (expanded)
};

// ── Suggestions par humeur ─────────────────────────────────────────────────────

const SUGGESTED: Record<CheckinMood, SanteSection[]> = {
  "super":   ["inspiration"],
  "bof":     ["mantras", "inspiration", "reconnexion"],
  "pas-top": ["mantras", "reconnexion", "nuit"],
};

// ── 40 Mantras ────────────────────────────────────────────────────────────────

const MANTRAS: Mantra[] = [
  { text: "Tu es exactement là où tu dois être.",                                           tags: ["pause", "festival"]    },
  { text: "Ta fatigue est réelle. Tu as le droit de ralentir.",                             tags: ["fatigue", "corps"]     },
  { text: "Tu n'as rien à prouver ici.",                                                    tags: ["anxiété", "pause"]     },
  { text: "Respire. Tu es en sécurité.",                                                    tags: ["anxiété", "corps"]     },
  { text: "Ce moment ne reviendra jamais — et c'est ce qui le rend précieux.",              tags: ["festival", "pause"]    },
  { text: "Tes émotions sont des vagues. Elles passent.",                                   tags: ["anxiété", "pensées"]   },
  { text: "Tu peux partir, rester, ou simplement être là.",                                 tags: ["pause", "anxiété"]     },
  { text: "Ce que tu ressens est vrai.",                                                    tags: ["pensées", "anxiété"]   },
  { text: "Même les étoiles ont besoin de l'obscurité pour briller.",                      tags: ["nuit", "fatigue"]      },
  { text: "Tu mérites de prendre soin de toi.",                                             tags: ["fatigue", "pause"]     },
  { text: "Le silence aussi fait partie de la musique.",                                    tags: ["pause", "festival"]    },
  { text: "Chaque respiration est un nouveau départ.",                                      tags: ["corps", "pause"]       },
  { text: "Tu peux être fatigué·e et heureux·se en même temps.",                           tags: ["fatigue", "festival"]  },
  { text: "Ce son t'appartient autant qu'à n'importe qui.",                                tags: ["festival", "énergie"]  },
  { text: "Ton rythme est le bon rythme.",                                                  tags: ["pause", "énergie"]     },
  { text: "La nuit protège ceux qui continuent d'avancer.",                                 tags: ["nuit", "énergie"]      },
  { text: "Tu n'as pas besoin de comprendre pour ressentir.",                               tags: ["pensées", "festival"]  },
  { text: "Il y a de la beauté dans ton épuisement.",                                       tags: ["fatigue", "nuit"]      },
  { text: "Lâche ce qui ne t'appartient pas.",                                              tags: ["pensées", "anxiété"]   },
  { text: "Quelque chose en toi sait déjà comment continuer.",                              tags: ["pensées", "pause"]     },
  { text: "Tu fais partie de cette nuit.",                                                  tags: ["nuit", "festival"]     },
  { text: "La musique ne juge pas.",                                                        tags: ["festival", "énergie"]  },
  { text: "Ancre-toi dans le sol sous tes pieds.",                                         tags: ["corps", "pause"]       },
  { text: "Chaque instant qui passe est gravé quelque part.",                               tags: ["festival", "pause"]    },
  { text: "Tu es plus fort·e que ta tête ne le pense.",                                    tags: ["pensées", "énergie"]   },
  { text: "Donne-toi la permission de simplement exister.",                                 tags: ["pause", "anxiété"]     },
  { text: "Ton cœur bat au rythme de la fête.",                                            tags: ["festival", "corps"]    },
  { text: "Ce n'est pas une compétition.",                                                  tags: ["pause", "anxiété"]     },
  { text: "Le matin viendra avec sa propre lumière.",                                       tags: ["nuit", "fatigue"]      },
  { text: "Cherche le point fixe dans le mouvement.",                                       tags: ["corps", "pause"]       },
  { text: "Tu as déjà vécu des nuits qui t'ont changé·e.",                                tags: ["nuit", "festival"]     },
  { text: "La basse te rappelle que tu existes.",                                           tags: ["festival", "corps"]    },
  { text: "Tout ce qui monte redescend doucement.",                                          tags: ["anxiété", "pensées"]   },
  { text: "Tu es exactement assez tel·le que tu es.",                                      tags: ["anxiété", "pause"]     },
  { text: "Sens le vent. Tu es vivant·e.",                                                 tags: ["corps", "pause"]       },
  { text: "Les émotions intenses sont aussi de l'énergie.",                                tags: ["anxiété", "énergie"]   },
  { text: "Laisse la musique faire le travail.",                                            tags: ["festival", "énergie"]  },
  { text: "Il n'y a rien d'urgent dans cette nuit.",                                       tags: ["nuit", "pause"]        },
  { text: "Tu peux fermer les yeux et danser quand même.",                                  tags: ["corps", "festival"]    },
  { text: "Ce festival existe parce que tu y es.",                                          tags: ["festival", "pause"]    },
];

// ── 30 Inspirations ───────────────────────────────────────────────────────────

const INSPIRATIONS: string[] = [
  "La foule devant toi est faite de gens qui ont dit oui.",
  "La psytrance n'a pas d'histoire — elle a juste un maintenant.",
  "Quelqu'un ici vit son tout premier festival.",
  "Cette nuit ne ressemble à aucune autre dans l'histoire.",
  "Les meilleures heures d'un festival n'étaient pas prévues.",
  "Tu es au bon endroit au bon moment.",
  "Il suffit d'un instant pour tout voir différemment.",
  "Ce que tu gardes de cette nuit sera uniquement pour toi.",
  "Les étoiles au-dessus de toi ont vu des siècles de fêtes.",
  "Tu es venu·e chercher quelque chose. Tu es en train de le trouver.",
  "La musique a été composée pour ce moment précis.",
  "Dans dix ans, tu te souviendras de cette nuit.",
  "Quelque chose de beau est en train de se passer en toi.",
  "Chaque danse est un langage que tout le monde comprend.",
  "L'énergie de la foule t'appartient autant qu'à elle.",
  "Les meilleurs souvenirs naissent dans l'imprévu.",
  "Tu as traversé beaucoup pour être là ce soir.",
  "Le festival existe pour toi autant que pour les milliers d'autres.",
  "Les basses que tu sens sont les mêmes pour tous ceux qui dansent.",
  "Laisse-toi surprendre par ce que tu ne savais pas chercher.",
  "Ce son nouveau que tu entends — souviens-t'en.",
  "Tu n'es jamais seul·e dans une foule qui danse.",
  "L'instant présent est le seul endroit où les choses arrivent vraiment.",
  "Il y a une version de toi qui se souviendra de cette nuit.",
  "Quelque chose de toi s'est ouvert ici.",
  "La nuit est une permission que le jour n'accorde pas toujours.",
  "Ce moment appartient à une communauté invisible mais réelle.",
  "Tu portes en toi toutes les nuits que tu as déjà vécues.",
  "Les lumières au-dessus de toi ont été pensées pour toi.",
  "Ce que tu ressens là, c'est de la vie à pleine densité.",
];

// ── 15 Exercices de reconnexion ───────────────────────────────────────────────

const EXERCISES: Exercise[] = [
  // Observation (5)
  {
    id: "obs1", group: "observation",
    short: "Trouve 3 choses qui bougent",
    full: "Regarde autour de toi. Trouve lentement 3 choses qui bougent dans ton champ de vision. Laisse ton regard les suivre un instant.",
  },
  {
    id: "obs2", group: "observation",
    short: "Cherche une source de lumière",
    full: "Repère une source de lumière près de toi. Observe-la pendant 5 secondes. Laisse ta vision s'y poser sans effort.",
  },
  {
    id: "obs3", group: "observation",
    short: "Trouve quelqu'un qui sourit",
    full: "Promène ton regard dans la foule. Cherche quelqu'un qui sourit. Laisse ce sourire entrer dans ton champ intérieur.",
  },
  {
    id: "obs4", group: "observation",
    short: "Repère une couleur dominante",
    full: "Quelle couleur domine ton champ de vision en ce moment ? Laisse ton regard s'y poser pendant quelques respirations.",
  },
  {
    id: "obs5", group: "observation",
    short: "Cherche le son le plus lointain",
    full: "Ferme les yeux un instant. Écoute. Quel est le son le plus lointain que tu arrives à percevoir ? Concentre-toi sur lui.",
  },

  // Respiration (5)
  {
    id: "resp1", group: "respiration",
    short: "Inspire 4 temps, expire 6 temps",
    full: "Inspire lentement pendant 4 temps. Expire encore plus lentement pendant 6 temps. Recommence 3 fois. Laisse ton corps se poser.",
  },
  {
    id: "resp2", group: "respiration",
    short: "Pose une main sur ton ventre",
    full: "Pose une main sur ton ventre. Sens-le monter doucement à l'inspiration, descendre à l'expiration. Reste là le temps de 5 respirations.",
  },
  {
    id: "resp3", group: "respiration",
    short: "Expire complètement, puis attends",
    full: "Expire tout l'air de tes poumons. Attends un instant — sans forcer. Puis laisse l'inspiration venir toute seule. Répète 3 fois.",
  },
  {
    id: "resp4", group: "respiration",
    short: "5 respirations les yeux sur le sol",
    full: "Baisse légèrement le regard vers le sol. Prends 5 respirations profondes en gardant les yeux là, dans cet espace calme.",
  },
  {
    id: "resp5", group: "respiration",
    short: "Inspire par le nez, expire par la bouche",
    full: "Inspire lentement par le nez. Expire doucement par la bouche, comme si tu soufflais sur une bougie sans l'éteindre. Recommence.",
  },

  // Présence (5)
  {
    id: "pres1", group: "présence",
    short: "Sens le sol sous tes pieds",
    full: "Concentre toute ton attention sur la plante de tes pieds. Sens le sol. Dur, stable, réel. Tu es ancré·e ici.",
  },
  {
    id: "pres2", group: "présence",
    short: "Bouge juste assez pour sentir ton corps",
    full: "Bouge légèrement — les épaules, les hanches, les bras. Juste assez pour sentir que ton corps existe et qu'il est là, avec toi.",
  },
  {
    id: "pres3", group: "présence",
    short: "Ferme les yeux 10 secondes",
    full: "Ferme les yeux pendant 10 secondes. Concentre-toi uniquement sur le son qui t'entoure. Puis ouvre les yeux doucement.",
  },
  {
    id: "pres4", group: "présence",
    short: "Bois de l'eau lentement",
    full: "Si tu as de l'eau, bois-en une gorgée lentement. Sens la fraîcheur. Sois présent·e à cette simple sensation.",
  },
  {
    id: "pres5", group: "présence",
    short: "Pose tes mains sur quelque chose de stable",
    full: "Pose tes deux mains à plat sur une surface stable — une barrière, le sol, ta jambe. Sens la résistance. Tu es là.",
  },
];

// ── 20 Phrases Mode Nuit ──────────────────────────────────────────────────────

const NUIT_PHRASES: string[] = [
  "La nuit efface les distances — tout le monde est proche.",
  "Le silence après un set est aussi de la musique.",
  "Le ciel au-dessus de toi est le même que partout dans le monde.",
  "Il n'y a rien à accomplir cette nuit. Juste à être là.",
  "Quand tout s'apaise, quelque chose d'essentiel apparaît.",
  "La fatigue que tu ressens est le prix du plaisir vécu.",
  "Les corps autour de toi ont aussi besoin de silence.",
  "Le froid de la nuit garde les choses vraies.",
  "Tu peux laisser cette nuit se terminer avec douceur.",
  "Quelque part, quelqu'un joue encore. Tu peux te reposer.",
  "La nuit porte en elle sa propre magie — même silencieuse.",
  "Tu as le droit d'avoir moins d'énergie qu'avant.",
  "Ce qui reste de toi en ce moment est l'essentiel.",
  "Les étoiles au-dessus ne dorment pas. Toi, tu peux.",
  "Une nuit de festival vécue est déjà une victoire.",
  "Le lendemain matin existe. Il sera doux.",
  "Laisse la musique au loin te bercer sans l'écouter vraiment.",
  "Dans quelques heures, la lumière reviendra.",
  "Tu n'as plus à performer — ni pour les autres, ni pour toi.",
  "Ce soir s'est passé. Demain commencera.",
];

// ── Sections hub ──────────────────────────────────────────────────────────────

const SECTIONS: { id: SanteSection; emoji: string; title: string; desc: string }[] = [
  { id: "mantras",      emoji: "🌿", title: "Mantras",    desc: "Phrases rassurantes pour traverser un moment difficile"      },
  { id: "inspiration",  emoji: "✨", title: "Inspiration", desc: "Retrouver de l'énergie et une perspective plus large"        },
  { id: "reconnexion",  emoji: "🌍", title: "Reconnexion", desc: "Techniques simples pour revenir au moment présent"           },
  { id: "nuit",         emoji: "🌙", title: "Mode nuit",   desc: "Pour les moments calmes et la fin de soirée"                },
];

// ── CSS animé ─────────────────────────────────────────────────────────────────

const CSS = `
@keyframes santeSlideRight {
  from { opacity: 0; transform: translateX(-30px) scale(0.98); }
  to   { opacity: 1; transform: translateX(0)     scale(1);    }
}
@keyframes santeSlideLeft {
  from { opacity: 0; transform: translateX(30px)  scale(0.98); }
  to   { opacity: 1; transform: translateX(0)     scale(1);    }
}
@keyframes santeBreath {
  0%,100% { opacity: 0.38; transform: scale(1);    }
  50%     { opacity: 0.62; transform: scale(1.07); }
}
@keyframes santeFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes santeExpand {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 120px; }
}
`;

// ── Utilitaire : mélange ──────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Utilitaire : capitalise la première lettre ────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Bouton flèche (réutilisable) ──────────────────────────────────────────────

function NavBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 999,
        padding: "10px 18px",
        fontSize: 14,
        color: disabled ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

// ── SwipeCard ─────────────────────────────────────────────────────────────────

type SwipeCardProps = {
  items: string[];
  renderCard: (text: string, index: number, total: number) => React.ReactNode;
  nightMode?: boolean;
};

function SwipeCard({ items, renderCard, nightMode = false }: SwipeCardProps) {
  const { t } = useTranslation();
  const [index,   setIndex]   = useState(0);
  const [animDir, setAnimDir] = useState<"right" | "left">("right");
  const [animKey, setAnimKey] = useState(0);
  const [dragX,   setDragX]   = useState(0);

  const startXRef    = useRef(0);
  const isDragging   = useRef(false);

  function goNext() {
    setAnimDir("right");
    setIndex((i) => (i + 1) % items.length);
    setAnimKey((k) => k + 1);
    setDragX(0);
  }

  function goPrev() {
    setAnimDir("left");
    setIndex((i) => (i - 1 + items.length) % items.length);
    setAnimKey((k) => k + 1);
    setDragX(0);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    startXRef.current  = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    setDragX((e.clientX - startXRef.current) * 0.25);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = false;
    const delta = e.clientX - startXRef.current;
    setDragX(0);
    if (delta > 40)  goNext();
    else if (delta < -40) goPrev();
  }

  const animName = animDir === "right" ? "santeSlideRight" : "santeSlideLeft";
  const duration = nightMode ? "0.7s" : "0.45s";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      {/* Carte swipeable */}
      <div
        key={animKey}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { isDragging.current = false; setDragX(0); }}
        style={{
          width: "100%",
          borderRadius: 22,
          padding: "32px 24px",
          background: nightMode ? "rgba(18,22,38,0.88)" : "rgba(255,255,255,0.06)",
          border: nightMode ? "1px solid rgba(100,120,180,0.20)" : "1px solid rgba(255,255,255,0.11)",
          backdropFilter: "blur(14px)",
          boxShadow: nightMode
            ? "0 8px 40px rgba(0,0,20,0.45)"
            : "0 8px 40px rgba(0,0,0,0.30)",
          cursor: "grab",
          touchAction: "pan-y",
          userSelect: "none",
          transform: `translateX(${dragX}px)`,
          transition: dragX === 0 ? "transform 0.2s ease" : "none",
          animation: `${animName} ${duration} cubic-bezier(0.22, 1, 0.36, 1) both`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Halo de respiration (mode nuit) */}
        {nightMode && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 60%, rgba(80,100,180,0.18) 0%, transparent 70%)",
            animation: "santeBreath 4s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}
        {renderCard(items[index], index, items.length)}
      </div>

      {/* Compteur + navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <NavBtn onClick={goPrev} label={t('sante.navPrev')} />
        <div style={{ fontSize: 13, opacity: 0.45, minWidth: 60, textAlign: "center" }}>
          {index + 1} / {items.length}
        </div>
        <NavBtn onClick={goNext} label={t('sante.navNext')} />
      </div>

      {/* Hint swipe */}
      <div style={{ fontSize: 11, opacity: 0.30, letterSpacing: "0.05em" }}>
        {t('sante.swipeHint')}
      </div>
    </div>
  );
}

// ── CheckInView ───────────────────────────────────────────────────────────────

type CheckInProps = { onMood: (m: CheckinMood | null) => void };

function CheckInView({ onMood }: CheckInProps) {
  const { t } = useTranslation();

  const moods: { key: CheckinMood; emoji: string; label: string }[] = [
    { key: "super",   emoji: "😊", label: t('sante.moodSuperLabel')   },
    { key: "bof",     emoji: "😐", label: t('sante.moodBofLabel')     },
    { key: "pas-top", emoji: "😔", label: t('sante.moodPasTopLabel')  },
  ];

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 40, padding: "0 24px",
      animation: "santeFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      {/* Question */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 36 }}>🧠</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.4 }}>
          {t('sante.checkinQuestion')}
        </div>
        <div style={{ fontSize: 13, opacity: 0.45, lineHeight: 1.5 }}>
          {t('sante.checkinSub')}
        </div>
      </div>

      {/* Boutons humeur */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {moods.map((m) => (
          <button
            key={m.key}
            onClick={() => onMood(m.key)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6,
              padding: "18px 22px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              minWidth: 88,
              letterSpacing: "0.03em",
              transition: "background 0.15s ease",
            }}
          >
            <span style={{ fontSize: 28 }}>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Passer */}
      <button
        onClick={() => onMood(null)}
        style={{
          background: "none", border: "none",
          color: "rgba(255,255,255,0.30)",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 13, letterSpacing: "0.04em",
          padding: "8px 16px",
        }}
      >
        {t('sante.skip')}
      </button>
    </div>
  );
}

// ── HubView ───────────────────────────────────────────────────────────────────

type HubProps = {
  mood: CheckinMood | null;
  onSection: (s: SanteSection) => void;
};

function HubView({ mood, onSection }: HubProps) {
  const { t } = useTranslation();
  const suggested = mood ? SUGGESTED[mood] : [];

  const moodEmoji: Record<CheckinMood, string> = {
    "super": "😊", "bof": "😐", "pas-top": "😔",
  };
  const moodLabelMap: Record<CheckinMood, string> = {
    "super":   t('sante.moodSuperLabel'),
    "bof":     t('sante.moodBofLabel'),
    "pas-top": t('sante.moodPasTopLabel'),
  };

  return (
    <div
      className="no-scrollbar"
      style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px 48px",
        display: "flex", flexDirection: "column", gap: 20,
        animation: "santeFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Rappel humeur */}
      {mood && (
        <div style={{
          fontSize: 13, opacity: 0.5,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>{moodEmoji[mood]}</span>
          <span>{t('sante.moodSuggestion', { mood: moodLabelMap[mood].toLowerCase() })}</span>
        </div>
      )}

      {/* Sections recommandées */}
      {suggested.length > 0 && (
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", opacity: 0.40, marginBottom: 12,
          }}>
            {t('sante.forYou')}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {suggested.map((sid) => {
              const s = SECTIONS.find((x) => x.id === sid)!;
              return (
                <button
                  key={sid}
                  onClick={() => onSection(sid)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 18,
                    padding: 16,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{s.emoji}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
                      {t(`sante.hub${capitalize(sid)}`)}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.55, lineHeight: 1.4 }}>
                      {t(`sante.hub${capitalize(sid)}Sub`)}
                    </div>
                  </div>
                  {/* Badge recommandé */}
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,200,50,0.18)",
                    border: "1px solid rgba(255,200,50,0.35)",
                    borderRadius: 999, padding: "2px 8px",
                    fontSize: 9, fontWeight: 700,
                    color: "#F0C832", letterSpacing: "0.05em",
                  }}>
                    {t('sante.forYouBadge')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toutes les sections */}
      <div>
        {suggested.length > 0 && (
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", opacity: 0.40, marginBottom: 12,
          }}>
            {t('sante.alwaysAvailable')}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {SECTIONS.filter((s) => !suggested.includes(s.id)).map((s) => (
            <button
              key={s.id}
              onClick={() => onSection(s.id)}
              style={{
                aspectRatio: "1",
                borderRadius: 18,
                padding: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 28, lineHeight: 1 }}>{s.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
                  {t(`sante.hub${capitalize(s.id)}`)}
                </div>
                <div style={{ fontSize: 11, opacity: 0.50, lineHeight: 1.4 }}>
                  {t(`sante.hub${capitalize(s.id)}Sub`)}
                </div>
              </div>
            </button>
          ))}

        </div>
      </div>

    </div>
  );
}

// ── MantraView ────────────────────────────────────────────────────────────────

function MantraView() {
  const items = useMemo(() => shuffle(MANTRAS), []);

  return (
    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <SwipeCard
        items={items.map((m) => m.text)}
        renderCard={(text, index) => {
          const m = items[index];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 14, opacity: 0.40, fontStyle: "italic", textAlign: "center" }}>🌿</div>
              <p style={{
                margin: 0, fontSize: 19, lineHeight: 1.65,
                color: "rgba(255,255,255,0.92)", textAlign: "center",
                fontWeight: 400, fontStyle: "italic",
              }}>
                {text}
              </p>
              {m.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                  {m.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 10, padding: "3px 9px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                      letterSpacing: "0.05em",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

// ── InspirationView ───────────────────────────────────────────────────────────

function InspirationView() {
  const items = useMemo(() => shuffle(INSPIRATIONS), []);

  return (
    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <SwipeCard
        items={items}
        renderCard={(text) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 14, opacity: 0.40, textAlign: "center" }}>✨</div>
            <p style={{
              margin: 0, fontSize: 19, lineHeight: 1.65,
              color: "rgba(255,255,255,0.92)", textAlign: "center",
              fontWeight: 400,
            }}>
              {text}
            </p>
          </div>
        )}
      />
    </div>
  );
}

// ── ReconnexionView ───────────────────────────────────────────────────────────

const GROUP_META = {
  observation: { emoji: "🔍", label: "Observation" },
  respiration: { emoji: "💨", label: "Respiration" },
  présence:    { emoji: "🌱", label: "Présence"    },
} as const;

function ReconnexionView() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = (["observation", "respiration", "présence"] as const).map((g) => ({
    ...GROUP_META[g],
    key: g,
    exercises: EXERCISES.filter((e) => e.group === g),
    label: g === "observation"
      ? t('sante.sectionObservation')
      : g === "respiration"
        ? t('sante.sectionRespiration')
        : t('sante.sectionPresence'),
  }));

  return (
    <div
      className="no-scrollbar"
      style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px 48px",
        display: "flex", flexDirection: "column", gap: 24,
        animation: "santeFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.45, textAlign: "center", lineHeight: 1.6 }}>
        {t('sante.reconnexionInstruction')}
      </div>

      {groups.map((g) => (
        <div key={g.key}>
          {/* Titre groupe */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 18 }}>{g.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", opacity: 0.65, textTransform: "uppercase" }}>
              {g.label}
            </span>
          </div>

          {/* Exercices */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {g.exercises.map((ex) => {
              const isOpen = expandedId === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setExpandedId(isOpen ? null : ex.id)}
                  style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "flex-start",
                    gap: isOpen ? 10 : 0,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: isOpen ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
                    border: isOpen ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background 0.2s ease, border 0.2s ease",
                    width: "100%",
                  }}
                >
                  {/* Label court + indicateur */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                    <span style={{
                      fontSize: 12, color: "rgba(255,255,255,0.35)",
                      transition: "transform 0.2s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}>
                      ▶
                    </span>
                    <span style={{ fontSize: 14, lineHeight: 1.4, flex: 1 }}>
                      {ex.short}
                    </span>
                  </div>

                  {/* Instruction complète (expandée) */}
                  {isOpen && (
                    <div style={{
                      fontSize: 14, lineHeight: 1.65,
                      color: "rgba(255,255,255,0.75)",
                      paddingLeft: 22,
                      animation: "santeExpand 0.25s ease both",
                    }}>
                      {ex.full}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ModeNuitView ──────────────────────────────────────────────────────────────

function ModeNuitView() {
  const items = useMemo(() => shuffle(NUIT_PHRASES), []);

  return (
    <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <SwipeCard
        items={items}
        nightMode
        renderCard={(text) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 14, opacity: 0.35, textAlign: "center" }}>🌙</div>
            <p style={{
              margin: 0, fontSize: 18, lineHeight: 1.75,
              color: "rgba(200,210,255,0.90)", textAlign: "center",
              fontWeight: 300, letterSpacing: "0.01em",
            }}>
              {text}
            </p>
          </div>
        )}
      />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

type Props = { onBack: () => void; onRisques: () => void; haloColor?: string };

export function SanteScreen({ onBack, onRisques, haloColor = "#00FFB7" }: Props) {
  const { t } = useTranslation();

  // check-in persisté au niveau module (survit aux navigations sans rechargement)
  const [view, setView] = useState<SanteView>(
    _sessionMood !== null ? "hub" : "checkin"
  );
  const [mood, setMood] = useState<CheckinMood | null>(_sessionMood);

  function handleMood(m: CheckinMood | null) {
    _sessionMood = m;
    setMood(m);
    setView("hub");
  }

  function goBack() {
    if (view === "checkin") { onBack(); return; }
    if (view === "hub")     { onBack(); return; }
    setView("hub");
  }

  const sectionMeta = SECTIONS.find((s) => s.id === view);
  const headerTitle =
    view === "checkin" ? t('sante.headerCheckin') :
    view === "hub"     ? t('sante.headerHub') :
    sectionMeta ? `${sectionMeta.emoji} ${t(`sante.hub${capitalize(sectionMeta.id)}`)}` : t('sante.headerCheckin');

  const headerSub =
    view === "checkin"     ? t('sante.headerSub') :
    view === "hub"         ? t('sante.headerHubSub') :
    view === "mantras"     ? t('sante.subMantraCount', { count: MANTRAS.length }) :
    view === "inspiration" ? t('sante.subInspirationCount', { count: INSPIRATIONS.length }) :
    view === "reconnexion" ? t('sante.subReconnexionCount') :
    view === "nuit"        ? t('sante.subNuitCount', { count: NUIT_PHRASES.length }) : "";

  const backLabel = (view === "checkin" || view === "hub") ? t('sante.backHome') : t('sante.backSection');

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>

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
            {headerTitle}
          </div>
          {headerSub && (
            <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
              {headerSub}
            </div>
          )}
        </div>
        <button
          onClick={goBack}
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
          {backLabel}
        </button>
      </div>

      {/* ── Corps ── */}
      {view === "checkin"    && <CheckInView onMood={handleMood} />}
      {view === "hub"        && <HubView mood={mood} onSection={(s) => setView(s)} />}
      {view === "mantras"    && <MantraView />}
      {view === "inspiration"&& <InspirationView />}
      {view === "reconnexion"&& <ReconnexionView />}
      {view === "nuit"       && <ModeNuitView />}

      {/* ── Footer fixe — Réduction des risques ── */}
      <div style={{
        flexShrink: 0,
        padding: "10px 16px 28px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={onRisques}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: "14px 16px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${toRgba(haloColor, 0.40)}`,
            boxShadow: `0 0 14px ${toRgba(haloColor, 0.12)}`,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "white",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>⛑️</span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
            {t('sante.risquesLink')}
          </span>
          <span style={{ fontSize: 11, opacity: 0.45 }}>
            {t('sante.risquesLinkSub')}
          </span>
        </button>
      </div>
    </div>
  );
}
