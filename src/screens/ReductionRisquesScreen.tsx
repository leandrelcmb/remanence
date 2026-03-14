import { useState } from "react";

// ── Types internes ─────────────────────────────────────────────────────────────

type RisquesView =
  | "hub"
  | "categories"
  | "categoryDetail"
  | "substances"
  | "substanceDetail"
  | "conseils"
  | "simulateur";

type Category = {
  id: string;
  emoji: string;
  name: string;
  color: string;
  description: string;
  examples: string[];
  effects: string[];
  risks: string[];
};

type Substance = {
  id: string;
  name: string;
  emoji: string;
  categoryId: string;
  onsetMin: number;
  durationH: number;
  afterEffects?: string;
  effects: string[];
  attention: string[];
  melanges: string[];
  melangesText: string;
  alertSigns: string[];
};

type Conseil = {
  emoji: string;
  title: string;
  tips: string[];
};

// ── Données — Catégories ──────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "stimulants",
    emoji: "💊",
    name: "Stimulants",
    color: "#FF9500",
    description: "Produits qui augmentent l'énergie, l'éveil et la stimulation.",
    examples: ["MDMA", "amphétamines", "cocaïne", "3-MMC"],
    effects: ["énergie", "sociabilité", "stimulation"],
    risks: ["déshydratation", "surchauffe", "fatigue importante après coup"],
  },
  {
    id: "psychedeliques",
    emoji: "🍄",
    name: "Psychédéliques",
    color: "#BF5AF2",
    description: "Produits qui modifient la perception et les sensations.",
    examples: ["LSD", "champignons", "DMT", "mescaline"],
    effects: ["perception altérée", "introspection", "émotions amplifiées"],
    risks: ["confusion", "anxiété", "bad trip"],
  },
  {
    id: "dissociatifs",
    emoji: "🧬",
    name: "Dissociatifs",
    color: "#00C7BE",
    description: "Produits qui modifient la perception du corps et de la réalité.",
    examples: ["kétamine"],
    effects: ["sensation de flottement", "dissociation"],
    risks: ["perte d'équilibre", "confusion"],
  },
  {
    id: "depresseurs",
    emoji: "📉",
    name: "Dépresseurs",
    color: "#FF3B30",
    description: "Produits qui ralentissent certaines fonctions du système nerveux.",
    examples: ["alcool", "GHB / GBL", "benzodiazépines"],
    effects: [],
    risks: ["perte de conscience", "respiration ralentie", "mélanges dangereux"],
  },
  {
    id: "cannabis",
    emoji: "🌿",
    name: "Cannabis",
    color: "#34C759",
    description: "Produits à base de THC.",
    examples: ["herbe", "résine", "huile"],
    effects: ["relaxation", "modification des sensations"],
    risks: ["anxiété", "perte de motivation", "malaise chez certaines personnes"],
  },
];

// ── Données — Substances ──────────────────────────────────────────────────────

