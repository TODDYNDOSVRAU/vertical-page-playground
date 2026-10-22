import type { Track } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "./Cover";

export function Shelf({ items }: { items: Track[] }) {
  const { playTrack } = usePlayer();
  return (
    <div className="-mx-5 px-5 flex gap-4 overflow-x-auto pb-2 snap-x">
      {items.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => playTrack(t, items)}
          className="w-36 shrink-0 text-left snap-start"
        >
          <Cover t={t} className="aspect-square w-full rounded-xl text-xs shadow-md" />
          <div className="mt-2 truncate text-sm font-medium">{t.title}</div>
          <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
        </button>
      ))}
    </div>
  );
}
