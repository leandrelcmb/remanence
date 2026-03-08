import { useCallback, useEffect, useState } from "react";
import { ensureBootstrap, listJournalItems } from "../core/store/service";
import type { JournalItem } from "../core/store/service";
import type { Festival } from "../core/models/types";

export function useJournal() {
  const [status, setStatus] = useState("Boot…");
  const [festivalId, setFestivalId] = useState<string>("");
  const [festival, setFestival] = useState<Festival | null>(null);
  const [journal, setJournal] = useState<JournalItem[]>([]);

  useEffect(() => {
    (async () => {
      const { festival: fest } = await ensureBootstrap();
      setFestivalId(fest.id);
      setFestival(fest);
      const items = await listJournalItems(fest.id);
      setJournal(items);
      setStatus(`Prêt · ${fest.name}`);
    })().catch((e) => setStatus(`Erreur: ${String(e)}`));
  }, []);

  const refreshJournal = useCallback(async (fid: string) => {
    const items = await listJournalItems(fid);
    setJournal(items);
  }, []);

  return { status, festivalId, festival, journal, refreshJournal };
}
