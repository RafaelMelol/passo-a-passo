"use client";

import { useState } from "react";
import { formatShortDate, formatWeekday } from "@/lib/format";
import type { DailyPoint } from "@/lib/history";

/**
 * Questões respondidas por dia (uma única série, cor principal).
 * Passar o mouse ou focar uma barra mostra os detalhes do dia; há também uma tabela.
 */
export function EvolutionChart({ points }: { points: DailyPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((point) => point.answered));
  const maxIndex = points.findIndex((point) => point.answered === max && max > 0);
  const totalAnswered = points.reduce((sum, point) => sum + point.answered, 0);

  if (totalAnswered === 0) {
    return <p className="text-ink-soft">Nenhuma questão respondida nos últimos {points.length} dias. Os dias de estudo aparecerão aqui.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        {/* Linhas de grade discretas */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
        </div>
        <ul className="relative flex h-40 items-end gap-0.5 border-b border-line-strong sm:gap-1" aria-label="Questões respondidas por dia">
          {points.map((point, index) => {
            const height = point.answered === 0 ? 0 : Math.max(4, (point.answered / max) * 100);
            const description = `${formatShortDate(point.date)}: ${point.answered} ${point.answered === 1 ? "questão" : "questões"}${
              point.answered > 0 ? `, ${point.correct} acertos (${point.percentage}%)` : ""
            }`;
            return (
              <li key={point.date} className="relative flex h-full flex-1 items-end justify-center">
                <button
                  type="button"
                  aria-label={description}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  className="flex h-full w-full items-end justify-center rounded-t focus-visible:outline-offset-0"
                >
                  <span
                    className={`w-full max-w-7 rounded-t bg-brand ${active === index ? "bg-brand-strong" : ""}`}
                    style={{ height: `${height}%` }}
                  />
                </button>
                {index === maxIndex && active === null && (
                  <span aria-hidden className="pointer-events-none absolute text-xs font-bold text-ink" style={{ bottom: `calc(${height}% + 2px)` }}>
                    {point.answered}
                  </span>
                )}
                {active === index && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-48 rounded-lg bg-ink px-3 py-2 text-sm text-white shadow-lg"
                  >
                    <span className="block font-bold">
                      {formatWeekday(point.date)}, {formatShortDate(point.date)}
                    </span>
                    {point.answered} {point.answered === 1 ? "questão" : "questões"}
                    {point.answered > 0 && (
                      <span className="block">
                        {point.correct} acertos ({point.percentage}%)
                      </span>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div aria-hidden className="flex justify-between text-xs text-ink-soft">
        <span>{formatShortDate(points[0].date)}</span>
        <span>hoje</span>
      </div>
      <details className="rounded-xl border border-line">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 font-bold text-brand">Ver como tabela</summary>
        <div className="overflow-x-auto p-3 pt-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-3">Dia</th>
                <th scope="col" className="py-2 pr-3">Respondidas</th>
                <th scope="col" className="py-2 pr-3">Acertos</th>
                <th scope="col" className="py-2">Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {points
                .filter((point) => point.answered > 0)
                .map((point) => (
                  <tr key={point.date} className="border-b border-line/60">
                    <td className="py-2 pr-3">{formatShortDate(point.date)}</td>
                    <td className="py-2 pr-3">{point.answered}</td>
                    <td className="py-2 pr-3">{point.correct}</td>
                    <td className="py-2">{point.percentage}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
