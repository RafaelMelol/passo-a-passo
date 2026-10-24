import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon: ReactNode;
}

export function StatTile({ label, value, detail, icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-ink-soft">
        <span className="text-brand [&_svg]:size-5">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink sm:text-3xl">{value}</div>
      {detail && <div className="text-sm text-ink-soft">{detail}</div>}
    </div>
  );
}
