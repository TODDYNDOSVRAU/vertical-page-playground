import { useState } from "react";
import { toast } from "sonner";
import { TRACKS } from "@/data/tracks";
import { usePlayer } from "@/player/PlayerProvider";
import { H1, H2 } from "@/components/music/Headings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SettingsTab() {
  const { favs, playlists, recent, resetData } = usePlayer();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = [
    { label: "Favoritas", value: favs.length },
    { label: "Playlists", value: playlists.length },
    { label: "Buscas recentes", value: recent.length },
  ];

  const confirm = () => {
    resetData();
    setConfirmOpen(false);
    toast.success("Dados apagados");
  };

  return (
    <>
      <H1>Configurações</H1>

      <H2>Sobre</H2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Sonora é um app de demonstração: as {TRACKS.length} faixas são áudios demo e não há
        login nem contas. Tudo que você salva (favoritas, playlists e buscas) fica apenas
        neste navegador.
      </p>

      <H2>Dados salvos neste navegador</H2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{r.label}</span>
            <span className="text-sm text-muted-foreground">{r.value}</span>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="destructive"
        className="mt-3 w-full"
        onClick={() => setConfirmOpen(true)}
      >
        Limpar dados salvos
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar dados salvos?</DialogTitle>
            <DialogDescription>
              Favoritas, playlists e buscas recentes serão apagadas deste navegador. As faixas
              demo continuam disponíveis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirm}>
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
