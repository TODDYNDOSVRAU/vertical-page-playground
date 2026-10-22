import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Heart, Search, Library, Radio, LayoutGrid,
  ChevronDown, ListMusic, MessageSquareQuote, Shuffle, Repeat, Plus, Volume2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sonora — Música para ouvir agora" },
      { name: "description", content: "Ouça músicas com player imersivo, letras sincronizadas, biblioteca e busca." },
      { property: "og:title", content: "Sonora — Música para ouvir agora" },
      { property: "og:description", content: "Player imersivo, letras sincronizadas, biblioteca e busca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Track = { id: number; title: string; artist: string; album: string; genre: string; colors: [string, string]; src: string };

const TRACKS: Track[] = [
  ["Luz de Neon", "Aurora Vale", "Cidade Elétrica", "Pop", ["#ff2d55", "#5e2bff"]],
  ["Maré Alta", "Os Faróis", "Litoral", "Indie", ["#0a84ff", "#30d158"]],
  ["Concreto", "MC Atlas", "Ruas", "Hip-Hop", ["#ff9f0a", "#3a0ca3"]],
  ["Pulso", "Kairo", "Frequência", "Eletrônica", ["#64d2ff", "#bf5af2"]],
  ["Veludo", "Nina Sol", "Madrugada", "R&B", ["#ff375f", "#ff9f0a"]],
  ["Trovão", "Ferro Velho", "Amplificado", "Rock", ["#8e8e93", "#ff3b30"]],
  ["Horizonte", "Aurora Vale", "Cidade Elétrica", "Pop", ["#ffd60a", "#ff2d55"]],
  ["Deserto", "Kairo", "Frequência", "Eletrônica", ["#ac8e68", "#5856d6"]],
].map(([title, artist, album, genre, colors], i) => ({
  id: i, title: title as string, artist: artist as string, album: album as string, genre: genre as string,
  colors: colors as [string, string],
  src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
}));

const LYRICS = [
  "As luzes da cidade acendem devagar", "Teu nome ecoa em cada esquina", "Eu sigo o som sem medo de errar",
  "A noite é longa e a gente ilumina", "Ooh, deixa o ritmo levar", "Ooh, até o sol voltar",
  "Cada batida é um passo a mais", "Rumo ao lugar onde a gente é livre", "E quando tudo silencia atrás",
  "Ainda há música que sobrevive", "Ooh, deixa o ritmo levar", "Ooh, até o sol voltar",
];
const LINE_SEC = 9;

const cover = (t: Track) => ({ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` });
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function Cover({ t, className = "" }: { t: Track; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={cover(t)}>
      <span className="absolute bottom-1.5 left-2 right-2 truncate font-display text-[0.7em] font-semibold text-background/90 mix-blend-overlay">{t.album}</span>
    </div>
  );
}

type Tab = "now" | "browse" | "radio" | "library" | "search";

function App() {
  const audio = useRef<HTMLAudioElement>(null);
  const [tab, setTab] = useState<Tab>("now");
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [full, setFull] = useState(false);
  const [panel, setPanel] = useState<"art" | "lyrics" | "queue">("art");
  const [favs, setFavs] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playlists, setPlaylists] = useState<{ name: string; ids: number[] }[]>([{ name: "Para correr", ids: [2, 3, 5] }]);
  const track = queue[idx];

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.src = track.src;
    if (playing) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  const playTrack = (t: Track, list: Track[] = TRACKS) => {
    setQueue(list);
    setIdx(Math.max(0, list.findIndex((x) => x.id === t.id)));
    setPlaying(true);
    setTimeout(() => audio.current?.play().catch(() => setPlaying(false)), 0);
  };
  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) { a.play().then(() => setPlaying(true)).catch(() => {}); } else { a.pause(); setPlaying(false); }
  };
  const next = () => {
    if (shuffle) setIdx(Math.floor(Math.random() * queue.length));
    else setIdx((i) => (i + 1) % queue.length);
  };
  const prev = () => {
    if ((audio.current?.currentTime ?? 0) > 3) { audio.current!.currentTime = 0; return; }
    setIdx((i) => (i - 1 + queue.length) % queue.length);
  };
  const seek = (s: number) => { if (audio.current) audio.current.currentTime = s; };
  const isFav = (id: number) => favs.includes(id);
  const toggleFav = (id: number) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const ctx = { playTrack, track, playing, favs, isFav, toggleFav, playlists, setPlaylists };

  return (
    <div className="min-h-screen bg-muted/40 flex justify-center">
      <audio
        ref={audio}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => (repeat ? (seek(0), audio.current?.play()) : next())}
      />
      <div className="relative w-full max-w-[430px] min-h-screen bg-background text-foreground font-sans overflow-hidden shadow-2xl">
        <main className="h-screen overflow-y-auto pb-40 px-5 pt-12">
          {tab === "now" && <ListenNow {...ctx} />}
          {tab === "browse" && <Browse {...ctx} />}
          {tab === "radio" && <RadioTab {...ctx} />}
          {tab === "library" && <LibraryTab {...ctx} />}
          {tab === "search" && <SearchTab {...ctx} />}
        </main>

        {/* Mini player */}
        <button onClick={() => setFull(true)} className="absolute left-3 right-3 bottom-[76px] flex items-center gap-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-2 pr-4 text-left shadow-lg">
          <Cover t={track} className="h-11 w-11 rounded-lg text-[8px]" />
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">{track.title}</div>
            <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
          </div>
          <span onClick={(e) => { e.stopPropagation(); toggle(); }} className="p-1">{playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}</span>
          <span onClick={(e) => { e.stopPropagation(); next(); }} className="p-1"><SkipForward className="h-6 w-6 fill-current" /></span>
          <div className="absolute left-4 right-4 bottom-0.5 h-0.5 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${dur ? (time / dur) * 100 : 0}%` }} /></div>
        </button>

        {/* Tab bar */}
        <nav className="absolute bottom-0 inset-x-0 h-[72px] bg-card/85 backdrop-blur-xl border-t border-border grid grid-cols-5 pb-3">
          {([
            ["now", "Ouvir Agora", Play], ["browse", "Explorar", LayoutGrid], ["radio", "Rádio", Radio],
            ["library", "Biblioteca", Library], ["search", "Buscar", Search],
          ] as const).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex flex-col items-center justify-center gap-1 text-[10px] ${tab === k ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-6 w-6" />{label}
            </button>
          ))}
        </nav>

        {/* Full player */}
        <div className={`absolute inset-0 z-50 transition-transform duration-500 ease-out ${full ? "translate-y-0" : "translate-y-full"}`}>
          <div className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(circle at 20% 10%, ${track.colors[0]}, transparent 60%), radial-gradient(circle at 80% 80%, ${track.colors[1]}, transparent 60%), ${track.colors[1]}` }} />
          <div className="absolute inset-0 bg-foreground/35 backdrop-blur-3xl" />
          <div className="relative h-full flex flex-col px-7 pt-4 pb-8 text-background">
            <button onClick={() => setFull(false)} className="self-center p-2 opacity-80"><ChevronDown className="h-7 w-7" /></button>

            <div className="flex-1 min-h-0 flex flex-col justify-center">
              {panel === "art" && (
                <Cover t={track} className={`aspect-square w-full rounded-2xl shadow-2xl text-lg transition-transform duration-500 ${playing ? "scale-100" : "scale-[0.82]"}`} />
              )}
              {panel === "lyrics" && <Lyrics time={time} onSeek={seek} />}
              {panel === "queue" && (
                <div className="h-full overflow-y-auto py-2">
                  <div className="font-display text-xl font-semibold mb-3">A Seguir</div>
                  {queue.map((t, i) => (
                    <button key={t.id + "-" + i} onClick={() => setIdx(i)} className={`flex w-full items-center gap-3 py-2 text-left ${i === idx ? "opacity-100" : "opacity-70"}`}>
                      <Cover t={t} className="h-11 w-11 rounded-md text-[7px]" />
                      <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{t.title}</div><div className="truncate text-xs opacity-70">{t.artist}</div></div>
                      {i === idx && <Volume2 className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="min-w-0">
                <div className="truncate font-display text-2xl font-semibold">{track.title}</div>
                <div className="truncate opacity-70">{track.artist}</div>
              </div>
              <button onClick={() => toggleFav(track.id)}><Heart className={`h-7 w-7 ${isFav(track.id) ? "fill-current" : ""}`} /></button>
            </div>

            <input type="range" min={0} max={dur || 0} step={0.1} value={time} onChange={(e) => seek(+e.target.value)} className="mt-5 w-full accent-background" />
            <div className="flex justify-between text-xs opacity-70"><span>{fmt(time)}</span><span>-{fmt(dur - time)}</span></div>

            <div className="mt-4 flex items-center justify-between px-2">
              <button onClick={() => setShuffle(!shuffle)} className={shuffle ? "" : "opacity-50"}><Shuffle className="h-5 w-5" /></button>
              <button onClick={prev}><SkipBack className="h-10 w-10 fill-current" /></button>
              <button onClick={toggle}>{playing ? <Pause className="h-14 w-14 fill-current" /> : <Play className="h-14 w-14 fill-current" />}</button>
              <button onClick={next}><SkipForward className="h-10 w-10 fill-current" /></button>
              <button onClick={() => setRepeat(!repeat)} className={repeat ? "" : "opacity-50"}><Repeat className="h-5 w-5" /></button>
            </div>

            <div className="mt-7 flex justify-around opacity-90">
              <button onClick={() => setPanel(panel === "lyrics" ? "art" : "lyrics")} className={`rounded-lg p-2 ${panel === "lyrics" ? "bg-background/25" : ""}`}><MessageSquareQuote className="h-6 w-6" /></button>
              <button onClick={() => setPanel(panel === "queue" ? "art" : "queue")} className={`rounded-lg p-2 ${panel === "queue" ? "bg-background/25" : ""}`}><ListMusic className="h-6 w-6" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lyrics({ time, onSeek }: { time: number; onSeek: (s: number) => void }) {
  const active = Math.min(LYRICS.length - 1, Math.floor(time / LINE_SEC));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { refs.current[active]?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [active]);
  return (
    <div className="h-full overflow-y-auto py-24 space-y-6 [mask-image:linear-gradient(transparent,black_20%,black_80%,transparent)]">
      {LYRICS.map((l, i) => (
        <button key={i} ref={(el) => { refs.current[i] = el; }} onClick={() => onSeek(i * LINE_SEC + 0.1)}
          className={`block text-left font-display text-3xl font-bold leading-tight transition-all duration-500 ${i === active ? "opacity-100" : "opacity-35 blur-[1.5px]"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

type Ctx = {
  playTrack: (t: Track, list?: Track[]) => void; track: Track; playing: boolean; favs: number[];
  isFav: (id: number) => boolean; toggleFav: (id: number) => void;
  playlists: { name: string; ids: number[] }[]; setPlaylists: React.Dispatch<React.SetStateAction<{ name: string; ids: number[] }[]>>;
};

const H1 = ({ children }: { children: React.ReactNode }) => <h1 className="font-display text-4xl font-bold tracking-tight mb-5">{children}</h1>;
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="font-display text-xl font-semibold mt-8 mb-3">{children}</h2>;

function Row({ t, list, ctx }: { t: Track; list?: Track[]; ctx: Ctx }) {
  const on = ctx.track.id === t.id;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/60">
      <button onClick={() => ctx.playTrack(t, list)} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <Cover t={t} className="h-12 w-12 rounded-md text-[7px]" />
        <div className="min-w-0"><div className={`truncate text-sm font-medium ${on ? "text-primary" : ""}`}>{t.title}</div><div className="truncate text-xs text-muted-foreground">{t.artist} · {t.album}</div></div>
      </button>
      <button onClick={() => ctx.toggleFav(t.id)}><Heart className={`h-5 w-5 ${ctx.isFav(t.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>
    </div>
  );
}

function Shelf({ items, ctx }: { items: Track[]; ctx: Ctx }) {
  return (
    <div className="-mx-5 px-5 flex gap-4 overflow-x-auto pb-2 snap-x">
      {items.map((t) => (
        <button key={t.id} onClick={() => ctx.playTrack(t, items)} className="w-36 shrink-0 text-left snap-start">
          <Cover t={t} className="aspect-square w-full rounded-xl text-xs shadow-md" />
          <div className="mt-2 truncate text-sm font-medium">{t.title}</div>
          <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
        </button>
      ))}
    </div>
  );
}

function ListenNow(ctx: Ctx) {
  const top = TRACKS[0];
  return (
    <>
      <H1>Ouvir Agora</H1>
      <button onClick={() => ctx.playTrack(top)} className="w-full text-left">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Destaque</div>
        <div className="font-display text-xl font-semibold">{top.album} — {top.artist}</div>
        <Cover t={top} className="mt-3 aspect-[4/3] w-full rounded-2xl text-2xl shadow-xl" />
      </button>
      <H2>Tocadas recentemente</H2>
      <Shelf items={TRACKS.slice(2, 7)} ctx={ctx} />
      <H2>Feito para você</H2>
      <Shelf items={[...TRACKS].reverse()} ctx={ctx} />
    </>
  );
}

const GENRES = Array.from(new Set(TRACKS.map((t) => t.genre)));

function Browse(ctx: Ctx) {
  const [genre, setGenre] = useState<string | null>(null);
  const list = genre ? TRACKS.filter((t) => t.genre === genre) : TRACKS;
  return (
    <>
      <H1>Explorar</H1>
      <H2>Top 100: Brasil</H2>
      {TRACKS.slice(0, 5).map((t, i) => (
        <div key={t.id} className="flex items-center gap-3"><span className="w-5 font-display text-lg font-bold text-muted-foreground">{i + 1}</span><div className="flex-1"><Row t={t} ctx={ctx} /></div></div>
      ))}
      <H2>Gêneros</H2>
      <div className="grid grid-cols-2 gap-3">
        {GENRES.map((g) => {
          const t = TRACKS.find((x) => x.genre === g)!;
          return (
            <button key={g} onClick={() => setGenre(genre === g ? null : g)} className={`h-24 rounded-xl p-3 text-left font-display text-lg font-bold text-background ${genre === g ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} style={cover(t)}>{g}</button>
          );
        })}
      </div>
      {genre && (<><H2>{genre}</H2>{list.map((t) => <Row key={t.id} t={t} list={list} ctx={ctx} />)}</>)}
    </>
  );
}

