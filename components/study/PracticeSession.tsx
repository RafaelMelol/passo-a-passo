"use client";

import { ChartColumn, ListRestart, SearchX, Shuffle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { PracticeQuestion } from "@/components/questions/PracticeQuestion";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { isDifficulty, isSubjectId, isTopicOfSubject } from "@/data/subjects";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { encouragement } from "@/lib/format";
import { calculateScore } from "@/lib/grading";
import { recordAttempt } from "@/lib/history";
import { createPracticeProgress, isPracticeFinished, practiceFilterKey, practiceHref, practicePool, practiceTitle } from "@/lib/practice";
import type { OptionLetter } from "@/types/question";
import type { PracticeFilters } from "@/types/study";

export function readPracticeFilters(params: { get(name: string): string | null }): PracticeFilters | null {
  const subject = params.get("disciplina");
  const topic = params.get("assunto") ?? "todos";
  const difficulty = params.get("dificuldade") ?? "todas";
  const origin = params.get("origem") ?? "todas";
  if (!isSubjectId(subject)) return null;
  if (topic !== "todos" && !isTopicOfSubject(subject, topic)) return null;
  if (difficulty !== "todas" && !isDifficulty(difficulty)) return null;
  if (origin !== "todas" && origin !== "oficiais" && origin !== "pratica") return null;
  return { subject, topic, difficulty, ...(origin !== "todas" ? { origin } : {}) };
}

export function PracticeSession() {
  const params = useSearchParams();
  const { state, update } = useStudyData();
  const startPractice = useStartPractice();
  const questionBank = useQuestionBank();
  const getQuestion = (id: string) => questionBank.byId.get(id);
  const filters = readPracticeFilters(params);
  const key = filters ? practiceFilterKey(filters) : null;
  const poolSize = filters ? practicePool(questionBank.questions, filters).length : 0;
  const createdForKey = useRef<string | null>(null);

  const practice = state?.data.practice ?? null;
  const matches = practice !== null && practice.filterKey === key;
  const questionsMissing = matches && practice.questionIds.some((id) => !questionBank.byId.has(id));
  const needsNewList = filters !== null && poolSize > 0 && (!matches || questionsMissing);

  // Abriu um link direto para uma lista que ainda não existe: cria a lista uma vez.
  useEffect(() => {
    if (!state || !filters || !key || !needsNewList || createdForKey.current === key) return;
    createdForKey.current = key;
    const now = new Date();
    const progress = createPracticeProgress(questionBank.questions, filters, state.data.attempts, now);
    if (!progress) return;
    update((data) => ({
      ...data,
      practice: progress,
      lastActivity: { kind: "pratica", title: practiceTitle(filters), href: practiceHref(filters), at: now.toISOString() },
    }));
  }, [state, filters, key, needsNewList, update, questionBank]);

  if (!filters) {
    return (
      <EmptyState
        icon={<SearchX aria-hidden />}
        title="Não encontramos essa lista de questões"
        description="O endereço parece incompleto. Escolha a disciplina e o assunto novamente."
        action={<ButtonLink href="/estudar">Escolher o que estudar</ButtonLink>}
      />
    );
  }

  const header = (
    <PageHeader title={practiceTitle(filters)} back={{ href: `/estudar?disciplina=${filters.subject}`, label: "Trocar assunto" }} />
  );

  if (poolSize === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<SearchX aria-hidden />}
          title="Ainda não há questões para essa escolha"
          description="Tente outro nível de dificuldade ou outro assunto."
          action={<ButtonLink href={`/estudar?disciplina=${filters.subject}`}>Escolher outra lista</ButtonLink>}
        />
      </>
    );
  }

  if (!state) return <LoadingState />;
  if (!practice || !matches || needsNewList) return <LoadingState label="Preparando suas questões…" />;

  const total = practice.questionIds.length;

  if (isPracticeFinished(practice)) {
    const items = practice.questionIds.flatMap((id) => {
      const question = getQuestion(id);
      return question ? [{ question, selected: practice.answers[id] ?? null }] : [];
    });
    const score = calculateScore(items);
    return (
      <>
        {header}
        <Card className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Você terminou esta lista!</h2>
          <p className="text-4xl font-bold text-brand">
            {score.correct} de {score.total}
          </p>
          <p className="text-lg">acertos ({score.percentage}%)</p>
          <p className="text-ink-soft">{encouragement(score.percentage, score.total)}</p>
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Button onClick={() => startPractice(filters)} icon={<Shuffle aria-hidden className="size-5" />}>
              Praticar de novo
            </Button>
            <ButtonLink
              href={`/estudar?disciplina=${filters.subject}`}
              variant="secondary"
              icon={<ListRestart aria-hidden className="size-5" />}
            >
              Escolher outro assunto
            </ButtonLink>
            <ButtonLink href="/desempenho" variant="secondary" icon={<ChartColumn aria-hidden className="size-5" />}>
              Ver meu desempenho
            </ButtonLink>
          </div>
        </Card>
      </>
    );
  }

  const index = practice.currentIndex;
  const question = getQuestion(practice.questionIds[index]);
  if (!question) return <LoadingState label="Preparando suas questões…" />;

  const answeredCount = practice.questionIds.filter((id) => practice.answers[id] !== undefined).length;
  const correctCount = practice.questionIds.filter((id) => practice.answers[id] === getQuestion(id)?.correctOption).length;
  const currentFilters = filters;
  const currentQuestion = question;

  function handleAnswer(selected: OptionLetter, isCorrect: boolean) {
    const now = new Date().toISOString();
    update((data) => {
      if (!data.practice || data.practice.answers[currentQuestion.id] !== undefined) return data;
      const withAttempt = recordAttempt(data, {
        questionId: currentQuestion.id,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
        selected,
        isCorrect,
        answeredAt: now,
        mode: "pratica",
        questionVersion: currentQuestion.version ?? 1,
      });
      return {
        ...withAttempt,
        practice: { ...data.practice, answers: { ...data.practice.answers, [currentQuestion.id]: selected }, updatedAt: now },
        lastActivity: { kind: "pratica", title: practiceTitle(currentFilters), href: practiceHref(currentFilters), at: now },
      };
    });
  }

  function handleNext() {
    update((data) =>
      data.practice
        ? { ...data, practice: { ...data.practice, currentIndex: data.practice.currentIndex + 1, updatedAt: new Date().toISOString() } }
        : data,
    );
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      {header}
      <div className="mb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-ink-soft">
          <span className="font-bold text-ink">
            Questão {index + 1} de {total}
          </span>
          {answeredCount > 0 && (
            <span>
              Acertos nesta lista: <span className="font-bold text-ink">{correctCount}</span> de {answeredCount}
            </span>
          )}
        </div>
        <ProgressBar value={index} max={total} label="Progresso na lista de questões" />
      </div>
      <Card>
        <PracticeQuestion
          key={question.id}
          question={question}
          heading={`Questão ${index + 1} de ${total}`}
          savedAnswer={practice.answers[question.id]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          nextLabel={index + 1 >= total ? "Ver resultado da lista" : "Próxima questão"}
          focusOnMount={index > 0}
        />
      </Card>
    </>
  );
}
