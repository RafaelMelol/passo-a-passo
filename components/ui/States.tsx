import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Carregando seus dados…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-48 flex-col items-center justify-center gap-3 text-ink-soft">
      <LoaderCircle aria-hidden className="size-8 animate-spin text-brand motion-reduce:animate-none" />
      <p>{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
      <div className="text-brand [&_svg]:size-10">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <div className="max-w-prose text-ink-soft">{description}</div>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