function RadioTab(ctx: Ctx) {
  const stations = GENRES.map((g) => ({ g, list: TRACKS.filter((t) => t.genre === g) }));
  return (
    <>
      <H1>Rádio</H1>
      <div className="space-y-3">
        {stations.map(({ g, list }) => (
          <button key={g} onClick={() => ctx.playTrack(list[0], list)} className="flex w-full items-center gap-4 rounded-2xl bg-card border border-border p-3 text-left">
            <Cover t={list[0]} className="h-16 w-16 rounded-xl text-[8px]" />
            <div><div className="text-xs uppercase text-muted-foreground">Estação ao vivo</div><div className="font-display text-lg font-semibold">Rádio {g}</div></div>
            <Radio className="ml-auto h-5 w-5 text-primary" />
          </button>
        ))}
      </div>
    </>
  );
}

function LibraryTab(ctx: Ctx) {
  const [view, setView] = useState<"Playlists" | "Artistas" | "Álbuns" | "Músicas" | "Favoritas">("Playlists");
  const [open, setOpen] = useState<number | null>(null);
  const artists = Array.from(new Set(TRACKS.map((t) => t.artist)));
  const albums = Array.from(new Set(TRACKS.map((t) => t.album)));
  const favList = TRACKS.filter((t) => ctx.favs.includes(t.id));
  const addPlaylist = () => {
    const name = prompt("Nome da nova playlist");
    if (name) ctx.setPlaylists((p) => [...p, { name, ids: [...ctx.favs] }]);
  };
  return (
    <>
      <H1>Biblioteca</H1>
      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto pb-2">
        {(["Playlists", "Artistas", "Álbuns", "Músicas", "Favoritas"] as const).map((v) => (
          <button key={v} onClick={() => { setView(v); setOpen(null); }} className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{v}</button>
        ))}
      </div>
      <div className="mt-4">
        {view === "Playlists" && (
          <>
            <button onClick={addPlaylist} className="flex items-center gap-3 py-2 text-primary"><span className="grid h-12 w-12 place-items-center rounded-md bg-secondary"><Plus className="h-6 w-6" /></span>Nova playlist (com suas favoritas)</button>
            {ctx.playlists.map((p, i) => {
              const items = TRACKS.filter((t) => p.ids.includes(t.id));
              return (
                <div key={i}>
                  <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 py-2 text-left">
                    {items[0] ? <Cover t={items[0]} className="h-12 w-12 rounded-md text-[7px]" /> : <span className="h-12 w-12 rounded-md bg-secondary" />}
                    <div><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{items.length} músicas</div></div>
                  </button>
                  {open === i && <div className="pl-4">{items.length ? items.map((t) => <Row key={t.id} t={t} list={items} ctx={ctx} />) : <p className="text-sm text-muted-foreground py-2">Vazia — favorite músicas antes de criar.</p>}</div>}
                </div>
              );
            })}
          </>
        )}
        {view === "Artistas" && artists.map((a) => {
          const items = TRACKS.filter((t) => t.artist === a);
          return (
            <button key={a} onClick={() => ctx.playTrack(items[0], items)} className="flex w-full items-center gap-3 py-2 text-left">
              <Cover t={items[0]} className="h-12 w-12 rounded-full text-[0px]" /><span className="font-medium">{a}</span>
            </button>
          );
        })}
        {view === "Álbuns" && (
          <div className="grid grid-cols-2 gap-4">
            {albums.map((al) => {
              const items = TRACKS.filter((t) => t.album === al);
              return (
                <button key={al} onClick={() => ctx.playTrack(items[0], items)} className="text-left">
                  <Cover t={items[0]} className="aspect-square w-full rounded-xl text-xs" />
                  <div className="mt-1 truncate text-sm font-medium">{al}</div><div className="truncate text-xs text-muted-foreground">{items[0].artist}</div>
                </button>
              );
            })}
          </div>
        )}
        {view === "Músicas" && TRACKS.map((t) => <Row key={t.id} t={t} ctx={ctx} />)}
        {view === "Favoritas" && (favList.length ? favList.map((t) => <Row key={t.id} t={t} list={favList} ctx={ctx} />) : <p className="text-sm text-muted-foreground">Toque no coração de uma música para salvá-la aqui.</p>)}
      </div>
    </>
  );
}

