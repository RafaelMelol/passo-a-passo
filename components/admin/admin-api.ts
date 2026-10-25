"use client";

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

/** Chamada às rotas administrativas: mesmo site, cookie de sessão e respostas JSON. */
export async function adminFetch<T>(path: string, init: { method?: string; json?: unknown; form?: FormData } = {}): Promise<T> {
  const response = await fetch(path, {
    method: init.method ?? (init.json !== undefined || init.form ? "POST" : "GET"),
    credentials: "same-origin",
    headers: init.json !== undefined ? { "content-type": "application/json" } : undefined,
    body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
    cache: "no-store",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (data as { error?: { message?: string; code?: string } } | null)?.error;
    throw new AdminApiError(error?.message ?? `Erro ${response.status}.`, response.status, error?.code ?? "erro");
  }
  return data as T;
}

export interface AdminSource {
  id: string;
  name: string;
  kind: string;
  homepage: string;
  allowedHosts: string[];
  frequency: string;
  strategy: string;
  automationAllowed: boolean;
  automationNote: string | null;
  reusePolicy: { mode: string; summary: string; license?: string; termsUrl?: string; checkedAt: string };
  robots: { checkedAt: string; summary: string };
  rateLimit: { minIntervalMs: number; maxRequestsPerRun: number; maxDownloadsPerRun: number };
  enabled: boolean;
  health: string;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  consecutiveFailures: number;
  lastError: string | null;
}

export interface AdminRun {
  id: string;
  trigger: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  stats: Partial<Record<string, number | string[]>>;
  errors: string[];
  warnings: string[];
  sources: { sourceId: string; status: string; error: string | null }[];
}

export interface AdminOverviewData {
  schedule: { timezone: string; dailyHour: number; nextPlannedRun: string; utcCron: string; cronSecretConfigured: boolean };
  running: boolean;
  lastRun: AdminRun | null;
  today: Record<string, number>;
  counts: { exams: Record<string, number>; questions: Record<string, number>; duplicates: number; openReviews: number; failedDocuments: number };
  sources: AdminSource[];
  failedDocuments: { id: number; url: string; kind: string; attempts: number; lastError: string | null }[];
}

export interface AdminReviewItem {
  id: number;
  itemType: "exam" | "question";
  itemId: string;
  itemTitle: string | null;
  reason: string;
  reasonLabel: string;
  details: string | null;
  priority: number;
  status: string;
  resolutionNote: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export const RUN_STATUS_LABEL: Record<string, string> = {
  running: "Em andamento",
  succeeded: "Concluída",
  partial: "Concluída com avisos",
  failed: "Falhou",
  interrupted: "Interrompida",
};
