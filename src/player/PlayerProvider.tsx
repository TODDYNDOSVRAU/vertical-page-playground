import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { TRACKS, type Track } from "@/data/tracks";
import {
  EMPTY_STATS,
  insertNext,
  moveInQueue as moveQ,
  nextIndex,
  removeFromQueue as removeQ,
  sleepRemaining,
  type Stats,
} from "@/player/logic";
import { deleteStored, listStored, putStored, type StoredTrack } from "@/lib/idb";
import {
  isNumberArray,
  isPlaylists,
  isStringArray,
  loadJSON,
  saveJSON,
  type Playlist,
} from "@/lib/storage";

declare module "@tanstack/react-router" {
  interface HistoryState {
    player?: boolean;
  }
}

const DEFAULT_PLAYLISTS: Playlist[] = [{ id: "demo-correr", name: "Para correr", ids: [2, 3, 5] }];
const KEYS = {
  favs: "sonora:favs",
  playlists: "sonora:playlists",
  recent: "sonora:recent",
  stats: "sonora:stats",
} as const;

const isRecord = (v: unknown): v is Record<string, number> =>
  typeof v === "object" && v !== null && Object.values(v).every((x) => typeof x === "number");
const isStats = (v: unknown): v is Stats =>
  typeof v === "object" &&
  v !== null &&
  isRecord((v as Stats).seconds) &&
  isRecord((v as Stats).plays);

const PALETTE: [string, string][] = [
  ["#ff2d55", "#5e2bff"],
  ["#0a84ff", "#30d158"],
  ["#ff9f0a", "#ff375f"],
  ["#64d2ff", "#5856d6"],
];
const toTrack = (s: StoredTrack): Track => ({
  id: s.id,
  title: s.title,
  artist: "Importada",
  album: "Minhas músicas",
  genre: "Importada",
  colors: s.colors,
  src: URL.createObjectURL(s.blob),
});

export type Sleep = { mode: "off" } | { mode: "time"; endsAt: number } | { mode: "track" };

