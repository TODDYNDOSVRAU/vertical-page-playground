import { createFileRoute } from "@tanstack/react-router";
import { SearchTab } from "@/features/buscar/SearchTab";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/buscar")({
  head: () => pageHead("/buscar", "Buscar — Sonora", "Encontre músicas, artistas e álbuns."),
  component: SearchTab,
});
