import { createFileRoute } from "@tanstack/react-router";
import { RadioTab } from "@/features/radio/RadioTab";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/radio")({
  head: () => pageHead("/radio", "Rádio — Sonora", "Estações por gênero."),
  component: RadioTab,
});
