import { Heart, MoreHorizontal } from "lucide-react";
import type { Track } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cover } from "./Cover";

export function Row({ t, list, playlistId }: { t: Track; list?: Track[]; playlistId?: string }) {
  const p = usePlayer();
  const on = p.track.id === t.id;
  const fav = p.isFav(t.id);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/60">
      <button type="button" onClick={() => p.playTrack(t, list)} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <Cover t={t} className="h-12 w-12 shrink-0 rounded-md text-[7px]" />
        <div className="min-w-0"><div className={`truncate text-sm font-medium ${on ? "text-primary" : ""}`}>{t.title}</div><div className="truncate text-xs text-muted-foreground">{t.artist} · {t.album}</div></div>
      </button>
      <button type="button" onClick={() => p.toggleFav(t.id)} aria-label={fav ? `Remover ${t.title} das favoritas` : `Favoritar ${t.title}`} aria-pressed={fav}>
        <Heart className={`h-5 w-5 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={`Mais opções para ${t.title}`} className="p-1 text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Adicionar à playlist</DropdownMenuLabel>
          {p.playlists.length === 0 && <DropdownMenuItem disabled>Nenhuma playlist</DropdownMenuItem>}
          {p.playlists.map((pl) => (
            <DropdownMenuItem key={pl.id} disabled={pl.ids.includes(t.id)} onSelect={() => p.addToPlaylist(pl.id, t.id)}>
              {pl.name}{pl.ids.includes(t.id) ? " ✓" : ""}
            </DropdownMenuItem>
          ))}
          {playlistId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => p.removeFromPlaylist(playlistId, t.id)}>Remover desta playlist</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
