import { CircleCheck, Info, TriangleAlert, CircleX } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: "bg-brand-soft border-brand/25 text-ink", icon: <Info aria-hidden className="size-6 shrink-0 text-brand" /> },
  success: { box: "bg-success-soft border-success/30 text-ink", icon: <CircleCheck aria-hidden className="size-6 shrink-0 text-success" /> },
  warning: { box: "bg-warning-soft border-warning/30 text-ink", icon: <TriangleAlert aria-hidden className="size-6 shrink-0 text-warning" /> },
  danger: { box: "bg-danger-soft border-danger/30 text-ink", icon: <CircleX aria-hidden className="size-6 shrink-0 text-danger" /> },
};

interface NoticeProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}

export function Notice({ tone = "info", title, children, className = "", role }: NoticeProps) {
  const style = tones[tone];
  return (
    <div role={role} className={`flex gap-3 rounded-xl border p-4 ${style.box} ${className}`}>
      {style.icon}
      <div className="min-w-0 space-y-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="text-ink-soft [&_a]:font-bold [&_a]:text-brand [&_a]:underline">{children}</div>}
      </div>
    </div>
  );
}
