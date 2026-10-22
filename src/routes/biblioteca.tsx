import { createFileRoute } from "@tanstack/react-router";
import { LibraryTab } from "@/features/biblioteca/LibraryTab";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/biblioteca")({
  head: () =>
    pageHead("/biblioteca", "Biblioteca — Sonora", "Suas playlists, artistas e favoritas."),
  component: LibraryTab,
});
