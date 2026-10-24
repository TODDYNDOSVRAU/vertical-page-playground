import { describe, expect, it } from "vitest";
import { TRACKS, type Track } from "@/data/tracks";
import {
  aggregateStats,
  filterByMood,
  insertNext,
  moveInQueue,
  removeFromQueue,
  sleepRemaining,
} from "@/player/logic";

describe("fila A Seguir", () => {
  it("reordenar mantém a faixa atual apontada", () => {
    const r = moveInQueue(["a", "b", "c", "d"], 1, 0, 3);
    expect(r.queue).toEqual(["b", "c", "d", "a"]);
    expect(r.queue[r.idx]).toBe("b");
  });
  it("não remove a faixa atual e ajusta o índice", () => {
    expect(removeFromQueue(["a", "b", "c"], 1, 1).queue).toEqual(["a", "b", "c"]);
    const r = removeFromQueue(["a", "b", "c"], 2, 0);
    expect(r.queue[r.idx]).toBe("c");
  });
  it("tocar a seguir entra logo depois da atual", () => {
    expect(insertNext(["a", "b"], 0, "x").queue).toEqual(["a", "x", "b"]);
  });
});

describe("timer de sono", () => {
  it("conta 30 minutos em segundos e nunca fica negativo", () => {
    expect(sleepRemaining(30 * 60_000, 0)).toBe(1800);
    expect(sleepRemaining(1000, 5000)).toBe(0);
  });
});

describe("Replay", () => {
  it("soma minutos e ordena as mais tocadas", () => {
    const r = aggregateStats({ seconds: { "0": 90, "1": 60 }, plays: { "0": 1, "1": 3 } }, TRACKS);
    expect(r.minutes).toBe(2);
    expect(r.top[0]!.track.id).toBe(1);
  });
});

describe("humor", () => {
  it("filtra só faixas do humor escolhido", () => {
    const list = filterByMood(TRACKS, "Foco");
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((t: Track) => t.moods?.includes("Foco"))).toBe(true);
    expect(filterByMood(TRACKS, null)).toHaveLength(TRACKS.length);
  });
});
