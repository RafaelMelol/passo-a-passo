"use client";

import { Footprints } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontSizeControl } from "./FontSizeControl";
import { NAV_ITEMS, isActivePath } from "./nav-items";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
            <Footprints aria-hidden className="size-6" />
          </span>
          <span className="whitespace-nowrap leading-tight">
            <span className="block text-lg font-bold">Passo a Passo</span>
            <span className="hidden text-sm text-ink-soft sm:block xl:hidden 2xl:block">Estudos para concurso · nível fundamental</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 font-bold ${
                      active ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-page hover:text-ink"
                    }`}
                  >
                    <item.icon aria-hidden className="size-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <FontSizeControl />
      </div>
    </header>
  );
}
