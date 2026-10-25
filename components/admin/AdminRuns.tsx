"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { adminFetch, formatDateTime, RUN_STATUS_LABEL, type AdminRun } from "./admin-api";

const STAT_LABELS: [string, string][] = [
  ["sourcesChecked", "fontes consultadas"],
  ["sourcesOk", "fontes ok"],
  ["documentsNew", "documentos novos"],
  ["documentsFetched", "documentos baixados"],
  ["examsFound", "provas encontradas"],
  ["questionsExtracted", "questões extraídas"],
  ["questionsPublished", "publicadas"],
  ["questionsPending", "aguardando revisão"],
  ["questionsRejected", "rejeitadas"],
  ["duplicates", "duplicidades"],
  ["revisions", "alterações de gabarito"],
];

export function AdminRuns() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AdminRun[]; total: number; pageSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminFetch<{ items: AdminRun[]; total: number; pageSize: number }>(`/api/admin/crawler/runs?pagina=${page}&porPagina=10`)
      .then((result) => active && setData(result))
      .catch((err: unknown) => active && setError(err instanceof Error ? err.message : "Erro ao carregar."));
    return () => {
      active = false;
    };
  }, [page]);

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!data) return <LoadingState label="Carregando execuções…" />;
  if (data.items.length === 0) return <Notice tone="info">Nenhuma execução registrada ainda.</Notice>;

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  return (
    <div className="space-y-3">
      {data.items.map((run) => (
        <Card key={run.id} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">
              {formatDateTime(run.startedAt)} · {RUN_STATUS_LABEL[run.status] ?? run.status}
            </h3>
            <span className="text-sm text-ink-soft">
              {run.trigger === "cron" ? "agendada" : run.trigger === "manual" ? "manual (painel)" : "linha de comando"}
              {run.durationMs !== null ? ` · ${Math.round(run.durationMs / 1000)} s` : ""}
            </span>
          </div>
          <p className="text-sm text-ink-soft">
            {STAT_LABELS.map(([key, label]) => `${typeof run.stats[key] === "number" ? run.stats[key] : 0} ${label}`).join(" · ")}
          </p>
          {run.sources.length > 0 && (
            <p className="text-sm">
              Fontes: {run.sources.map((source) => `${source.sourceId} (${source.status}${source.error ? `: ${source.error}` : ""})`).join("; ")}
            </p>
          )}
          {(run.errors.length > 0 || run.warnings.length > 0) && (
            <details>
              <summary className="cursor-pointer font-bold text-brand">
                {run.errors.length} erro(s) e {run.warnings.length} aviso(s)
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {run.errors.map((item, index) => (
                  <li key={`e${index}`} className="text-danger">
                    {item}
                  </li>
                ))}
                {run.warnings.map((item, index) => (
                  <li key={`w${index}`}>{item}</li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      ))}
      <div className="flex items-center gap-3">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
          Anteriores
        </Button>
        <span className="text-ink-soft">
          Página {page} de {pages}
        </span>
        <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>
          Seguintes
        </Button>
      </div>
    </div>
  );
}
