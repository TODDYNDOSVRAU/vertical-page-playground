import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Páginas — Editor mobile" },
      { name: "description", content: "Crie e edite páginas direto no celular." },
      { property: "og:title", content: "Páginas — Editor mobile" },
      { property: "og:description", content: "Crie e edite páginas direto no celular." },
    ],
  }),
  component: Index,
});

type BlockType = "titulo" | "texto" | "imagem" | "botao";
type Block = { id: string; type: BlockType; value: string };
type Page = { id: string; name: string; blocks: Block[] };

const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = "mobile-pages-v1";
const labels: Record<BlockType, string> = { titulo: "Título", texto: "Texto", imagem: "Imagem (URL)", botao: "Botão" };

function Index() {
  const [pages, setPages] = useState<Page[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setPages(raw ? JSON.parse(raw) : [{ id: uid(), name: "Início", blocks: [{ id: uid(), type: "titulo", value: "Bem-vindo" }, { id: uid(), type: "texto", value: "Toque para editar este texto." }] }]);
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(pages)); }, [pages, loaded]);

  const page = pages.find((p) => p.id === openId);
  const update = (fn: (p: Page) => Page) => setPages((ps) => ps.map((p) => (p.id === openId ? fn(p) : p)));

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card/90 px-4 py-4 backdrop-blur">
        {page && <button onClick={() => { setOpenId(null); setPreview(false); }} className="text-2xl text-primary">‹</button>}
        {page ? (
          <input value={page.name} onChange={(e) => update((p) => ({ ...p, name: e.target.value }))} className="flex-1 bg-transparent font-display text-xl outline-none" />
        ) : (
          <h1 className="flex-1 font-display text-2xl">Minhas páginas</h1>
        )}
        {page && <button onClick={() => setPreview(!preview)} className="rounded-full bg-secondary px-3 py-1 text-sm">{preview ? "Editar" : "Ver"}</button>}
      </header>

      <main className="flex-1 space-y-3 p-4 pb-28">
        {!page && pages.map((p) => (
          <div key={p.id} className="flex items-center rounded-2xl border bg-card p-4 shadow-soft">
            <button onClick={() => setOpenId(p.id)} className="flex-1 text-left">
              <div className="font-display text-lg">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.blocks.length} blocos</div>
            </button>
            <button onClick={() => confirm("Excluir página?") && setPages(pages.filter((x) => x.id !== p.id))} className="px-2 text-muted-foreground">✕</button>
          </div>
        ))}

        {page && preview && page.blocks.map((b) => <Render key={b.id} b={b} />)}

        {page && !preview && page.blocks.map((b, i) => (
          <div key={b.id} className="rounded-2xl border bg-card p-3 shadow-soft">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              {labels[b.type]}
              <div className="flex gap-3 text-base">
                <button disabled={i === 0} onClick={() => update((p) => { const bl = [...p.blocks]; [bl[i - 1], bl[i]] = [bl[i], bl[i - 1]]; return { ...p, blocks: bl }; })}>↑</button>
                <button disabled={i === page.blocks.length - 1} onClick={() => update((p) => { const bl = [...p.blocks]; [bl[i + 1], bl[i]] = [bl[i], bl[i + 1]]; return { ...p, blocks: bl }; })}>↓</button>
                <button onClick={() => update((p) => ({ ...p, blocks: p.blocks.filter((x) => x.id !== b.id) }))}>✕</button>
              </div>
            </div>
            <textarea value={b.value} rows={b.type === "texto" ? 3 : 1}
              onChange={(e) => update((p) => ({ ...p, blocks: p.blocks.map((x) => (x.id === b.id ? { ...x, value: e.target.value } : x)) }))}
              className="w-full resize-none rounded-lg bg-muted p-2 outline-none" />
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t bg-card/95 p-3 backdrop-blur">
        {!page ? (
          <button onClick={() => { const p = { id: uid(), name: "Nova página", blocks: [] }; setPages([...pages, p]); setOpenId(p.id); }}
            className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground shadow-soft">+ Nova página</button>
        ) : !preview && (
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(labels) as BlockType[]).map((t) => (
              <button key={t} onClick={() => update((p) => ({ ...p, blocks: [...p.blocks, { id: uid(), type: t, value: t === "imagem" ? "https://picsum.photos/600/400" : labels[t] }] }))}
                className="rounded-xl bg-secondary py-3 text-xs font-medium">+ {labels[t].split(" ")[0]}</button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

function Render({ b }: { b: Block }) {
  if (b.type === "titulo") return <h2 className="font-display text-3xl">{b.value}</h2>;
  if (b.type === "imagem") return <img src={b.value} alt="" className="w-full rounded-2xl" />;
  if (b.type === "botao") return <button className="w-full rounded-2xl bg-primary py-3 text-primary-foreground">{b.value}</button>;
  return <p className="whitespace-pre-wrap text-foreground/80">{b.value}</p>;
}
