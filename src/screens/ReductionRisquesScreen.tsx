import { useState } from "react";
import { useTranslation } from "react-i18next";

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

// ── Simulateur — données ──────────────────────────────────────────────────────

const SIM_ONSET: Record<string, number> = {
  mdma: 45, lsd: 60, champignons: 45, dmt: 1, mescaline: 60,
  amphetamines: 30, cocaine: 5, ketamine: 5, alcool: 15,
  cannabis: 30, ghb: 15, benzos: 30, "3mmc": 30, poppers: 1,
};

const SIM_DURATION: Record<string, number> = {
  mdma: 4.5, lsd: 10, champignons: 5, dmt: 0.25, mescaline: 10,
  amphetamines: 6, cocaine: 0.75, ketamine: 1, alcool: 3,
  cannabis: 2, ghb: 3, benzos: 6, "3mmc": 3, poppers: 0.05,
};

const MOOD_OPTIONS: { id: string; emoji: string; label: string }[] = [
  { id: "ok",      emoji: "🙂", label: "ça va bien" },
  { id: "strange", emoji: "😐", label: "un peu étrange" },
  { id: "intense", emoji: "😵", label: "trop intense" },
  { id: "anxious", emoji: "😰", label: "anxieux" },
  { id: "hot",     emoji: "🥵", label: "chaud / fatigué" },
  { id: "tired",   emoji: "😴", label: "très fatigué" },
];

// ── Banques de messages (A=montée · B=ok · C=étrange · D=anxieux · E=chaleur · F=épuisé)

const BANK_A: readonly string[] = [
  "Les effets peuvent encore évoluer. Il peut être utile d'attendre avant de reprendre quoi que ce soit.",
  "Certaines substances mettent du temps à se stabiliser. Laisse ton corps suivre son rythme.",
  "Si les effets sont encore en train de monter, il est souvent préférable d'attendre avant toute décision.",
  "Prends quelques minutes pour ressentir ce qui se passe dans ton corps.",
  "Les sensations peuvent encore changer un peu. Laisse le temps faire son travail.",
  "Respire doucement et observe comment tu te sens.",
  "Les effets arrivent parfois progressivement.",
  "Un peu de patience peut éviter de prendre trop rapidement.",
  "Prendre le temps aide souvent à mieux vivre l'expérience.",
  "Attendre un moment permet souvent d'y voir plus clair.",
  "Chaque corps réagit différemment.",
  "Les effets peuvent se stabiliser avec un peu de temps.",
  "Écouter son corps reste le meilleur repère.",
  "Les sensations évoluent parfois lentement.",
  "Laisse le moment se poser tranquillement.",
  "Tu peux simplement observer ce qui se passe.",
  "Le temps est souvent un bon allié.",
  "Rien ne presse.",
  "Une pause peut aider à mieux ressentir.",
  "Reste attentif à ton rythme.",
  "Les effets peuvent continuer à évoluer un moment.",
  "Attendre évite souvent les surprises.",
  "Prends le temps de respirer.",
  "Observe tes sensations.",
  "Les choses se mettent souvent en place doucement.",
];

const BANK_B: readonly string[] = [
  "Si tout va bien, continue simplement d'écouter ton corps.",
  "Profite du moment en restant attentif à ton énergie.",
  "Pense à boire un peu d'eau de temps en temps.",
  "Faire des pauses aide à garder un bon équilibre.",
  "Prendre soin de soi permet de profiter plus longtemps.",
  "Respirer profondément peut faire du bien.",
  "Si tu te sens bien, continue à ton rythme.",
  "Garder un peu d'énergie pour la suite est souvent une bonne idée.",
  "Boire de l'eau et se reposer un peu peut aider.",
  "Un moment calme peut être agréable.",
  "Profite de la musique et de l'ambiance.",
  "Rester connecté à son corps est important.",
  "Les pauses font aussi partie du festival.",
  "Un peu d'eau peut toujours aider.",
  "Prendre le temps de respirer peut faire du bien.",
  "Profite de l'instant.",
  "Ton rythme est le bon.",
  "Rien ne presse.",
  "Reste à l'écoute de tes sensations.",
  "Un moment calme peut être agréable.",
  "Tu peux simplement profiter du moment.",
  "La musique continue.",
  "Ton corps sait souvent ce dont il a besoin.",
  "Respire tranquillement.",
  "Tout semble aller bien.",
];

