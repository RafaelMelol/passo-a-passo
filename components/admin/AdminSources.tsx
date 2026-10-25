"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { adminFetch, formatDateTime, type AdminOverviewData, type AdminSource } from "./admin-api";

const HEALTH: Record<string, { label: string; className: string }> = {
  ok: { label: "Funcionando", className: "bg-success-soft text-success" },
  degraded: { label: "Com avisos", className: "bg-warning-soft text-warning" },
  failing: { label: "Falhando", className: "bg-danger-soft text-danger" },
  disabled: { label: "Desativada", className: "bg-page text-ink-soft" },
  unknown: { label: "Sem execução ainda", className: "bg-brand-soft text-brand" },
};

export function AdminSources() {
  const [sources, setSources] = useState<AdminSource[] | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    adminFetch<AdminOverviewData>("/api/admin/crawler/overview")
      .then((data) => active && setSources(data.sources))
      .catch((error: unknown) => active && setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro ao carregar." }));
    return () => {
      active = false;
    };
  }, []);

  async function toggle(source: AdminSource, enabled: boolean) {
    setMessage(null);
    try {
      await adminFetch(`/api/admin/crawler/sources/${encodeURIComponent(source.id)}`, { method: "PATCH", json: { enabled } });
      setSources((current) => current?.map((item) => (item.id === source.id ? { ...item, enabled, health: enabled ? "unknown" : "disabled" } : item)) ?? null);
      setMessage({ tone: "success", text: `${source.name}: ${enabled ? "ativada" : "desativada"}.` });
    } catch (error) {
      setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro." });
    }
  }

  if (!sources) return message ? <Notice tone={message.tone}>{message.text}</Notice> : <LoadingState label="Carregando fontes…" />;

  return (
    <div className="space-y-4">
      {message && (
        <Notice tone={message.tone} role="status">
          {message.text}
        </Notice>
      )}
      {sources.map((source) => {
        const health = HEALTH[source.health] ?? HEALTH.unknown;
        return (
          <Card key={source.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{source.name}</h3>
                <p className="text-sm text-ink-soft">
                  {source.kind} · {source.frequency} · hosts: {source.allowedHosts.join(", ") || "—"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${health.className}`}>{health.label}</span>
            </div>
            <p>{source.strategy}</p>
            {source.automationAllowed ? (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
                <input type="checkbox" checked={source.enabled} onChange={(event) => toggle(source, event.target.checked)} className="size-6 accent-brand" />
                Coleta automática {source.enabled ? "ativada" : "desativada"}
              </label>
            ) : (
              <Notice tone="warning" title="Coleta automática não permitida">
                {source.automationNote} Use a aba “Importar”.
              </Notice>
            )}
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="inline text-ink-soft">Última coleta bem-sucedida: </dt>
                <dd className="inline font-bold">{formatDateTime(source.lastSuccessAt)}</dd>
              </div>
              <div>
                <dt className="inline text-ink-soft">Próxima coleta prevista: </dt>
                <dd className="inline font-bold">{formatDateTime(source.nextRunAt)}</dd>
              </div>
              <div>
                <dt className="inline text-ink-soft">Falhas seguidas: </dt>
                <dd className="inline font-bold">{source.consecutiveFailures}</dd>
              </div>
              <div>
                <dt className="inline text-ink-soft">Limites: </dt>
                <dd className="inline font-bold">
                  {source.rateLimit.minIntervalMs / 1000}s entre requisições, até {source.rateLimit.maxRequestsPerRun} requisições e{" "}
                  {source.rateLimit.maxDownloadsPerRun} downloads por execução
                </dd>
              </div>
            </dl>
            {source.lastError && <p className="text-sm text-danger">Último erro: {source.lastError}</p>}
            <details className="rounded-xl border border-line">
              <summary className="flex min-h-11 cursor-pointer items-center px-3 font-bold text-brand">Política de reutilização e robots.txt</summary>
              <div className="space-y-2 p-3 pt-0 text-sm">
                <p>
                  <strong>Reutilização ({source.reusePolicy.mode}):</strong> {source.reusePolicy.summary}
                </p>
                {source.reusePolicy.license && <p>Licença: {source.reusePolicy.license}</p>}
                {source.reusePolicy.termsUrl && (
                  <ExternalLink href={source.reusePolicy.termsUrl} className="font-bold text-brand underline">
                    Termos de uso
                  </ExternalLink>
                )}
                <p>
                  <strong>robots.txt:</strong> {source.robots.summary} (verificado em {source.robots.checkedAt})
                </p>
              </div>
            </details>
          </Card>
        );
      })}
    </div>
  );
}
