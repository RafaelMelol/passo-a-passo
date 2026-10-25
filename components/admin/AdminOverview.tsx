"use client";

import { CircleCheck, ClipboardList, FileText, Hourglass, Play, RefreshCw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { StatTile } from "@/components/dashboard/StatTile";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { adminFetch, formatDateTime, RUN_STATUS_LABEL, type AdminOverviewData } from "./admin-api";

export function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await adminFetch<AdminOverviewData>("/api/admin/crawler/overview"));
    } catch (error) {
      setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro ao carregar." });
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch<AdminOverviewData>("/api/admin/crawler/overview")
      .then((result) => active && setData(result))
      .catch((error: unknown) => active && setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro ao carregar." }));
    return () => {
      active = false;
    };
  }, []);

  async function act(path: string, body: unknown) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await adminFetch<{ message?: string }>(path, { json: body });
      setMessage({ tone: "success", text: result.message ?? "Feito." });
      await load();
    } catch (error) {
      setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro." });
    } finally {
      setBusy(false);
    }
  }

  if (!data) return message ? <Notice tone={message.tone}>{message.text}</Notice> : <LoadingState label="Carregando visão geral…" />;

  const last = data.lastRun;
  const activeSources = data.sources.filter((source) => source.enabled && source.automationAllowed).length;
  const failingSources = data.sources.filter((source) => source.lastError);

  return (
    <div className="space-y-5">
      {message && (
        <Notice tone={message.tone} role="status">
          {message.text}
        </Notice>
      )}
      {!data.schedule.cronSecretConfigured && (
        <Notice tone="warning" title="Agendamento diário ainda não protegido">
          CRON_SECRET não está definido; a rota de coleta agendada recusa todas as chamadas. Veja COLETOR.md.
        </Notice>
      )}

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Status da coleta</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => act("/api/admin/crawler/run", {})} disabled={busy || data.running} icon={<Play aria-hidden className="size-5" />}>
              Executar coleta agora
            </Button>
            <Button variant="secondary" onClick={load} icon={<RefreshCw aria-hidden className="size-5" />}>
              Atualizar
            </Button>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-soft">Situação</dt>
            <dd className="font-bold">{data.running ? "Coleta em andamento" : last ? RUN_STATUS_LABEL[last.status] ?? last.status : "Nenhuma execução ainda"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Última execução</dt>
            <dd className="font-bold">{last ? `${formatDateTime(last.startedAt)} (${last.trigger})` : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Próxima execução prevista</dt>
            <dd className="font-bold">
              {formatDateTime(data.schedule.nextPlannedRun)} ({data.schedule.timezone}, cron UTC “{data.schedule.utcCron}”)
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Fontes ativas</dt>
            <dd className="font-bold">
              {activeSources} de {data.sources.length}
            </dd>
          </div>
        </dl>
      </Card>

      <section aria-label="Hoje" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<FileText aria-hidden />} label="Documentos novos hoje" value={data.today.documentsNew ?? 0} />
        <StatTile icon={<ClipboardList aria-hidden />} label="Provas encontradas hoje" value={data.today.examsFound ?? 0} />
        <StatTile icon={<CircleCheck aria-hidden />} label="Questões publicadas hoje" value={data.today.questionsPublished ?? 0} />
        <StatTile icon={<Hourglass aria-hidden />} label="Pendentes de revisão" value={data.counts.openReviews} />
      </section>

      <Card className="space-y-2">
        <CardTitle>Banco central</CardTitle>
        <ul className="grid gap-1 text-ink-soft sm:grid-cols-2">
          <li>Provas publicadas: <strong className="text-ink">{data.counts.exams.published ?? 0}</strong></li>
          <li>Provas pendentes: <strong className="text-ink">{data.counts.exams.pending_validation ?? 0}</strong></li>
          <li>Provas rejeitadas: <strong className="text-ink">{data.counts.exams.rejected ?? 0}</strong></li>
          <li>Questões publicadas: <strong className="text-ink">{data.counts.questions.published ?? 0}</strong></li>
          <li>Questões pendentes: <strong className="text-ink">{data.counts.questions.pending_validation ?? 0}</strong></li>
          <li>Questões anuladas: <strong className="text-ink">{data.counts.questions.annulled ?? 0}</strong></li>
          <li>Duplicidades identificadas: <strong className="text-ink">{data.counts.duplicates}</strong></li>
          <li>Documentos com falha: <strong className="text-ink">{data.counts.failedDocuments}</strong></li>
        </ul>
      </Card>

      {(failingSources.length > 0 || data.failedDocuments.length > 0) && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Erros recentes</CardTitle>
            {data.failedDocuments.length > 0 && (
              <Button variant="secondary" onClick={() => act("/api/admin/crawler/reprocess", {})} disabled={busy} icon={<RotateCcw aria-hidden className="size-5" />}>
                Reprocessar documentos com falha
              </Button>
            )}
          </div>
          <ul className="space-y-2 text-sm">
            {failingSources.map((source) => (
              <li key={source.id}>
                <strong>{source.name}:</strong> {source.lastError}
              </li>
            ))}
            {data.failedDocuments.map((document) => (
              <li key={document.id} className="break-all">
                <strong>{document.kind}</strong> — {document.url} ({document.attempts} tentativa(s)): {document.lastError}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
