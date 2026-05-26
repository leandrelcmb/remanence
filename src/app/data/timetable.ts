// ── Timetable Ozora 2026 ─────────────────────────────────────────────────────
// Programmation complète avec horaires réels pour 3 scènes.
// Dragon Nest et Ambyss : noms d'artistes uniquement (pas de timetable horaire disponible).
//
// day      : "Day -1" | "Day 0" | "Day 1" … "Day 8"
// startTime: "HH:MM" (heure de début du set)
// legend   : true si l'artiste est un pionnier / une légende de la scène psytrance
// mood     : "galoper" = full-on / dark / haute énergie
//            "poser"   = progressive / midtempo / mélodique
//            "reposer" = ambient / dub / chillout

export type TimetableEntry = {
  artistName: string;
  scene:
    | "Ozora Stage"
    | "Pumpui"
    | "The Dome"
    | "Dragon Nest"
    | "Ambyss";
  style:      string;
  day?:       string;
  startTime?: string;
  endTime?:   string;
  legend?:    true;
  mood?:      "galoper" | "poser" | "reposer";
};

export const TIMETABLE: TimetableEntry[] = [

  // ── Ozora Stage ──────────────────────────────────────────────────────────
  // Classification : nuit/matin → galoper · après-midi → poser · méditation → reposer
  // Exceptions basées sur le style musical (Shpongle → poser malgré l'heure de soirée)

  // Day 1 — Lun 27/07
  { artistName: "Hilight Tribe",                  scene: "Ozora Stage", style: "World Psy",       day: "Day 1", startTime: "20:30", legend: true,  mood: "galoper" },
  { artistName: "Humanoids",                       scene: "Ozora Stage", style: "Full-on",         day: "Day 1", startTime: "22:00",               mood: "galoper" },
  { artistName: "Koxbox",                          scene: "Ozora Stage", style: "Goa Trance",      day: "Day 1", startTime: "23:30", legend: true,  mood: "galoper" },
  // Day 2 — Mar 28/07
  { artistName: "Ajja",                            scene: "Ozora Stage", style: "Progressive",     day: "Day 2", startTime: "01:00", legend: true,  mood: "galoper" },
  { artistName: "Fantazma",                        scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "02:30",               mood: "galoper" },
  { artistName: "Boogie Knight",                   scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "04:00",               mood: "galoper" },
  { artistName: "Phobos",                          scene: "Ozora Stage", style: "Dark Psy",        day: "Day 2", startTime: "05:30",               mood: "galoper" },
  { artistName: "Trubble",                         scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "07:00",               mood: "galoper" },
  { artistName: "Noface",                          scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "08:30",               mood: "galoper" },
  { artistName: "Delysid",                         scene: "Ozora Stage", style: "Progressive",     day: "Day 2", startTime: "10:00",               mood: "poser"   },
  { artistName: "Spinal Fusion",                   scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "11:30",               mood: "poser"   },
  { artistName: "Starlab",                         scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "13:00",               mood: "poser"   },
  { artistName: "Kalki",                           scene: "Ozora Stage", style: "Progressive",     day: "Day 2", startTime: "14:30",               mood: "poser"   },
  { artistName: "Ace Ventura",                     scene: "Ozora Stage", style: "Progressive",     day: "Day 2", startTime: "16:00", legend: true,  mood: "poser"   },
  { artistName: "Strontium Dogs",                  scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "20:30",               mood: "galoper" },
  { artistName: "Para Halu",                       scene: "Ozora Stage", style: "Progressive",     day: "Day 2", startTime: "22:00",               mood: "galoper" },
  { artistName: "Vox Fabri",                       scene: "Ozora Stage", style: "Full-on",         day: "Day 2", startTime: "23:30",               mood: "galoper" },
  // Day 3 — Mer 29/07
  { artistName: "Irgum Burgum",                    scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "01:00",               mood: "galoper" },
  { artistName: "Cyber Aghori",                    scene: "Ozora Stage", style: "Dark Psy",        day: "Day 3", startTime: "02:30",               mood: "galoper" },
  { artistName: "Shred'er",                        scene: "Ozora Stage", style: "Dark Psy",        day: "Day 3", startTime: "04:00",               mood: "galoper" },
  { artistName: "Gino Sonica",                     scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "05:30",               mood: "galoper" },
  { artistName: "Braincell",                       scene: "Ozora Stage", style: "Hi-Tech",         day: "Day 3", startTime: "07:00", legend: true,  mood: "galoper" },
  { artistName: "Kynethik",                        scene: "Ozora Stage", style: "Dark Psy",        day: "Day 3", startTime: "08:30",               mood: "galoper" },
  { artistName: "Tsubi",                           scene: "Ozora Stage", style: "Progressive",     day: "Day 3", startTime: "10:00",               mood: "poser"   },
  { artistName: "Gorovich",                        scene: "Ozora Stage", style: "Progressive",     day: "Day 3", startTime: "11:30",               mood: "poser"   },
  { artistName: "A Perfect Sphere",                scene: "Ozora Stage", style: "Progressive",     day: "Day 3", startTime: "13:00",               mood: "poser"   },
  { artistName: "Freedom Fighters",                scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "14:30", legend: true,  mood: "poser"   },
  { artistName: "Merkaba",                         scene: "Ozora Stage", style: "Progressive",     day: "Day 3", startTime: "16:00", legend: true,  mood: "poser"   },
  { artistName: "Novelty Engine",                  scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "20:30",               mood: "galoper" },
  { artistName: "Altruism",                        scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "22:00",               mood: "galoper" },
  { artistName: "Avalon",                          scene: "Ozora Stage", style: "Full-on",         day: "Day 3", startTime: "23:30",               mood: "galoper" },
  // Day 4 — Jeu 30/07
  { artistName: "GMS & Dickster",                  scene: "Ozora Stage", style: "Full-on",         day: "Day 4", startTime: "00:00", legend: true,  mood: "galoper" },
  { artistName: "Tristan",                         scene: "Ozora Stage", style: "Hi-Tech",         day: "Day 4", startTime: "02:30", legend: true,  mood: "galoper" },
  { artistName: "8ternal Beings",                  scene: "Ozora Stage", style: "Dark Psy",        day: "Day 4", startTime: "04:00",               mood: "galoper" },
  { artistName: "Undefined Behavior",              scene: "Ozora Stage", style: "Dark / Hi-Tech",  day: "Day 4", startTime: "05:30",               mood: "galoper" },
  { artistName: "Gong Zen",                        scene: "Ozora Stage", style: "Sound Healing",   day: "Day 4", startTime: "16:30",               mood: "reposer" },
  { artistName: "Simon Borg Olivier Meditation",   scene: "Ozora Stage", style: "Méditation",      day: "Day 4", startTime: "18:00",               mood: "reposer" },
  { artistName: "Star Sounds Orchestra",           scene: "Ozora Stage", style: "Sound Healing",   day: "Day 4", startTime: "19:30",               mood: "reposer" },
  { artistName: "Astral Projection",               scene: "Ozora Stage", style: "Goa Trance",      day: "Day 4", startTime: "21:00", legend: true,  mood: "galoper" },
  { artistName: "Neo Shaman",                      scene: "Ozora Stage", style: "Tribal Psy",      day: "Day 4", startTime: "22:30",               mood: "galoper" },
  // Day 5 — Ven 31/07
  { artistName: "Tündérke",                        scene: "Ozora Stage", style: "Progressive",     day: "Day 5", startTime: "00:00",               mood: "galoper" },
  { artistName: "Rawar",                           scene: "Ozora Stage", style: "Full-on",         day: "Day 5", startTime: "01:00",               mood: "galoper" },
  { artistName: "Psynonima",                       scene: "Ozora Stage", style: "Dark Psy",        day: "Day 5", startTime: "02:30",               mood: "galoper" },
  { artistName: "Dirty Saffi",                     scene: "Ozora Stage", style: "Full-on",         day: "Day 5", startTime: "04:00",               mood: "galoper" },
  { artistName: "Taku",                            scene: "Ozora Stage", style: "Full-on",         day: "Day 5", startTime: "05:30",               mood: "galoper" },
  { artistName: "Hruscsov",                        scene: "Ozora Stage", style: "Progressive",     day: "Day 5", startTime: "07:30",               mood: "galoper" },
  { artistName: "Tsuyoshi Suzuki",                 scene: "Ozora Stage", style: "Goa Trance",      day: "Day 5", startTime: "08:30", legend: true,  mood: "galoper" },
  { artistName: "Modus",                           scene: "Ozora Stage", style: "Progressive",     day: "Day 5", startTime: "10:00",               mood: "poser"   },
  { artistName: "Skizologic",                      scene: "Ozora Stage", style: "Dark / Hi-Tech",  day: "Day 5", startTime: "11:30",               mood: "poser"   },
  { artistName: "Blue Planet Corporation",         scene: "Ozora Stage", style: "Full-on",         day: "Day 5", startTime: "13:00", legend: true,  mood: "poser"   },
  { artistName: "Etnica",                          scene: "Ozora Stage", style: "Goa Trance",      day: "Day 5", startTime: "15:00", legend: true,  mood: "poser"   },
  { artistName: "Shpongle",                        scene: "Ozora Stage", style: "Psybient",        day: "Day 5", startTime: "20:30", legend: true,  mood: "poser"   },
  { artistName: "Grant Darshan",                   scene: "Ozora Stage", style: "Progressive",     day: "Day 5", startTime: "22:00",               mood: "galoper" },
  { artistName: "Eat Static",                      scene: "Ozora Stage", style: "Full-on",         day: "Day 5", startTime: "23:30", legend: true,  mood: "galoper" },
  // Day 6 — Sam 01/08
  { artistName: "Giuseppe",                        scene: "Ozora Stage", style: "Full-on",         day: "Day 6", startTime: "00:00",               mood: "galoper" },
  { artistName: "Farebi Jalebi",                   scene: "Ozora Stage", style: "Dark / Forest",   day: "Day 6", startTime: "02:30",               mood: "galoper" },
  { artistName: "Weirdos",                         scene: "Ozora Stage", style: "Dark Psy",        day: "Day 6", startTime: "04:00",               mood: "galoper" },
  { artistName: "Codex Spiralis",                  scene: "Ozora Stage", style: "Dark Psy",        day: "Day 6", startTime: "05:30",               mood: "galoper" },
  { artistName: "Ondrej Psyla",                    scene: "Ozora Stage", style: "Dark Psy",        day: "Day 6", startTime: "07:00",               mood: "galoper" },
  { artistName: "Martian Arts",                    scene: "Ozora Stage", style: "Full-on",         day: "Day 6", startTime: "08:30",               mood: "galoper" },
  { artistName: "Danger & Beyond",                 scene: "Ozora Stage", style: "Full-on",         day: "Day 6", startTime: "10:00",               mood: "poser"   },
  { artistName: "Asgard",                          scene: "Ozora Stage", style: "Progressive",     day: "Day 6", startTime: "11:30",               mood: "poser"   },
  { artistName: "Talpa",                           scene: "Ozora Stage", style: "Full-on",         day: "Day 6", startTime: "13:00",               mood: "poser"   },
  { artistName: "Astrix",                          scene: "Ozora Stage", style: "Progressive",     day: "Day 6", startTime: "14:30", legend: true,  mood: "poser"   },
  { artistName: "Raja Ram & Lucas",                scene: "Ozora Stage", style: "Goa Trance",      day: "Day 6", startTime: "19:30", legend: true,  mood: "galoper" },
  { artistName: "Aardvarkk",                       scene: "Ozora Stage", style: "Hi-Tech",         day: "Day 6", startTime: "21:00",               mood: "galoper" },
  { artistName: "Jimi Green",                      scene: "Ozora Stage", style: "Full-on",         day: "Day 6", startTime: "22:30",               mood: "galoper" },
  // Day 7 — Dim 02/08
  { artistName: "Ninesense",                       scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "00:00",               mood: "galoper" },
  { artistName: "Act One",                         scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "01:30",               mood: "galoper" },
  { artistName: "Shenanigan",                      scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "03:00",               mood: "galoper" },
  { artistName: "Originz & Rajax",                 scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "04:30",               mood: "galoper" },
  { artistName: "Justin Chaos",                    scene: "Ozora Stage", style: "Dark Psy",        day: "Day 7", startTime: "06:30",               mood: "galoper" },
  { artistName: "He She It",                       scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "08:00",               mood: "galoper" },
  { artistName: "Tron",                            scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "09:30",               mood: "galoper" },
  { artistName: "Amigdala",                        scene: "Ozora Stage", style: "Progressive",     day: "Day 7", startTime: "11:00",               mood: "poser"   },
  { artistName: "Egorythmia",                      scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "12:30", legend: true,  mood: "poser"   },
  { artistName: "Atmos",                           scene: "Ozora Stage", style: "Progressive",     day: "Day 7", startTime: "14:00", legend: true,  mood: "poser"   },
  { artistName: "Headroom",                        scene: "Ozora Stage", style: "Progressive",     day: "Day 7", startTime: "15:30",               mood: "poser"   },
  { artistName: "Grouch",                          scene: "Ozora Stage", style: "Progressive",     day: "Day 7", startTime: "17:00", legend: true,  mood: "poser"   },
  { artistName: "O:F:F",                           scene: "Ozora Stage", style: "Full-on",         day: "Day 7", startTime: "18:30",               mood: "poser"   },

  // ── Pumpui ───────────────────────────────────────────────────────────────
  // Scène full-on psytrance → tout "galoper", sauf Gaudi → "poser"

  // Day -1 — Sam 25/07
  { artistName: "Switch Nollie & Tsu",             scene: "Pumpui", style: "Full-on",         day: "Day -1", startTime: "16:00", mood: "galoper" },
  { artistName: "Siblicity",                        scene: "Pumpui", style: "Full-on",         day: "Day -1", startTime: "19:00", mood: "galoper" },
  { artistName: "Zagi",                            scene: "Pumpui", style: "Full-on",         day: "Day -1", startTime: "20:30", mood: "galoper" },
  { artistName: "DJ Reload",                       scene: "Pumpui", style: "Full-on",         day: "Day -1", startTime: "22:00", mood: "galoper" },
  { artistName: "Mankind",                         scene: "Pumpui", style: "Full-on",         day: "Day -1", startTime: "23:30", mood: "galoper" },
  // Day 0 — Dim 26/07
  { artistName: "Subotage",                        scene: "Pumpui", style: "Dark Psy",        day: "Day 0", startTime: "01:00", mood: "galoper" },
  { artistName: "DTNB.",                           scene: "Pumpui", style: "Hi-Tech",         day: "Day 0", startTime: "03:00", mood: "galoper" },
  { artistName: "Korruptcop",                      scene: "Pumpui", style: "Dark / Hi-Tech",  day: "Day 0", startTime: "04:30", mood: "galoper" },
  { artistName: "Nova Gravity",                    scene: "Pumpui", style: "Progressive",     day: "Day 0", startTime: "05:30", mood: "galoper" },
  { artistName: "Tatoo",                           scene: "Pumpui", style: "Progressive",     day: "Day 0", startTime: "07:30", mood: "galoper" },
  { artistName: "Sundi Jr & Paradiddle",           scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "08:30", mood: "galoper" },
  { artistName: "Sundi",                           scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "10:00", mood: "galoper" },
  { artistName: "Sabee",                           scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "11:30", mood: "galoper" },
  { artistName: "Robot Bennett",                   scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "13:00", mood: "galoper" },
  { artistName: "Titusz",                          scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "14:30", mood: "galoper" },
  { artistName: "Faktor X",                        scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "16:00", mood: "galoper" },
  { artistName: "Tetrameth",                       scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "17:30", mood: "galoper" },
  { artistName: "Shadow FX",                       scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "19:00", mood: "galoper" },
  { artistName: "Detune",                          scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "20:30", mood: "galoper" },
  { artistName: "Emiri",                           scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "22:00", mood: "galoper" },
  { artistName: "Pusher",                          scene: "Pumpui", style: "Full-on",         day: "Day 0", startTime: "23:30", mood: "galoper" },
  // Day 1 — Lun 27/07
  { artistName: "Ikoza & Alphakey",                scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "01:00", mood: "galoper" },
  { artistName: "Symbionts",                       scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "03:00", mood: "galoper" },
  { artistName: "Acid Echoes",                     scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "04:30", mood: "galoper" },
  { artistName: "Rook",                            scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "06:00", mood: "galoper" },
  { artistName: "Ramizes",                         scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "07:30", mood: "galoper" },
  { artistName: "Metaverse",                       scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "08:30", mood: "galoper" },
  { artistName: "Benho & Psymon",                  scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "11:00", mood: "galoper" },
  { artistName: "Oleg",                            scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "13:00", mood: "galoper" },
  { artistName: "Captain Hook",                    scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "14:30", legend: true, mood: "galoper" },
  { artistName: "Faktor X",                        scene: "Pumpui", style: "Full-on",         day: "Day 1", startTime: "16:00", mood: "galoper" },
  { artistName: "Gaudi",                           scene: "Pumpui", style: "Psydub",          day: "Day 1", startTime: "22:00", legend: true, mood: "poser"   },
  // Day 2 — Mar 28/07
  { artistName: "Heavy Hertz",                     scene: "Pumpui", style: "Dark Psy",        day: "Day 2", startTime: "00:00", mood: "galoper" },
  { artistName: "Regan",                           scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "01:30", mood: "galoper" },
  { artistName: "Tongue & Groove",                 scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "03:00", mood: "galoper" },
  { artistName: "Nanoplex",                        scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "04:30", mood: "galoper" },
  { artistName: "Mist",                            scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "11:00", mood: "galoper" },
  { artistName: "Alma Deya",                       scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "13:00", mood: "galoper" },
  { artistName: "Airydisc",                        scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "14:30", mood: "galoper" },
  { artistName: "Bioterranean",                    scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "16:00", mood: "galoper" },
  { artistName: "Porat",                           scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "17:30", mood: "galoper" },
  { artistName: "Out of Orbit",                    scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "19:00", mood: "galoper" },
  { artistName: "Abstrakt",                        scene: "Pumpui", style: "Dark Psy",        day: "Day 2", startTime: "21:00", mood: "galoper" },
  { artistName: "Prometheus",                      scene: "Pumpui", style: "Full-on",         day: "Day 2", startTime: "22:30", mood: "galoper" },
  // Day 3 — Mer 29/07
  { artistName: "Hallucinogen",                    scene: "Pumpui", style: "Goa Trance",      day: "Day 3", startTime: "00:00", legend: true, mood: "galoper" },
  { artistName: "DJ Solitaire",                    scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "01:30", mood: "galoper" },
  { artistName: "Anoebis",                         scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "03:00", mood: "galoper" },
  { artistName: "Roy Sason",                       scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "04:30", mood: "galoper" },
  { artistName: "Gerő",                            scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "11:00", mood: "galoper" },
  { artistName: "Zsom",                            scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "13:00", mood: "galoper" },
  { artistName: "Axeev",                           scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "14:30", mood: "galoper" },
  { artistName: "Klipsun",                         scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "16:00", mood: "galoper" },
  { artistName: "Sensient",                        scene: "Pumpui", style: "Progressive",     day: "Day 3", startTime: "17:30", mood: "galoper" },
  { artistName: "Captain Pastek",                  scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "19:30", mood: "galoper" },
  { artistName: "Triforce",                        scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "21:00", mood: "galoper" },
  { artistName: "Katamii",                         scene: "Pumpui", style: "Full-on",         day: "Day 3", startTime: "22:30", mood: "galoper" },
  // Day 4 — Jeu 30/07
  { artistName: "Efdemin",                         scene: "Pumpui", style: "Techno",          day: "Day 4", startTime: "00:00", mood: "galoper" },
  { artistName: "Ignez",                           scene: "Pumpui", style: "Full-on",         day: "Day 4", startTime: "01:30", mood: "galoper" },
  { artistName: "Wavecheck",                       scene: "Pumpui", style: "Full-on",         day: "Day 4", startTime: "03:00", mood: "galoper" },
  { artistName: "Detective Kelly",                 scene: "Pumpui", style: "Full-on",         day: "Day 4", startTime: "04:30", mood: "galoper" },
  { artistName: "Ewake",                           scene: "Pumpui", style: "Full-on",         day: "Day 4", startTime: "21:00", mood: "galoper" },
  { artistName: "Jossie Telch",                    scene: "Pumpui", style: "Full-on",         day: "Day 4", startTime: "22:30", mood: "galoper" },
  // Day 5 — Ven 31/07
  { artistName: "Yuli Fershtat",                   scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "00:00", mood: "galoper" },
  { artistName: "Jedidiah",                        scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "01:30", mood: "galoper" },
  { artistName: "One Million Toys",                scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "03:00", mood: "galoper" },
  { artistName: "Miles from Mars",                 scene: "Pumpui", style: "Progressive",     day: "Day 5", startTime: "04:30", mood: "galoper" },
  { artistName: "Bodoo",                           scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "11:00", mood: "galoper" },
  { artistName: "Antique",                         scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "12:30", mood: "galoper" },
  { artistName: "Britta Arnold",                   scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "14:00", mood: "galoper" },
  { artistName: "In Between",                      scene: "Pumpui", style: "Progressive",     day: "Day 5", startTime: "15:30", mood: "galoper" },
  { artistName: "Moonclipse",                      scene: "Pumpui", style: "Progressive",     day: "Day 5", startTime: "17:00", mood: "galoper" },
  { artistName: "Enrico Sanguliano",               scene: "Pumpui", style: "Techno",          day: "Day 5", startTime: "18:30", mood: "galoper" },
  { artistName: "John 00 Fleming",                 scene: "Pumpui", style: "Progressive",     day: "Day 5", startTime: "20:00", legend: true, mood: "galoper" },
  { artistName: "Tom_Ato",                         scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "21:30", mood: "galoper" },
  { artistName: "Ekkel",                           scene: "Pumpui", style: "Full-on",         day: "Day 5", startTime: "23:00", mood: "galoper" },
  // Day 6 — Sam 01/08
  { artistName: "Sindh",                           scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "01:00", mood: "galoper" },
  { artistName: "Kalumet",                         scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "02:30", mood: "galoper" },
  { artistName: "Slym & Szoliver",                 scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "04:30", mood: "galoper" },
  { artistName: "Deerfeeder",                      scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "11:00", mood: "galoper" },
  { artistName: "Szamy",                           scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "13:00", mood: "galoper" },
  { artistName: "Muteless",                        scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "14:30", mood: "galoper" },
  { artistName: "Aka Nina",                        scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "16:00", mood: "galoper" },
  { artistName: "Breger",                          scene: "Pumpui", style: "Progressive",     day: "Day 6", startTime: "18:30", mood: "galoper" },
  { artistName: "Roland Handrick",                 scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "20:00", mood: "galoper" },
  { artistName: "Mode & Valens",                   scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "21:30", mood: "galoper" },
  { artistName: "Ness",                            scene: "Pumpui", style: "Full-on",         day: "Day 6", startTime: "23:30", mood: "galoper" },
  // Day 7 — Dim 02/08
  { artistName: "Isu",                             scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "01:00", mood: "galoper" },
  { artistName: "Dork",                            scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "03:00", mood: "galoper" },
  { artistName: "Lensky",                          scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "04:30", mood: "galoper" },
  { artistName: "O:F:F",                           scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "06:00", mood: "galoper" },
  { artistName: "Adx",                             scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "11:00", mood: "galoper" },
  { artistName: "Garpo & Ferenc Szanati",          scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "12:30", mood: "galoper" },
  { artistName: "Nora Matisse",                    scene: "Pumpui", style: "Progressive",     day: "Day 7", startTime: "14:00", mood: "galoper" },
  { artistName: "Andras Bader",                    scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "15:30", mood: "galoper" },
  { artistName: "Infragandhi",                     scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "17:00", mood: "galoper" },
  { artistName: "Bernathy",                        scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "18:30", mood: "galoper" },
  { artistName: "Atia",                            scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "20:00", mood: "galoper" },
  { artistName: "Nevo",                            scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "22:00", mood: "galoper" },
  { artistName: "Arhetip",                         scene: "Pumpui", style: "Full-on",         day: "Day 7", startTime: "23:30", mood: "galoper" },
  // Day 8 — Lun 03/08
  { artistName: "Neutron",                         scene: "Pumpui", style: "Full-on",         day: "Day 8", startTime: "01:00", mood: "galoper" },
  { artistName: "Hatta",                           scene: "Pumpui", style: "Full-on",         day: "Day 8", startTime: "02:30", mood: "galoper" },
  { artistName: "Eltawave & Yury",                 scene: "Pumpui", style: "Full-on",         day: "Day 8", startTime: "04:00", mood: "galoper" },

  // ── The Dome ─────────────────────────────────────────────────────────────
  // Espace chillout d'Ozora → tous "reposer"

  // Day 1 — Lun 27/07
  { artistName: "Solar Fields",                    scene: "The Dome", style: "Ambient",           day: "Day 1", startTime: "21:30", legend: true, mood: "reposer" },
  { artistName: "Entheogenic",                     scene: "The Dome", style: "Psybient",          day: "Day 1", startTime: "23:30", legend: true, mood: "reposer" },
  // Day 2 — Mar 28/07
  { artistName: "Vibrasphere",                     scene: "The Dome", style: "Progressive Chill", day: "Day 2", startTime: "01:30", legend: true, mood: "reposer" },
  { artistName: "Yoy Project",                     scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "03:00",               mood: "reposer" },
  { artistName: "Saalyx",                          scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "04:30",               mood: "reposer" },
  { artistName: "Mysticism",                       scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "06:00",               mood: "reposer" },
  { artistName: "Eat Static",                      scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "12:00", legend: true, mood: "reposer" },
  { artistName: "Greg Hunter",                     scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "14:00",               mood: "reposer" },
  { artistName: "Nick Interchill",                 scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "16:00",               mood: "reposer" },
  { artistName: "Aux25",                           scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "18:00",               mood: "reposer" },
  { artistName: "Coloboma & Filip Varial",         scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "19:30",               mood: "reposer" },
  { artistName: "Zakhorov",                        scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "21:00",               mood: "reposer" },
  { artistName: "DJ Josko",                        scene: "The Dome", style: "Psychill",          day: "Day 2", startTime: "22:30",               mood: "reposer" },
  // Day 3 — Mer 29/07
  { artistName: "Ok Eg",                           scene: "The Dome", style: "Psychill",          day: "Day 3", startTime: "00:30",               mood: "reposer" },
  { artistName: "Sunju Hargun",                    scene: "The Dome", style: "Psybient",          day: "Day 3", startTime: "02:00",               mood: "reposer" },
  { artistName: "Beta",                            scene: "The Dome", style: "Psydub",            day: "Day 3", startTime: "04:00",               mood: "reposer" },
  { artistName: "Erro",                            scene: "The Dome", style: "Ambient",           day: "Day 3", startTime: "06:00",               mood: "reposer" },
  { artistName: "Vlastur",                         scene: "The Dome", style: "Psydub",            day: "Day 3", startTime: "12:00",               mood: "reposer" },
  { artistName: "S&A in Dub",                      scene: "The Dome", style: "Dub",               day: "Day 3", startTime: "14:00",               mood: "reposer" },
  { artistName: "Crazy Baldhead",                  scene: "The Dome", style: "Dub",               day: "Day 3", startTime: "16:00",               mood: "reposer" },
  { artistName: "Sudden Reverb",                   scene: "The Dome", style: "Psychill",          day: "Day 3", startTime: "17:30",               mood: "reposer" },
  { artistName: "Misled Convoy",                   scene: "The Dome", style: "Downtempo",         day: "Day 3", startTime: "19:00",               mood: "reposer" },
  { artistName: "Tor.Ma in Dub",                   scene: "The Dome", style: "Dub Techno",        day: "Day 3", startTime: "20:30",               mood: "reposer" },
  { artistName: "Giuseppe in Dub",                 scene: "The Dome", style: "Psydub",            day: "Day 3", startTime: "22:00",               mood: "reposer" },
  { artistName: "Gabriel Le Mar",                  scene: "The Dome", style: "Psychill",          day: "Day 3", startTime: "23:30",               mood: "reposer" },
  // Day 4 — Jeu 30/07
  { artistName: "Benji Vaughan",                   scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "01:30",               mood: "reposer" },
  { artistName: "Aliji",                           scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "03:00",               mood: "reposer" },
  { artistName: "Aurafood",                        scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "04:30",               mood: "reposer" },
  { artistName: "Dymons",                          scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "06:30",               mood: "reposer" },
  { artistName: "Mirror System",                   scene: "The Dome", style: "Downtempo",         day: "Day 4", startTime: "12:00",               mood: "reposer" },
  { artistName: "Savaborsa & Richietyerra",        scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "14:00",               mood: "reposer" },
  { artistName: "Chillum Trio",                    scene: "The Dome", style: "Organic Live",      day: "Day 4", startTime: "15:30",               mood: "reposer" },
  { artistName: "Zen Baboon",                      scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "17:00",               mood: "reposer" },
  { artistName: "Meo Culpa",                       scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "19:00",               mood: "reposer" },
  { artistName: "Banyek",                          scene: "The Dome", style: "Psychill",          day: "Day 4", startTime: "20:30",               mood: "reposer" },
  { artistName: "Om Unit",                         scene: "The Dome", style: "Jungle / Bass",     day: "Day 4", startTime: "21:30",               mood: "reposer" },
  { artistName: "Anatolian Weapons",               scene: "The Dome", style: "Dub Techno",        day: "Day 4", startTime: "22:30",               mood: "reposer" },
  // Day 5 — Ven 31/07
  { artistName: "Jane Fitz",                       scene: "The Dome", style: "House / Techno",    day: "Day 5", startTime: "00:30",               mood: "reposer" },
  { artistName: "Crimson",                         scene: "The Dome", style: "Psychill",          day: "Day 5", startTime: "03:30",               mood: "reposer" },
  { artistName: "Acideal",                         scene: "The Dome", style: "Acid Techno",       day: "Day 5", startTime: "06:00",               mood: "reposer" },
  { artistName: "Rumpistol",                       scene: "The Dome", style: "Downtempo",         day: "Day 5", startTime: "21:00",               mood: "reposer" },
  { artistName: "Eclektic",                        scene: "The Dome", style: "Psychill",          day: "Day 5", startTime: "23:30",               mood: "reposer" },
  // Day 6 — Sam 01/08
  { artistName: "Herrhausen & Treindl",            scene: "The Dome", style: "Ambient",           day: "Day 6", startTime: "00:30",               mood: "reposer" },
  { artistName: "Griffin Kloud",                   scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "01:30",               mood: "reposer" },
  { artistName: "Merlyn Silva",                    scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "03:00",               mood: "reposer" },
  { artistName: "Alexander Descroix",              scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "04:30",               mood: "reposer" },
  { artistName: "Stereomantra",                    scene: "The Dome", style: "Downtempo",         day: "Day 6", startTime: "06:00",               mood: "reposer" },
  { artistName: "Kalya Scintilla",                 scene: "The Dome", style: "World Fusion",      day: "Day 6", startTime: "12:00",               mood: "reposer" },
  { artistName: "Entangled Mind",                  scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "14:00",               mood: "reposer" },
  { artistName: "Geoglyph",                        scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "15:30",               mood: "reposer" },
  { artistName: "Encounters",                      scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "17:00",               mood: "reposer" },
  { artistName: "Lo.Renzo",                        scene: "The Dome", style: "Psydub",            day: "Day 6", startTime: "18:30",               mood: "reposer" },
  { artistName: "Bayawaka",                        scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "20:30",               mood: "reposer" },
  { artistName: "Tribone",                         scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "22:30",               mood: "reposer" },
  { artistName: "Mantismash",                      scene: "The Dome", style: "Psychill",          day: "Day 6", startTime: "23:30",               mood: "reposer" },
  // Day 7 — Dim 02/08
  { artistName: "The Flying Mars",                 scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "01:00",               mood: "reposer" },
  { artistName: "Cosmic Trigger",                  scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "02:30",               mood: "reposer" },
  { artistName: "Gumi",                            scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "04:30",               mood: "reposer" },
  { artistName: "Cord",                            scene: "The Dome", style: "Ambient",           day: "Day 7", startTime: "06:00",               mood: "reposer" },
  { artistName: "Grouch in Dub",                   scene: "The Dome", style: "Progressive Dub",   day: "Day 7", startTime: "12:00",               mood: "reposer" },
  { artistName: "Ajja & Tanina",                   scene: "The Dome", style: "Progressive Chill", day: "Day 7", startTime: "13:30",               mood: "reposer" },
  { artistName: "Nautis",                          scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "15:30",               mood: "reposer" },
  { artistName: "Dubapest Hifi",                   scene: "The Dome", style: "Dub",               day: "Day 7", startTime: "17:00",               mood: "reposer" },
  { artistName: "Lucas in Dub",                    scene: "The Dome", style: "Psydub",            day: "Day 7", startTime: "18:30",               mood: "reposer" },
  { artistName: "Globular",                        scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "20:30",               mood: "reposer" },
  { artistName: "O:F:F",                           scene: "The Dome", style: "Psychill",          day: "Day 7", startTime: "22:30",               mood: "reposer" },

  // ── Dragon Nest ───────────────────────────────────────────────────────────
  // Day 1
  { artistName: "Brooklyn Gypsies",               scene: "Dragon Nest", style: "Folk / World",         day: "Day 1", startTime: "22:00",               mood: "galoper" },
  // Day 2
  { artistName: "Óperentzia",                     scene: "Dragon Nest", style: "Folk / World",         day: "Day 2", startTime: "00:30",               mood: "poser"   },
  { artistName: "Populous",                       scene: "Dragon Nest", style: "Folktronica",          day: "Day 2", startTime: "02:30",               mood: "poser"   },
  { artistName: "Tom Bini",                       scene: "Dragon Nest", style: "World / DJ",           day: "Day 2", startTime: "10:00",               mood: "poser"   },
  { artistName: "Earthly Measures",               scene: "Dragon Nest", style: "Folk / Electronic",    day: "Day 2", startTime: "12:00",               mood: "poser"   },
  { artistName: "Bellegance & Fraser",            scene: "Dragon Nest", style: "Folk / Electronic",    day: "Day 2", startTime: "13:30",               mood: "poser"   },
  { artistName: "Ko Shin Moon",                   scene: "Dragon Nest", style: "Acoustic / World",     day: "Day 2", startTime: "15:30",               mood: "poser"   },
  { artistName: "Nana Benz du Togo",              scene: "Dragon Nest", style: "Afrobeat",             day: "Day 2", startTime: "17:30",               mood: "galoper" },
  { artistName: "Chicha Libre",                   scene: "Dragon Nest", style: "Cumbia / World",       day: "Day 2", startTime: "19:30",               mood: "galoper" },
  { artistName: "BCUC",                           scene: "Dragon Nest", style: "Afrofunk / World",     day: "Day 2", startTime: "22:00",               mood: "galoper" },
  // Day 3
  { artistName: "Smag På Dig Selv",               scene: "Dragon Nest", style: "Electronic",           day: "Day 3", startTime: "00:30",               mood: "galoper" },
  { artistName: "Fidju Kitxora",                  scene: "Dragon Nest", style: "African Folk",         day: "Day 3", startTime: "02:30",               mood: "poser"   },
  { artistName: "Sonido Tupinamba",               scene: "Dragon Nest", style: "Cumbia / World",       day: "Day 3", startTime: "11:00",               mood: "poser"   },
  { artistName: "Sibu Manaï",                     scene: "Dragon Nest", style: "African Folk",         day: "Day 3", startTime: "12:20",               mood: "poser"   },
  { artistName: "Panache & Grabuge",              scene: "Dragon Nest", style: "Brass / Funk",         day: "Day 3", startTime: "14:00",               mood: "galoper" },
  { artistName: "Giolibrí",                       scene: "Dragon Nest", style: "Folk / World",         day: "Day 3", startTime: "15:30",               mood: "poser"   },
  { artistName: "Marysia Osu & Kibir La Amlak",  scene: "Dragon Nest", style: "Dub / World",          day: "Day 3", startTime: "17:30",               mood: "poser"   },
  { artistName: "Noura Mint Seymali",             scene: "Dragon Nest", style: "Mauritanian Blues",    day: "Day 3", startTime: "19:30",               mood: "poser"   },
  { artistName: "Younger Brother",                scene: "Dragon Nest", style: "Psybient",             day: "Day 3", startTime: "22:00", legend: true, mood: "galoper" },
  // Day 4
  { artistName: "Ott",                            scene: "Dragon Nest", style: "Psydub",               day: "Day 4", startTime: "00:30", legend: true, mood: "poser"   },
  { artistName: "Phil Hartnoll",                  scene: "Dragon Nest", style: "Electronic",           day: "Day 4", startTime: "02:30", legend: true, mood: "galoper" },
  { artistName: "Djembejam! Drum & Dance Circle", scene: "Dragon Nest", style: "African Percussion",   day: "Day 4", startTime: "11:00",               mood: "poser"   },
  { artistName: "Wild Marmalade",                 scene: "Dragon Nest", style: "Tribal / World",       day: "Day 4", startTime: "22:00",               mood: "galoper" },
  // Day 5
  { artistName: "My Baby",                        scene: "Dragon Nest", style: "Blues / Folk",         day: "Day 5", startTime: "00:30",               mood: "poser"   },
  { artistName: "Felix Laband",                   scene: "Dragon Nest", style: "Downtempo",            day: "Day 5", startTime: "02:30",               mood: "poser"   },
  { artistName: "Mavvi & Antonia",                scene: "Dragon Nest", style: "Folk / Electronic",    day: "Day 5", startTime: "11:00",               mood: "poser"   },
  { artistName: "Biomigrant",                     scene: "Dragon Nest", style: "World / Electronic",   day: "Day 5", startTime: "12:30",               mood: "poser"   },
  { artistName: "Sorian",                         scene: "Dragon Nest", style: "World Music",          day: "Day 5", startTime: "14:00",               mood: "poser"   },
  { artistName: "Anicca",                         scene: "Dragon Nest", style: "Electronic / World",   day: "Day 5", startTime: "15:30",               mood: "poser"   },
  { artistName: "Spoink",                         scene: "Dragon Nest", style: "Electronic",           day: "Day 5", startTime: "17:30",               mood: "poser"   },
  { artistName: "Colorstar",                      scene: "Dragon Nest", style: "Electronic",           day: "Day 5", startTime: "19:30",               mood: "galoper" },
  { artistName: "Gaudi + Don Letts + Earl 16",   scene: "Dragon Nest", style: "Dub / World",          day: "Day 5", startTime: "22:00", legend: true, mood: "galoper" },
  // Day 6
  { artistName: "Dubsahara meets Vlastur",        scene: "Dragon Nest", style: "Dub / World",          day: "Day 6", startTime: "00:30",               mood: "poser"   },
  { artistName: "Pistamashina",                   scene: "Dragon Nest", style: "Electronic",           day: "Day 6", startTime: "02:30",               mood: "galoper" },
  { artistName: "Bass Kovac",                     scene: "Dragon Nest", style: "Dub / Bass",           day: "Day 6", startTime: "11:00",               mood: "poser"   },
  { artistName: "Meo Culpa & Zakhorov",           scene: "Dragon Nest", style: "World / Electronic",   day: "Day 6", startTime: "12:30",               mood: "poser"   },
  { artistName: "Taiga",                          scene: "Dragon Nest", style: "Folk / World",         day: "Day 6", startTime: "14:00",               mood: "poser"   },
  { artistName: "Tebra",                          scene: "Dragon Nest", style: "Folk / World",         day: "Day 6", startTime: "15:30",               mood: "poser"   },
  { artistName: "Kalikamo",                       scene: "Dragon Nest", style: "Tribal / World",       day: "Day 6", startTime: "17:30",               mood: "galoper" },
  { artistName: "Red Snapper",                    scene: "Dragon Nest", style: "Trip-Hop",             day: "Day 6", startTime: "19:30",               mood: "galoper" },
  { artistName: "Collignon",                      scene: "Dragon Nest", style: "Jazz / Cabaret",       day: "Day 6", startTime: "22:00",               mood: "galoper" },
  // Day 7
  { artistName: "Konono N°1",                     scene: "Dragon Nest", style: "Congotronics",         day: "Day 7", startTime: "00:30", legend: true, mood: "galoper" },
  { artistName: "$roken $reger",                  scene: "Dragon Nest", style: "Electronic",           day: "Day 7", startTime: "02:30",               mood: "galoper" },
  { artistName: "Enki",                           scene: "Dragon Nest", style: "Tribal / World",       day: "Day 7", startTime: "17:00",               mood: "poser"   },
  { artistName: "Heimya",                         scene: "Dragon Nest", style: "Electronic",           day: "Day 7", startTime: "19:30",               mood: "poser"   },
  { artistName: "Mitsoura",                       scene: "Dragon Nest", style: "Folk / World",         day: "Day 7", startTime: "22:00",               mood: "galoper" },
  { artistName: "O:F:F (All Stars Fire Show)",    scene: "Dragon Nest", style: "Closing / Live",       day: "Day 7", startTime: "00:00",               mood: "galoper" },

  // ── Cooking Groove ────────────────────────────────────────────────────────
  { artistName: "Patajana & Karlo Kurbel",        scene: "Cooking Groove", style: "World / Folk",      day: "Day 1", startTime: "10:00",               mood: "reposer" },
  { artistName: "Arökem",                         scene: "Cooking Groove", style: "World / Electronic", day: "Day 1", startTime: "11:30",              mood: "reposer" },
  { artistName: "Frederika",                      scene: "Cooking Groove", style: "Folk / Acoustic",   day: "Day 1", startTime: "13:00",               mood: "reposer" },
  { artistName: "Sebastian Venu",                 scene: "Cooking Groove", style: "Electronic",        day: "Day 1", startTime: "14:30",               mood: "reposer" },

  // ── Ambyss — pas de timetable horaire disponible ─────────────────────────
  { artistName: "Ssiege",                          scene: "Ambyss", style: "Ambient" },
  { artistName: "Marysia Osu",                     scene: "Ambyss", style: "Ambient Vocal" },
  { artistName: "Platon Karataev Duo",             scene: "Ambyss", style: "Post-Rock" },
  { artistName: "Anatolian Weapons",               scene: "Ambyss", style: "Dub Techno" },
  { artistName: "Zen Baboon Ambient Set",          scene: "Ambyss", style: "Ambient" },
  { artistName: "Atia in Peace",                   scene: "Ambyss", style: "Ambient" },
  { artistName: "Rumpistol",                       scene: "Ambyss", style: "Downtempo" },
  { artistName: "Pause.DXA",                       scene: "Ambyss", style: "Ambient" },
  { artistName: "Sunju Hargun",                    scene: "Ambyss", style: "Psybient" },
  { artistName: "Ouoa",                            scene: "Ambyss", style: "Ambient" },
  { artistName: "Eklectik",                        scene: "Ambyss", style: "Psychill" },
  { artistName: "Fanni Zahár Fluidum & Peaq",     scene: "Ambyss", style: "Contemporary Jazz" },
  { artistName: "Nathalia",                        scene: "Ambyss", style: "Vocal / Electronic" },
  { artistName: "Nick Interchill",                 scene: "Ambyss", style: "Psychill" },
  { artistName: "Kukan Dub Ambient",               scene: "Ambyss", style: "Dub Ambient" },
  { artistName: "Gabriel Le Mar",                  scene: "Ambyss", style: "Psychill" },
  { artistName: "Lazy Calm Raga",                  scene: "Ambyss", style: "Raga / Indian" },
  { artistName: "Smooglers",                       scene: "Ambyss", style: "Ambient" },
  { artistName: "Blue Sun pres. Hanussen & Kozmo D", scene: "Ambyss", style: "Electronic" },
  { artistName: "Alagi & Papa",                    scene: "Ambyss", style: "World / Acoustic" },
  { artistName: "Tsu",                             scene: "Ambyss", style: "Electronic" },
  { artistName: "Switch Nollie",                   scene: "Ambyss", style: "Electronic" },
  { artistName: "Baumb",                           scene: "Ambyss", style: "Ambient" },
  { artistName: "Aiwa",                            scene: "Ambyss", style: "Ambient" },
  { artistName: "Bodoo",                           scene: "Ambyss", style: "Psychill" },
  { artistName: "Swanasa",                         scene: "Ambyss", style: "Ambient" },
  { artistName: "Professor Chill",                 scene: "Ambyss", style: "Psychill" },
  { artistName: "Danaël3D",                        scene: "Ambyss", style: "Electronic" },
  { artistName: "Wonky Swing Trio",                scene: "Ambyss", style: "Jazz / Swing" },
  { artistName: "Andras Toth",                     scene: "Ambyss", style: "Electronic" },
];

// ── 5 scènes officielles Ozora 2026 ──────────────────────────────────────────
export const SCENES = [
  { key: "Ozora Stage",    emoji: "🌞" },
  { key: "Pumpui",         emoji: "🎪" },
  { key: "The Dome",       emoji: "🎵" },
  { key: "Dragon Nest",    emoji: "🐉" },
  { key: "Cooking Groove", emoji: "🍳" },
  { key: "Ambyss",         emoji: "🌊" },
] as const;

// ── Labels jour → date lisible ────────────────────────────────────────────────
export const DAY_LABELS: Record<string, string> = {
  "Day -1": "Sam 25/07",
  "Day 0":  "Dim 26/07",
  "Day 1":  "Lun 27/07",
  "Day 2":  "Mar 28/07",
  "Day 3":  "Mer 29/07",
  "Day 4":  "Jeu 30/07",
  "Day 5":  "Ven 31/07",
  "Day 6":  "Sam 01/08",
  "Day 7":  "Dim 02/08",
  "Day 8":  "Lun 03/08",
};

export type SceneKey = (typeof SCENES)[number]["key"];

export function artistsByScene(scene: string): TimetableEntry[] {
  return TIMETABLE.filter((e) => e.scene === scene);
}
