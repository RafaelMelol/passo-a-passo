import { ExternalLink as ExternalIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OfficialExamCard } from "@/components/official/OfficialExamCard";
import { RemoteExams } from "@/components/official/RemoteExams";
import { ExternalLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { OFFICIAL_EXAMS, OFFICIAL_REPOSITORIES } from "@/data/official-exams";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Provas oficiais" };

export default function ProvasOficiaisPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Provas oficiais anteriores"
        description="Treine com provas de verdade, aplicadas em concursos de nível fundamental, e corrija com o gabarito definitivo da banca."
      />

      <Notice tone="info" title="Como funciona">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Abra a prova no site oficial da banca (o PDF abre em outra aba).</li>
          <li>Resolva as questões no papel ou na tela, com calma.</li>
          <li>Marque suas respostas no cartão-resposta deste site e peça a correção.</li>
        </ol>
        <p className="mt-2">
          Para respeitar os direitos autorais da banca, os enunciados não são copiados aqui: usamos apenas os links oficiais e o
          gabarito definitivo. Questões anuladas pela banca não contam na sua nota.
        </p>
      </Notice>

      {OFFICIAL_EXAMS.map((exam) => (
        <OfficialExamCard key={exam.id} exam={exam} />
      ))}

      <RemoteExams />

      <Card className="space-y-3">
        <CardTitle>Onde encontrar mais provas</CardTitle>
        <p className="text-ink-soft">
          Sites oficiais de bancas e órgãos públicos. Procure concursos de nível fundamental e baixe sempre o gabarito{" "}
          <strong>definitivo</strong> (o preliminar ainda pode mudar depois dos recursos).
        </p>
        <ul className="space-y-3">
          {OFFICIAL_REPOSITORIES.map((repository) => (
            <li key={repository.url} className="rounded-xl bg-page p-3">
              <ExternalLink href={repository.url} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand underline">
                {repository.name} <ExternalIcon aria-hidden className="size-4" />
              </ExternalLink>
              <p className="text-ink-soft">{repository.description}</p>
              <p className="text-sm text-ink-soft">
                {repository.linkStatus === "verificado"
                  ? `Link conferido em ${formatDate(repository.checkedAt)}.`
                  : `Não foi possível conferir este link automaticamente em ${formatDate(repository.checkedAt)} (o site bloqueou a verificação).`}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft">
          Quer saber como as questões deste site foram escolhidas? Veja{" "}
          <Link href="/fontes" className="font-bold text-brand underline">
            Sobre as questões e fontes
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
