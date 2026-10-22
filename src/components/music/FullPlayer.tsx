import { useEffect, useState } from "react";
import { ChevronDown, Heart, ListMusic, MessageSquareQuote, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { fmtTime, hasLyrics } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "./Cover";
import { Lyrics } from "./Lyrics";

export function FullPlayer() {
  const p = usePlayer();
  const { track, full } = p;
  const [panel, setPanel] = useState<"art" | "lyrics" | "queue">("art");
  const lyricsOk = hasLyrics(track);
  useEffect(() => { if (!lyricsOk && panel === "lyrics") setPanel("art"); }, [lyricsOk, panel]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Tocando agora" aria-hidden={!full} inert={!full}
      className={`absolute inset-0 z-50 transition-transform duration-500 ease-out ${full ? "translate-y-0" : "translate-y-full"}`}>
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(circle at 20% 10%, ${track.colors[0]}, transparent 60%), radial-gradient(circle at 80% 80%, ${track.colors[1]}, transparent 60%), ${track.colors[1]}` }} />
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-3xl" />
      <div className="relative h-full flex flex-col px-7 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] text-background">
        <button type="button" onClick={p.closeFull} aria-label="Fechar player" className="self-center p-2 opacity-80"><ChevronDown className="h-7 w-7" /></button>

        <div className="flex-1 min-h-0 flex flex-col justify-center">
          {panel === "art" && <Cover t={track} className={`aspect-square w-full rounded-2xl shadow-2xl text-lg transition-transform duration-500 ${p.playing ? "scale-100" : "scale-[0.82]"}`} />}
          {panel === "lyrics" && <Lyrics lines={track.lyrics} time={p.time} onSeek={p.seek} />}
          {panel === "queue" && (
            <div className="h-full overflow-y-auto py-2">
              <div className="font-display text-xl font-semibold mb-3">A Seguir</div>
              {p.queue.map((t, i) => (
                <button type="button" key={t.id + "-" + i} onClick={() => p.playAt(i)} aria-current={i === p.idx ? "true" : undefined}
                  className={`flex w-full items-center gap-3 py-2 text-left ${i === p.idx ? "opacity-100" : "opacity-70"}`}>
                  <Cover t={t} className="h-11 w-11 rounded-md text-[7px]" />
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{t.title}</div><div className="truncate text-xs opacity-70">{t.artist}</div></div>
                  {i === p.idx && <Volume2 className="h-4 w-4" aria-label="Tocando" />}
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
          <button type="button" onClick={() => p.toggleFav(track.id)} aria-label={p.isFav(track.id) ? "Remover das favoritas" : "Adicionar às favoritas"} aria-pressed={p.isFav(track.id)}>
            <Heart className={`h-7 w-7 ${p.isFav(track.id) ? "fill-current" : ""}`} />
          </button>
        </div>

        <input type="range" aria-label="Progresso da música" aria-valuetext={`${fmtTime(p.time)} de ${fmtTime(p.dur)}`}
          min={0} max={p.dur || 0} step={0.1} value={p.time} onChange={(e) => p.seek(+e.target.value)} className="mt-5 w-full accent-background" />
        <div className="flex justify-between text-xs opacity-70"><span>{fmtTime(p.time)}</span><span>-{fmtTime(p.dur - p.time)}</span></div>

        <div className="mt-4 flex items-center justify-between px-2">
          <button type="button" onClick={() => p.setShuffle(!p.shuffle)} aria-label="Aleatório" aria-pressed={p.shuffle} className={p.shuffle ? "" : "opacity-50"}><Shuffle className="h-5 w-5" /></button>
          <button type="button" onClick={p.prev} aria-label="Anterior"><SkipBack className="h-10 w-10 fill-current" /></button>
          <button type="button" onClick={p.toggle} aria-label={p.playing ? "Pausar" : "Tocar"}>{p.playing ? <Pause className="h-14 w-14 fill-current" /> : <Play className="h-14 w-14 fill-current" />}</button>
          <button type="button" onClick={p.next} aria-label="Próxima"><SkipForward className="h-10 w-10 fill-current" /></button>
          <button type="button" onClick={() => p.setRepeat(!p.repeat)} aria-label="Repetir" aria-pressed={p.repeat} className={p.repeat ? "" : "opacity-50"}><Repeat className="h-5 w-5" /></button>
        </div>

        <div className="mt-7 flex justify-around opacity-90">
          <button type="button" disabled={!lyricsOk} onClick={() => setPanel(panel === "lyrics" ? "art" : "lyrics")}
            aria-label={lyricsOk ? "Letras" : "Letra indisponível"} aria-pressed={panel === "lyrics"}
            className={`rounded-lg p-2 disabled:opacity-40 ${panel === "lyrics" ? "bg-background/25" : ""}`}><MessageSquareQuote className="h-6 w-6" /></button>
          <button type="button" onClick={() => setPanel(panel === "queue" ? "art" : "queue")} aria-label="Fila" aria-pressed={panel === "queue"}
            className={`rounded-lg p-2 ${panel === "queue" ? "bg-background/25" : ""}`}><ListMusic className="h-6 w-6" /></button>
        </div>
      </div>
    </div>
  );
}
