import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "./Cover";

export function MiniPlayer() {
  const { track, playing, toggle, next, openFull, time, dur } = usePlayer();
  return (
    <div className="absolute left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] flex items-center gap-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-2 pr-4 shadow-lg">
      <button type="button" onClick={openFull} aria-label={`Abrir player: ${track.title}, ${track.artist}`} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <Cover t={track} className="h-11 w-11 shrink-0 rounded-lg text-[8px]" />
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{track.title}</div>
          <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
        </div>
      </button>
      <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : "Tocar"} className="p-1">
        {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
      </button>
      <button type="button" onClick={next} aria-label="Próxima" className="p-1"><SkipForward className="h-6 w-6 fill-current" /></button>
      <div aria-hidden="true" className="absolute left-4 right-4 bottom-0.5 h-0.5 rounded bg-muted">
        <div className="h-full rounded bg-primary" style={{ width: `${dur ? (time / dur) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
