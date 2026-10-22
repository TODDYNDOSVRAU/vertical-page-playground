/** Leitura/escrita segura no localStorage. Chame só no navegador (efeitos ou handlers). */
export function loadJSON<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // armazenamento cheio ou bloqueado: ignora
  }
}

export type Playlist = { id: string; name: string; ids: number[] };

export const isNumberArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((x) => typeof x === "number");
export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export const isPlaylists = (v: unknown): v is Playlist[] =>
  Array.isArray(v) &&
  v.every(
    (p) =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as Playlist).id === "string" &&
      typeof (p as Playlist).name === "string" &&
      isNumberArray((p as Playlist).ids),
  );
