import { useState, useMemo, useEffect, useCallback } from "react";

// ── Utilitaires couleur ───────────────────────────────────────────────────────

function parseColor(color: string): [number, number, number] {
  const v = color.trim();
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (![r, g, b].some(Number.isNaN)) return [r, g, b];
    }
  }
  const m = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  return [0, 255, 183];
}
function lighten(c: number, factor: number): number {
  return Math.min(255, Math.round(c + (255 - c) * factor));
}
function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DiversCard = { id: string; text: string; detail?: string; category: string };
type Mode = "tirage" | "parcourir";

// ── Catégories ────────────────────────────────────────────────────────────────

const CATS: Record<string, { emoji: string; label: string }> = {
  camping:      { emoji: "🎲", label: "Camping"      },
  rencontres:   { emoji: "🌍", label: "Rencontres"   },
  exploration:  { emoji: "🔍", label: "Exploration"  },
  connexion:    { emoji: "💛", label: "Connexion"    },
  absurde:      { emoji: "🎭", label: "Absurde"      },
  conversation: { emoji: "🧠", label: "Conversation" },
  sensoriels:   { emoji: "🌌", label: "Sensoriels"   },
  calme:        { emoji: "🌿", label: "Calme"        },
  defis:        { emoji: "🎯", label: "Défis"        },
};

// ── Cartes (153) ──────────────────────────────────────────────────────────────

