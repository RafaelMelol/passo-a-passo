"use client";

import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { adminFetch, formatDateTime, type AdminReviewItem } from "./admin-api";

type Status = "open" | "approved" | "rejected" | "dismissed";
const STATUS_LABEL: Record<Status, string> = { open: "Abertos", approved: "Aprovados", rejected: "Rejeitados", dismissed: "Encerrados automaticamente" };

export function AdminReview() {
  const [status, setStatus] = useState<Status>("open");
  const [items, setItems] = useState<AdminReviewItem[] | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const load = useCallback(async (which: Status) => {
    const data = await adminFetch<{ items: AdminReviewItem[] }>(`/api/admin/review?status=${which}&porPagina=50`);
    setItems(data.items);
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch<{ items: AdminReviewItem[] }>(`/api/admin/review?status=${status}&porPagina=50`)
      .then((data) => active && setItems(data.items))
      .catch((error: unknown) => active && setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro ao carregar." }));
    return () => {
      active = false;
    };
  }, [status]);

  async function resolve(item: AdminReviewItem, action: "approve" | "reject") {
    setMessage(null);
    try {
      await adminFetch(`/api/admin/review/${item.id}`, { json: { action, note: notes[item.id] ?? "" } });
      setMessage({ tone: "success", text: action === "approve" ? "Aprovado e publicado." : "Rejeitado." });
      await load(status);
    } catch (error) {
      setMessage({ tone: "danger", text: error instanceof Error ? error.message : "Erro." });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fila">
        {(Object.keys(STATUS_LABEL) as Status[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => {
              setItems(null);
              setStatus(value);
            }}
            className={`min-h-11 rounded-xl px-3 font-bold ${status === value ? "bg-brand-soft text-brand" : "bg-surface text-ink-soft"}`}
          >
            {STATUS_LABEL[value]}
          </button>
        ))}
      </div>
      <Notice tone="info">
        Aprove somente depois de conferir o caderno e o gabarito no site oficial. Provas sem gabarito definitivo não podem ser aprovadas como
        oficiais.
      </Notice>
      {message && (
        <Notice tone={message.tone} role="status">
          {message.text}
        </Notice>
      )}
      {!items ? (
        <LoadingState label="Carregando fila…" />
      ) : items.length === 0 ? (
        <p className="text-ink-soft">Nenhum item.</p>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-bold">{item.itemTitle ?? item.itemId}</h3>
              <span className="text-sm text-ink-soft">
                {item.itemType === "exam" ? "Prova" : "Questão"} · prioridade {item.priority} · {formatDateTime(item.createdAt)}
              </span>
            </div>
            <p>
              <strong>{item.reasonLabel}</strong>
              {item.details ? ` — ${item.details}` : ""}
            </p>
            {item.resolutionNote && <p className="text-sm text-ink-soft">Resolução: {item.resolutionNote}</p>}
            {item.status === "open" && (
              <div className="space-y-2">
                <label className="block text-sm font-bold" htmlFor={`nota-${item.id}`}>
                  Observação (opcional)
                </label>
                <input
                  id={`nota-${item.id}`}
                  value={notes[item.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border-2 border-line-strong px-3"
                  maxLength={500}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => resolve(item, "approve")} icon={<Check aria-hidden className="size-5" />}>
                    Aprovar e publicar
                  </Button>
                  <Button variant="secondary" onClick={() => resolve(item, "reject")} icon={<X aria-hidden className="size-5" />}>
                    Rejeitar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
