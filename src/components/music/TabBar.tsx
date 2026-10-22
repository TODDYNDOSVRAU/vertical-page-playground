import { Link } from "@tanstack/react-router";
import { LayoutGrid, Library, Play, Radio, Search } from "lucide-react";

const TABS = [
  { to: "/", label: "Ouvir Agora", Icon: Play },
  { to: "/explorar", label: "Explorar", Icon: LayoutGrid },
  { to: "/radio", label: "Rádio", Icon: Radio },
  { to: "/biblioteca", label: "Biblioteca", Icon: Library },
  { to: "/buscar", label: "Buscar", Icon: Search },
] as const;

export function TabBar() {
  return (
    <nav
      aria-label="Abas"
      className="absolute bottom-0 inset-x-0 h-[calc(72px+env(safe-area-inset-bottom))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-card/85 backdrop-blur-xl border-t border-border grid grid-cols-5"
    >
      {TABS.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: true }}
          className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground data-[status=active]:text-primary"
          activeProps={{ "aria-current": "page" }}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
