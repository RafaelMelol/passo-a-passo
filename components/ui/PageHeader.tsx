import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  icon?: ReactNode;
}

export function PageHeader({ title, description, back, icon }: PageHeaderProps) {
  return (
    <header className="mb-6 space-y-2">
      {back && (
        <Link
          href={back.href}
          className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 font-bold text-brand hover:underline"
        >
          <ChevronLeft aria-hidden className="size-5" />
          {back.label}
        </Link>
      )}
      <div className="flex items-center gap-3">
        {icon && <span className="text-brand [&_svg]:size-8">{icon}</span>}
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
      </div>
      {description && <div className="max-w-prose text-lg text-ink-soft">{description}</div>}
    </header>
  );
}
