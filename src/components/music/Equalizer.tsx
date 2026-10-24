/** Barrinhas animadas da faixa tocando. Param quando pausado e respeitam "reduzir movimento". */
export function Equalizer({ playing, className = "" }: { playing: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-3.5 w-4 shrink-0 items-end gap-[2px] ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-sm bg-current"
          style={{ animationDelay: `${i * -0.3}s`, animationPlayState: playing ? "running" : "paused" }}
        />
      ))}
    </span>
  );
}
