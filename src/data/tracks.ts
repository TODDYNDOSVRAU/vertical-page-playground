/**
 * DADOS DE DEMONSTRAÇÃO.
 * Títulos, artistas e álbuns são fictícios; o áudio vem dos exemplos públicos do SoundHelix.
 * As letras abaixo são ORIGINAIS DE DEMONSTRAÇÃO, escritas para o app (o áudio é instrumental).
 */
export type LyricLine = { time: number; text: string };

export type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  colors: [string, string];
  src: string;
  lyrics?: LyricLine[];
  moods?: string[];
};

export const MOODS = ["Foco", "Treino", "Relax", "Viagem"] as const;

type Seed = [
  title: string,
  artist: string,
  album: string,
  genre: string,
  colors: [string, string],
  moods: string[],
];

const SEEDS: Seed[] = [
  [
    "Luz de Neon",
    "Aurora Vale",
    "Cidade Elétrica",
    "Pop",
    ["#ff2d55", "#5e2bff"],
    ["Viagem", "Treino"],
  ],
  ["Maré Alta", "Os Faróis", "Litoral", "Indie", ["#0a84ff", "#30d158"], ["Relax", "Viagem"]],
  ["Concreto", "MC Atlas", "Ruas", "Hip-Hop", ["#ff9f0a", "#3a0ca3"], ["Treino"]],
  ["Pulso", "Kairo", "Frequência", "Eletrônica", ["#64d2ff", "#bf5af2"], ["Foco", "Treino"]],
  ["Veludo", "Nina Sol", "Madrugada", "R&B", ["#ff375f", "#ff9f0a"], ["Relax"]],
  ["Trovão", "Ferro Velho", "Amplificado", "Rock", ["#8e8e93", "#ff3b30"], ["Treino"]],
  ["Horizonte", "Aurora Vale", "Cidade Elétrica", "Pop", ["#ffd60a", "#ff2d55"], ["Viagem"]],
  ["Deserto", "Kairo", "Frequência", "Eletrônica", ["#ac8e68", "#5856d6"], ["Foco", "Relax"]],
];

const lines = (texts: string[], start = 10, step = 6): LyricLine[] =>
  texts.map((text, i) => ({ time: start + i * step, text }));

const DEMO_LYRICS: Record<number, LyricLine[]> = {
  0: lines([
    "A cidade acende devagar",
    "Cada janela é uma canção",
    "Eu sigo a luz de neon",
    "Pelas ruas sem direção",
    "O céu de vidro se partiu",
    "E choveu cor no meu caminho",
    "Luz de neon, luz de neon",
    "Ninguém dança tão sozinho",
  ]),
  1: lines([
    "O mar chegou sem avisar",
    "Levou meus pés, levou meu chão",
    "Maré alta no peito",
    "Farol aceso na mão",
    "Se a onda vier, eu vou",
    "Se o vento virar, também",
    "Maré alta, maré alta",
    "Me leva pra onde ninguém vem",
  ]),
  4: lines([
    "Madrugada de veludo",
    "Teu nome no meu ouvido",
    "A luz baixa, o som macio",
    "Tudo fica mais bonito",
    "Fica mais um minuto",
    "O relógio pode esperar",
    "Veludo, veludo",
    "Até o dia clarear",
  ]),
};

export const DEMO_TRACKS: Track[] = SEEDS.map(
  ([title, artist, album, genre, colors, moods], i) => ({
    id: i,
    moods,
    ...(DEMO_LYRICS[i] ? { lyrics: DEMO_LYRICS[i] } : {}),
    title,
    artist,
    album,
    genre,
    colors,
    src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`,
  }),
);

export const TRACKS = DEMO_TRACKS;

export const GENRES: string[] = Array.from(new Set(TRACKS.map((t) => t.genre)));

export const TOP_LIST_TITLE = "Em alta na demo";

/** Embaralhamento determinístico (mesma ordem no servidor e no navegador). */
export function stableShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const hasLyrics = (t: Track) => (t.lyrics?.length ?? 0) > 0;

export const coverStyle = (t: Track) => ({
  background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
});

export const fmtTime = (s: number) =>
  Number.isFinite(s) && s >= 0
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "0:00";
