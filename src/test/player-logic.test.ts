import { describe, expect, it } from "vitest";
import { activeLyricIndex, nextIndex } from "@/player/logic";

describe("nextIndex", () => {
  it("shuffle never picks the current track", () => {
    for (let r = 0; r < 1; r += 0.05) expect(nextIndex(3, 8, true, () => r)).not.toBe(3);
  });
  it("sequential wraps to the start", () => {
    expect(nextIndex(7, 8, false)).toBe(0);
  });
});

describe("activeLyricIndex", () => {
  it("follows the real playback time", () => {
    const lines = [
      { time: 0, text: "a" },
      { time: 10, text: "b" },
    ];
    expect(activeLyricIndex(lines, 9.9)).toBe(0);
    expect(activeLyricIndex(lines, 10)).toBe(1);
  });
});
