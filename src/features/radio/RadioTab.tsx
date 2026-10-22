import { Radio } from "lucide-react";
import { GENRES, TRACKS, type Track } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "@/components/music/Cover";
import { H1 } from "@/components/music/Headings";

export function RadioTab() {
  const { playTrack } = usePlayer();
  const stations = GENRES.map((g) => ({ g, list: TRACKS.filter((t) => t.genre === g) as [Track, ...Track[]] }));
  return (
    <>
      <H1>Rádio</H1>
      <div className="space-y-3">
        {stations.map(({ g, list }) => (
          <button type="button" key={g} onClick={() => playTrack(list[0], list)} className="flex w-full items-center gap-4 rounded-2xl bg-card border border-border p-3 text-left">
            <Cover t={list[0]} className="h-16 w-16 rounded-xl text-[8px]" />
            {/* Não é transmissão ao vivo: é uma fila com as faixas demo do gênero. */}
            <div><div className="text-xs uppercase text-muted-foreground">Estação</div><div className="font-display text-lg font-semibold">Rádio {g}</div></div>
            <Radio className="ml-auto h-5 w-5 text-primary" aria-hidden="true" />
          </button>
        ))}
      </div>
    </>
  );
}
