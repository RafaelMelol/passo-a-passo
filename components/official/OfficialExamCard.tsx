import { BadgeCheck, ExternalLink as ExternalIcon, FileText, PencilLine } from "lucide-react";
import { ButtonLink, ExternalLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { OfficialExam } from "@/types/official";

export function OfficialExamCard({ exam }: { exam: OfficialExam }) {
  const annulled = exam.answerKey.filter((item) => item.status === "anulada").length;
  const linkClass = "inline-flex min-h-11 items-center gap-2 font-bold text-brand underline";
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          {exam.examBoard} · {exam.year} · {exam.level}
        </p>
        <h2 className="text-xl font-bold">{exam.title}</h2>
        <p className="text-ink-soft">
          {exam.organization} · Cargo: {exam.role} · Prova aplicada em {formatDate(exam.examDate)}
        </p>
      </div>

      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="inline font-bold">Questões: </dt>
          <dd className="inline">
            {exam.questionCount}, com {exam.optionCount} alternativas cada
          </dd>
        </div>
        <div>
          <dt className="inline font-bold">Caderno: </dt>
          <dd className="inline">{exam.bookletType}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-bold">Partes: </dt>
          <dd className="inline">
            {exam.sections.map((section) => `${section.title} (${section.firstQuestion}–${section.lastQuestion})`).join(" · ")}
          </dd>
        </div>
      </dl>

      <div className="flex items-start gap-2 rounded-xl bg-success-soft p-3">
        <BadgeCheck aria-hidden className="size-6 shrink-0 text-success" />
        <div className="space-y-1">
          <p className="font-bold">
            Gabarito definitivo conferido em {formatDate(exam.verification.checkedAt)}
            {annulled > 0 ? ` · ${annulled} ${annulled === 1 ? "questão anulada" : "questões anuladas"}` : " · nenhuma questão anulada"}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
            {exam.verification.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-x-5 sm:flex-row sm:flex-wrap">
        <ExternalLink href={exam.links.booklet} className={linkClass}>
          <FileText aria-hidden className="size-5" /> Abrir a prova (PDF oficial)
        </ExternalLink>
        <ExternalLink href={exam.links.answerKeyFinal} className={linkClass}>
          <FileText aria-hidden className="size-5" /> Gabarito definitivo (PDF)
        </ExternalLink>
        <ExternalLink href={exam.links.examPage} className={linkClass}>
          <ExternalIcon aria-hidden className="size-5" /> Página oficial do concurso
        </ExternalLink>
      </div>

      <ButtonLink
        href={`/provas-oficiais/cartao?prova=${encodeURIComponent(exam.id)}`}
        size="lg"
        icon={<PencilLine aria-hidden className="size-5" />}
      >
        Responder no cartão-resposta
      </ButtonLink>
    </Card>
  );
}
