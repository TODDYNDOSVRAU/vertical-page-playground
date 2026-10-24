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
import { nextIndex } from "@/player/logic";
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
} as const;

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
  const full = useRouterState({ select: (s) => s.location.state.player === true });
  const track = (queue[idx] ?? TRACKS[0])!;

  // Persistência
  useEffect(() => {
    setFavs(loadJSON(KEYS.favs, [], isNumberArray));
    setPlaylists(loadJSON(KEYS.playlists, DEFAULT_PLAYLISTS, isPlaylists));
    setRecent(loadJSON(KEYS.recent, [], isStringArray));
    setLoaded(true);
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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          if (!audio.current?.getAttribute("src")) return;
          wantPlay.current = false;
          setPlaying(false);
          toast.error("Não foi possível tocar");
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => {
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
