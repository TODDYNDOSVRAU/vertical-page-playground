import type { Track } from "@/data/tracks";

function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > max && line) {
      out.push(line);
      line = w;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

/** Gera um card vertical (Stories) e compartilha ou baixa. Chame só em handlers. */
export async function shareTrackCard(t: Track, lyric?: string): Promise<"shared" | "downloaded" | "cancelled"> {
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, t.colors[0]);
  bg.addColorStop(1, t.colors[1]);
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.fillRect(0, 0, W, H);

  const size = 840;
  const x = (W - size) / 2;
  const y = 300;
  g.save();
  g.shadowColor = "rgba(0,0,0,0.45)";
  g.shadowBlur = 80;
  g.shadowOffsetY = 30;
  const cover = g.createLinearGradient(x, y, x + size, y + size);
  cover.addColorStop(0, t.colors[0]);
  cover.addColorStop(1, t.colors[1]);
  g.fillStyle = cover;
  g.beginPath();
  g.roundRect(x, y, size, size, 48);
  g.fill();
  g.restore();
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.font = "600 56px Fraunces, serif";
  g.fillText(t.album, x + 48, y + size - 56);

  g.fillStyle = "#ffffff";
  g.font = "700 84px Fraunces, serif";
  g.fillText(t.title, x, 1290);
  g.globalAlpha = 0.8;
  g.font = "500 48px 'DM Sans', sans-serif";
  g.fillText(t.artist, x, 1370);
  g.globalAlpha = 1;

  if (lyric) {
    g.font = "600 56px Fraunces, serif";
    wrap(g, `“${lyric}”`, size).slice(0, 3).forEach((l, i) => g.fillText(l, x, 1510 + i * 72));
  }
  g.globalAlpha = 0.7;
  g.font = "600 40px 'DM Sans', sans-serif";
  g.fillText("Sonora", x, 1800);

  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
  if (!blob) throw new Error("canvas");
  const file = new File([blob], `sonora-${t.title.toLowerCase().replace(/\s+/g, "-")}.png`, {
    type: "image/png",
  });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: t.title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
