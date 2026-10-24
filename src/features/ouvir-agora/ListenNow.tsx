import { useState } from "react";
import { MOODS, stableShuffle, TRACKS } from "@/data/tracks";
import { filterByMood } from "@/player/logic";
import { Row } from "@/components/music/Row";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "@/components/music/Cover";
import { H1, H2 } from "@/components/music/Headings";
import { Shelf } from "@/components/music/Shelf";

const MADE_FOR_YOU = stableShuffle(TRACKS, 2026);

export function ListenNow() {
  const { playTrack } = usePlayer();
  const top = TRACKS[0]!;
  const [mood, setMood] = useState<string | null>(null);
  const moodList = filterByMood(TRACKS, mood);
  return (
    <>
      <H1>Ouvir Agora</H1>
      <div
        className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1"
        role="group"
        aria-label="Filtrar por humor"
      >
        {[null, ...MOODS].map((m) => (
          <button
            type="button"
            key={m ?? "todos"}
            aria-pressed={mood === m}
            onClick={() => setMood(m)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${mood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {m ?? "Todos"}
          </button>
        ))}
      </div>
      {mood ? (
        <>
          <H2>Para {mood.toLowerCase()}</H2>
          <Shelf items={moodList} />
          <div className="mt-4">
            {moodList.map((t) => (
              <Row key={t.id} t={t} list={moodList} />
            ))}
          </div>
        </>
      ) : (
        <>
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
      )}
    </>
  );
}
