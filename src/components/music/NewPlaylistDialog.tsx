import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePlayer } from "@/player/PlayerProvider";

export function NewPlaylistDialog() {
  const { createPlaylist } = usePlayer();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    createPlaylist(v);
    setName("");
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center gap-3 py-2 text-primary">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-secondary">
            <Plus className="h-6 w-6" aria-hidden="true" />
          </span>
          Nova playlist
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Nova playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Nome</Label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={60}
              placeholder="Minha playlist"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
