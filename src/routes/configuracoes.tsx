import { createFileRoute } from "@tanstack/react-router";
import { SettingsTab } from "@/features/configuracoes/SettingsTab";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/configuracoes")({
  head: () =>
    pageHead(
      "/configuracoes",
      "Configurações — Sonora",
      "Dados salvos neste navegador e informações do app.",
    ),
  component: SettingsTab,
});
