import { Moon } from "lucide-react";
import { fmtTime } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SLEEP_OPTIONS = [15, 30, 45] as const;

export function sleepLabel(mode: string, left: number) {
  if (mode === "time") return fmtTime(left);
  if (mode === "track") return "Fim da faixa";
  return null;
}

export function SleepMenu({ className = "" }: { className?: string }) {
  const { sleep, sleepLeft, setSleep } = usePlayer();
  const label = sleepLabel(sleep.mode, sleepLeft);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label ? `Timer de sono: ${label}` : "Timer de sono"}
        className={`flex items-center gap-1.5 rounded-lg p-2 ${label ? "bg-background/25" : ""} ${className}`}
      >
        <Moon className={`h-6 w-6 ${label ? "fill-current" : ""}`} />
        {label && <span className="text-xs font-medium tabular-nums">{label}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>Pausar depois de</DropdownMenuLabel>
        {SLEEP_OPTIONS.map((m) => (
          <DropdownMenuItem key={m} onSelect={() => setSleep(m)}>
            {m} minutos
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={() => setSleep("track")}>Fim da faixa</DropdownMenuItem>
        {label && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setSleep(null)}>Desligar timer</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
