import { useCallback, useEffect, useState } from "react";
import {
  ensureBootstrap,
  listJournalItems,
  createUserProfile,
  listFestivals,
  addNewFestival,
  switchActiveFestival,
} from "../core/store/service";
import type { JournalItem } from "../core/store/service";
import type { Festival, UserProfile } from "../core/models/types";

export function useJournal() {
  const [booting, setBooting] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");
  const [festival, setFestival] = useState<Festival | null>(null);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [journal, setJournal] = useState<JournalItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { user: existingUser, festival: fest } = await ensureBootstrap();
        setFestivalId(fest.id);
        setFestival(fest);

        const allFests = await listFestivals();
        setFestivals(allFests);

        if (existingUser) {
          setUser(existingUser);
          const items = await listJournalItems(fest.id);
          setJournal(items);
          setStatus(`Prêt · ${fest.name}`);
          setProfileReady(true);
        }
      } catch (e) {
        setStatus(`Erreur: ${String(e)}`);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const refreshJournal = useCallback(async (fid: string) => {
    const items = await listJournalItems(fid);
    setJournal(items);
  }, []);

  /** Onboarding : crée le profil après saisie du pseudo */
  async function saveProfile(displayName: string) {
    const newUser = await createUserProfile(displayName);
    setUser(newUser);
    if (festivalId) {
      const items = await listJournalItems(festivalId);
      setJournal(items);
      setStatus(`Prêt · ${festival?.name ?? ""}`);
    }
    setProfileReady(true);
  }

  /** Crée un nouveau festival et l'ajoute à la liste */
  async function createFestival(params: {
    name: string;
    startDate: string;
    endDate: string;
    location?: string;
  }): Promise<Festival> {
    const newFest = await addNewFestival(params);
    const allFests = await listFestivals();
    setFestivals(allFests);
    return newFest;
  }

  /** Bascule vers un autre festival actif */
  async function switchFestival(id: string) {
    await switchActiveFestival(id);
    setFestivalId(id);
    const target = festivals.find((f) => f.id === id) ?? null;
    setFestival(target);
    if (target) {
      const items = await listJournalItems(id);
      setJournal(items);
      setStatus(`Prêt · ${target.name}`);
    }
  }

  return {
    booting,
    profileReady,
    user,
    status,
    festivalId,
    festival,
    festivals,
    journal,
    refreshJournal,
    saveProfile,
    createFestival,
    switchFestival,
  };
}
