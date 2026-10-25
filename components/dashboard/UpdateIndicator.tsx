"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRelativeDateTime, plural } from "@/lib/format";

interface UpdateStatus {
  lastSuccessfulUpdateAt: string | null;
  newExamsLast7Days: number;
  newQuestionsLast7Days: number;
}

/**
 * Linha discreta com a data da última atualização do banco central.
 * Não aparece se o banco central não existir ou estiver fora do ar, e nunca anuncia novidades que não existem.
 */
export function UpdateIndicator() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    fetch("/api/updates/status", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<UpdateStatus>) : null))
      .then((data) => {
        if (data?.lastSuccessfulUpdateAt) setStatus(data);
      })
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (!status?.lastSuccessfulUpdateAt) return null;
  const news = status.newExamsLast7Days;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
      <RefreshCw aria-hidden className="size-4" />
      <span>Banco de provas oficiais atualizado {formatRelativeDateTime(status.lastSuccessfulUpdateAt, new Date())}.</span>
      {news > 0 && (
        <Link href="/provas-oficiais#banco-central" className="font-bold text-brand underline">
          {plural(news, "prova nova", "provas novas")} nesta semana
        </Link>
      )}
    </p>
  );
}
