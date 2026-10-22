import { useEffect, useRef } from "react";
import type { LyricLine } from "@/data/tracks";
import { activeLyricIndex } from "@/player/logic";

export function Lyrics({
  lines,
  time,
  onSeek,
}: {
  lines?: LyricLine[] | undefined;
  time: number;
  onSeek: (s: number) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = lines ? activeLyricIndex(lines, time) : -1;
  useEffect(() => {
    refs.current[active]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  if (!lines?.length) {
    return (
      <div className="h-full grid place-items-center font-display text-2xl font-semibold opacity-80">
        Letra indisponível
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto py-24 space-y-6 [mask-image:linear-gradient(transparent,black_20%,black_80%,transparent)]">
      {lines.map((l, i) => (
        <button
          type="button"
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          onClick={() => onSeek(l.time + 0.05)}
          aria-current={i === active ? "true" : undefined}
          className={`block text-left font-display text-3xl font-bold leading-tight transition-all duration-500 ${i === active ? "opacity-100" : "opacity-35 blur-[1.5px]"}`}
        >
          {l.text}
        </button>
      ))}
    </div>
  );
}
