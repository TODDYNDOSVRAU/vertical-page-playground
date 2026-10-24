import { useRef, useState } from "react";
import { GripVertical, X } from "lucide-react";
import { usePlayer } from "@/player/PlayerProvider";
import { Cover } from "./Cover";
import { Equalizer } from "./Equalizer";

const ROW = 60;

/** Fila "A Seguir": arraste pela alça para reordenar, X para remover. */
export function QueueList() {
  const p = usePlayer();
  const [drag, setDrag] = useState<{ from: number; dy: number } | null>(null);
  const startY = useRef(0);
  const target = drag
    ? Math.min(p.queue.length - 1, Math.max(0, drag.from + Math.round(drag.dy / ROW)))
    : -1;

  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="font-display text-xl font-semibold mb-3">A Seguir</div>
      {p.queue.map((t, i) => {
        const dragging = drag?.from === i;
        let shift = 0;
        if (drag && !dragging) {
          if (drag.from < i && target >= i) shift = -ROW;
          if (drag.from > i && target <= i) shift = ROW;
        }
        return (
          <div
            key={t.id + "-" + i}
            style={{
              height: ROW,
              transform: `translateY(${dragging ? drag.dy : shift}px)`,
              transition: dragging ? "none" : "transform 150ms",
            }}
            className={`relative flex items-center gap-2 ${dragging ? "z-10 opacity-100" : i === p.idx ? "opacity-100" : "opacity-75"}`}
          >
            <button
              type="button"
              onClick={() => p.playAt(i)}
              aria-current={i === p.idx ? "true" : undefined}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Cover t={t} className="h-11 w-11 shrink-0 rounded-md text-[7px]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="truncate text-xs opacity-70">{t.artist}</div>
              </div>
              {i === p.idx && <Equalizer playing={p.playing} />}
            </button>
            {i !== p.idx && (
              <button
                type="button"
                onClick={() => p.removeFromQueue(i)}
                aria-label={`Remover ${t.title} da fila`}
                className="p-1.5 opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Arrastar ${t.title} (setas para mover)`}
              className="touch-none cursor-grab p-1.5 opacity-70"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") p.moveInQueue(i, i - 1);
                if (e.key === "ArrowDown") p.moveInQueue(i, i + 1);
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                startY.current = e.clientY;
                setDrag({ from: i, dy: 0 });
              }}
              onPointerMove={(e) => {
                if (drag?.from === i) setDrag({ from: i, dy: e.clientY - startY.current });
              }}
              onPointerUp={() => {
                if (drag) p.moveInQueue(drag.from, target);
                setDrag(null);
              }}
              onPointerCancel={() => setDrag(null)}
            >
              <GripVertical className="h-5 w-5" />
            </span>
          </div>
        );
      })}
    </div>
  );
}
