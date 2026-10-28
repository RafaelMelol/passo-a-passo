"use client";

import { CalendarDays, CircleCheck, ClipboardList, Flame, ListChecks, Play, Target } from "lucide-react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/ui/States";
import { SUBJECTS, getSubject, topicName } from "@/data/subjects";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { formatRelativeDateTime, plural } from "@/lib/format";
import { overallStats, reviewSuggestions, statsBySubject, studyStreak, uniqueQuestionsAnswered } from "@/lib/history";
import { filterQuestions } from "@/lib/questions/bank";
import { ContinueCard } from "./ContinueCard";
import { StatTile } from "./StatTile";
import { SubjectCard } from "./SubjectCard";
import { UpdateIndicator } from "./UpdateIndicator";

function greeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function Dashboard() {
  const { state } = useStudyData();
  const startPractice = useStartPractice();
  const questionBank = useQuestionBank();

  if (!state) return <LoadingState />;

  const { data } = state;
  const now = new Date();
  const validIds = new Set(questionBank.byId.keys());
  const overall = overallStats(data.attempts);
  const bySubject = statsBySubject(data.attempts);
  const seen = uniqueQuestionsAnswered(data.attempts, validIds);
  const total = questionBank.questions.length;
  const suggestions = reviewSuggestions(data.attempts, { limit: 3 });
  const streak = studyStreak(data.attempts, now);
  const name = data.settings.name.trim();
  const lastAt = data.lastActivity?.at ?? data.attempts.at(-1)?.answeredAt;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {greeting(now.getHours())}
          {name ? `, ${name}` : ""}!
        </h1>
        <p className="max-w-prose text-lg text-ink-soft">
          Que bom ter você aqui. Estudar um pouquinho todos os dias faz muita diferença na hora da prova.
        </p>
        <UpdateIndicator />
      </section>

      {state.loadWarning === "corrompido" && (
        <Notice tone="warning" title="Não foi possível ler seu progresso anterior" role="alert">
          Os dados salvos neste navegador estavam danificados. Começamos um histórico novo. Se você tiver uma cópia de
          segurança, pode restaurá-la em <Link href="/desempenho#meus-dados">Meu desempenho</Link>.
        </Notice>
      )}
      {state.loadWarning === "indisponivel" && (
        <Notice tone="warning" title="Seu progresso não está sendo salvo" role="alert">
          Este navegador está bloqueando o armazenamento de dados (isso acontece, por exemplo, em janelas anônimas). Você pode
          estudar normalmente, mas o histórico será perdido ao fechar a página.
        </Notice>
      )}

      <ContinueCard data={data} now={now} />

      <section aria-labelledby="resumo-titulo" className="space-y-3">
        <h2 id="resumo-titulo" className="text-xl font-bold">
          Seu resumo
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={<ListChecks aria-hidden />} label="Questões respondidas" value={overall.answered} detail={plural(seen, "questão diferente", "questões diferentes")} />
          <StatTile
            icon={<Target aria-hidden />}
            label="Acertos"
            value={overall.answered > 0 ? `${overall.percentage}%` : "—"}
            detail={overall.answered > 0 ? `${overall.correct} de ${overall.answered}` : "Responda para ver"}
          />
          <StatTile
            icon={<Flame aria-hidden />}
            label="Dias seguidos"
            value={streak}
            detail={streak > 0 ? "Continue assim!" : "Estude hoje para começar"}
          />
          <StatTile
            icon={<CalendarDays aria-hidden />}
            label="Última sessão"
            value={<span className="text-lg sm:text-xl">{lastAt ? formatRelativeDateTime(lastAt, now) : "Ainda não houve"}</span>}
            detail={data.lastActivity?.title}
          />
        </div>
        <Card className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold">Progresso geral</h3>
            <span className="text-ink-soft">
              {seen} de {total} questões do banco já feitas
            </span>
          </div>
          <ProgressBar value={seen} max={total} label="Progresso geral no banco de questões" showValue />
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/estudar" size="lg" icon={<Play aria-hidden className="size-5" />}>
          Começar a estudar
        </ButtonLink>
        <ButtonLink href="/simulado" size="lg" variant="secondary" icon={<ClipboardList aria-hidden className="size-5" />}>
          Fazer um simulado
        </ButtonLink>
      </div>

      {suggestions.length > 0 && (
        <Card className="space-y-3">
          <CardTitle>Sugestões para revisar</CardTitle>
          <p className="text-ink-soft">Assuntos em que você errou mais. Revisar agora ajuda a fixar o conteúdo.</p>
          <ul className="space-y-2">
            {suggestions.map((item) => (
              <li key={item.topic} className="flex flex-col gap-2 rounded-xl bg-page p-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-bold">{topicName(item.topic)}</span>
                  <span className="text-ink-soft">
                    {" "}
                    · {getSubject(item.subject).name} · {item.correct} de {item.answered} acertos
                  </span>
                </span>
                <Button
                  variant="secondary"
                  onClick={() => startPractice({ subject: item.subject, topic: item.topic, difficulty: "todas" })}
                >
                  Revisar este assunto
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <section aria-labelledby="disciplinas-titulo" className="space-y-3">
        <h2 id="disciplinas-titulo" className="text-xl font-bold">
          Disciplinas
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBJECTS.map((subject) => {
            const subjectQuestions = filterQuestions(questionBank.questions, { subject: subject.id });
            const subjectIds = new Set(subjectQuestions.map((question) => question.id));
            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                totalQuestions={subjectQuestions.length}
                seenQuestions={uniqueQuestionsAnswered(data.attempts, subjectIds)}
                stats={bySubject[subject.id]}
              />
            );
          })}
        </div>
      </section>

      {overall.answered === 0 && (
        <Card className="space-y-4">
          <CardTitle>Como funciona</CardTitle>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["Escolha o assunto", "Português, Matemática, Informática ou Conhecimentos gerais, no nível que preferir."],
              ["Responda com calma", "Uma questão por vez. Depois de responder, veja se acertou."],
              ["Entenda a resposta", "Cada questão tem explicação simples e, em Matemática, a conta passo a passo."],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{index + 1}</span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="text-ink-soft">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-2 text-ink-soft">
            <CircleCheck aria-hidden className="size-5 text-success" />
            Seu progresso fica salvo neste navegador automaticamente.
          </p>
        </Card>
      )}
    </div>
  );
}