const BANK_C: readonly string[] = [
  "Certaines sensations peuvent sembler inhabituelles.",
  "Le corps et l'esprit peuvent réagir différemment selon le contexte.",
  "Respirer lentement peut aider à se recentrer.",
  "Prends quelques minutes pour te poser.",
  "Boire un peu d'eau peut faire du bien.",
  "Trouver un endroit calme peut aider.",
  "Regarder autour de soi peut rassurer.",
  "Les sensations évoluent souvent avec le temps.",
  "Prendre une pause peut être utile.",
  "S'asseoir quelques minutes peut aider.",
  "Respirer profondément peut calmer le corps.",
  "Observer ses sensations sans les juger peut aider.",
  "Tout n'a pas besoin d'aller vite.",
  "Les sensations changent souvent.",
  "Laisse le moment passer.",
  "Tu peux te poser un instant.",
  "Les choses peuvent redevenir plus simples avec le temps.",
  "Une pause peut aider.",
  "Ralentir peut faire du bien.",
  "Respire doucement.",
  "Regarde la musique autour de toi.",
  "Prends le temps.",
  "Les sensations passent souvent.",
  "Tu peux te poser.",
  "Le moment va évoluer.",
];

const BANK_D: readonly string[] = [
  "L'anxiété peut apparaître quand les sensations sont nouvelles.",
  "Respire lentement et profondément.",
  "Tu peux prendre quelques minutes au calme.",
  "Les sensations passent avec le temps.",
  "Trouver un endroit calme peut aider.",
  "Regarder autour de soi peut rassurer.",
  "Parler à un ami peut faire du bien.",
  "Boire un peu d'eau peut aider.",
  "Tu peux simplement t'asseoir.",
  "Respire doucement.",
  "Les sensations vont évoluer.",
  "Tu n'es pas seul.",
  "Prends quelques minutes.",
  "La musique est là.",
  "Le moment va passer.",
  "Ton corps va retrouver son rythme.",
  "Prends le temps.",
  "Ralentir peut aider.",
  "Respirer profondément peut calmer.",
  "Un peu de repos peut faire du bien.",
  "Tu peux fermer les yeux quelques secondes.",
  "Les sensations passent.",
  "Tu es en sécurité.",
  "Prends soin de toi.",
  "Ce moment peut se calmer.",
];

const BANK_E: readonly string[] = [
  "La chaleur et la danse peuvent fatiguer le corps.",
  "Boire un peu d'eau peut aider.",
  "Prendre une pause peut faire du bien.",
  "Se mettre à l'ombre peut aider.",
  "Ton corps peut avoir besoin de ralentir.",
  "Faire une pause est parfois la meilleure chose.",
  "Respire tranquillement.",
  "S'asseoir quelques minutes peut aider.",
  "La fatigue peut amplifier les sensations.",
  "Prendre soin de soi aide à profiter du festival.",
  "Un peu de repos peut faire du bien.",
  "Boire de l'eau peut aider.",
  "Ton corps te parle.",
  "Écoute-le.",
  "Prends quelques minutes.",
  "La musique peut attendre.",
  "Ton bien-être est important.",
  "Se poser peut aider.",
  "Un peu d'ombre peut faire du bien.",
  "Respire doucement.",
  "Le corps peut récupérer rapidement.",
  "Un moment calme peut aider.",
  "Ralentir est parfois la bonne décision.",
  "Hydrate-toi.",
  "Prends soin de toi.",
];

const BANK_F: readonly string[] = [
  "La fatigue peut amplifier les sensations.",
  "Se reposer peut aider.",
  "Dormir un peu peut faire du bien.",
  "Boire de l'eau peut aider.",
  "Manger quelque chose peut aider.",
  "Le corps récupère avec le repos.",
  "Prendre une pause peut faire la différence.",
  "Ton corps a peut-être besoin de ralentir.",
  "Un moment calme peut aider.",
  "Respire tranquillement.",
  "S'allonger un moment peut aider.",
  "La fatigue passe avec le repos.",
  "Ton énergie reviendra.",
  "Prends soin de toi.",
  "Le repos est parfois la meilleure solution.",
  "Tu peux simplement te poser.",
  "Le festival continue demain.",
  "Un peu de sommeil peut aider.",
  "Ton corps peut récupérer.",
  "Prends quelques minutes.",
  "Un moment calme peut faire du bien.",
  "Ralentir peut aider.",
  "Respire doucement.",
  "Le repos aide souvent.",
  "Prends soin de toi.",
];