const SUBSTANCES: Substance[] = [
  {
    id: "mdma",
    name: "MDMA · Ecstasy",
    emoji: "💊",
    categoryId: "stimulants",
    onsetMin: 45,
    durationH: 4.5,
    afterEffects: "Fatigue ou descente émotionnelle possible après coup.",
    effects: ["euphorie", "empathie et proximité avec les autres", "énergie pour danser"],
    attention: [
      "boire de l'eau régulièrement",
      "faire des pauses",
      "éviter la chaleur excessive",
      "éviter de reprendre trop rapidement",
    ],
    melanges: ["alcool", "stimulants supplémentaires", "certains médicaments"],
    melangesText: "Les mélanges peuvent augmenter les risques pour le cœur et la température du corps.",
    alertSigns: [
      "perte de conscience",
      "forte confusion",
      "difficulté à respirer",
      "agitation extrême",
      "température corporelle très élevée",
    ],
  },
  {
    id: "lsd",
    name: "LSD",
    emoji: "🌈",
    categoryId: "psychedeliques",
    onsetMin: 60,
    durationH: 10,
    effects: ["perception altérée des couleurs et formes", "introspection intense", "émotions amplifiées"],
    attention: [
      "prévoir un cadre rassurant",
      "ne pas conduire",
      "éviter si état émotionnel fragile",
      "l'expérience peut être très longue",
    ],
    melanges: ["stimulants", "alcool", "certains médicaments psychiatriques"],
    melangesText: "Les mélanges peuvent rendre l'expérience très imprévisible.",
    alertSigns: [
      "panique intense impossible à calmer",
      "perte totale de contact avec la réalité",
      "comportement dangereux pour soi ou les autres",
    ],
  },
  {
    id: "champignons",
    name: "Champignons",
    emoji: "🍄",
    categoryId: "psychedeliques",
    onsetMin: 45,
    durationH: 5,
    effects: ["perception modifiée", "rires", "introspection", "sensations corporelles amplifiées"],
    attention: [
      "éviter en cas d'anxiété préexistante",
      "prévoir un environnement calme",
      "commencer avec une petite quantité",
    ],
    melanges: ["alcool", "cannabis", "stimulants"],
    melangesText: "Les mélanges renforcent les effets et augmentent le risque de mauvaise expérience.",
    alertSigns: ["panique incontrôlable", "hallucinations très déstabilisantes", "comportement dangereux"],
  },
  {
    id: "cocaine",
    name: "Cocaïne",
    emoji: "❄️",
    categoryId: "stimulants",
    onsetMin: 5,
    durationH: 0.75,
    effects: ["énergie soudaine", "confiance accrue", "réduction de la fatigue"],
    attention: [
      "durée courte — envie fréquente de reprendre",
      "risque cardiaque",
      "éviter si problèmes cardiaques",
    ],
    melanges: ["alcool", "autres stimulants"],
    melangesText: "Le mélange avec l'alcool crée une substance qui augmente les risques cardiaques.",
    alertSigns: ["douleur thoracique", "palpitations intenses", "perte de conscience"],
  },
  {
    id: "amphetamines",
    name: "Amphétamines",
    emoji: "💊",
    categoryId: "stimulants",
    onsetMin: 30,
    durationH: 6,
    effects: ["énergie prolongée", "réduction du besoin de sommeil", "concentration accrue"],
    attention: [
      "risque de manquer les signaux de fatigue",
      "le corps ne ressent plus la faim ni la soif",
    ],
    melanges: ["alcool", "MDMA", "cocaïne"],
    melangesText: "Les mélanges de stimulants augmentent fortement les risques cardiaques.",
    alertSigns: ["palpitations intenses", "forte anxiété", "forte montée de température"],
  },
  {
    id: "ketamine",
    name: "Kétamine",
    emoji: "🧬",
    categoryId: "dissociatifs",
    onsetMin: 5,
    durationH: 1,
    effects: ["sensation de flottement", "dissociation", "distorsion du temps"],
    attention: [
      "perte d'équilibre possible",
      "éviter de se retrouver seul",
      "ne pas conduire",
      "doser avec précaution",
    ],
    melanges: ["alcool", "dépresseurs", "GHB"],
    melangesText: "Le mélange avec d'autres dépresseurs peut entraîner une perte de conscience.",
    alertSigns: ["perte de conscience", "respiration difficile", "incapacité à bouger ou répondre"],
  },
  {
    id: "alcool",
    name: "Alcool",
    emoji: "🍺",
    categoryId: "depresseurs",
    onsetMin: 15,
    durationH: 3,
    effects: ["désinhibition", "relaxation", "sociabilité"],
    attention: [
      "boire de l'eau en parallèle",
      "manger avant",
      "éviter de mélanger avec d'autres substances",
    ],
    melanges: ["GHB", "kétamine", "benzodiazépines", "MDMA"],
    melangesText: "L'alcool mélangé à d'autres dépresseurs peut entraîner une perte de conscience grave.",
    alertSigns: ["vomissements avec perte de conscience", "respiration lente ou irrégulière", "ne répond plus"],
  },
  {
    id: "cannabis",
    name: "Cannabis",
    emoji: "🌿",
    categoryId: "cannabis",
    onsetMin: 30,
    durationH: 2,
    afterEffects: "Somnolence possible.",
    effects: ["relaxation", "modification des sensations", "appétit stimulé"],
    attention: [
      "les effets varient beaucoup selon la personne",
      "la chaleur et la fatigue amplifient les effets",
      "risque de malaise si première fois ou trop forte dose",
    ],
    melanges: ["alcool", "psychédéliques"],
    melangesText: "Les mélanges peuvent amplifier fortement les effets et provoquer des malaises.",
    alertSigns: ["malaise intense ou perte de connaissance", "panique incontrôlable", "hallucinations non souhaitées"],
  },
  {
    id: "ghb",
    name: "GHB / GBL",
    emoji: "📉",
    categoryId: "depresseurs",
    onsetMin: 15,
    durationH: 3,
    effects: ["euphorie douce", "relaxation", "désinhibition"],
    attention: [
      "marge entre dose active et dose dangereuse très faible",
      "ne jamais mélanger avec l'alcool",
      "ne jamais laisser quelqu'un seul",
    ],
    melanges: ["alcool", "kétamine", "autres dépresseurs"],
    melangesText: "Le GHB mélangé à l'alcool peut provoquer une perte de conscience rapide et grave.",
    alertSigns: ["perte de conscience soudaine", "respiration très lente", "impossible à réveiller"],
  },
  {
    id: "3mmc",
    name: "3-MMC",
    emoji: "💊",
    categoryId: "stimulants",
    onsetMin: 30,
    durationH: 3,
    effects: ["euphorie", "sociabilité", "énergie"],
    attention: [
      "risque de redoser rapidement",
      "effets variables selon les personnes",
      "fatigue importante après",
    ],
    melanges: ["alcool", "MDMA", "autres stimulants"],
    melangesText: "Les mélanges augmentent les risques cardiaques et la surchauffe.",
    alertSigns: ["palpitations", "forte chaleur", "agitation extrême"],
  },
  {
    id: "poppers",
    name: "Poppers",
    emoji: "🫧",
    categoryId: "stimulants",
    onsetMin: 1,
    durationH: 0.05,
    effects: ["rush de quelques secondes", "relaxation musculaire", "sensation de chaleur"],
    attention: [
      "ne jamais avaler",
      "éviter si problèmes cardiaques ou tension artérielle",
      "ne pas inhaler trop fort ou trop longtemps",
    ],
    melanges: ["médicaments pour la dysfonction érectile"],
    melangesText: "Ce mélange peut provoquer une chute de tension grave.",
    alertSigns: ["perte de connaissance", "douleur thoracique", "maux de tête intenses"],
  },
];

