import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import patchAnecdotes from "./locales/_patch-anecdotes.json";
import patchDivers     from "./locales/_patch-divers.json";
import patchSante      from "./locales/_patch-sante.json";
import patchRisques    from "./locales/_patch-risques.json";

const savedLang = localStorage.getItem("lang") ?? "fr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
          ...(fr as AnyObj),
          anecdotes: { ...(fr as AnyObj).anecdotes, items: patchAnecdotes.fr.items },
          divers:    { ...(fr as AnyObj).divers,    cards: patchDivers.fr.cards    },
          sante:     { ...(fr as AnyObj).sante,     ...patchSante.fr               },
          risques:   { ...(fr as AnyObj).risques,   ...patchRisques.fr             },
        },
      },
      en: {
        translation: {
          ...(en as AnyObj),
          anecdotes: { ...(en as AnyObj).anecdotes, items: patchAnecdotes.en.items },
          divers:    { ...(en as AnyObj).divers,    cards: patchDivers.en.cards    },
          sante:     { ...(en as AnyObj).sante,     ...patchSante.en               },
          risques:   { ...(en as AnyObj).risques,   ...patchRisques.en             },
        },
      },
    },
    lng: savedLang,
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