type PlayerCtx = {
  track: Track;
  queue: Track[];
  idx: number;
  playing: boolean;
  time: number;
  dur: number;
  shuffle: boolean;
  repeat: boolean;
  full: boolean;
  favs: number[];
  playlists: Playlist[];
  recent: string[];
  stats: Stats;
  imported: Track[];
  library: Track[];
  sleep: Sleep;
  sleepLeft: number;
  setSleep: (v: number | "track" | null) => void;
  playNext: (t: Track) => void;
  moveInQueue: (from: number, to: number) => void;
  removeFromQueue: (i: number) => void;
  importFiles: (files: FileList | File[]) => Promise<void>;
  deleteImported: (id: number) => void;
  playTrack: (t: Track, list?: Track[]) => void;
  playAt: (i: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (s: number) => void;
  setShuffle: (v: boolean) => void;
  setRepeat: (v: boolean) => void;
  openFull: () => void;
  closeFull: () => void;
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (pid: string, tid: number) => void;
  removeFromPlaylist: (pid: string, tid: number) => void;
  addRecent: (q: string) => void;
  resetData: () => void;
};

const Ctx = createContext<PlayerCtx | null>(null);

export function usePlayer(): PlayerCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer precisa estar dentro de PlayerProvider");
  return c;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const audio = useRef<HTMLAudioElement>(null);
  const wantPlay = useRef(false);
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [idx, setIdx] = useState(0);
  const [nonce, setNonce] = useState(0); // força recarregar mesmo se a faixa se repetir
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [favs, setFavs] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [recent, setRecent] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const statsRef = useRef<Stats>(EMPTY_STATS);
  const statsDirty = useRef(false);
  const lastTime = useRef(0);
  const countedNonce = useRef(-1);
  const [imported, setImported] = useState<Track[]>([]);
  const [sleep, setSleepState] = useState<Sleep>({ mode: "off" });
  const [now, setNow] = useState(0);
  const full = useRouterState({ select: (s) => s.location.state.player === true });
  const track = (queue[idx] ?? TRACKS[0])!;

  // Persistência
  useEffect(() => {
    setFavs(loadJSON(KEYS.favs, [], isNumberArray));
    setPlaylists(loadJSON(KEYS.playlists, DEFAULT_PLAYLISTS, isPlaylists));
    setRecent(loadJSON(KEYS.recent, [], isStringArray));
    const st = loadJSON(KEYS.stats, EMPTY_STATS, isStats);
    statsRef.current = st;
    setStats(st);
    setLoaded(true);
    let urls: string[] = [];
    if (typeof indexedDB !== "undefined")
      listStored()
        .then((list) => {
          const ts = list.map(toTrack);
          urls = ts.map((t) => t.src);
          setImported(ts);
        })
        .catch(() => undefined);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  // Estatísticas: acumula em ref e grava a cada 5s
  useEffect(() => {
    const flush = () => {
      if (!statsDirty.current) return;
      statsDirty.current = false;
      setStats(statsRef.current);
      saveJSON(KEYS.stats, statsRef.current);
    };
    const id = window.setInterval(flush, 5000);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.favs, favs);
  }, [favs, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.playlists, playlists);
  }, [playlists, loaded]);
  useEffect(() => {
    if (loaded) saveJSON(KEYS.recent, recent);
  }, [recent, loaded]);

  // Carrega a faixa atual
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.src = track.src;
    a.currentTime = 0;
    setTime(0);
    setDur(0);
    lastTime.current = 0;
    if (wantPlay.current) a.play().catch(() => undefined); // falhas chegam via onError / onPause
  }, [track.src, nonce]);

  const goTo = useCallback((i: number, list?: Track[]) => {
    wantPlay.current = true;
    if (list) setQueue(list);
    setIdx(i);
    setNonce((n) => n + 1);
  }, []);

  const playTrack = useCallback(
    (t: Track, list: Track[] = TRACKS) => {
      goTo(
        Math.max(
          0,
          list.findIndex((x) => x.id === t.id),
        ),
        list,
      );
    },
    [goTo],
  );

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      wantPlay.current = true;
      a.play().catch(() => undefined);
    } else {
      wantPlay.current = false;
      a.pause();
    }
  }, []);

  const next = useCallback(
    () => goTo(nextIndex(idx, queue.length, shuffle)),
    [goTo, idx, queue.length, shuffle],
  );
  const prev = useCallback(() => {
    const a = audio.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    goTo((idx - 1 + queue.length) % queue.length);
  }, [goTo, idx, queue.length]);
  const seek = useCallback((s: number) => {
    if (audio.current) audio.current.currentTime = s;
  }, []);

  // Media Session (tela de bloqueio)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
    });
    const set = (a: MediaSessionAction, h: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(a, h);
      } catch {
        /* não suportado */
      }
    };
    set("play", () => {
      wantPlay.current = true;
      audio.current?.play().catch(() => undefined);
    });
    set("pause", () => {
      wantPlay.current = false;
      audio.current?.pause();
    });
    set("nexttrack", next);
    set("previoustrack", prev);
    return () => {
      (["play", "pause", "nexttrack", "previoustrack"] as const).forEach((a) => set(a, null));
    };
  }, [track, next, prev]);
  useEffect(() => {
    if (typeof navigator !== "undefined" && "mediaSession" in navigator)
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  // Timer de sono
  const sleepActive = sleep.mode === "time";
  useEffect(() => {
    if (!sleepActive) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [sleepActive]);
  const sleepLeft = sleep.mode === "time" ? sleepRemaining(sleep.endsAt, now || Date.now()) : 0;
  const fadeOutAndPause = useCallback(() => {
    const a = audio.current;
    setSleepState({ mode: "off" });
    wantPlay.current = false;
    if (!a) return;
    const start = a.volume;
    let step = 0;
    const id = window.setInterval(() => {
      step++;
      a.volume = Math.max(0, start * (1 - step / 15));
      if (step >= 15) {
        window.clearInterval(id);
        a.pause();
        a.volume = start;
        toast("Timer de sono: música pausada");
      }
    }, 200);
  }, []);
  useEffect(() => {
    if (sleep.mode === "time" && now && sleepLeft === 0) fadeOutAndPause();
  }, [sleep.mode, now, sleepLeft, fadeOutAndPause]);
  const setSleep = useCallback((v: number | "track" | null) => {
    if (v === null) setSleepState({ mode: "off" });
    else if (v === "track") setSleepState({ mode: "track" });
    else {
      setNow(Date.now());
      setSleepState({ mode: "time", endsAt: Date.now() + v * 60_000 });
    }
  }, []);

  const applyQ = useCallback((r: { queue: Track[]; idx: number }) => {
    setQueue(r.queue);
    setIdx(r.idx);
  }, []);
  const playNext = useCallback(
    (t: Track) => {
      applyQ(insertNext(queue, idx, t));
      toast(`“${t.title}” vai tocar a seguir`);
    },
    [applyQ, queue, idx],
  );
  const moveInQueue = useCallback(
    (from: number, to: number) => applyQ(moveQ(queue, idx, from, to)),
    [applyQ, queue, idx],
  );
  const removeFromQueue = useCallback(
    (i: number) => applyQ(removeQ(queue, idx, i)),
    [applyQ, queue, idx],
  );

  const importFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("audio/"));
    if (!list.length) {
      toast.error("Escolha arquivos de áudio");
      return;
    }
    const added: Track[] = [];
    for (const [i, f] of list.entries()) {
      const st: StoredTrack = {
        id: Date.now() + i,
        title: f.name.replace(/\.[^.]+$/, ""),
        blob: f,
        colors: PALETTE[(f.name.length + i) % PALETTE.length]!,
      };
      try {
        await putStored(st);
        added.push(toTrack(st));
      } catch {
        toast.error(`Não foi possível importar ${f.name}`);
      }
    }
    if (added.length) {
      setImported((im) => [...im, ...added]);
      toast.success(added.length === 1 ? "Música importada" : `${added.length} músicas importadas`);
    }
  }, []);
  const deleteImported = useCallback(
    (id: number) => {
      if (track.id === id) {
        toast.error("Troque de música antes de apagar esta");
        return;
      }
      deleteStored(id).catch(() => undefined);
      setImported((im) => {
        const t = im.find((x) => x.id === id);
        if (t) URL.revokeObjectURL(t.src);
        return im.filter((x) => x.id !== id);
      });
      setQueue((q) => {
        const i = q.findIndex((x) => x.id === id);
        if (i < 0) return q;
        setIdx((cur) => (i < cur ? cur - 1 : cur));
        return q.filter((x) => x.id !== id);
      });
    },
    [track.id],
  );
  const library = useMemo(() => [...TRACKS, ...imported], [imported]);

  const openFull = useCallback(() => {
    if (router.state.location.state.player) return;
    void router.navigate({
      to: router.state.location.pathname,
      state: (prev) => ({ ...prev, player: true }),
    });
  }, [router]);
  const closeFull = useCallback(() => {
    if (router.state.location.state.player) router.history.back();
  }, [router]);

  const toggleFav = useCallback(
    (id: number) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    [],
  );
  const createPlaylist = useCallback((name: string) => {
    setPlaylists((p) => [...p, { id: `pl-${Date.now()}`, name, ids: [] }]);
  }, []);
  const addToPlaylist = useCallback(
    (pid: string, tid: number) =>
      setPlaylists((ps) =>
        ps.map((p) => (p.id === pid && !p.ids.includes(tid) ? { ...p, ids: [...p.ids, tid] } : p)),
      ),
    [],
  );
  const removeFromPlaylist = useCallback(
    (pid: string, tid: number) =>
      setPlaylists((ps) =>
        ps.map((p) => (p.id === pid ? { ...p, ids: p.ids.filter((x) => x !== tid) } : p)),
      ),
    [],
  );
  const addRecent = useCallback((q: string) => {
    const v = q.trim();
    if (v) setRecent((r) => [v, ...r.filter((x) => x !== v)].slice(0, 5));
  }, []);

  const resetData = useCallback(() => {
    setFavs([]);
    setPlaylists(DEFAULT_PLAYLISTS);
    setRecent([]);
    statsRef.current = EMPTY_STATS;
    statsDirty.current = false;
    setStats(EMPTY_STATS);
    try {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // armazenamento bloqueado: os estados já foram resetados
    }
  }, []);

  const value = useMemo<PlayerCtx>(
    () => ({
      track,
      queue,
      idx,
      playing,
      time,
      dur,
      shuffle,
      repeat,
      full,
      favs,
      playlists,
      recent,
      stats,
      imported,
      library,
      sleep,
      sleepLeft,
      setSleep,
      playNext,
      moveInQueue,
      removeFromQueue,
      importFiles,
      deleteImported,
      playTrack,
      playAt: (i) => goTo(i),
      toggle,
      next,
      prev,
      seek,
      setShuffle,
      setRepeat,
      openFull,
      closeFull,
      isFav: (id) => favs.includes(id),
      toggleFav,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      addRecent,
      resetData,
    }),
    [
      track,
      queue,
      idx,
      playing,
      time,
      dur,
      shuffle,
      repeat,
      full,
      favs,
      playlists,
      recent,
      stats,
      imported,
      library,
      sleep,
      sleepLeft,
      setSleep,
      playNext,
      moveInQueue,
      removeFromQueue,
      importFiles,
      deleteImported,
      playTrack,
      goTo,
      toggle,
      next,
      prev,
      seek,
      openFull,
      closeFull,
      toggleFav,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      addRecent,
      resetData,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      <audio
        ref={audio}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          if (countedNonce.current !== nonce) {
            countedNonce.current = nonce;
            const k = String(track.id);
            const s = statsRef.current;
            statsRef.current = { ...s, plays: { ...s.plays, [k]: (s.plays[k] ?? 0) + 1 } };
            statsDirty.current = true;
          }
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          if (!audio.current?.getAttribute("src")) return;
          wantPlay.current = false;
          setPlaying(false);
          toast.error("Não foi possível tocar");
        }}
        onTimeUpdate={(e) => {
          const cur = e.currentTarget.currentTime;
          const d = cur - lastTime.current;
          lastTime.current = cur;
          if (!e.currentTarget.paused && d > 0 && d < 2) {
            const k = String(track.id);
            const s = statsRef.current;
            statsRef.current = { ...s, seconds: { ...s.seconds, [k]: (s.seconds[k] ?? 0) + d } };
            statsDirty.current = true;
          }
          setTime(cur);
        }}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => {
          if (sleep.mode === "track") {
            wantPlay.current = false;
            setSleepState({ mode: "off" });
            toast("Timer de sono: música pausada");
            return;
          }
          if (repeat) {
            seek(0);
            audio.current?.play().catch(() => undefined);
          } else next();
        }}
      />
      {children}
    </Ctx.Provider>
  );
}
