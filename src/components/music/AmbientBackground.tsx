import { usePlayer } from "@/player/PlayerProvider";

/** Brilho suave com as cores da música atual por trás de todo o app. */
export function AmbientBackground() {
  const { track } = usePlayer();
  const [a, b] = track.colors;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-20 opacity-30 blur-3xl transition-[background] duration-1000"
        style={{
          background: `radial-gradient(circle at 15% 5%, ${a}, transparent 55%), radial-gradient(circle at 90% 70%, ${b}, transparent 55%)`,
        }}
      />
      <div className="absolute inset-0 bg-background/40 backdrop-blur-2xl" />
    </div>
  );
}