// ── Données — Conseils festival ───────────────────────────────────────────────

const CONSEILS: Conseil[] = [
  {
    emoji: "💧",
    title: "Hydratation",
    tips: ["boire de l'eau régulièrement", "éviter de boire trop d'un coup"],
  },
  {
    emoji: "💤",
    title: "Pauses",
    tips: ["faire des pauses entre les moments de danse", "écouter son corps"],
  },
  {
    emoji: "🌡️",
    title: "Chaleur",
    tips: ["se mettre à l'ombre", "se rafraîchir régulièrement"],
  },
  {
    emoji: "😴",
    title: "Sommeil",
    tips: ["dormir un peu si possible", "le manque de sommeil amplifie les effets"],
  },
  {
    emoji: "💟",
    title: "Être entouré",
    tips: ["rester avec des personnes de confiance", "veiller les uns sur les autres"],
  },
  {
    emoji: "🆘",
    title: "Demander de l'aide",
    tips: [
      "si quelqu'un ne va pas bien, appelle le staff ou les bénévoles",
      "rester avec la personne",
      "les équipes sont là pour aider",
    ],
  },
];

// ── Simulateur ─────────────────────────────────────────────────────────────────

const SIM_ONSET: Record<string, number> = {
  mdma: 45, lsd: 60, champignons: 45, cocaine: 5,
  amphetamines: 30, ketamine: 5, alcool: 15,
  cannabis: 30, ghb: 15, "3mmc": 30, poppers: 1,
};