const DIVERS_CARDS: DiversCard[] = [
  // ── CAMPING (15) ──────────────────────────────────────────────────────────
  { id: "c01", category: "camping", text: "Deux vérités et un mensonge",
    detail: "Chacun raconte 2 vérités et 1 mensonge. Les autres devinent lequel." },
  { id: "c02", category: "camping", text: "Histoire collective",
    detail: "Chaque joueur ajoute une phrase à l'histoire. On voit où ça part !" },
  { id: "c03", category: "camping", text: "Blind test musical",
    detail: "Chacun met un morceau à deviner. Un point par bonne réponse." },
  { id: "c04", category: "camping", text: "La meilleure anecdote de festival",
    detail: "Chacun raconte la meilleure. Vote du groupe pour choisir la gagnante." },
  { id: "c05", category: "camping", text: "Le moment le plus drôle de la journée",
    detail: "Chacun raconte son anecdote comique préférée du jour." },
  { id: "c06", category: "camping", text: "L'objet de ton sac",
    detail: "Sors un objet de ton sac et raconte son histoire ou pourquoi tu l'as." },
  { id: "c07", category: "camping", text: "Jeu des surnoms",
    detail: "Invente un surnom festival pour chaque membre du groupe. Justifie-le." },
  { id: "c08", category: "camping", text: "Photo challenge",
    detail: "Trouver : la personne la plus stylée, la danse la plus drôle, le costume le plus fou." },
  { id: "c09", category: "camping", text: "Le mot du jour",
    detail: "Chacun décrit toute la journée en un seul mot. Comparez et discutez." },
  { id: "c10", category: "camping", text: "Le souvenir futur",
    detail: "Quel moment de ce festival raconteras-tu dans 10 ans ?" },
  { id: "c11", category: "camping", text: "Décrire ton alter ego festival",
    detail: "Qui es-tu dans ta version festival idéale ? Nom, style, vibe." },
  { id: "c12", category: "camping", text: "Imaginer une nouvelle règle du festival",
    detail: "Une règle absurde ou géniale que tous les festivals devraient avoir." },
  { id: "c13", category: "camping", text: "Inventer un film sur ce festival",
    detail: "Titre, genre, acteurs principaux, scène finale. Pitch en 60 secondes." },
  { id: "c14", category: "camping", text: "La question miroir",
    detail: "Qu'est-ce que ce festival révèle sur toi que tu n'avais pas vu avant ?" },
  { id: "c15", category: "camping", text: "La phrase finale",
    detail: "Chacun complète : « Ce festival me rappelle que… »" },

  // ── RENCONTRES (18) ───────────────────────────────────────────────────────
  { id: "r01", category: "rencontres", text: "Trouver quelqu'un qui vient d'un autre continent" },
  { id: "r02", category: "rencontres", text: "Trouver quelqu'un qui a fait Ozora plus de 5 fois" },
  { id: "r03", category: "rencontres", text: "Le jeu des pays",
    detail: "Trouver des gens venant de 5 pays différents. Notez-les et comparez à la fin." },
  { id: "r04", category: "rencontres", text: "Le jeu des langues",
    detail: "Apprendre « merci » dans 3 langues différentes auprès d'inconnus." },
  { id: "r05", category: "rencontres", text: "Apprendre le prénom de 5 inconnus",
    detail: "En bonne et due forme : prénom, pays, musique préférée ici." },
  { id: "r06", category: "rencontres", text: "Trouver quelqu'un qui voyage seul" },
  { id: "r07", category: "rencontres", text: "Trouver quelqu'un qui vit dans un van" },
  { id: "r08", category: "rencontres", text: "Trouver quelqu'un qui a changé de vie radicalement" },
  { id: "r09", category: "rencontres", text: "Trouver quelqu'un qui organise des festivals" },
  { id: "r10", category: "rencontres", text: "Trouver quelqu'un qui médite tous les jours" },
  { id: "r11", category: "rencontres", text: "Trouver quelqu'un qui danse tous les jours" },
  { id: "r12", category: "rencontres", text: "Trouver quelqu'un qui joue d'un instrument" },
  { id: "r13", category: "rencontres", text: "Trouver quelqu'un qui vient du même pays que toi" },
  { id: "r14", category: "rencontres", text: "Trouver quelqu'un qui a le même âge que toi" },
  { id: "r15", category: "rencontres", text: "Trouver quelqu'un qui vit dans un autre continent" },
  { id: "r16", category: "rencontres", text: "Apprendre un mot dans une langue que tu ne connais pas" },
  { id: "r17", category: "rencontres", text: "Trouver la personne avec le costume le plus lumineux" },
  { id: "r18", category: "rencontres", text: "Demander à quelqu'un son meilleur souvenir de festival" },

  // ── EXPLORATION (15) ──────────────────────────────────────────────────────
  { id: "e01", category: "exploration", text: "Le chemin aléatoire",
    detail: "À chaque intersection : pile → gauche, face → droite. Voir où ça mène." },
  { id: "e02", category: "exploration", text: "La scène inconnue",
    detail: "Aller voir une scène que personne du groupe ne connaît. Au moins 10 minutes." },
  { id: "e03", category: "exploration", text: "La sculpture cachée",
    detail: "Trouver une œuvre d'art que personne du groupe n'avait remarquée." },
  { id: "e04", category: "exploration", text: "La zone calme",
    detail: "Trouver l'endroit le plus calme et isolé du festival." },
  { id: "e05", category: "exploration", text: "La mission lever de soleil",
    detail: "Trouver le meilleur spot pour voir le lever de soleil avant qu'il arrive." },
  { id: "e06", category: "exploration", text: "Trouver un objet artistique caché" },
  { id: "e07", category: "exploration", text: "Trouver une décoration qui ressemble à un animal" },
  { id: "e08", category: "exploration", text: "Trouver un endroit où le son est étonnamment parfait" },
  { id: "e09", category: "exploration", text: "Trouver un stand de nourriture surprenant" },
  { id: "e10", category: "exploration", text: "Trouver un endroit pour observer le festival en hauteur" },
  { id: "e11", category: "exploration", text: "Trouver la constellation la plus visible cette nuit" },
  { id: "e12", category: "exploration", text: "Trouver la scène la plus magique la nuit" },
  { id: "e13", category: "exploration", text: "Trouver l'endroit le plus calme après minuit" },
  { id: "e14", category: "exploration", text: "Trouver un endroit qui représente la paix" },
  { id: "e15", category: "exploration", text: "Trouver une scène qui représente l'énergie pure" },

  // ── CONNEXION (15) ────────────────────────────────────────────────────────
  { id: "co01", category: "connexion", text: "La mission compliment",
    detail: "Complimenter sincèrement un inconnu. Sans rien attendre en retour." },
  { id: "co02", category: "connexion", text: "Le compliment profond",
    detail: "Dis à quelqu'un du groupe quelque chose que tu apprécies vraiment chez lui." },
  { id: "co03", category: "connexion", text: "La gratitude",
    detail: "Chacun complète : « Aujourd'hui je suis reconnaissant pour… »" },
  { id: "co04", category: "connexion", text: "Le défi sourire",
    detail: "Faire sourire 5 personnes différentes dans les prochaines 30 minutes." },
  { id: "co05", category: "connexion", text: "Le souvenir partagé",
    detail: "Demander à quelqu'un : quel est ton meilleur souvenir de festival ?" },
  { id: "co06", category: "connexion", text: "Dire un compliment sincère à quelqu'un du groupe" },
  { id: "co07", category: "connexion", text: "Demander à quelqu'un pourquoi il aime ce festival" },
  { id: "co08", category: "connexion", text: "Échanger une histoire personnelle avec un inconnu" },
  { id: "co09", category: "connexion", text: "Offrir un objet symbolique à quelqu'un",
    detail: "Quelque chose que tu as sur toi. Raconte ce que ça représente." },
  { id: "co10", category: "connexion", text: "Partager un souvenir d'enfance avec le groupe" },
  { id: "co11", category: "connexion", text: "Demander à quelqu'un son rêve actuel" },
  { id: "co12", category: "connexion", text: "Dire merci à quelqu'un qui t'a aidé aujourd'hui" },
  { id: "co13", category: "connexion", text: "Aider quelqu'un dans le festival" },
  { id: "co14", category: "connexion", text: "Qu'as-tu découvert chez quelqu'un aujourd'hui ?" },
  { id: "co15", category: "connexion", text: "Quelle rencontre t'a marqué aujourd'hui ?" },

  // ── ABSURDE (20) ──────────────────────────────────────────────────────────
  { id: "a01", category: "absurde", text: "Le DJ imaginaire",
    detail: "Inventer : un nom de DJ, un style musical, et la scène où il jouerait à Ozora." },
  { id: "a02", category: "absurde", text: "Le costume ultime",
    detail: "Décrire le costume le plus fou et impraticable possible pour ce festival." },
  { id: "a03", category: "absurde", text: "Le festival extraterrestre",
    detail: "Comment des aliens organiseraient-ils un festival ? Musique, nourriture, rituel…" },
  { id: "a04", category: "absurde", text: "La danse ridicule",
    detail: "Inventer une danse absurde et la nommer. Les autres doivent la reproduire." },
  { id: "a05", category: "absurde", text: "La théorie du festival",
    detail: "Inventer une théorie complotiste sur ce festival. La plus convaincante gagne." },
  { id: "a06", category: "absurde", text: "L'objet mystérieux",
    detail: "Trouver un objet étrange et inventer son histoire ou son usage secret." },
  { id: "a07", category: "absurde", text: "Inventer une nouvelle danse de festival",
    detail: "Lui donner un nom, des mouvements. Les autres la reproduisent." },
  { id: "a08", category: "absurde", text: "Imiter un DJ célèbre sans parler",
    detail: "Les autres devinent lequel. 30 secondes max." },
  { id: "a09", category: "absurde", text: "Faire deviner un style musical sans parler",
    detail: "Mimique, geste, expression uniquement." },
  { id: "a10", category: "absurde", text: "Parler pendant 1 minute avec un accent inventé",
    detail: "Un accent qui n'existe dans aucun pays connu." },
  { id: "a11", category: "absurde", text: "Inventer un slogan pour ce festival",
    detail: "Le plus absurde ou le plus poétique. Vote du groupe." },
  { id: "a12", category: "absurde", text: "Décrire le festival comme si tu étais un extraterrestre",
    detail: "Rapport à ton vaisseau mère sur ce rituel humain bizarre." },
  { id: "a13", category: "absurde", text: "Imaginer la météo la plus bizarre possible pour un festival",
    detail: "Pluie de confettis ? Soleil carré ? Vent à odeur de pizza ?" },
  { id: "a14", category: "absurde", text: "Inventer un objet totalement inutile pour le festival" },
  { id: "a15", category: "absurde", text: "Inventer un nouveau genre de musique",
    detail: "Nom + description + exemple sonore improvisé." },
  { id: "a16", category: "absurde", text: "Imaginer un festival sous l'eau",
    detail: "Comment se passe la musique, la danse, les tentes ?" },
  { id: "a17", category: "absurde", text: "Inventer une affiche de festival",
    detail: "Nom du festival, tête d'affiche, slogan. Pitcher à voix haute." },
  { id: "a18", category: "absurde", text: "Imaginer une sculpture géante au milieu du site",
    detail: "Quoi ? En quel matériau ? Quelle signification absurde ?" },
  { id: "a19", category: "absurde", text: "Improviser une publicité pour ce festival",
    detail: "30 secondes, style pub télé des années 90." },
  { id: "a20", category: "absurde", text: "Improviser une légende du festival",
    detail: "Quelle histoire mythique s'est passée ici il y a 1000 ans ?" },

  // ── CONVERSATION (20) ─────────────────────────────────────────────────────
  { id: "cv01", category: "conversation", text: "Le rêve d'enfant",
    detail: "Quel était ton rêve quand tu étais enfant ? Est-ce que tu l'as réalisé ?" },
  { id: "cv02", category: "conversation", text: "La société festival",
    detail: "Et si le monde entier fonctionnait comme un festival ?" },
  { id: "cv03", category: "conversation", text: "Le monde idéal",
    detail: "Comment serait une société idéale ? Chacun décrit une règle." },
  { id: "cv04", category: "conversation", text: "Le futur",
    detail: "Imaginez le monde dans 100 ans. Optimiste ou pessimiste ?" },
  { id: "cv05", category: "conversation", text: "Pourquoi les humains aiment-ils les festivals ?" },
  { id: "cv06", category: "conversation", text: "Pourquoi certains moments paraissent-ils magiques ?" },
  { id: "cv07", category: "conversation", text: "Quel est le festival qui t'a le plus marqué ?" },
  { id: "cv08", category: "conversation", text: "Quel est le pays le plus étonnant que tu as visité ?" },
  { id: "cv09", category: "conversation", text: "Quel est le moment le plus magique de ta vie ?" },
  { id: "cv10", category: "conversation", text: "Quelle musique te touche le plus profondément ?" },
  { id: "cv11", category: "conversation", text: "Quelle rencontre t'a le plus transformé ?" },
  { id: "cv12", category: "conversation", text: "Quel est le meilleur conseil que tu as reçu ?" },
  { id: "cv13", category: "conversation", text: "Quel rêve aimerais-tu réaliser dans 5 ans ?" },
  { id: "cv14", category: "conversation", text: "Quel endroit du monde veux-tu absolument voir ?" },
  { id: "cv15", category: "conversation", text: "Quel souvenir d'enfance te fait encore sourire ?" },
  { id: "cv16", category: "conversation", text: "Quelle musique te rend nostalgique ?" },
  { id: "cv17", category: "conversation", text: "Imaginer le festival dans 100 ans",
    detail: "Quels artistes, quelle technologie, quels rituels ?" },
  { id: "cv18", category: "conversation", text: "Raconter ton meilleur souvenir de voyage" },
  { id: "cv19", category: "conversation", text: "Quelle est ta définition personnelle de la liberté ?" },
  { id: "cv20", category: "conversation", text: "Qu'est-ce qui te fait sentir vivant ?" },

  // ── SENSORIELS (18) ───────────────────────────────────────────────────────
  { id: "s01", category: "sensoriels", text: "Les yeux fermés",
    detail: "Fermer les yeux pendant 2 minutes. Écouter uniquement. Qu'entends-tu ?" },
  { id: "s02", category: "sensoriels", text: "Les odeurs",
    detail: "Identifier 3 odeurs distinctes du festival. Chacun compare ses réponses." },
  { id: "s03", category: "sensoriels", text: "Les couleurs",
    detail: "Trouver : 5 objets rouges, 5 bleus, 5 verts. Chrono : 5 minutes." },
  { id: "s04", category: "sensoriels", text: "Les textures",
    detail: "Toucher 5 textures très différentes sans les regarder. Décrivez." },
  { id: "s05", category: "sensoriels", text: "Les sons",
    detail: "Identifier : musique, voix, nature, objets mécaniques. Comptez chaque catégorie." },
  { id: "s06", category: "sensoriels", text: "Observer les étoiles pendant 2 minutes de silence",
    detail: "Pas de téléphone. Juste les étoiles. Racontez ce que vous avez pensé." },
  { id: "s07", category: "sensoriels", text: "Décrire le ciel",
    detail: "Chaque personne décrit ce qu'elle voit exactement maintenant. Comparez." },
  { id: "s08", category: "sensoriels", text: "Identifier 5 sons différents dans le festival" },
  { id: "s09", category: "sensoriels", text: "Trouver une texture surprenante dans le festival" },
  { id: "s10", category: "sensoriels", text: "Observer les gens danser pendant 3 minutes",
    detail: "Sans juger. Qu'est-ce que ça inspire ?" },
  { id: "s11", category: "sensoriels", text: "Décrire la musique comme une couleur",
    detail: "Maintenant, ici. Quelle couleur est cette musique ? Pourquoi ?" },
  { id: "s12", category: "sensoriels", text: "Décrire la foule comme une vague",
    detail: "Où est-elle calme ? Où est-elle agitée ? Où est son cœur ?" },
  { id: "s13", category: "sensoriels", text: "Écouter le silence du festival",
    detail: "Trouver l'endroit le plus calme. 1 minute de silence complet." },
  { id: "s14", category: "sensoriels", text: "Décrire les lumières du festival",
    detail: "Comme un tableau. Quelles couleurs, quels contrastes, quelle ambiance ?" },
  { id: "s15", category: "sensoriels", text: "Écouter la musique les yeux fermés",
    detail: "3 minutes. Juste la musique. Qu'est-ce que tu vois dans ta tête ?" },
  { id: "s16", category: "sensoriels", text: "Observer les danseurs au ralenti",
    detail: "Imaginer un ralenti cinématographique. Décrire un danseur précisément." },
  { id: "s17", category: "sensoriels", text: "Trouver une lumière qui représente l'espoir" },
  { id: "s18", category: "sensoriels", text: "Trouver une musique qui représente ton humeur actuelle" },

  // ── CALME (20) ────────────────────────────────────────────────────────────
  { id: "cl01", category: "calme", text: "La musique intérieure",
    detail: "Quelle musique représente exactement ton humeur en ce moment ?" },
  { id: "cl02", category: "calme", text: "Qu'as-tu appris sur toi aujourd'hui ?" },
  { id: "cl03", category: "calme", text: "Quel moment t'a rendu heureux aujourd'hui ?" },
  { id: "cl04", category: "calme", text: "Qu'est-ce qui te surprend ici ?" },
  { id: "cl05", category: "calme", text: "Qu'est-ce que ce festival te rappelle ?" },
  { id: "cl06", category: "calme", text: "Quel moment restera gravé dans ta mémoire ?" },
  { id: "cl07", category: "calme", text: "Quel moment aimerais-tu revivre, juste une fois ?" },
  { id: "cl08", category: "calme", text: "Qu'est-ce que ce festival t'inspire ?" },
  { id: "cl09", category: "calme", text: "Décrire le festival en un seul mot" },
  { id: "cl10", category: "calme", text: "Décrire la musique en une phrase" },
  { id: "cl11", category: "calme", text: "Décrire la foule comme un animal",
    detail: "Quel animal ? Pourquoi ?" },
  { id: "cl12", category: "calme", text: "Décrire la musique comme un voyage",
    detail: "D'où part-elle ? Où amène-t-elle ?" },
  { id: "cl13", category: "calme", text: "Quel est ton moment préféré du festival jusqu'ici ?" },
  { id: "cl14", category: "calme", text: "Qu'est-ce que ce festival te rappelle sur la vie ?" },
  { id: "cl15", category: "calme", text: "Qu'est-ce que tu aimerais garder de cette semaine ?" },
  { id: "cl16", category: "calme", text: "Décrire le festival comme un rêve",
    detail: "Quel type de rêve ? Cohérent, surréaliste, récurrent ?" },
  { id: "cl17", category: "calme", text: "Trouver un objet qui représente ta journée" },
  { id: "cl18", category: "calme", text: "Trouver un moment qui représente la liberté" },
  { id: "cl19", category: "calme", text: "Trouver un instant qui représente la magie" },
  { id: "cl20", category: "calme", text: "Compléter : « Ce festival me rappelle que… »" },

  // ── DÉFIS (12) ────────────────────────────────────────────────────────────
  { id: "d01", category: "defis", text: "Le défi sourire",
    detail: "Faire sourire 5 personnes différentes dans les 30 prochaines minutes." },
  { id: "d02", category: "defis", text: "Faire rire quelqu'un en 30 secondes" },
  { id: "d03", category: "defis", text: "Apprendre une danse à quelqu'un",
    detail: "Un inconnu ou quelqu'un du groupe. Minimum 2 mouvements." },
  { id: "d04", category: "defis", text: "Trouver quelqu'un qui danse mieux que toi",
    detail: "Et apprendre un mouvement de lui." },
  { id: "d05", category: "defis", text: "Faire une photo de groupe avec des inconnus",
    detail: "Minimum 5 personnes dont au moins 3 que tu ne connaissais pas ce matin." },
  { id: "d06", category: "defis", text: "Créer une mini performance",
    detail: "Danse, musique ou théâtre. 60 secondes. Devant au moins une personne." },
  { id: "d07", category: "defis", text: "Apprendre une nouvelle danse",
    detail: "Trouver quelqu'un qui danse quelque chose de différent et apprendre." },
  { id: "d08", category: "defis", text: "Faire une photo artistique du festival",
    detail: "Pas un selfie. Un cadrage, une lumière, un moment inattendu." },
  { id: "d09", category: "defis", text: "Trouver une danse qui représente la joie pure" },
  { id: "d10", category: "defis", text: "Aider quelqu'un que tu ne connais pas" },
  { id: "d11", category: "defis", text: "Inventer un rituel de lever de soleil",
    detail: "Un geste, un mot, une posture. À répéter demain matin." },
  { id: "d12", category: "defis", text: "Improviser un guide touristique du festival",
    detail: "2 minutes. Présenter 3 « sites incontournables » avec enthousiasme absurde." },
];

