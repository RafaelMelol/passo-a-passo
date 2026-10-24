"use client";

import { CircleCheck, CircleMinus, CircleX, ClipboardList, Clock, House, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { StatTile } from "@/components/dashboard/StatTile";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import { SUBJECTS, getSubject, topicName } from "@/data/subjects";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { encouragement, formatDuration, formatRelativeDateTime } from "@/lib/format";
import { summarizeScore } from "@/lib/grading";
import { ReviewItem } from "./ReviewItem";

export function SimuladoResultView() {
  const params = useSearchParams();
  const { state } = useStudyData();
  const startPractice = useStartPractice();
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const id = params.get("id");

  if (!state) return <LoadingState />;

  const result = state.data.simulados.find((item) => item.id === id);
  if (!result) {
    return (
      <EmptyState
        icon={<SearchX aria-hidden />}
        title="Resultado não encontrado"
        description="Esse simulado não está no histórico deste navegador."
        action={<ButtonLink href="/desempenho">Ver meu histórico</ButtonLink>}
      />
    );
  }

  const { score } = result;
  const reviewItems = result.items
    .map((item, index) => ({ item, number: index + 1 }))
    .filter(({ item }) => !onlyMistakes || !item.isCorrect);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Resultado do simulado</h1>
        <p className="text-ink-soft">Finalizado {formatRelativeDateTime(result.finishedAt, new Date())}.</p>
      </header>

      <Card className="space-y-4 text-center">
        <p className="text-5xl font-bold text-brand">{score.percentage}%</p>
        <p className="text-lg">de aproveitamento</p>
        <p className="text-ink-soft">{encouragement(score.percentage, score.total)}</p>
        <ProgressBar value={score.correct} max={score.total} label="Aproveitamento no simulado" barClassName="bg-success" />
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<CircleCheck aria-hidden />} label="Acertos" value={score.correct} detail={`de ${score.total} questões`} />
        <StatTile icon={<CircleX aria-hidden />} label="Erros" value={score.wrong} />
        <StatTile icon={<CircleMinus aria-hidden />} label="Em branco" value={score.blank} />
        <StatTile icon={<Clock aria-hidden />} label="Tempo gasto" value={<span className="text-xl">{formatDuration(result.durationMs)}</span>} />
      </div>

      <Card className="space-y-3">
        <CardTitle>Por disciplina</CardTitle>
        <ul className="space-y-3">
          {SUBJECTS.map((subject) => {
            const items = result.items.filter((item) => item.subject === subject.id);
            if (items.length === 0) return null;
            const correct = items.filter((item) => item.isCorrect).length;
            const blank = items.filter((item) => !item.selected).length;
            const summary = summarizeScore(correct, items.length - correct - blank, blank);
            return (
              <li key={subject.id} className="space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="font-bold">{subject.name}</span>
                  <span className="text-ink-soft">
                    {correct} de {items.length} ({summary.percentage}%)
                  </span>
                </div>
                <ProgressBar value={correct} max={items.length} label={`Acertos em ${subject.name}`} barClassName={SUBJECT_STYLES[subject.id].bar} />
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="space-y-3">
        <CardTitle>Assuntos para estudar mais</CardTitle>
        {result.topicsToReview.length === 0 ? (
          <p className="text-ink-soft">Você acertou todas as questões. Parabéns!</p>
        ) : (
          <ul className="space-y-2">
            {result.topicsToReview.map((review) => (
              <li key={review.topic} className="flex flex-col gap-2 rounded-xl bg-page p-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-bold">{topicName(review.topic)}</span>
                  <span className="text-ink-soft">
                    {" "}
                    · {getSubject(review.subject).name} · errou ou deixou em branco {review.wrong} de {review.total}
                  </span>
                </span>
                <Button variant="secondary" onClick={() => startPractice({ subject: review.subject, topic: review.topic, difficulty: "todas" })}>
                  Praticar este assunto
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section aria-labelledby="revisao-titulo" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="revisao-titulo" className="text-2xl font-bold">
            Revisão das questões
          </h2>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
            <input
              type="checkbox"
              checked={onlyMistakes}
              onChange={(event) => setOnlyMistakes(event.target.checked)}
              className="size-6 accent-brand"
            />
            Mostrar só as que errei
          </label>
        </div>
        {reviewItems.length === 0 ? (
          <p className="text-ink-soft">Nenhuma questão errada ou em branco. Muito bem!</p>
        ) : (
          <ol className="space-y-4">
            {reviewItems.map(({ item, number }) => (
              <ReviewItem key={item.questionId} item={item} number={number} />
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/simulado" icon={<ClipboardList aria-hidden className="size-5" />}>
          Fazer outro simulado
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" icon={<House aria-hidden className="size-5" />}>
          Voltar ao início
        </ButtonLink>
      </div>
    </div>
  );
}