const SIM_DURATION: Record<string, number> = {
  mdma: 4.5, lsd: 10, champignons: 5, cocaine: 0.75,
  amphetamines: 6, ketamine: 1, alcool: 3,
  cannabis: 2, ghb: 3, "3mmc": 3, poppers: 0.05,
};

const TIME_OPTIONS: { label: string; value: number }[] = [
  { label: "Moins de 20 min", value: 10 },
  { label: "30 minutes",       value: 30 },
  { label: "1 heure",          value: 60 },
  { label: "2 heures",         value: 120 },
  { label: "4 heures",         value: 240 },
  { label: "6 heures",         value: 360 },
  { label: "Plus de 8 heures", value: 480 },
];

function getSimMessage(substanceId: string, elapsedMin: number): string {
  const onset = SIM_ONSET[substanceId] ?? 30;
  const durationMin = (SIM_DURATION[substanceId] ?? 3) * 60;

  if (elapsedMin < onset * 0.7) {
    return "Les effets n'ont probablement pas encore commencé à se faire sentir pleinement. Prends le temps d'attendre avant de reprendre quoi que ce soit.";
  }
  if (elapsedMin <= onset * 1.3) {
    return "Tu es probablement dans la phase de montée. Les effets peuvent encore évoluer pendant un moment. Attends de voir comment ton corps réagit.";
  }
  if (elapsedMin <= durationMin * 0.8) {
    return "Tu es probablement dans la période principale des effets. Écoute ton corps, hydrate-toi et prends des pauses.";
  }
  if (elapsedMin <= durationMin * 1.2) {
    return "Les effets commencent probablement à diminuer. Ton corps peut être fatigué — c'est normal.";
  }
  return "Les effets sont probablement passés. Ton corps a encore besoin de récupérer. Prends soin de toi.";
}

// ── Composants ────────────────────────────────────────────────────────────────

