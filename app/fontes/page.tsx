import { BadgeCheck, Info, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { OFFICIAL_EXAMS } from "@/data/official-exams";
import { SUBJECTS } from "@/data/subjects";
import { formatDate } from "@/lib/format";
import { filterQuestions, questionBank } from "@/lib/questions/bank";

export const metadata: Metadata = { title: "Sobre as questões e fontes" };

export default function FontesPage() {
  const practiceCount = questionBank.questions.filter((question) => question.contentType === "pratica-autoral").length;
  const officialCount = questionBank.questions.length - practiceCount;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Sobre as questões e fontes"
        description="Transparência sobre a origem de cada conteúdo, para você estudar com confiança."
      />

      <Card className="space-y-3">
        <CardTitle className="flex items-center gap-2">
          <Info aria-hidden className="size-6 text-brand" /> Questões de prática
        </CardTitle>
        <p>
          O banco tem <strong>{practiceCount} questões de prática</strong> escritas especialmente para este site, no estilo das
          provas de nível fundamental. Elas aparecem com a etiqueta <strong>&quot;Questão de prática&quot;</strong> e{" "}
          <strong>não são atribuídas a nenhuma banca, concurso ou órgão</strong>. Cada uma tem a resposta revisada e uma
          explicação em linguagem simples.
        </p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <li key={subject.id} className="rounded-xl bg-page p-3">
              <span className="block font-bold">{subject.name}</span>
              <span className="text-ink-soft">
                {filterQuestions(questionBank.questions, { subject: subject.id }).length} questões em {subject.topics.length} assuntos
              </span>
            </li>
          ))}
        </ul>
        {officialCount > 0 && (
          <p>
            Há também {officialCount} questões oficiais importadas, identificadas com a etiqueta &quot;Questão oficial&quot; e com
            link para a fonte.
          </p>
        )}
      </Card>

      <Card className="space-y-3">
        <CardTitle className="flex items-center gap-2">
          <BadgeCheck aria-hidden className="size-6 text-success" /> Provas oficiais
        </CardTitle>
        <p>
          As provas oficiais ficam na página{" "}
          <Link href="/provas-oficiais" className="font-bold text-brand underline">
            Provas oficiais
          </Link>
          . Para respeitar os direitos autorais, o site não copia os enunciados: ele leva você ao PDF publicado pela banca e
          corrige suas respostas com o gabarito definitivo.
        </p>
        <ul className="space-y-2">
          {OFFICIAL_EXAMS.map((exam) => (
            <li key={exam.id} className="rounded-xl bg-page p-3">
              <span className="block font-bold">{exam.title}</span>
              <span className="text-ink-soft">
                Banca {exam.examBoard} · gabarito definitivo conferido em {formatDate(exam.verification.checkedAt)}
              </span>
              <p className="mt-1 text-sm text-ink-soft">{exam.verification.method}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck aria-hidden className="size-6 text-brand" /> Regras de qualidade
        </CardTitle>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nenhuma questão inventada é apresentada como se fosse de prova oficial.</li>
          <li>Questão oficial só é usada com fonte, banca, concurso, ano e link, e com o gabarito conferido no gabarito definitivo.</li>
          <li>Questões anuladas ou com gabarito em dúvida são identificadas e nunca contam como resposta definitiva.</li>
          <li>
            A correção compara a letra marcada com a letra do gabarito validado. Antes de entrar no site, toda questão passa por uma
            verificação automática (alternativas, resposta correta, explicação e dados da fonte).
          </li>
          {questionBank.rejected.length > 0 && (
            <li>
              {questionBank.rejected.length} questões cadastradas não passaram na verificação e estão fora do banco até serem
              corrigidas.
            </li>
          )}
        </ul>
      </Card>

      <Card className="space-y-3">
        <CardTitle>Seus dados</CardTitle>
        <p>
          O site não tem cadastro nem senha e não envia suas respostas para nenhum servidor. O progresso fica guardado no próprio
          navegador (localStorage). Por isso, ele pode ser perdido se os dados do navegador forem apagados ou se você trocar de
          aparelho ou de navegador.
        </p>
        <p>
          Para não perder nada, baixe uma cópia de segurança em{" "}
          <Link href="/desempenho#meus-dados" className="font-bold text-brand underline">
            Meu desempenho
          </Link>{" "}
          e guarde o arquivo. Com ele você pode restaurar tudo em outro aparelho.
        </p>
      </Card>
    </div>
  );
}
