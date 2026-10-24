/** Músicas importadas do aparelho, salvas no IndexedDB do navegador. Chame só no navegador. */
export type StoredTrack = { id: number; title: string; blob: Blob; colors: [string, string] };

const DB = "sonora";
const STORE = "tracks";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => res(req.result as T);
    req.onerror = () => rej(req.error);
  });
}

export const listStored = () => run<StoredTrack[]>("readonly", (s) => s.getAll());
export const putStored = (t: StoredTrack) => run<unknown>("readwrite", (s) => s.put(t));
export const deleteStored = (id: number) => run<unknown>("readwrite", (s) => s.delete(id));