function AlertBanner({ signs }: { signs?: string[] }) {
  return (
    <div
      style={{
        background: "rgba(255,59,48,0.08)",
        border: "1px solid rgba(255,59,48,0.22)",
        borderRadius: 16,
        padding: "14px 16px",
        marginTop: 8,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        ⛑️ Quand demander de l'aide
      </div>
      {signs && signs.length > 0 && (
        <ul style={{ margin: "0 0 8px 16px", padding: 0, fontSize: 12, opacity: 0.85, lineHeight: 1.7 }}>
          {signs.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      <div style={{ fontSize: 12, opacity: 0.70, lineHeight: 1.55, fontStyle: "italic" }}>
        Des équipes sont là pour accompagner sans jugement.
      </div>
    </div>
  );
}

function CategoryColor({ cat }: { cat: Category }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${cat.color}30`,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 26,
          width: 46,
          height: 46,
          borderRadius: 12,
          background: `${cat.color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {cat.emoji}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{cat.name}</div>
        <div style={{ fontSize: 11, opacity: 0.45, marginTop: 2, lineHeight: 1.4 }}>
          {cat.description}
        </div>
      </div>
      <span style={{ opacity: 0.30, fontSize: 14, flexShrink: 0 }}>›</span>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

type Props = { onBack: () => void };

export function ReductionRisquesScreen({ onBack }: Props) {
  const [view, setView] = useState<RisquesView>("hub");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [simSubstanceId, setSimSubstanceId] = useState<string>("");
  const [simTimeValue, setSimTimeValue] = useState<string>("");

  // ── Navigation interne ──────────────────────────────────────────────────────
  function handleBack() {
    if (view === "hub")             { onBack(); return; }
    if (view === "categoryDetail")  { setView("categories"); return; }
    if (view === "substanceDetail") { setView("substances"); return; }
    setView("hub");
  }

  // ── Header dynamique ────────────────────────────────────────────────────────
  const headerTitle =
    view === "hub"             ? "Réduction des risques ⛑️" :
    view === "categories"      ? "Catégories 🗂️" :
    view === "categoryDetail"  ? `${selectedCategory?.emoji} ${selectedCategory?.name}` :
    view === "substances"      ? "Substances 💊" :
    view === "substanceDetail" ? selectedSubstance?.name ?? "" :
    view === "conseils"        ? "Conseils festival 🏕️" :
                                 "Simulateur ⏱️";

  const headerSub =
    view === "hub"             ? "Informer pour mieux prendre soin" :
    view === "categories"      ? "5 familles de substances" :
    view === "substances"      ? `${SUBSTANCES.length} substances · tap pour le détail` :
    view === "conseils"        ? "En festival, quelques repères utiles" :
    view === "simulateur"      ? "Aide au timing — pas un outil médical" :
    "";

  const backLabel =
    view === "hub"             ? "← Santé" :
    view === "categoryDetail"  ? "← Catégories" :
    view === "substanceDetail" ? "← Substances" : "← Retour";

  // ── Simulateur ──────────────────────────────────────────────────────────────
  const simMessage = simSubstanceId && simTimeValue
    ? getSimMessage(simSubstanceId, Number(simTimeValue))
    : null;

  // ── Rendu des vues ──────────────────────────────────────────────────────────

  function renderHub() {
    const hubCards = [
      { key: "categories", emoji: "🗂️", title: "Catégories",       desc: "Familles de substances" },
      { key: "substances",  emoji: "💊", title: "Substances",        desc: "Fiches par produit" },
      { key: "conseils",    emoji: "🏕️", title: "Conseils festival", desc: "Hydratation, pauses, aide" },
      { key: "simulateur",  emoji: "⏱️", title: "Simulateur",        desc: "Aide au timing" },
    ] as const;

    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "20px 16px 48px" }}
      >
        {/* Introduction éditoriale */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
            Cette section informe pour réduire les risques, pas pour encourager la consommation.
          </p>
          <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.65, lineHeight: 1.6 }}>
            Chaque corps est différent. Les effets varient selon la fatigue, la chaleur, les mélanges ou le contexte.
          </p>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.65, lineHeight: 1.6 }}>
            ⛑️ Des personnes sont là pour accompagner sans jugement si quelque chose ne va pas.
          </p>
        </div>

        {/* Grille 2×2 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {hubCards.map((card) => (
            <button
              key={card.key}
              onClick={() => setView(card.key)}
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
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 28, lineHeight: 1 }}>{card.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 11, opacity: 0.50, lineHeight: 1.4 }}>
                  {card.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderCategories() {
    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => { setSelectedCategory(cat); setView("categoryDetail"); }}
          >
            <CategoryColor cat={cat} />
          </div>
        ))}
      </div>
    );
  }

  function renderCategoryDetail() {
    const cat = selectedCategory;
    if (!cat) return null;
    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        {/* Description */}
        <div
          style={{
            background: `${cat.color}12`,
            border: `1px solid ${cat.color}30`,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 32 }}>{cat.emoji}</span>
          <p style={{ margin: "10px 0 0", fontSize: 14, opacity: 0.80, lineHeight: 1.6 }}>
            {cat.description}
          </p>
        </div>

        {/* Exemples */}
        <Section title="Exemples">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cat.examples.map((e) => (
              <span
                key={e}
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: `${cat.color}18`,
                  border: `1px solid ${cat.color}40`,
                  color: cat.color,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {e}
              </span>
            ))}
          </div>
        </Section>

        {/* Effets fréquents */}
        {cat.effects.length > 0 && (
          <Section title="Effets fréquents">
            <BulletList items={cat.effects} />
          </Section>
        )}

        {/* Risques fréquents */}
        <Section title="Risques fréquents">
          <BulletList items={cat.risks} color="#FF9500" />
        </Section>
      </div>
    );
  }

  function renderSubstances() {
    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        {SUBSTANCES.map((sub) => {
          const cat = CATEGORIES.find((c) => c.id === sub.categoryId);
          const color = cat?.color ?? "#ffffff";
          return (
            <button
              key={sub.id}
              onClick={() => { setSelectedSubstance(sub); setView("substanceDetail"); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                marginBottom: 8,
                borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 7px ${color}88`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{sub.name}</div>
                <div style={{ fontSize: 11, opacity: 0.40, marginTop: 2 }}>
                  {cat?.name ?? ""}
                </div>
              </div>
              <div style={{ fontSize: 11, opacity: 0.35, flexShrink: 0 }}>
                {sub.durationH < 1
                  ? `${Math.round(sub.durationH * 60)} min`
                  : `~${sub.durationH}h`}
              </div>
              <span style={{ opacity: 0.30, fontSize: 14, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>
    );
  }

  function renderSubstanceDetail() {
    const sub = selectedSubstance;
    if (!sub) return null;
    const cat = CATEGORIES.find((c) => c.id === sub.categoryId);
    const color = cat?.color ?? "#ffffff";

    // Durée en texte lisible
    const durationText =
      sub.durationH < 1
        ? `${Math.round(sub.durationH * 60)} minutes`
        : sub.durationH === Math.floor(sub.durationH)
          ? `${sub.durationH}h`
          : `${sub.durationH}h`;

    const onsetText =
      sub.onsetMin < 5
        ? "quelques secondes"
        : sub.onsetMin < 60
          ? `~${sub.onsetMin} min`
          : `~${sub.onsetMin / 60}h`;

    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        {/* Badge catégorie */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 999,
              background: `${color}18`,
              border: `1px solid ${color}44`,
              color,
              fontWeight: 600,
            }}
          >
            {cat?.emoji} {cat?.name}
          </span>
        </div>

        {/* Frise temporelle */}
        <Section title="Durée approximative des effets">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              fontSize: 11,
            }}
          >
            <span style={{ opacity: 0.55, whiteSpace: "nowrap" }}>Début {onsetText}</span>
            <div
              style={{
                flex: 1,
                height: 2,
                background: `linear-gradient(90deg, ${color}60, ${color}22)`,
                borderRadius: 999,
                margin: "0 8px",
              }}
            />
            <span style={{ fontWeight: 600, color, whiteSpace: "nowrap" }}>Effets {durationText}</span>
            <div
              style={{
                flex: 1,
                height: 2,
                background: `linear-gradient(90deg, ${color}22, rgba(255,255,255,0.08))`,
                borderRadius: 999,
                margin: "0 8px",
              }}
            />
            <span style={{ opacity: 0.40, whiteSpace: "nowrap" }}>Descente</span>
          </div>
          {sub.afterEffects && (
            <p style={{ margin: "8px 0 0", fontSize: 11, opacity: 0.45, fontStyle: "italic", lineHeight: 1.5 }}>
              {sub.afterEffects}
            </p>
          )}
        </Section>

        {/* Effets fréquents */}
        <Section title="Effets fréquents">
          <BulletList items={sub.effects} />
        </Section>

        {/* Points d'attention */}
        <Section title="Points d'attention 🌡️">
          <BulletList items={sub.attention} />
        </Section>

        {/* Mélanges */}
        <div
          style={{
            background: "rgba(255,149,0,0.08)",
            border: "1px solid rgba(255,149,0,0.22)",
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Attention aux mélanges ❗️
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {sub.melanges.map((m) => (
              <span
                key={m}
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(255,149,0,0.14)",
                  color: "#FF9500",
                  fontWeight: 500,
                }}
              >
                {m}
              </span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.75, lineHeight: 1.55 }}>
            {sub.melangesText}
          </p>
        </div>

        {/* AlertBanner */}
        <AlertBanner signs={sub.alertSigns} />
      </div>
    );
  }

  function renderConseils() {
    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        <p
          style={{
            fontSize: 13,
            opacity: 0.60,
            lineHeight: 1.65,
            margin: "0 0 20px",
          }}
        >
          En festival, l'euphorie, la musique et le manque de sommeil peuvent faire baisser la vigilance.
          Quelques repères simples pour passer un bon moment en prenant soin de soi et des autres.
        </p>

        {CONSEILS.map((c) => (
          <div
            key={c.title}
            style={{
              padding: "14px 16px",
              marginBottom: 10,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.title}</span>
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, opacity: 0.70, lineHeight: 1.8 }}>
              {c.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        ))}

        {/* Message aide */}
        <AlertBanner />
      </div>
    );
  }

  function renderSimulateur() {
    const selectStyle: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      borderRadius: 14,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      padding: "14px 16px",
      color: "white",
      outline: "none",
      fontFamily: "inherit",
      fontSize: 15,
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
    };

    return (
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}
      >
        <p style={{ fontSize: 13, opacity: 0.60, lineHeight: 1.65, margin: "0 0 24px" }}>
          Un repère sur le timing, basé sur des données générales.
          Chaque personne réagit différemment. Ce n'est pas un outil médical.
        </p>

        {/* Substance */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, opacity: 0.55, display: "block", marginBottom: 6 }}>
            Substance
          </label>
          <select
            value={simSubstanceId}
            onChange={(e) => setSimSubstanceId(e.target.value)}
            style={selectStyle}
          >
            <option value="" style={{ background: "#1a1a2e" }}>Choisir une substance…</option>
            {SUBSTANCES.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#1a1a2e" }}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Temps écoulé */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, opacity: 0.55, display: "block", marginBottom: 6 }}>
            Temps écoulé depuis la prise
          </label>
          <select
            value={simTimeValue}
            onChange={(e) => setSimTimeValue(e.target.value)}
            style={selectStyle}
          >
            <option value="" style={{ background: "#1a1a2e" }}>Choisir…</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={String(t.value)} style={{ background: "#1a1a2e" }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Résultat */}
        {simMessage && (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 20,
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.7, opacity: 0.90 }}>
              {simMessage}
            </p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.50, lineHeight: 1.5, fontStyle: "italic" }}>
              Boire de l'eau, faire une pause si besoin, écouter ton corps.
            </p>
          </div>
        )}

        {/* Footer fixe */}
        <div
          style={{
            background: "rgba(191,90,242,0.08)",
            border: "1px solid rgba(191,90,242,0.20)",
            borderRadius: 16,
            padding: "14px 16px",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600 }}>💟 Prends soin de toi.</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.65, lineHeight: 1.55 }}>
            Si tu veux te recentrer ou ralentir, les modules de respiration et de recentrage sont disponibles dans Santé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header fixe ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {headerTitle}
          </div>
          {headerSub && (
            <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>
              {headerSub}
            </div>
          )}
        </div>
        <button
          onClick={handleBack}
          style={{
            flexShrink: 0,
            marginLeft: 12,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {backLabel}
        </button>
      </div>

      {/* ── Corps ── */}
      {view === "hub"             && renderHub()}
      {view === "categories"      && renderCategories()}
      {view === "categoryDetail"  && renderCategoryDetail()}
      {view === "substances"      && renderSubstances()}
      {view === "substanceDetail" && renderSubstanceDetail()}
      {view === "conseils"        && renderConseils()}
      {view === "simulateur"      && renderSimulateur()}
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          opacity: 0.40,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul
      style={{
        margin: 0,
        padding: "0 0 0 16px",
        fontSize: 13,
        opacity: color ? 0.85 : 0.75,
        lineHeight: 1.8,
        color: color ?? "inherit",
      }}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
