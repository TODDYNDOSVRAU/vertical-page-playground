import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { coverStyle, GENRES, TRACKS } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { H1, H2 } from "@/components/music/Headings";
import { Row } from "@/components/music/Row";

export function SearchTab() {
  const { recent, addRecent } = usePlayer();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? TRACKS.filter((t) => [t.title, t.artist, t.album, t.genre].some((x) => x.toLowerCase().includes(s))) : [];
  }, [q]);
  return (
    <>
      <H1>Buscar</H1>
      <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
        <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <input type="search" aria-label="Buscar artistas, músicas e álbuns" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addRecent(q); }}
          placeholder="Artistas, músicas, álbuns…" className="flex-1 bg-transparent outline-none text-sm" />
      </div>
      {q ? (
        <div className="mt-4">{results.length ? results.map((t) => <Row key={t.id} t={t} list={results} />) : <p className="text-sm text-muted-foreground">Nada encontrado para “{q}”.</p>}</div>
      ) : (
        <>
          {recent.length > 0 && (<><H2>Recentes</H2><div className="flex flex-wrap gap-2">{recent.map((r) => <button type="button" key={r} onClick={() => setQ(r)} className="rounded-full bg-secondary px-3 py-1 text-sm">{r}</button>)}</div></>)}
          <H2>Navegar por categorias</H2>
          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((g) => <button type="button" key={g} onClick={() => { setQ(g); addRecent(g); }} className="h-20 rounded-xl p-3 text-left font-display font-bold text-background" style={coverStyle(TRACKS.find((t) => t.genre === g)!)}>{g}</button>)}
          </div>
        </>
      )}
    </>
  );
}
