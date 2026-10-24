import { toast } from "sonner";
import type { Track } from "@/data/tracks";
import { activeLyricIndex } from "@/player/logic";

/** Compartilha o card da faixa; usa a linha de letra atual (ou a primeira) quando houver. */
export async function shareCard(t: Track, time?: number) {
  const lines = t.lyrics ?? [];
  const i = time === undefined ? 0 : Math.max(0, activeLyricIndex(lines, time));
  try {
    const { shareTrackCard } = await import("@/lib/shareCard");
    const r = await shareTrackCard(t, lines[i]?.text);
    if (r === "downloaded") toast.success("Card salvo nos downloads");
  } catch {
    toast.error("Não foi possível criar o card");
  }
}
