import { createFileRoute } from "@tanstack/react-router";
import { ListenNow } from "@/features/ouvir-agora/ListenNow";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("/", "Sonora — Música para ouvir agora", "Player imersivo, biblioteca e busca."),
  component: ListenNow,
});
