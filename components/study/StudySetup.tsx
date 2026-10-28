"use client";

import { Play } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import { DIFFICULTIES, SUBJECTS, isDifficulty, isSubjectId, isTopicOfSubject } from "@/data/subjects";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { statsByTopic } from "@/lib/history";
import { isPracticeFinished, practiceHref, practicePool, practiceTitle } from "@/lib/practice";
import { filterQuestions } from "@/lib/questions/bank";
import type { Difficulty, SubjectId, TopicId } from "@/types/question";

function optionClass(active: boolean) {
  return `flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 p-3 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/40 ${
    active ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/60"
  }`;
}

export function StudySetup() {
  const startPractice = useStartPractice();
  const questionBank = useQuestionBank();
  const params = useSearchParams();
  const { state } = useStudyData();

  const initialSubject = params.get("disciplina");
  const initialTopic = params.get("assunto");
  const [subject, setSubject] = useState<SubjectId>(isSubjectId(initialSubject) ? initialSubject : "portugues");
  const [topic, setTopic] = useState<TopicId | "todos">(
    initialTopic && isTopicOfSubject(subject, initialTopic) ? initialTopic : "todos",
  );
  const [difficulty, setDifficulty] = useState<Difficulty | "todas">(() => {
    const value = params.get("dificuldade");
    return isDifficulty(value) ? value : "todas";
  });

  const [origin, setOrigin] = useState<"todas" | "oficiais" | "pratica">("todas");
  const hasOfficial = questionBank.questions.some((question) => question.contentType === "oficial");
  const topicStats = useMemo(() => new Map((state ? statsByTopic(state.data.attempts) : []).map((s) => [s.topic, s])), [state]);
  const subjectInfo = SUBJECTS.find((item) => item.id === subject) ?? SUBJECTS[0];
  const available = practicePool(questionBank.questions, { subject, topic, difficulty, origin: hasOfficial ? origin : "todas" }).length;
  const practice = state?.data.practice;
  const inProgress = practice && !isPracticeFinished(practice) ? practice : null;

  function chooseSubject(next: SubjectId) {
    setSubject(next);
    setTopic("todos");
  }

  function start() {
    startPractice({ subject, topic, difficulty, ...(hasOfficial && origin !== "todas" ? { origin } : {}) });
  }

  return (
    <div className="space-y-6">
      {inProgress && (
        <Notice tone="info" title="Você tem uma lista em andamento">
          <p>
            {practiceTitle(inProgress.filters)} — questão {inProgress.currentIndex + 1} de {inProgress.questionIds.length}.
          </p>
          <ButtonLink href={practiceHref(inProgress.filters)} variant="secondary" className="mt-2 no-underline!">
            Continuar de onde parei
          </ButtonLink>
        </Notice>
      )}

      <Card>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-xl font-bold">1. Escolha a disciplina</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUBJECTS.map((item) => {
              const style = SUBJECT_STYLES[item.id];
              const Icon = style.icon;
              const count = filterQuestions(questionBank.questions, { subject: item.id }).length;
              return (
                <label key={item.id} className={optionClass(subject === item.id)}>
                  <input
                    type="radio"
                    name="disciplina"
                    value={item.id}
                    checked={subject === item.id}
                    onChange={() => chooseSubject(item.id)}
                    className="sr-only"
                  />
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${style.soft} ${style.text}`}>
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{item.name}</span>
                    <span className="text-sm text-ink-soft">{count} questões</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <Card>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-xl font-bold">2. Escolha o assunto</legend>
          <div className="grid gap-2">
            {[{ id: "todos" as const, name: "Todos os assuntos" }, ...subjectInfo.topics].map((item) => {
              const count = filterQuestions(questionBank.questions, { subject, topic: item.id }).length;
              const stats = item.id === "todos" ? undefined : topicStats.get(item.id);
              return (
                <label key={item.id} className={optionClass(topic === item.id)}>
                  <input
                    type="radio"
                    name="assunto"
                    value={item.id}
                    checked={topic === item.id}
                    onChange={() => setTopic(item.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`size-5 shrink-0 rounded-full border-2 ${
                      topic === item.id ? "border-[6px] border-brand" : "border-line-strong"
                    }`}
                  />
                  <span className="flex-1">
                    <span className="block font-bold">{item.name}</span>
                    <span className="text-sm text-ink-soft">
                      {count} questões
                      {stats ? ` · você acertou ${stats.correct} de ${stats.answered} (${stats.percentage}%)` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <Card>
        <fieldset>
          <legend className="mb-3 text-xl font-bold">3. Escolha o nível</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ id: "todas" as const, name: "Todos" }, ...DIFFICULTIES].map((item) => {
              const count = filterQuestions(questionBank.questions, { subject, topic, difficulty: item.id }).length;
              return (
                <label key={item.id} className={`${optionClass(difficulty === item.id)} justify-center text-center`}>
                  <input
                    type="radio"
                    name="dificuldade"
                    value={item.id}
                    checked={difficulty === item.id}
                    onChange={() => setDifficulty(item.id)}
                    className="sr-only"
                  />
                  <span>
                    <span className="block font-bold">{item.name}</span>
                    <span className="text-sm text-ink-soft">{count} questões</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      {hasOfficial && (
        <Card>
          <fieldset>
            <legend className="mb-3 text-xl font-bold">4. Origem das questões</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: "todas" as const, name: "Todas" },
                { id: "oficiais" as const, name: "Só oficiais verificadas" },
                { id: "pratica" as const, name: "Só de prática" },
              ].map((item) => (
                <label key={item.id} className={`${optionClass(origin === item.id)} justify-center text-center`}>
                  <input type="radio" name="origem" checked={origin === item.id} onChange={() => setOrigin(item.id)} className="sr-only" />
                  <span className="font-bold">{item.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
      )}

      <div className="flex flex-col items-start gap-3 rounded-2xl bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg" aria-live="polite">
          {available > 0 ? (
            <>
              <span className="font-bold">{available} questões</span> prontas para você.
            </>
          ) : (
            "Não há questões com essas escolhas. Tente outro nível ou outro assunto."
          )}
        </p>
        <Button size="lg" onClick={start} disabled={available === 0} icon={<Play aria-hidden className="size-5" />}>
          Começar a praticar
        </Button>
      </div>
    </div>
  );
}
