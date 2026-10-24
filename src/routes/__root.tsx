import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PlayerProvider } from "@/player/PlayerProvider";
import { MiniPlayer } from "@/components/music/MiniPlayer";
import { TabBar } from "@/components/music/TabBar";
import { FullPlayer } from "@/components/music/FullPlayer";
import { AmbientBackground } from "@/components/music/AmbientBackground";
import { Toaster } from "@/components/ui/sonner";
import { Settings as SettingsIcon } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente recarregar ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonora" },
      { name: "description", content: "Ouça música com um player imersivo" },
      { property: "og:title", content: "Sonora" },
      { property: "og:description", content: "Ouça música com um player imersivo" },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <div className="min-h-dvh bg-muted/40 flex justify-center">
          <div className="relative w-full max-w-[430px] h-dvh bg-background text-foreground font-sans overflow-hidden shadow-2xl">
            <AmbientBackground />
            <main className="relative h-dvh overflow-y-auto px-5 pt-12 pb-[calc(10rem+env(safe-area-inset-bottom))]">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </main>
            <Link
              to="/configuracoes"
              aria-label="Configurações"
              className="absolute right-3 top-3 z-30 rounded-full border border-border bg-card/80 p-2 text-foreground shadow-sm backdrop-blur-xl"
            >
              <SettingsIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
            <MiniPlayer />
            <TabBar />
            <FullPlayer />
          </div>
        </div>
        <Toaster position="top-center" />
      </PlayerProvider>
    </QueryClientProvider>
  );
}
