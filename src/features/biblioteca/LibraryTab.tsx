import { useState } from "react";
import { TRACKS, type Track } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "@/components/music/Cover";
import { H1 } from "@/components/music/Headings";
import { Row } from "@/components/music/Row";
import { NewPlaylistDialog } from "@/components/music/NewPlaylistDialog";

const VIEWS = ["Playlists", "Artistas", "Álbuns", "Músicas", "Favoritas"] as const;

export function LibraryTab() {
  const p = usePlayer();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Playlists");
  const [open, setOpen] = useState<string | null>(null);
  const artists = Array.from(new Set(TRACKS.map((t) => t.artist)));
  const albums = Array.from(new Set(TRACKS.map((t) => t.album)));
  const favList = TRACKS.filter((t) => p.favs.includes(t.id));
  return (
    <>
      <H1>Biblioteca</H1>
      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto pb-2">
        {VIEWS.map((v) => (
          <button type="button" key={v} aria-pressed={view === v} onClick={() => { setView(v); setOpen(null); }} className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{v}</button>
        ))}
      </div>
      <div className="mt-4">
        {view === "Playlists" && (
          <>
            <NewPlaylistDialog />
            {p.playlists.map((pl) => {
              const items = pl.ids.map((id) => TRACKS.find((t) => t.id === id)).filter((t): t is Track => !!t);
              return (
                <div key={pl.id}>
                  <button type="button" aria-expanded={open === pl.id} onClick={() => setOpen(open === pl.id ? null : pl.id)} className="flex w-full items-center gap-3 py-2 text-left">
                    {items[0] ? <Cover t={items[0]} className="h-12 w-12 rounded-md text-[7px]" /> : <span className="h-12 w-12 rounded-md bg-secondary" />}
                    <div><div className="text-sm font-medium">{pl.name}</div><div className="text-xs text-muted-foreground">{items.length} músicas</div></div>
                  </button>
                  {open === pl.id && <div className="pl-4">{items.length ? items.map((t) => <Row key={t.id} t={t} list={items} playlistId={pl.id} />) : <p className="text-sm text-muted-foreground py-2">Vazia — use o menu ⋯ de uma música para adicioná-la.</p>}</div>}
                </div>
              );
            })}
          </>
        )}
        {view === "Artistas" && artists.map((a) => {
          const items = TRACKS.filter((t) => t.artist === a) as [Track, ...Track[]];
          return (
            <button type="button" key={a} onClick={() => p.playTrack(items[0], items)} className="flex w-full items-center gap-3 py-2 text-left">
              <Cover t={items[0]} className="h-12 w-12 rounded-full text-[0px]" /><span className="font-medium">{a}</span>
            </button>
          );
        })}
        {view === "Álbuns" && (
          <div className="grid grid-cols-2 gap-4">
            {albums.map((al) => {
              const items = TRACKS.filter((t) => t.album === al) as [Track, ...Track[]];
              return (
                <button type="button" key={al} onClick={() => p.playTrack(items[0], items)} className="text-left">
                  <Cover t={items[0]} className="aspect-square w-full rounded-xl text-xs" />
                  <div className="mt-1 truncate text-sm font-medium">{al}</div><div className="truncate text-xs text-muted-foreground">{items[0].artist}</div>
                </button>
              );
            })}
          </div>
        )}
        {view === "Músicas" && TRACKS.map((t) => <Row key={t.id} t={t} />)}
        {view === "Favoritas" && (favList.length ? favList.map((t) => <Row key={t.id} t={t} list={favList} />) : <p className="text-sm text-muted-foreground">Toque no coração de uma música para salvá-la aqui.</p>)}
      </div>
    </>
  );
}
