import { coverStyle, type Track } from "@/data/tracks";

/** Capa gerada por gradiente. O nome do álbum é decorativo (aria-hidden) e pode ser menor que 11px. */
export function Cover({ t, className = "" }: { t: Track; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={coverStyle(t)}>
      <span aria-hidden="true" className="absolute bottom-1.5 left-2 right-2 truncate font-display text-[0.7em] font-semibold text-background/90 mix-blend-overlay">
        {t.album}
      </span>
    </div>
  );
}
