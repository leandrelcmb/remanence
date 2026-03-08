import { useCallback, useEffect, useState } from "react";
import { ensureBootstrap, listJournalItems, createUserProfile } from "../core/store/service";
import type { JournalItem } from "../core/store/service";
import type { Festival, UserProfile } from "../core/models/types";

export function useJournal() {
  const [booting, setBooting] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");
  const [festival, setFestival] = useState<Festival | null>(null);
  const [journal, setJournal] = useState<JournalItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { user: existingUser, festival: fest } = await ensureBootstrap();
        setFestivalId(fest.id);
        setFestival(fest);

        if (existingUser) {
          setUser(existingUser);
          const items = await listJournalItems(fest.id);
          setJournal(items);
          setStatus(`Prêt · ${fest.name}`);
          setProfileReady(true);
        }
        // Si pas de profil → profileReady reste false → l'app affiche l'onboarding
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

  /** Appelé depuis OnboardingScreen après saisie du pseudo */
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

  return { booting, profileReady, user, status, festivalId, festival, journal, refreshJournal, saveProfile };
}
