import { useState, useMemo } from "react";

// ── Palette ────────────────────────────────────────────────────────────────────

const VIOLET        = "#BF5AF2";
const VIOLET_GLOW   = "rgba(191, 90, 242, 0.16)";
const GREEN_CORRECT = "#34C759";
const RED_WRONG     = "#FF3B30";

// ── CSS ────────────────────────────────────────────────────────────────────────

const CSS = `
@keyframes anecdotesReveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes anecdotesCorrect {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.025); }
  100% { transform: scale(1); }
}
@keyframes anecdotesPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(191,90,242,0); }
  50%     { box-shadow: 0 0 22px 6px rgba(191,90,242,0.38); }
}
@keyframes anecdotesFade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ── Données ───────────────────────────────────────────────────────────────────

type AnecdoteCard = { a: string; b: string; ctx: string };

const ANECDOTES: AnecdoteCard[] = [
  { a: "Le premier Woodstock devait accueillir 50 000 personnes mais près de 400 000 sont venues.", b: "Le premier Woodstock était limité à 60 000 personnes avec des billets nominatifs.", ctx: "Woodstock 1969 a été largement dépassé par son succès : environ 400 000 personnes sont venues alors que 50 000 étaient attendues." },
  { a: "Les organisateurs de Woodstock ont retiré les clôtures et rendu le festival gratuit.", b: "Les organisateurs de Woodstock ont annulé la moitié des concerts pour raisons de sécurité.", ctx: "Face à l'afflux massif, les barrières ont été abandonnées et l'événement est devenu gratuit." },
  { a: "Jimi Hendrix a joué l'hymne américain à la guitare au lever du soleil à Woodstock.", b: "Jimi Hendrix a refusé de jouer l'hymne américain pour protester contre la guerre.", ctx: "Sa version électrique de l'hymne américain est devenue l'un des moments les plus célèbres de l'histoire du rock." },
  { a: "Le premier Glastonbury coûtait 1 livre et incluait du lait gratuit.", b: "Le premier Glastonbury offrait de la soupe gratuite pour chaque billet acheté.", ctx: "L'édition de 1970 coûtait 1£ et les festivaliers recevaient du lait de la ferme locale." },
  { a: "La première Pyramid Stage de Glastonbury a été construite en s'inspirant des pyramides d'Égypte.", b: "La première Pyramid Stage était une réplique d'un temple maya.", ctx: "La célèbre scène pyramidale a été construite en 1971 et inspirée par la pyramide de Gizeh." },
  { a: "En 1995, Pulp a remplacé les Stone Roses au dernier moment à Glastonbury.", b: "En 1995, Oasis a remplacé Blur au dernier moment à Glastonbury.", ctx: "La performance improvisée de Pulp est devenue l'un des concerts les plus cultes du festival." },
  { a: "L'édition 1997 de Glastonbury est surnommée \"Year of the Mud\".", b: "L'édition 1997 est surnommée \"Year of the Storm\".", ctx: "Les pluies torrentielles ont transformé le site en immense champ de boue." },
  { a: "En 2000, Glastonbury a été envahi par des milliers de personnes sans billet.", b: "En 2000, Glastonbury a fermé ses portes pendant une journée entière.", ctx: "L'afflux de resquilleurs a poussé les organisateurs à renforcer la sécurité les années suivantes." },
  { a: "Burning Man a commencé sur une plage de San Francisco en 1986.", b: "Burning Man a commencé dans le désert du Nevada en 1978.", ctx: "La première effigie a été brûlée sur Baker Beach avant que le festival ne déménage dans le désert." },
  { a: "Burning Man possède une ville temporaire appelée Black Rock City.", b: "Burning Man se déplace dans un lieu différent chaque année.", ctx: "Chaque année une ville entière est construite puis démontée dans le désert du Nevada." },
  { a: "Le Temple de Burning Man est brûlé lors de la dernière nuit du festival.", b: "Le Temple de Burning Man reste intact après le festival.", ctx: "Le Temple est brûlé dans un moment de silence collectif très émotionnel." },
  { a: "Le festival Fyre devait être un événement de luxe aux Bahamas.", b: "Le festival Fyre était prévu dans un palace à Miami.", ctx: "Promu par des influenceurs, Fyre Festival est devenu célèbre pour son désastre logistique." },
  { a: "Les festivaliers de Fyre ont reçu des sandwichs au fromage dans des boîtes en polystyrène.", b: "Les festivaliers de Fyre ont reçu uniquement des fruits secs pendant deux jours.", ctx: "La photo d'un sandwich au fromage basique est devenue virale." },
  { a: "Billy McFarland, fondateur du Fyre Festival, a été condamné à de la prison.", b: "Billy McFarland a simplement payé une amende administrative.", ctx: "Il a été condamné à six ans de prison pour fraude." },
  { a: "Boom Festival au Portugal se déroule près d'un lac artificiel.", b: "Boom Festival se déroule dans un ancien volcan.", ctx: "Le festival psytrance se tient près du lac d'Idanha-a-Nova." },
  { a: "Boom Festival est reconnu pour son engagement écologique.", b: "Boom Festival fonctionne uniquement avec des générateurs diesel.", ctx: "Le festival a reçu plusieurs prix pour ses initiatives environnementales." },
  { a: "Ozora Festival se tient sur une ancienne ferme en Hongrie.", b: "Ozora Festival se tient dans une mine abandonnée.", ctx: "Le festival psytrance se déroule dans une vallée agricole." },
  { a: "Ozora possède un immense dragon gonflable au-dessus de la scène principale.", b: "Ozora utilise un ballon dirigeable lumineux comme scène principale.", ctx: "La décoration psychédélique du festival est célèbre." },
  { a: "Mo:Dem Festival en Croatie se déroule dans une forêt isolée.", b: "Mo:Dem Festival se déroule sur une plage méditerranéenne.", ctx: "Le festival est connu pour son ambiance sombre et immersive en pleine nature." },
  { a: "Masters of Puppets est un festival psytrance qui se tient souvent dans des lieux souterrains ou industriels.", b: "Masters of Puppets se déroule uniquement dans des théâtres historiques.", ctx: "Le festival est célèbre pour ses décors dark psy et ses lieux atypiques." },
  { a: "Hadra Festival est l'un des plus anciens festivals psytrance en France.", b: "Hadra Festival a été créé en 2015.", ctx: "L'association Hadra organise des événements psytrance depuis plus de vingt ans." },
  { a: "Shankra Festival en Suisse se déroule dans les Alpes.", b: "Shankra Festival se déroule dans un désert salé.", ctx: "Le festival est connu pour son décor montagneux spectaculaire." },
  { a: "Tomorrowland vend ses billets en quelques minutes chaque année.", b: "Tomorrowland vend ses billets uniquement sur place.", ctx: "Les ventes en ligne partent généralement en quelques minutes." },
  { a: "Tomorrowland attire des festivaliers de plus de 200 nationalités.", b: "Tomorrowland limite ses billets à l'Europe.", ctx: "Le festival est devenu un événement électronique mondial." },
  { a: "DreamVille est le gigantesque camping de Tomorrowland.", b: "DreamVille est une scène secondaire du festival.", ctx: "Des dizaines de milliers de personnes y campent chaque année." },
  { a: "Coachella a popularisé les réunions de groupes mythiques.", b: "Coachella interdit les reformations de groupes.", ctx: "De nombreux groupes célèbres s'y sont reformés." },
  { a: "Daft Punk a marqué Coachella 2006 avec sa pyramide lumineuse.", b: "Daft Punk a refusé de jouer à Coachella.", ctx: "Ce concert est considéré comme un moment historique de la musique électronique." },
  { a: "En 2012, Tupac est apparu en hologramme à Coachella.", b: "En 2012, Tupac est apparu sur scène en vidéo géante.", ctx: "La performance holographique avec Snoop Dogg a marqué l'histoire." },
  { a: "Roskilde Festival reverse ses bénéfices à des œuvres caritatives.", b: "Roskilde appartient à une entreprise privée.", ctx: "Le festival est organisé par une fondation à but non lucratif." },
  { a: "Roskilde a connu une tragédie lors d'un concert de Pearl Jam en 2000.", b: "Roskilde a connu une panne électrique générale en 2000.", ctx: "Une bousculade dans la foule a causé la mort de neuf personnes." },
  { a: "Le festival de Cannes a été interrompu en 1968 par les protestations étudiantes.", b: "Le festival de Cannes a été déplacé à Paris en 1968.", ctx: "Plusieurs réalisateurs ont arrêté le festival en solidarité avec les manifestations." },
  { a: "Le festival Burning Man interdit toute publicité commerciale sur le site.", b: "Burning Man autorise les sponsors sur les scènes principales.", ctx: "Le festival repose sur un principe de décommercialisation." },
  { a: "Le festival Boom possède une scène appelée Dance Temple.", b: "Boom possède une scène appelée Techno Cathedral.", ctx: "Le Dance Temple est la scène principale psytrance du festival." },
  { a: "Ozora possède une gigantesque sculpture appelée Dragon Nest.", b: "Ozora possède une réplique de Stonehenge.", ctx: "Les installations artistiques psychédéliques sont emblématiques du festival." },
  { a: "Le festival Hadra a dû déménager plusieurs fois à cause de contraintes administratives.", b: "Le festival Hadra se déroule au même endroit depuis sa création.", ctx: "Comme beaucoup de festivals alternatifs, il a changé de site plusieurs fois." },
  { a: "Le festival Shankra est réputé pour ses décors lumineux dans les montagnes.", b: "Shankra est réputé pour ses concerts acoustiques.", ctx: "Les décorations psychédéliques sont une signature du festival." },
  { a: "Burning Man impose aux participants de ne laisser aucune trace derrière eux.", b: "Burning Man nettoie le site avec des machines industrielles après le festival.", ctx: "Le principe \"Leave No Trace\" est fondamental dans la culture du festival." },
  { a: "Le festival Boom interdit les bouteilles en plastique jetables.", b: "Boom distribue des bouteilles en plastique à l'entrée.", ctx: "Les initiatives écologiques sont une priorité." },
  { a: "Woodstock a été déclaré zone sinistrée par le gouverneur de New York.", b: "Woodstock a été évacué par l'armée.", ctx: "L'afflux massif de personnes et les problèmes logistiques ont conduit à cette décision." },
  { a: "Le festival Burning Man possède un service postal interne.", b: "Burning Man utilise uniquement des drones pour livrer les messages.", ctx: "Un vrai bureau postal temporaire fonctionne sur le site." },
  { a: "Burning Man possède un aéroport temporaire dans le désert.", b: "Burning Man interdit tout avion sur le site.", ctx: "Un véritable petit aéroport appelé Black Rock City Airport est installé pendant le festival." },
  { a: "Le festival Boom fonctionne en grande partie à l'énergie solaire.", b: "Le festival Boom fonctionne uniquement avec des générateurs à essence.", ctx: "Boom Festival est connu pour ses installations solaires et ses infrastructures écologiques." },
  { a: "Le festival Ozora possède une scène appelée The Dome.", b: "Le festival Ozora possède une scène appelée The Volcano.", ctx: "The Dome est l'une des scènes les plus connues du festival." },
  { a: "Mo:Dem Festival est réputé pour ses décorations inspirées de l'univers sombre et cyberpunk.", b: "Mo:Dem Festival est réputé pour ses décors médiévaux.", ctx: "L'esthétique du festival est volontairement sombre et immersive." },
  { a: "Tomorrowland construit chaque année une scène principale entièrement différente.", b: "Tomorrowland utilise la même scène principale depuis sa création.", ctx: "La scénographie spectaculaire de Tomorrowland change chaque année." },
  { a: "Tomorrowland possède une radio officielle pendant le festival.", b: "Tomorrowland interdit toute retransmission audio du festival.", ctx: "One World Radio diffuse les sets et l'actualité du festival." },
  { a: "Burning Man accueille parfois plus de 70 000 personnes.", b: "Burning Man est limité à 10 000 personnes.", ctx: "La ville temporaire peut atteindre environ 70 000 habitants." },
  { a: "Le festival Boom n'a lieu que tous les deux ans.", b: "Le festival Boom se déroule chaque mois d'août.", ctx: "Boom est un festival biennal." },
  { a: "Ozora Festival est né après l'annulation d'un autre festival psytrance appelé Solipse.", b: "Ozora Festival est né comme extension de Tomorrowland.", ctx: "Ozora s'est développé après l'annulation du festival Solipse." },
  { a: "Burning Man possède une flotte de véhicules artistiques appelés \"mutant vehicles\".", b: "Burning Man interdit tout véhicule motorisé sur le site.", ctx: "Les mutant vehicles sont des œuvres roulantes souvent spectaculaires." },
  { a: "Woodstock a provoqué un gigantesque embouteillage sur des dizaines de kilomètres.", b: "Woodstock s'est déroulé sans aucun problème de circulation.", ctx: "Les routes menant au festival ont été bloquées pendant des heures." },
  { a: "Le festival Roskilde possède une tradition appelée \"Orange Stage\".", b: "Roskilde possède une scène appelée Blue Pyramid.", ctx: "L'Orange Stage est la scène emblématique du festival." },
  { a: "Boom Festival possède un espace dédié aux conférences appelé Liminal Village.", b: "Boom Festival possède un espace appelé Digital Arena.", ctx: "Liminal Village accueille conférences et débats." },
  { a: "Burning Man possède une université improvisée appelée Black Rock University.", b: "Burning Man possède une école officielle accréditée.", ctx: "Des ateliers et conférences sont organisés par les participants." },
  { a: "Ozora organise souvent une cérémonie d'ouverture collective.", b: "Ozora commence sans aucune cérémonie.", ctx: "Les festivals psytrance incluent souvent des rituels d'ouverture." },
  { a: "Mo:Dem Festival est souvent considéré comme un festival dark psytrance.", b: "Mo:Dem est principalement un festival de house music.", ctx: "Il est spécialisé dans la scène psytrance sombre." },
  { a: "Le festival Hadra propose des ateliers et conférences en plus de la musique.", b: "Le festival Hadra ne propose que des concerts.", ctx: "L'événement inclut une programmation culturelle." },
  { a: "Shankra Festival possède une vue sur les Alpes suisses.", b: "Shankra Festival se déroule en bord de mer.", ctx: "Le décor alpin est une caractéristique du festival." },
  { a: "Tomorrowland a organisé une édition virtuelle pendant la pandémie.", b: "Tomorrowland a suspendu toute activité pendant la pandémie.", ctx: "Tomorrowland Around the World a été organisé en ligne." },
  { a: "Burning Man interdit la vente d'objets sur le site.", b: "Burning Man possède un grand marché central.", ctx: "L'économie repose sur le don plutôt que la vente." },
  { a: "Le festival Boom possède un système de toilettes écologiques.", b: "Boom utilise uniquement des toilettes chimiques classiques.", ctx: "Le festival a développé des toilettes à compost." },
  { a: "Ozora Festival possède une immense roue panoramique.", b: "Ozora Festival possède un monorail.", ctx: "La grande roue est visible depuis le site." },
  { a: "Burning Man construit une immense effigie appelée \"The Man\".", b: "Burning Man construit chaque année une statue d'animal.", ctx: "L'effigie centrale est brûlée lors du festival." },
  { a: "Boom Festival possède un lac où les festivaliers peuvent se baigner.", b: "Boom Festival interdit toute baignade.", ctx: "Le lac fait partie de l'expérience du festival." },
  { a: "Tomorrowland possède un thème narratif différent chaque année.", b: "Tomorrowland n'utilise jamais de thème.", ctx: "Chaque édition raconte une histoire différente." },
  { a: "Burning Man possède un temple reconstruit chaque année.", b: "Burning Man utilise le même temple depuis 20 ans.", ctx: "Le temple est reconstruit chaque année par des artistes." },
  { a: "Woodstock s'est déroulé dans une ferme à Bethel.", b: "Woodstock s'est déroulé dans un parc national.", ctx: "Le festival a eu lieu sur la ferme de Max Yasgur." },
  { a: "Tomorrowland possède une bibliothèque appelée Tomorrowland Library.", b: "Tomorrowland possède une université permanente.", ctx: "La Library est une scène emblématique." },
  { a: "Burning Man possède un service médical géré par des volontaires.", b: "Burning Man n'a aucun service médical.", ctx: "Plusieurs structures médicales sont présentes." },
  { a: "Boom Festival encourage les installations artistiques participatives.", b: "Boom Festival interdit les installations d'art.", ctx: "L'art est au cœur du festival." },
  { a: "Ozora possède un espace appelé Dragon Nest.", b: "Ozora possède un espace appelé Pyramid Hall.", ctx: "Dragon Nest est une zone artistique célèbre." },
  { a: "Mo:Dem possède un dancefloor appelé Hive.", b: "Mo:Dem possède un dancefloor appelé Pyramid.", ctx: "The Hive est la scène principale." },
  { a: "Burning Man possède un réseau de rues circulaires.", b: "Burning Man possède un plan aléatoire chaque année.", ctx: "Black Rock City est organisée en demi-cercle." },
  { a: "Tomorrowland possède une scène appelée CORE dans une forêt.", b: "Tomorrowland possède une scène appelée Desert Dome.", ctx: "CORE est une scène immersive au milieu des arbres." },
  { a: "Burning Man demande aux participants d'apporter leur propre eau.", b: "Burning Man distribue de l'eau gratuitement à tous les participants.", ctx: "Les participants doivent être autonomes." },
  { a: "Boom Festival propose des espaces de méditation.", b: "Boom Festival interdit toute activité non musicale.", ctx: "Spiritualité et bien-être font partie du festival." },
  { a: "Ozora possède un espace de yoga.", b: "Ozora interdit les activités de bien-être.", ctx: "Les festivals psytrance incluent souvent ces pratiques." },
  { a: "Burning Man possède un département dédié à l'art.", b: "Burning Man n'accepte aucune œuvre d'art.", ctx: "Le festival finance certaines installations artistiques." },
  { a: "Tomorrowland possède un restaurant gastronomique pendant le festival.", b: "Tomorrowland interdit toute restauration sur place.", ctx: "Plusieurs restaurants éphémères sont installés." },
  { a: "Burning Man possède un journal officiel appelé Black Rock Gazette.", b: "Burning Man n'a aucun média interne.", ctx: "Le journal est distribué pendant le festival." },
  { a: "Woodstock a été filmé pour un documentaire oscarisé.", b: "Woodstock n'a jamais été filmé.", ctx: "Le film Woodstock a remporté l'Oscar du meilleur documentaire." },
  { a: "Tomorrowland utilise des feux d'artifice spectaculaires chaque nuit.", b: "Tomorrowland interdit les feux d'artifice.", ctx: "Les shows nocturnes sont célèbres." },
  { a: "Burning Man possède des œuvres d'art géantes visibles à des kilomètres.", b: "Burning Man n'autorise que des œuvres de petite taille.", ctx: "Certaines installations dépassent 20 mètres." },
  { a: "Boom Festival organise des projections de films.", b: "Boom Festival interdit toute projection vidéo.", ctx: "Le festival propose une programmation culturelle." },
  { a: "Ozora possède une immense sculpture de dragon.", b: "Ozora possède une réplique de la tour Eiffel.", ctx: "Les sculptures psychédéliques font partie du décor." },
  { a: "Mo:Dem Festival attire des fans de psytrance du monde entier.", b: "Mo:Dem Festival est réservé aux artistes.", ctx: "Le festival est international." },
  { a: "Hadra Festival accueille aussi des artistes visuels.", b: "Hadra Festival est uniquement musical.", ctx: "Les arts visuels sont importants dans la culture psytrance." },
  { a: "Shankra Festival propose des workshops spirituels.", b: "Shankra Festival interdit toute activité non musicale.", ctx: "Les festivals psytrance mêlent souvent musique et développement personnel." },
  { a: "Burning Man possède une poste appelée Black Rock Post Office.", b: "Burning Man interdit l'envoi de courrier.", ctx: "Les participants peuvent envoyer des cartes postales." },
  { a: "Tomorrowland possède un livre officiel retraçant son univers.", b: "Tomorrowland n'a jamais publié de livre.", ctx: "Plusieurs livres racontent l'histoire du festival." },
  { a: "Burning Man encourage les costumes extravagants.", b: "Burning Man impose un dress code uniforme.", ctx: "L'expression personnelle est encouragée." },
  { a: "Boom Festival possède un jardin botanique expérimental.", b: "Boom Festival n'a aucune zone végétale.", ctx: "Le festival met en avant l'écologie et la biodiversité." },
  { a: "Ozora possède un marché artisanal.", b: "Ozora interdit toute vente artisanale.", ctx: "Des stands d'artisans sont présents." },
  { a: "Burning Man organise une parade appelée \"Burn Night\".", b: "Burning Man interdit les rassemblements collectifs.", ctx: "La nuit où le Man brûle est un moment central." },
  { a: "Tomorrowland possède un hôtel éphémère.", b: "Tomorrowland interdit toute forme d'hébergement.", ctx: "Des packages incluant hôtel sont proposés." },
  { a: "Burning Man possède un centre de recyclage temporaire.", b: "Burning Man brûle tous les déchets sur place.", ctx: "Le tri des déchets est très encadré." },
  { a: "Boom Festival possède un espace appelé Sacred Fire.", b: "Boom Festival possède un espace appelé Digital Dome.", ctx: "Sacred Fire est dédié aux discussions et conférences." },
  { a: "Ozora possède un théâtre de feu.", b: "Ozora possède un aquarium géant.", ctx: "Les spectacles de feu sont fréquents." },
  { a: "Burning Man possède une équipe appelée Rangers pour gérer les conflits.", b: "Burning Man utilise uniquement la police locale.", ctx: "Les Rangers sont des volontaires qui aident à gérer les situations." },
  { a: "Woodstock est souvent considéré comme l'un des festivals les plus mythiques de l'histoire.", b: "Woodstock a été oublié après sa première édition.", ctx: "Woodstock est devenu un symbole culturel majeur des années 60." },
  { a: "Le festival Boom possède une immense sculpture appelée \"Tree of Life\".", b: "Boom possède une sculpture appelée \"Golden Pyramid\".", ctx: "Le Tree of Life est une installation artistique emblématique du festival." },
  { a: "Burning Man possède un service de réparation de vélos gratuit.", b: "Burning Man interdit l'utilisation de vélos.", ctx: "Les vélos sont le principal moyen de transport dans Black Rock City." },
  { a: "Tomorrowland possède un train spécial pour transporter les festivaliers depuis Bruxelles.", b: "Tomorrowland interdit l'accès en train.", ctx: "Des trains spéciaux sont organisés pour l'événement." },
  { a: "Ozora possède un espace appelé Pumpui dédié à la musique expérimentale.", b: "Ozora possède un espace appelé Cyber Cave.", ctx: "Pumpui est une scène alternative connue du festival." },
  { a: "Burning Man possède un département appelé Art Grants qui finance certaines œuvres.", b: "Burning Man interdit toute aide financière pour les artistes.", ctx: "Des subventions sont accordées à certains projets artistiques." },
  { a: "Woodstock a duré quatre jours à cause des retards.", b: "Woodstock a duré exactement deux jours.", ctx: "Le festival s'est étendu du 15 au 18 août 1969." },
  { a: "Boom Festival possède un système de recyclage avancé appelé Boom Eco Team.", b: "Boom Festival brûle les déchets sur place.", ctx: "La gestion écologique est un pilier du festival." },
  { a: "Burning Man possède une immense bibliothèque d'art appelée The Artery.", b: "Burning Man possède un musée permanent dans le désert.", ctx: "The Artery est le centre de coordination artistique." },
  { a: "Tomorrowland possède une scène flottante sur l'eau certaines années.", b: "Tomorrowland possède une scène sous-marine.", ctx: "Des scènes sont parfois installées sur le lac du festival." },
  { a: "Ozora organise un grand défilé artistique appelé Ozora Parade.", b: "Ozora organise un feu d'artifice obligatoire chaque soir.", ctx: "Les défilés artistiques sont fréquents dans les festivals psytrance." },
  { a: "Burning Man possède une gigantesque horloge appelée Clockwork.", b: "Burning Man possède une horloge solaire géante visible depuis l'espace.", ctx: "Certaines installations artistiques incluent des structures mécaniques monumentales." },
  { a: "Boom Festival encourage les participants à créer des œuvres d'art collaboratives.", b: "Boom Festival interdit toute création artistique spontanée.", ctx: "L'art participatif est une tradition du festival." },
  { a: "Ozora possède une installation appelée Dragon Bridge.", b: "Ozora possède une installation appelée Cyber Bridge.", ctx: "Les ponts décorés font partie du décor du site." },
  { a: "Burning Man possède un système de rues nommées par lettres et heures.", b: "Burning Man possède des rues nommées par animaux.", ctx: "Les rues de Black Rock City sont organisées comme une horloge." },
  { a: "Tomorrowland possède un thème appelé \"Book of Wisdom\".", b: "Tomorrowland possède un thème appelé \"Digital Kingdom\".", ctx: "Book of Wisdom est l'un des thèmes les plus célèbres." },
  { a: "Ozora possède un espace appelé Healing Area.", b: "Ozora possède un espace appelé Digital Spa.", ctx: "Les espaces bien-être sont communs dans les festivals psytrance." },
  { a: "Burning Man possède un centre d'accueil appelé Center Camp.", b: "Burning Man possède un centre appelé Desert Hall.", ctx: "Center Camp est le cœur social du festival." },
  { a: "Boom Festival possède une scène appelée Alchemy Circle.", b: "Boom Festival possède une scène appelée Energy Dome.", ctx: "Alchemy Circle accueille souvent des styles plus variés." },
  { a: "Mo:Dem possède une scène appelée The Swamp.", b: "Mo:Dem possède une scène appelée The Temple.", ctx: "The Swamp est une scène emblématique du festival." },
  { a: "Burning Man possède un service météo interne.", b: "Burning Man ne surveille pas la météo.", ctx: "Les tempêtes de poussière nécessitent une surveillance météo constante." },
  { a: "Tomorrowland possède un restaurant appelé Mesa Garden.", b: "Tomorrowland possède un restaurant appelé Techno Kitchen.", ctx: "Mesa Garden propose une expérience culinaire pendant le festival." },
  { a: "Boom Festival possède une immense sculpture appelée Boom Portal.", b: "Boom Festival possède une sculpture appelée Solar Pyramid.", ctx: "Les portails artistiques marquent l'entrée du site." },
  { a: "Burning Man possède un service de radio appelé BMIR.", b: "Burning Man possède une chaîne TV permanente.", ctx: "BMIR diffuse musique et informations pendant le festival." },
  { a: "Ozora possède un espace appelé Ambyss.", b: "Ozora possède un espace appelé Submarine Club.", ctx: "Ambyss est une scène dédiée aux styles alternatifs." },
  { a: "Boom Festival organise des cérémonies de feu appelées Fire Gatherings.", b: "Boom Festival interdit les performances de feu.", ctx: "Les spectacles de feu font partie de la culture psytrance." },
  { a: "Burning Man possède une sculpture géante appelée The Man qui mesure plus de 10 mètres.", b: "Burning Man possède une statue de 3 mètres.", ctx: "L'effigie centrale est monumentale." },
  { a: "Tomorrowland possède une scène appelée Rose Garden.", b: "Tomorrowland possède une scène appelée Silver Castle.", ctx: "La Rose Garden est connue pour sa décoration florale." },
  { a: "Boom Festival possède une plage appelée Boom Beach.", b: "Boom Festival possède une piscine artificielle.", ctx: "Le lac est accessible aux festivaliers." },
  { a: "Burning Man possède un service appelé Playa Info.", b: "Burning Man possède un bureau appelé Desert Office.", ctx: "Playa Info aide les participants à s'orienter." },
  { a: "Ozora possède une scène appelée Dome Stage.", b: "Ozora possède une scène appelée Crystal Stage.", ctx: "Le Dome est une scène emblématique." },
  { a: "Tomorrowland possède un thème appelé \"Planaxis\".", b: "Tomorrowland possède un thème appelé \"Ocean Dream\".", ctx: "Planaxis est un thème inspiré du monde sous-marin." },
  { a: "Burning Man possède une zone appelée Deep Playa pour les grandes œuvres.", b: "Burning Man possède une zone appelée Art Valley.", ctx: "Deep Playa accueille les installations monumentales." },
  { a: "Boom Festival possède une équipe appelée Boom Volunteers.", b: "Boom Festival emploie uniquement du personnel privé.", ctx: "Le festival repose beaucoup sur le volontariat." },
  { a: "Ozora possède un espace appelé Chill Out Dome.", b: "Ozora possède un espace appelé Relax Arena.", ctx: "Le Chill Out est une tradition dans la psytrance." },
  { a: "Burning Man possède un département appelé DPW pour construire la ville.", b: "Burning Man possède un département appelé Desert Police.", ctx: "DPW signifie Department of Public Works." },
  { a: "Tomorrowland possède une scène appelée Atmosphere.", b: "Tomorrowland possède une scène appelée Galaxy.", ctx: "Atmosphere est une scène indoor emblématique." },
  { a: "Boom Festival possède un espace appelé Being Fields.", b: "Boom Festival possède un espace appelé Energy Fields.", ctx: "Being Fields est dédié au bien-être." },
  { a: "Burning Man possède un système de rues en demi-cercle.", b: "Burning Man possède un plan carré.", ctx: "La ville est construite comme une horloge." },
  { a: "Ozora possède une zone appelée Artibarn.", b: "Ozora possède une zone appelée Psy Barn.", ctx: "Artibarn accueille des installations artistiques." },
  { a: "Tomorrowland possède une scène appelée Freedom Stage.", b: "Tomorrowland possède une scène appelée Energy Hall.", ctx: "Freedom Stage est une grande scène couverte." },
  { a: "Burning Man possède une cérémonie appelée Temple Burn.", b: "Burning Man possède une cérémonie appelée Desert Light.", ctx: "Le Temple Burn est un moment très symbolique." },
  { a: "Boom Festival possède une scène appelée The Gardens.", b: "Boom Festival possède une scène appelée Solar Stage.", ctx: "Les jardins accueillent musique et installations." },
  { a: "Ozora possède un espace appelé Magic Garden.", b: "Ozora possède un espace appelé Psy Garden.", ctx: "Magic Garden accueille performances et art." },
  { a: "Burning Man possède un service appelé Lost & Found.", b: "Burning Man ne gère pas les objets perdus.", ctx: "Un centre d'objets perdus est disponible." },
  { a: "Tomorrowland possède un spectacle appelé Symphony of Unity.", b: "Tomorrowland possède un orchestre appelé Electro Orchestra.", ctx: "Symphony of Unity mélange musique classique et électronique." },
  { a: "Boom Festival possède un espace appelé Visionary Art Gallery.", b: "Boom Festival possède une galerie appelée Digital Art Hall.", ctx: "L'art visionnaire est très présent." },
  { a: "Ozora possède une installation appelée Ozorian Temple.", b: "Ozora possède une installation appelée Crystal Temple.", ctx: "Le temple est un espace symbolique." },
  { a: "Burning Man possède une cérémonie appelée Sunrise Gathering.", b: "Burning Man possède une cérémonie appelée Morning Ritual.", ctx: "Des rassemblements spontanés ont lieu au lever du soleil." },
  { a: "Tomorrowland possède un thème appelé \"The Story of Planaxis\".", b: "Tomorrowland possède un thème appelé \"The Ocean Empire\".", ctx: "Planaxis raconte une histoire sous-marine fantastique." },
  { a: "Burning Man possède une sculpture appelée Embrace représentant deux figures géantes.", b: "Burning Man possède une sculpture appelée Titan représentant un robot.", ctx: "Embrace est une sculpture monumentale célèbre." },
];

// ── Utilitaire ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = { onBack: () => void };

export function AnecdotesScreen({ onBack }: Props) {
  // Deck pré-calculé : mélangé + orientation aléatoire (flipped = B affiché en 1er)
  const displayCards = useMemo(
    () => shuffle(ANECDOTES).map(c => ({ ...c, flipped: Math.random() < 0.5 })),
    []
  );

  const [index,  setIndex]  = useState(0);
  const [chosen, setChosen] = useState<"first" | "second" | null>(null);
  const [score,  setScore]  = useState({ ok: 0, total: 0 });

  const card         = displayCards[index % displayCards.length];
  const opt1         = card.flipped ? card.b : card.a;
  const opt2         = card.flipped ? card.a : card.b;
  const correctChoice: "first" | "second" = card.flipped ? "second" : "first";
  const revealed     = chosen !== null;
  const isCorrect    = chosen === correctChoice;
  const cardNumber   = (index % displayCards.length) + 1;

  function handleChoose(pick: "first" | "second") {
    if (chosen) return;
    setChosen(pick);
    setScore(s => ({ ok: s.ok + (pick === correctChoice ? 1 : 0), total: s.total + 1 }));
  }

  function handleNext() {
    setIndex(i => i + 1);
    setChosen(null);
  }

  // Style d'une option selon l'état
  function optionStyle(which: "first" | "second"): React.CSSProperties {
    if (!revealed) {
      return {
        background:   "rgba(255,255,255,0.05)",
        border:       "1px solid rgba(255,255,255,0.12)",
        boxShadow:    "none",
        opacity:      1,
        animation:    "none",
        color:        "rgba(255,255,255,0.90)",
      };
    }
    const isThisCorrect = which === correctChoice;
    const isChosen      = which === chosen;

    if (isThisCorrect) return {
      background:   `rgba(52, 199, 89, 0.12)`,
      border:       `1px solid ${GREEN_CORRECT}`,
      boxShadow:    `0 0 12px rgba(52,199,89,0.20)`,
      opacity:      1,
      animation:    isChosen ? "anecdotesCorrect 0.35s ease both" : "none",
      color:        "rgba(255,255,255,0.92)",
    };
    if (isChosen && !isThisCorrect) return {
      background:   `rgba(255, 59, 48, 0.10)`,
      border:       `1px solid ${RED_WRONG}`,
      boxShadow:    "none",
      opacity:      1,
      animation:    "none",
      color:        "rgba(255,255,255,0.80)",
    };
    return {
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(255,255,255,0.06)",
      boxShadow:    "none",
      opacity:      0.38,
      animation:    "none",
      color:        "rgba(255,255,255,0.60)",
    };
  }

  function optionIcon(which: "first" | "second") {
    if (!revealed) return null;
    if (which === correctChoice) return <span style={{ color: GREEN_CORRECT, fontSize: 16, flexShrink: 0 }}>✓</span>;
    if (which === chosen)        return <span style={{ color: RED_WRONG,     fontSize: 16, flexShrink: 0 }}>✗</span>;
    return null;
  }

  const commonOptionStyle: React.CSSProperties = {
    width:         "100%",
    borderRadius:  18,
    padding:       "18px 16px",
    textAlign:     "left",
    fontSize:      14,
    lineHeight:    1.65,
    fontFamily:    "inherit",
    cursor:        revealed ? "default" : "pointer",
    fontWeight:    400,
    letterSpacing: "0.01em",
    display:       "flex",
    gap:           12,
    alignItems:    "flex-start",
    transition:    "opacity 0.2s ease, border 0.2s ease, background 0.2s ease",
  };

  return (
    <div style={{
      height:         "100dvh",
      display:        "flex",
      flexDirection:  "column",
      overflow:       "hidden",
    }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink:     0,
        padding:        "20px 20px 14px",
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        borderBottom:   "1px solid rgba(255,255,255,0.07)",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.01em" }}>
            🎪 Anecdotes de festival
          </div>
          {score.total > 0 && (
            <div style={{
              fontSize: 12, opacity: 0.50, marginTop: 4,
              animation: "anecdotesFade 0.3s ease both",
            }}>
              {score.ok} ✓ · {score.total - score.ok} ✗ sur {score.total}
            </div>
          )}
        </div>
        <button
          onClick={onBack}
          style={{
            background:   "rgba(255,255,255,0.08)",
            border:       "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding:      "8px 16px",
            fontSize:     13,
            color:        "white",
            cursor:       "pointer",
            fontFamily:   "inherit",
            flexShrink:   0,
          }}
        >
          ← Jeux
        </button>
      </div>

      {/* ── Body ── */}
      <div
        className="no-scrollbar"
        style={{
          flex:           1,
          overflowY:      "auto",
          padding:        "20px 16px 40px",
          display:        "flex",
          flexDirection:  "column",
          gap:            12,
        }}
      >

        {/* Progression */}
        <div style={{
          textAlign:     "center",
          fontSize:      12,
          opacity:       0.40,
          letterSpacing: "0.08em",
          marginBottom:  4,
        }}>
          Carte {cardNumber} / {displayCards.length}
        </div>

        {/* Instruction (première carte uniquement) */}
        {score.total === 0 && !revealed && (
          <div style={{
            textAlign:    "center",
            fontSize:     13,
            opacity:      0.50,
            lineHeight:   1.5,
            padding:      "4px 8px 8px",
            fontStyle:    "italic",
          }}>
            Quelle affirmation est vraie ?
          </div>
        )}

        {/* Option 1 */}
        <button
          onClick={() => handleChoose("first")}
          className={!revealed ? "remanence-btn" : ""}
          style={{ ...commonOptionStyle, ...optionStyle("first") }}
        >
          {optionIcon("first")}
          <span>{opt1}</span>
        </button>

        {/* Séparateur "ou" */}
        <div style={{
          textAlign:     "center",
          fontSize:      11,
          opacity:       0.30,
          letterSpacing: "0.10em",
          margin:        "-2px 0",
        }}>
          ou
        </div>

        {/* Option 2 */}
        <button
          onClick={() => handleChoose("second")}
          className={!revealed ? "remanence-btn" : ""}
          style={{ ...commonOptionStyle, ...optionStyle("second") }}
        >
          {optionIcon("second")}
          <span>{opt2}</span>
        </button>

        {/* Contexte révélé */}
        {revealed && (
          <div style={{
            borderRadius:    16,
            padding:         "16px",
            background:      isCorrect
              ? "rgba(52,199,89,0.08)"
              : "rgba(255,59,48,0.07)",
            border:          isCorrect
              ? "1px solid rgba(52,199,89,0.25)"
              : "1px solid rgba(255,59,48,0.20)",
            animation:       "anecdotesReveal 0.4s cubic-bezier(0.22,1,0.36,1) both",
            display:         "flex",
            flexDirection:   "column",
            gap:             8,
          }}>
            <div style={{
              fontSize:      13,
              fontWeight:    700,
              color:         isCorrect ? GREEN_CORRECT : RED_WRONG,
              letterSpacing: "0.04em",
            }}>
              {isCorrect ? "✓ Bonne réponse !" : "✗ Pas tout à fait…"}
            </div>
            <p style={{
              margin:     0,
              fontSize:   13,
              lineHeight: 1.65,
              opacity:    0.80,
            }}>
              {card.ctx}
            </p>
          </div>
        )}

        {/* Bouton suivant */}
        {revealed && (
          <button
            onClick={handleNext}
            className="remanence-btn"
            style={{
              width:         "100%",
              borderRadius:  999,
              padding:       "16px 20px",
              border:        "none",
              background:    `linear-gradient(135deg, ${VIOLET} 0%, #D084F8 100%)`,
              boxShadow:     `0 0 18px ${VIOLET_GLOW}, 0 4px 20px rgba(191,90,242,0.22)`,
              color:         "white",
              fontSize:      16,
              fontWeight:    600,
              cursor:        "pointer",
              fontFamily:    "inherit",
              letterSpacing: "0.03em",
              animation:     "anecdotesReveal 0.4s cubic-bezier(0.22,1,0.36,1) 0.15s both, anecdotesPulse 2.2s ease-in-out 0.55s infinite",
            }}
          >
            Carte suivante →
          </button>
        )}

      </div>
    </div>
  );
}
