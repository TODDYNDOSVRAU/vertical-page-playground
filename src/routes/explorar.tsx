import { createFileRoute } from "@tanstack/react-router";
import { Browse } from "@/features/explorar/Browse";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/explorar")({
  head: () => pageHead("/explorar", "Explorar — Sonora", "Gêneros e faixas em alta."),
  component: Browse,
});
