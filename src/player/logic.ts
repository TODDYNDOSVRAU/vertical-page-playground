import type { LyricLine } from "@/data/tracks";

/** Próximo índice da fila. No aleatório nunca sorteia o índice atual (se houver outra opção). */
export function nextIndex(current: number, length: number, shuffle: boolean, rand: () => number = Math.random): number {
  if (length <= 1) return 0;
  if (!shuffle) return (current + 1) % length;
  const pick = Math.floor(rand() * (length - 1));
  return pick >= current ? pick + 1 : pick;
}

/** Índice da linha de letra ativa para o tempo atual (-1 antes da primeira). */
export function activeLyricIndex(lines: LyricLine[], time: number): number {
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.time <= time) active = i;
    else break;
  }
  return active;
}
