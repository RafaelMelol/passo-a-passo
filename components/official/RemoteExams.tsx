"use client";

import { BadgeCheck, FileText, PencilLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink, ExternalLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OFFICIAL_EXAMS } from "@/data/official-exams";
import { formatDate } from "@/lib/format";

interface RemoteExam {
  id: string;
  title: string;
  examBoard: string;
  organization: string | null;
  role: string;
  year: number | null;
  bookletType: string;
  questionCount: number;
  optionCount: number;
  examPageUrl: string;
  bookletUrl: string;
  answerKeyUrl: string | null;
  sections: { id: string; title: string; firstQuestion: number; lastQuestion: number }[];
  notes: string[];
  annulled: number[];
  publishedAt: string | null;
}

const RECENT_DAYS = 30;

/** Provas encontradas pela atualização automática (banco central). Some silenciosamente se o banco não estiver disponível. */
export function RemoteExams() {
  const [exams, setExams] = useState<RemoteExam[] | null>(null);
  const [board, setBoard] = useState("");
  const [year, setYear] = useState("");
  const [onlyRecent, setOnlyRecent] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/exams?porPagina=100", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ items: RemoteExam[] }>) : null))
      .then((data) => {
        const staticBooklets = new Set(OFFICIAL_EXAMS.map((exam) => exam.links.booklet));
        setExams((data?.items ?? []).filter((exam) => !staticBooklets.has(exam.bookletUrl)));
        setLoadedAt(Date.now());
      })
      .catch(() => setExams([]));
    return () => controller.abort();
  }, []);

  const boards = useMemo(() => [...new Set((exams ?? []).map((exam) => exam.examBoard))].sort(), [exams]);
  const years = useMemo(() => [...new Set((exams ?? []).map((exam) => exam.year).filter((value): value is number => value !== null))].sort((a, b) => b - a), [exams]);

  if (!exams || exams.length === 0) return null;
  const visible = exams.filter(
    (exam) =>
      (!board || exam.examBoard === board) &&
      (!year || String(exam.year) === year) &&
      (!onlyRecent || (exam.publishedAt !== null && loadedAt - Date.parse(exam.publishedAt) < RECENT_DAYS * 86_400_000)),
  );
  const selectClass = "min-h-11 rounded-xl border-2 border-line-strong bg-surface px-3";

  return (
    <section id="banco-central" aria-labelledby="banco-central-titulo" className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <h2 id="banco-central-titulo" className="text-2xl font-bold">
          Mais provas oficiais (atualização automática)
        </h2>
        <p className="text-ink-soft">
          Encontradas pelo coletor diário em fontes oficiais que permitem a coleta. O gabarito foi lido do documento oficial e conferido
          automaticamente com o caderno.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {boards.length > 1 && (
          <label className="space-y-1">
            <span className="block text-sm font-bold">Banca</span>
            <select value={board} onChange={(event) => setBoard(event.target.value)} className={selectClass}>
              <option value="">Todas</option>
              {boards.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        {years.length > 1 && (
          <label className="space-y-1">
            <span className="block text-sm font-bold">Ano</span>
            <select value={year} onChange={(event) => setYear(event.target.value)} className={selectClass}>
              <option value="">Todos</option>
              {years.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        <label className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
          <input type="checkbox" checked={onlyRecent} onChange={(event) => setOnlyRecent(event.target.checked)} className="size-5 accent-brand" />
          Adicionadas nos últimos {RECENT_DAYS} dias
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-ink-soft">Nenhuma prova com esses filtros.</p>
      ) : (
        visible.map((exam) => (
          <Card key={exam.id} className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                {exam.examBoard}
                {exam.year ? ` · ${exam.year}` : ""} · Nível fundamental
              </p>
              <h3 className="text-xl font-bold">{exam.title}</h3>
              <p className="text-ink-soft">
                {exam.role} · {exam.questionCount} questões, {exam.optionCount} alternativas
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-success-soft p-3">
              <BadgeCheck aria-hidden className="size-6 shrink-0 text-success" />
              <div className="space-y-1 text-ink-soft">
                <p className="font-bold text-ink">Gabarito oficial conferido{exam.publishedAt ? ` · publicado no site em ${formatDate(exam.publishedAt)}` : ""}</p>
                {exam.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-x-5 sm:flex-row sm:flex-wrap">
              <ExternalLink href={exam.bookletUrl} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand underline">
                <FileText aria-hidden className="size-5" /> Abrir a prova (PDF oficial)
              </ExternalLink>
              <ExternalLink href={exam.examPageUrl} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand underline">
                <FileText aria-hidden className="size-5" /> Página oficial
              </ExternalLink>
            </div>
            <ButtonLink href={`/provas-oficiais/cartao?prova=${encodeURIComponent(exam.id)}`} size="lg" icon={<PencilLine aria-hidden className="size-5" />}>
              Responder no cartão-resposta
            </ButtonLink>
          </Card>
        ))
      )}
    </section>
  );
}