function SearchTab(ctx: Ctx) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? TRACKS.filter((t) => [t.title, t.artist, t.album, t.genre].some((x) => x.toLowerCase().includes(s))) : [];
  }, [q]);
  return (
    <>
      <H1>Buscar</H1>
      <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && q.trim() && setRecent((r) => [q.trim(), ...r.filter((x) => x !== q.trim())].slice(0, 5))}
          placeholder="Artistas, músicas, álbuns…" className="flex-1 bg-transparent outline-none text-sm" />
      </div>
      {q ? (
        <div className="mt-4">{results.length ? results.map((t) => <Row key={t.id} t={t} list={results} ctx={ctx} />) : <p className="text-sm text-muted-foreground">Nada encontrado para “{q}”.</p>}</div>
      ) : (
        <>
          {recent.length > 0 && (<><H2>Recentes</H2><div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} onClick={() => setQ(r)} className="rounded-full bg-secondary px-3 py-1 text-sm">{r}</button>)}</div></>)}
          <H2>Navegar por categorias</H2>
          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((g) => <button key={g} onClick={() => setQ(g)} className="h-20 rounded-xl p-3 text-left font-display font-bold text-background" style={cover(TRACKS.find((t) => t.genre === g)!)}>{g}</button>)}
          </div>
        </>
      )}
    </>
  );
}
