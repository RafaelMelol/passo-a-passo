interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  /** Classe de cor da barra (padrão: azul principal). */
  barClassName?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, max = 100, label, barClassName = "bg-brand", showValue = false }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        className="h-3 flex-1 overflow-hidden rounded-full bg-line/70"
      >
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
      {showValue && <span className="w-12 text-right text-sm font-bold text-ink-soft">{percent}%</span>}
    </div>
  );
}
