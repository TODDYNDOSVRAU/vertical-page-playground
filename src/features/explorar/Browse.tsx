import { useState } from "react";
import { coverStyle, GENRES, TOP_LIST_TITLE, TRACKS } from "@/data/tracks";
import { H1, H2 } from "@/components/music/Headings";
import { Row } from "@/components/music/Row";

const TOP = TRACKS.slice(0, 5);

export function Browse() {
  const [genre, setGenre] = useState<string | null>(null);
  const list = genre ? TRACKS.filter((t) => t.genre === genre) : TRACKS;
  return (
    <>
      <H1>Explorar</H1>
      <H2>{TOP_LIST_TITLE}</H2>
      {TOP.map((t, i) => (
        <div key={t.id} className="flex items-center gap-3"><span className="w-5 font-display text-lg font-bold text-muted-foreground">{i + 1}</span><div className="flex-1 min-w-0"><Row t={t} list={TOP} /></div></div>
      ))}
      <H2>Gêneros</H2>
      <div className="grid grid-cols-2 gap-3">
        {GENRES.map((g) => {
          const t = TRACKS.find((x) => x.genre === g)!;
          return (
            <button type="button" key={g} aria-pressed={genre === g} onClick={() => setGenre(genre === g ? null : g)} className={`h-24 rounded-xl p-3 text-left font-display text-lg font-bold text-background ${genre === g ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} style={coverStyle(t)}>{g}</button>
          );
        })}
      </div>
      {genre && (<><H2>{genre}</H2>{list.map((t) => <Row key={t.id} t={t} list={list} />)}</>)}
    </>
  );
}