// ── CSS animations ─────────────────────────────────────────────────────────────

const CSS = `
@keyframes diversFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes diversListFade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}
`;

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = { onBack: () => void; haloColor?: string };

// ── Composant ──────────────────────────────────────────────────────────────────

export function DiversScreen({ onBack, haloColor = "#00FFB7" }: Props) {
  // ── Halo colors ───────────────────────────────────────────────────────────
  const [r, g, b]   = parseColor(haloColor);
  const haloMain    = toHex(r, g, b);
  const haloLight   = toHex(lighten(r, 0.22), lighten(g, 0.22), lighten(b, 0.22));
  const haloGlow    = `rgba(${r},${g},${b},0.40)`;
  const haloGlowSft = `rgba(${r},${g},${b},0.22)`;

  // ── Favoris (localStorage) ────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem("remanence_divers_fav") ?? "[]"));
    } catch { return new Set(); }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem("remanence_divers_fav", JSON.stringify([...next])); } catch { /* ok */ }
      return next;
    });
  }, []);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("tirage");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  function toggleCategory(key: string) {
    setActiveCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  // ── Deck filtré ───────────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    let cards = DIVERS_CARDS;
    if (activeCategories.length > 0)
      cards = cards.filter(c => activeCategories.includes(c.category));
    if (favoritesOnly)
      cards = cards.filter(c => favorites.has(c.id));
    return cards;
  }, [activeCategories, favoritesOnly, favorites]);

  // ── Deck mélangé (Tirage) ─────────────────────────────────────────────────
  const [shuffledDeck, setShuffledDeck] = useState<DiversCard[]>(() => shuffle([...DIVERS_CARDS]));
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Re-shuffle quand les filtres changent
  useEffect(() => {
    setShuffledDeck(shuffle([...filteredCards]));
    setIndex(0);
    setAnimKey(k => k + 1);
  }, [filteredCards]);

  const card = shuffledDeck[index % Math.max(1, shuffledDeck.length)];
  const isFav = card ? favorites.has(card.id) : false;

  function handleNext() {
    setIndex(i => (i + 1) % Math.max(1, shuffledDeck.length));
    setAnimKey(k => k + 1);
  }

  // ── Mode Parcourir : carte sélectionnée ───────────────────────────────────
  const [selectedCard, setSelectedCard] = useState<DiversCard | null>(null);

  // ── Render ────────────────────────────────────────────────────────────────
  const catKeys = Object.keys(CATS);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>Divers 🎲</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
            {filteredCards.length} carte{filteredCards.length !== 1 ? "s" : ""}
            {activeCategories.length > 0 ? " · filtré" : " · toutes catégories"}
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
          Home ॐ
        </button>
      </div>

      {/* ── Mode switch ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        gap: 6,
        padding: "10px 16px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {(["tirage", "parcourir"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              background: mode === m ? "rgba(255,255,255,0.12)" : "transparent",
              border: `1px solid ${mode === m ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}`,
              color: mode === m ? "white" : "rgba(255,255,255,0.50)",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
          >
            {m === "tirage" ? "🎲 Tirage" : "📋 Parcourir"}
          </button>
        ))}
      </div>

      {/* ── Filtres catégories ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        gap: 7,
        padding: "8px 16px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {catKeys.map(key => {
          const cat = CATS[key];
          const active = activeCategories.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              style={{
                flexShrink: 0,
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 12,
                background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.09)"}`,
                color: active ? "white" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          );
        })}
        {favorites.size > 0 && (
          <button
            onClick={() => setFavoritesOnly(f => !f)}
            style={{
              flexShrink: 0,
              borderRadius: 999,
              padding: "5px 11px",
              fontSize: 12,
              background: favoritesOnly ? `rgba(${r},${g},${b},0.18)` : "rgba(255,255,255,0.05)",
              border: `1px solid ${favoritesOnly ? `rgba(${r},${g},${b},0.45)` : "rgba(255,255,255,0.09)"}`,
              color: favoritesOnly ? haloMain : "rgba(255,255,255,0.55)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: favoritesOnly ? 600 : 400,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            ❤️ Favoris ({favorites.size})
          </button>
        )}
      </div>

      {/* ── Corps selon mode ── */}
      {mode === "tirage" ? (
        /* ── MODE TIRAGE ── */
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "16px",
          gap: 16,
          overflow: "hidden",
        }}>
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.5, padding: 20 }}>
              Aucune carte dans cette sélection.
              {favoritesOnly && favorites.size === 0 && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  Marque des cartes ❤️ pour les retrouver ici.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Carte */}
              <div
                key={animKey}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 24,
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  animation: "diversFadeIn 0.30s cubic-bezier(0.22,1,0.36,1) both",
                  minHeight: 160,
                  justifyContent: "center",
                }}
              >
                {/* Badge catégorie + compteur */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{
                    fontSize: 12,
                    opacity: 0.55,
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}>
                    {card && CATS[card.category]
                      ? `${CATS[card.category].emoji} ${CATS[card.category].label.toUpperCase()}`
                      : ""}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.40 }}>
                    {(index % shuffledDeck.length) + 1} / {shuffledDeck.length}
                  </span>
                </div>

                {/* Texte principal */}
                <div style={{
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  letterSpacing: "0.01em",
                }}>
                  {card?.text ?? ""}
                </div>

                {/* Détail optionnel */}
                {card?.detail && (
                  <div style={{
                    fontSize: 14,
                    opacity: 0.60,
                    lineHeight: 1.5,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 12,
                  }}>
                    {card.detail}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div style={{ display: "flex", gap: 10 }}>
                {/* Coup de cœur */}
                <button
                  onClick={() => card && toggleFavorite(card.id)}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    padding: "16px 12px",
                    border: isFav ? "none" : "1px solid rgba(255,255,255,0.14)",
                    background: isFav
                      ? `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isFav ? `0 0 16px ${haloGlow}, 0 4px 16px ${haloGlowSft}` : "none",
                    color: isFav ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.70)",
                    fontSize: 15,
                    fontWeight: isFav ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.02em",
                    transition: "all 0.18s ease",
                  }}
                >
                  {isFav ? "❤️ Coup de cœur" : "🤍 Coup de cœur"}
                </button>

                {/* Suivante */}
                <button
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    padding: "16px 12px",
                    border: "none",
                    background: `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`,
                    boxShadow: `0 0 18px ${haloGlow}, 0 4px 20px ${haloGlowSft}`,
                    color: "rgba(0,0,0,0.85)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.03em",
                  }}
                >
                  Suivante →
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── MODE PARCOURIR ── */
        <div style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          animation: "diversListFade 0.25s ease both",
        }}>
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.5, padding: 32 }}>
              Aucune carte dans cette sélection.
            </div>
          ) : (
            filteredCards.map(c => {
              const cat = CATS[c.category];
              const fav = favorites.has(c.id);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedCard(c)}
                >
                  {/* Emoji catégorie */}
                  <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.80 }}>
                    {cat?.emoji ?? "🎲"}
                  </span>

                  {/* Texte */}
                  <div style={{
                    flex: 1,
                    fontSize: 14,
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {c.text}
                  </div>

                  {/* Bouton favori */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(c.id); }}
                    style={{
                      flexShrink: 0,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: "4px",
                      lineHeight: 1,
                    }}
                  >
                    {fav ? "❤️" : "🤍"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modal carte (mode Parcourir) ── */}
      {selectedCard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(18,12,40,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: "24px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              animation: "diversFadeIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {/* Badge catégorie */}
            <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.06em", fontWeight: 500 }}>
              {CATS[selectedCard.category]?.emoji} {CATS[selectedCard.category]?.label.toUpperCase()}
            </div>

            {/* Texte */}
            <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.35 }}>
              {selectedCard.text}
            </div>

            {/* Détail */}
            {selectedCard.detail && (
              <div style={{
                fontSize: 14,
                opacity: 0.62,
                lineHeight: 1.5,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 12,
              }}>
                {selectedCard.detail}
              </div>
            )}

            {/* Boutons */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => toggleFavorite(selectedCard.id)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "14px 12px",
                  border: favorites.has(selectedCard.id) ? "none" : "1px solid rgba(255,255,255,0.14)",
                  background: favorites.has(selectedCard.id)
                    ? `linear-gradient(135deg, ${haloMain} 0%, ${haloLight} 100%)`
                    : "rgba(255,255,255,0.06)",
                  boxShadow: favorites.has(selectedCard.id)
                    ? `0 0 16px ${haloGlow}, 0 4px 16px ${haloGlowSft}`
                    : "none",
                  color: favorites.has(selectedCard.id) ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.70)",
                  fontSize: 14,
                  fontWeight: favorites.has(selectedCard.id) ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {favorites.has(selectedCard.id) ? "❤️ Coup de cœur" : "🤍 Coup de cœur"}
              </button>

              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "14px 12px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.80)",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Fermer ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