// ── Assemblage du message simulateur ──────────────────────────────────────────

type SimResult = {
  informatif: string;
  conseil: string;
  securite: string;
  rassurant: string;
};

function assembleSimMessage(substanceId: string, elapsedMin: number, mood: string): SimResult {
  const onset      = SIM_ONSET[substanceId] ?? 30;
  const durMin     = (SIM_DURATION[substanceId] ?? 3) * 60;

  // 1. Phase temporelle → message informatif
  type Phase = "before" | "rising" | "peak" | "declining" | "after";
  let phase: Phase;
  let informatif: string;

  if (elapsedMin < onset * 0.7) {
    phase      = "before";
    informatif = "Les effets n'ont probablement pas encore commencé. Prends le temps d'attendre avant de reprendre quoi que ce soit.";
  } else if (elapsedMin <= onset * 1.3) {
    phase      = "rising";
    informatif = "Tu es probablement dans la phase de montée. Les effets peuvent encore évoluer — attends de voir comment ton corps réagit.";
  } else if (elapsedMin <= durMin * 0.8) {
    phase      = "peak";
    informatif = "Tu es dans la période principale des effets. Écoute ton corps, hydrate-toi et prends des pauses.";
  } else if (elapsedMin <= durMin * 1.2) {
    phase      = "declining";
    informatif = "Les effets commencent probablement à diminuer. Le corps peut être plus fatigué qu'il n'y paraît.";
  } else {
    phase      = "after";
    informatif = "Les effets sont probablement passés. Le corps continue à récupérer — c'est normal de se sentir épuisé.";
  }

  // 2. Sélection de la banque selon humeur + phase
  const isMontee = phase === "before" || phase === "rising";
  let bank: readonly string[];
  if (isMontee && (mood === "ok" || mood === "")) {
    bank = BANK_A;
  } else if (mood === "ok" || mood === "") {
    bank = BANK_B;
  } else if (mood === "strange") {
    bank = isMontee ? [...BANK_A, ...BANK_C] : BANK_C;
  } else if (mood === "intense") {
    bank = BANK_C;
  } else if (mood === "anxious") {
    bank = BANK_D;
  } else if (mood === "hot") {
    bank = BANK_E;
  } else {
    bank = BANK_F; // tired
  }

  // Sélection déterministe (même entrée → même message)
  const seed   = substanceId.charCodeAt(0) * 7 + Math.floor(elapsedMin / 15);
  const conseil = bank[seed % bank.length];

  // 3. Rappel sécurité contextuel
  const securite =
    mood === "anxious" || mood === "intense"
      ? "Si les sensations sont difficiles, trouver un endroit calme et rester avec quelqu'un de confiance peut aider. Des équipes sont disponibles sans jugement."
      : mood === "hot" || mood === "tired"
      ? "La chaleur et la fatigue amplifient souvent les effets. Boire de l'eau, se mettre à l'ombre et faire une pause peut faire du bien."
      : isMontee
      ? "Attendre avant de reprendre quoi que ce soit est souvent la meilleure décision dans cette phase."
      : "Boire régulièrement de l'eau et faire des pauses aide à garder un bon équilibre.";

  // 4. Phrase rassurante selon humeur
  const RASSURANTS: Record<string, string> = {
    ok:      "Tout semble aller dans le bon sens. Continue d'écouter ton corps.",
    strange: "Les sensations évoluent. Tu peux simplement les observer sans t'y accrocher.",
    intense: "Ça peut passer. Tu n'es pas seul — les équipes du festival sont là.",
    anxious: "Tu es en sécurité. Prendre soin de toi est la bonne chose à faire.",
    hot:     "Ton corps va récupérer. Repose-toi et prends soin de toi.",
    tired:   "Le repos est la meilleure chose maintenant. Le festival continue demain.",
  };
  const rassurant = RASSURANTS[mood] ?? "Prends soin de toi.";

  return { informatif, conseil, securite, rassurant };
}

