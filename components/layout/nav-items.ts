import { BookOpenText, ChartColumn, ClipboardList, FileText, House, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Início", shortLabel: "Início", icon: House },
  { href: "/estudar", label: "Estudar", shortLabel: "Estudar", icon: BookOpenText },
  { href: "/simulado", label: "Simulado", shortLabel: "Simulado", icon: ClipboardList },
  { href: "/desempenho", label: "Desempenho", shortLabel: "Progresso", icon: ChartColumn },
  { href: "/provas-oficiais", label: "Provas oficiais", shortLabel: "Provas", icon: FileText },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/estudar") return pathname.startsWith("/estudar") || pathname.startsWith("/praticar");
  return pathname === href || pathname.startsWith(`${href}/`);
}
