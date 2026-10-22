import { stableShuffle, TRACKS } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "@/components/music/Cover";
import { H1, H2 } from "@/components/music/Headings";
import { Shelf } from "@/components/music/Shelf";

const MADE_FOR_YOU = stableShuffle(TRACKS, 2026);

export function ListenNow() {
  const { playTrack } = usePlayer();
  const top = TRACKS[0]!;
  return (
    <>
      <H1>Ouvir Agora</H1>
      <button type="button" onClick={() => playTrack(top)} className="w-full text-left">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Destaque</div>
        <div className="font-display text-xl font-semibold">
          {top.album} — {top.artist}
        </div>
        <Cover t={top} className="mt-3 aspect-[4/3] w-full rounded-2xl text-2xl shadow-xl" />
      </button>
      <H2>Tocadas recentemente</H2>
      <Shelf items={TRACKS.slice(2, 7)} />
      <H2>Feito para você</H2>
      <Shelf items={MADE_FOR_YOU} />
    </>
  );
}