// ── Composants ────────────────────────────────────────────────────────────────

function AlertBanner({ signs }: { signs?: string[] }) {
  const { t } = useTranslation();
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
        {t("risques.alertBannerTitle")}
      </div>
      {signs && signs.length > 0 && (
        <ul style={{ margin: "0 0 8px 16px", padding: 0, fontSize: 12, opacity: 0.85, lineHeight: 1.7 }}>
          {signs.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      <div style={{ fontSize: 12, opacity: 0.70, lineHeight: 1.55, fontStyle: "italic" }}>
        {t("risques.alertBannerSub")}
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
  const { t } = useTranslation();
  const CATEGORIES = t('risques.categories', { returnObjects: true }) as Category[];
  const SUBSTANCES = t('risques.substances', { returnObjects: true }) as Substance[];
  const CONSEILS   = t('risques.conseils',   { returnObjects: true }) as Conseil[];
  const SIM_SUBSTANCES = t('risques.simSubstances', { returnObjects: true }) as { id: string; name: string; emoji: string }[];
  const TIME_OPTIONS   = t('risques.timeOptions',   { returnObjects: true }) as { label: string; value: number }[];
  const [view, setView] = useState<RisquesView>("hub");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [simSubstanceId, setSimSubstanceId] = useState<string>("");
  const [simTimeValue, setSimTimeValue]     = useState<string>("");
  const [simMoodId, setSimMoodId]           = useState<string>("");

  // ── Navigation interne ──────────────────────────────────────────────────────
  function handleBack() {
    if (view === "hub")             { onBack(); return; }
    if (view === "categoryDetail")  { setView("categories"); return; }
    if (view === "substanceDetail") { setView("substances"); return; }
    setView("hub");
  }

  // ── Header dynamique ────────────────────────────────────────────────────────
  const headerTitle =
    view === "hub"             ? `${t("risques.title")} ⛑️` :
    view === "categories"      ? t("risques.headerCategories") :
    view === "categoryDetail"  ? `${selectedCategory?.emoji} ${selectedCategory?.name}` :
    view === "substances"      ? t("risques.headerSubstances") :
    view === "substanceDetail" ? selectedSubstance?.name ?? "" :
    view === "conseils"        ? t("risques.headerConseils") :
                                 t("risques.headerSim");

  const headerSub =
    view === "hub"             ? t("risques.hubInfoBack") :
    view === "categories"      ? t("risques.headerSubCategories") :
    view === "substances"      ? t("risques.hubSubstancesCount", { count: SUBSTANCES.length }) :
    view === "conseils"        ? t("risques.hubConseilsSub2") :
    view === "simulateur"      ? t("risques.headerSubSim") :
    "";

  const backLabel =
    view === "hub"             ? t("risques.backSante") :
    view === "categoryDetail"  ? t("risques.backCategories") :
    view === "substanceDetail" ? t("risques.backSubstances") :
                                 t("risques.backHub");

  // ── Simulateur ──────────────────────────────────────────────────────────────
  const simResult: SimResult | null =
    simSubstanceId && simTimeValue && simMoodId
      ? assembleSimMessage(simSubstanceId, Number(simTimeValue), simMoodId)
      : null;

  // ── Rendu des vues ──────────────────────────────────────────────────────────

  function renderHub() {
    const hubCards = [
      { key: "categories", emoji: "🗂️", title: t("risques.hubCategories"),  desc: t("risques.hubCategoriesSub") },
      { key: "substances",  emoji: "💊", title: t("risques.hubSubstances"),  desc: t("risques.hubSubstancesSub") },
      { key: "conseils",    emoji: "🏕️", title: t("risques.hubConseils"),    desc: t("risques.hubConseilsSub") },
      { key: "simulateur",  emoji: "⏱️", title: t("risques.hubSimulateur"),  desc: t("risques.hubSimulateurSub") },
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
        <Section title={t("risques.sectionExamples")}>
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
          <Section title={t("risques.sectionEffects")}>
            <BulletList items={cat.effects} />
          </Section>
        )}

        {/* Risques fréquents */}
        <Section title={t("risques.sectionRisks")}>
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
                  ? `${Math.round(sub.durationH * 60)} ${t("risques.min")}`
                  : `~${sub.durationH}${t("risques.hours")}`}
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
          ? `${sub.durationH}${t("risques.hours")}`
          : `${sub.durationH}${t("risques.hours")}`;

    const onsetText =
      sub.onsetMin < 5
        ? "quelques secondes"
        : sub.onsetMin < 60
          ? `~${sub.onsetMin} ${t("risques.min")}`
          : `~${sub.onsetMin / 60}${t("risques.hours")}`;

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
        <Section title={t("risques.sectionDuration")}>
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
        <Section title={t("risques.sectionEffects")}>
          <BulletList items={sub.effects} />
        </Section>

        {/* Points d'attention */}
        <Section title={t("risques.sectionAttention")}>
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
            {t("risques.sectionMixing")}
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
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 48px" }}>
        <p style={{ fontSize: 13, opacity: 0.60, lineHeight: 1.65, margin: "0 0 24px" }}>
          Un repère sur le timing, basé sur des données générales.
          Chaque personne réagit différemment. Ce n'est pas un outil médical.
        </p>

        {/* Champ 1 — Substance */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, opacity: 0.55, display: "block", marginBottom: 6 }}>
            {t("risques.simSubstance")}
          </label>
          <select
            value={simSubstanceId}
            onChange={(e) => { setSimSubstanceId(e.target.value); setSimMoodId(""); }}
            style={selectStyle}
          >
            <option value="" style={{ background: "#1a1a2e" }}>{t("risques.simSubstancePlaceholder")}</option>
            {SIM_SUBSTANCES.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#1a1a2e" }}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Champ 2 — Temps écoulé */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, opacity: 0.55, display: "block", marginBottom: 6 }}>
            {t("risques.simTime")}
          </label>
          <select
            value={simTimeValue}
            onChange={(e) => { setSimTimeValue(e.target.value); setSimMoodId(""); }}
            style={selectStyle}
          >
            <option value="" style={{ background: "#1a1a2e" }}>{t("risques.simTimePlaceholder")}</option>
            {TIME_OPTIONS.map((t_opt) => (
              <option key={t_opt.value} value={String(t_opt.value)} style={{ background: "#1a1a2e" }}>
                {t_opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Champ 3 — Comment tu te sens (visible après les 2 premiers) */}
        {simSubstanceId && simTimeValue && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, opacity: 0.55, display: "block", marginBottom: 10 }}>
              {t("risques.simMood")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSimMoodId(simMoodId === m.id ? "" : m.id)}
                  style={{
                    borderRadius: 14,
                    padding: "10px 6px",
                    background: simMoodId === m.id
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(255,255,255,0.05)",
                    border: simMoodId === m.id
                      ? "1px solid rgba(255,255,255,0.35)"
                      : "1px solid rgba(255,255,255,0.10)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  <span style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.3 }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Résultat — 4 parties */}
        {simResult && (
          <div style={{ marginBottom: 16 }}>
            {/* 1 — Situation probable */}
            <div style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, opacity: 0.40, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>
                {t("risques.simLabelSituation")}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>{simResult.informatif}</p>
            </div>

            {/* 2 — Conseil */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, opacity: 0.40, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>
                {t("risques.simLabelConseil")}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>{simResult.conseil}</p>
            </div>

            {/* 3 — Rappel sécurité */}
            <div style={{
              background: "rgba(255,149,0,0.06)",
              border: "1px solid rgba(255,149,0,0.18)",
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, opacity: 0.40, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>
                {t("risques.simLabelSecurite")}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{simResult.securite}</p>
            </div>

            {/* 4 — Phrase rassurante */}
            <div style={{
              background: "rgba(191,90,242,0.06)",
              border: "1px solid rgba(191,90,242,0.18)",
              borderRadius: 16,
              padding: "14px 16px",
            }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, fontStyle: "italic" }}>
                💟 {simResult.rassurant}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: "rgba(191,90,242,0.08)",
          border: "1px solid rgba(191,90,242,0.20)",
          borderRadius: 16,
          padding: "14px 16px",
        }}>
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
