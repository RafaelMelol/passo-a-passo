import { BadgeCheck, ExternalLink as ExternalIcon, Info } from "lucide-react";
import { ExternalLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import type { Question, VerificationStatus } from "@/types/question";

const STATUS_TEXT: Record<VerificationStatus, string> = {
  verificada: "conferido",
  pendente: "ainda não conferido",
  divergente: "com divergência entre fontes — não é definitivo",
  anulada: "questão anulada pela banca",
};

export function ContentTypeBadge({ question }: { question: Question }) {
  const official = question.contentType === "oficial";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${
        official ? "bg-success-soft text-success" : "bg-brand-soft text-brand"
      }`}
    >
      {official ? <BadgeCheck aria-hidden className="size-4" /> : <Info aria-hidden className="size-4" />}
      {official ? "Questão oficial" : "Questão de prática"}
    </span>
  );
}

/** Origem e dados de referência da questão, em um bloco que abre e fecha. */
export function SourceDetails({ question }: { question: Question }) {
  const { source, verification } = question;
  const official = question.contentType === "oficial";
  const rows: [string, string | number | undefined][] = [
    ["Banca", source.examBoard],
    ["Concurso", source.exam],
    ["Órgão", source.organization],
    ["Cargo", source.role],
    ["Ano", source.year],
    ["Número na prova", source.originalNumber],
  ];

  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-2 font-bold text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
        <Info aria-hidden className="size-5" />
        Origem da questão
        <span aria-hidden className="ml-auto text-sm group-open:hidden">mostrar</span>
        <span aria-hidden className="ml-auto hidden text-sm group-open:inline">ocultar</span>
      </summary>
      <div className="space-y-2 px-4 pb-4 text-ink-soft">
        <ContentTypeBadge question={question} />
        <p>{source.description}</p>
        {official && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {rows
              .filter(([, value]) => value !== undefined && value !== "")
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-bold text-ink">{label}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        )}
        <p>
          {official ? "Enunciado " : "Conteúdo "}
          {STATUS_TEXT[verification.statement]} · Gabarito {STATUS_TEXT[verification.answerKey]}
          {verification.checkedAt ? ` em ${formatDate(verification.checkedAt)}` : ""}.
        </p>
        {verification.notes && <p className="text-sm">{verification.notes}</p>}
        {source.url && (
          <ExternalLink href={source.url} className="inline-flex items-center gap-1 font-bold text-brand underline">
            Consultar a fonte original <ExternalIcon aria-hidden className="size-4" />
          </ExternalLink>
        )}
      </div>
    </details>
  );
}
