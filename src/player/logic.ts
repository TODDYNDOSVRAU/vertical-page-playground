import type { LyricLine, Track } from "@/data/tracks";

/** Próximo índice da fila. No aleatório nunca sorteia o índice atual (se houver outra opção). */
export function nextIndex(
  current: number,
  length: number,
  shuffle: boolean,
  rand: () => number = Math.random,
): number {
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

export type QueueState<T> = { queue: T[]; idx: number };

/** Move um item da fila mantendo a faixa atual apontada pelo índice. */
export function moveInQueue<T>(q: T[], idx: number, from: number, to: number): QueueState<T> {
  if (from === to || from < 0 || to < 0 || from >= q.length || to >= q.length)
    return { queue: q, idx };
  const out = [...q];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item!);
  let n = idx;
  if (from === idx) n = to;
  else if (from < idx && to >= idx) n = idx - 1;
  else if (from > idx && to <= idx) n = idx + 1;
  return { queue: out, idx: n };
}

/** Remove um item da fila. A faixa atual não pode ser removida. */
export function removeFromQueue<T>(q: T[], idx: number, i: number): QueueState<T> {
  if (i === idx || i < 0 || i >= q.length) return { queue: q, idx };
  return { queue: q.filter((_, j) => j !== i), idx: i < idx ? idx - 1 : idx };
}

/** Coloca um item logo depois da faixa atual. */
export function insertNext<T>(q: T[], idx: number, item: T): QueueState<T> {
  const out = [...q];
  out.splice(idx + 1, 0, item);
  return { queue: out, idx };
}

/** Segundos que faltam no timer de sono (nunca negativo). */
export function sleepRemaining(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export type Stats = { seconds: Record<string, number>; plays: Record<string, number> };
export const EMPTY_STATS: Stats = { seconds: {}, plays: {} };

export function aggregateStats(stats: Stats, tracks: Track[]) {
  const byId = new Map(tracks.map((t) => [String(t.id), t]));
  const totalSec = Object.values(stats.seconds).reduce((a, b) => a + b, 0);
  const top = Object.entries(stats.plays)
    .filter(([id, n]) => byId.has(id) && n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, plays]) => ({ track: byId.get(id)!, plays }));
  const genreSec = new Map<string, number>();
  for (const [id, s] of Object.entries(stats.seconds)) {
    const t = byId.get(id);
    if (t) genreSec.set(t.genre, (genreSec.get(t.genre) ?? 0) + s);
  }
  const genres = [...genreSec.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre, s]) => ({ genre, minutes: Math.floor(s / 60) }));
  return { minutes: Math.floor(totalSec / 60), top, genres };
}

export function filterByMood(tracks: Track[], mood: string | null): Track[] {
  return mood ? tracks.filter((t) => t.moods?.includes(mood)) : tracks;
}
