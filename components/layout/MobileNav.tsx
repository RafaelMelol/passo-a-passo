"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActivePath } from "./nav-items";

/** Barra de navegação fixa no rodapé, só em telas pequenas. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal (celular)" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface xl:hidden">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-bold ${
                  active ? "text-brand" : "text-ink-soft"
                }`}
              >
                <span className={`rounded-full px-3 py-1 ${active ? "bg-brand-soft" : ""}`}>
                  <item.icon aria-hidden className="size-6" />
                </span>
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
