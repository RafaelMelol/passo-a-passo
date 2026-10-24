"use client";

import { ChartColumn, ClipboardList, FileText, ListChecks, Target } from "lucide-react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import { SUBJECTS, getSubject, topicName } from "@/data/subjects";
import { getOfficialExam } from "@/data/official-exams";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { formatDuration, formatRelativeDateTime } from "@/lib/format";
import {
  dailyEvolution,
  overallStats,
  reviewSuggestions,
  statsBySubject,
  statsByTopic,
  uniqueQuestionsAnswered,
} from "@/lib/history";
import { questionBank } from "@/lib/questions/bank";
import { DataManagement } from "./DataManagement";
import { EvolutionChart } from "./EvolutionChart";
import { StatTile } from "./StatTile";

export function PerformanceView() {
  const { state } = useStudyData();
  const startPractice = useStartPractice();

  if (!state) return <LoadingState />;

  const { data } = state;
  const now = new Date();
  const overall = overallStats(data.attempts);
  const bySubject = statsBySubject(data.attempts);
  const byTopic = statsByTopic(data.attempts);
  const suggestions = reviewSuggestions(data.attempts);
  const evolution = dailyEvolution(data.attempts, 14, now);
  const seen = uniqueQuestionsAnswered(data.attempts, new Set(questionBank.byId.keys()));
  const simulados = [...data.simulados].reverse();
  const officialAttempts = [...data.officialAttempts].reverse();
  const hasHistory = overall.answered > 0 || simulados.length > 0 || officialAttempts.length > 0;

  return (
    <div className="space-y-6">
      {!hasHistory && (
        <EmptyState
          icon={<ChartColumn aria-hidden />}
          title="Seu histórico ainda está vazio"
          description="Responda algumas questões ou faça um simulado. Aqui você vai acompanhar seus acertos e ver o que revisar."
          action={
            <>
              <ButtonLink href="/estudar">Começar a estudar</ButtonLink>
              <ButtonLink href="/simulado" variant="secondary">
                Fazer um simulado
              </ButtonLink>
            </>
          }
        />
      )}

      {hasHistory && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<ListChecks aria-hidden />} label="Questões respondidas" value={overall.answered} />
            <StatTile
              icon={<Target aria-hidden />}
              label="Acertos"
              value={overall.answered > 0 ? `${overall.percentage}%` : "—"}
              detail={`${overall.correct} certas · ${overall.wrong} erradas`}
            />
            <StatTile
              icon={<ChartColumn aria-hidden />}
              label="Questões diferentes"
              value={seen}
              detail={`de ${questionBank.questions.length} do banco`}
            />
            <StatTile icon={<ClipboardList aria-hidden />} label="Simulados feitos" value={simulados.length} />
          </div>

          <Card className="space-y-4">
            <CardTitle>Desempenho por disciplina</CardTitle>
            <ul className="space-y-4">
              {SUBJECTS.map((subject) => {
                const stats = bySubject[subject.id];
                const style = SUBJECT_STYLES[subject.id];
                const Icon = style.icon;
                return (
                  <li key={subject.id} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-bold">
                        <Icon aria-hidden className={`size-5 ${style.text}`} />
                        {subject.name}
                      </span>
                      <span className="text-ink-soft">
                        {stats.answered > 0 ? `${stats.correct} de ${stats.answered} (${stats.percentage}%)` : "Sem respostas ainda"}
                      </span>
                    </div>
                    <ProgressBar value={stats.correct} max={stats.answered} label={`Acertos em ${subject.name}`} barClassName={style.bar} />
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="space-y-3">
            <CardTitle>Sugestões para revisar</CardTitle>
            {suggestions.length === 0 ? (
              <p className="text-ink-soft">
                Nenhum assunto pedindo revisão agora. Quando você errar questões de um assunto, ele aparecerá aqui.
              </p>
            ) : (
              <>
                <p className="text-ink-soft">Assuntos com menos de 70% de acertos ou em que a última resposta foi errada.</p>
                <ul className="space-y-2">
                  {suggestions.map((item) => (
                    <li key={item.topic} className="flex flex-col gap-2 rounded-xl bg-page p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        <span className="font-bold">{topicName(item.topic)}</span>
                        <span className="text-ink-soft">
                          {" "}
                          · {getSubject(item.subject).name} · {item.correct} de {item.answered} ({item.percentage}%)
                        </span>
                      </span>
                      <Button variant="secondary" onClick={() => startPractice({ subject: item.subject, topic: item.topic, difficulty: "todas" })}>
                        Revisar este assunto
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card className="space-y-3">
            <CardTitle>Evolução nos últimos 14 dias</CardTitle>
            <p className="text-ink-soft">Questões respondidas por dia. Passe o mouse ou toque em uma barra para ver os acertos.</p>
            <EvolutionChart points={evolution} />
          </Card>

          {byTopic.length > 0 && (
            <Card className="space-y-4">
              <CardTitle>Desempenho por assunto</CardTitle>
              {SUBJECTS.map((subject) => {
                const topics = byTopic
                  .filter((item) => item.subject === subject.id)
                  .sort((a, b) => a.percentage - b.percentage);
                if (topics.length === 0) return null;
                return (
                  <div key={subject.id} className="space-y-2">
                    <h3 className="font-bold">{subject.name}</h3>
                    <ul className="space-y-3">
                      {topics.map((item) => (
                        <li key={item.topic} className="space-y-1">
                          <div className="flex flex-wrap justify-between gap-2 text-sm">
                            <span>{topicName(item.topic)}</span>
                            <span className="text-ink-soft">
                              {item.correct} de {item.answered} ({item.percentage}%)
                            </span>
                          </div>
                          <ProgressBar
                            value={item.correct}
                            max={item.answered}
                            label={`Acertos em ${topicName(item.topic)}`}
                            barClassName={SUBJECT_STYLES[subject.id].bar}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </Card>
          )}

          <Card className="space-y-3">
            <CardTitle>Histórico de simulados</CardTitle>
            {simulados.length === 0 ? (
              <p className="text-ink-soft">
                Você ainda não fez simulados. <Link href="/simulado" className="font-bold text-brand underline">Montar um simulado</Link>
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {simulados.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="block font-bold">
                        {item.score.correct} de {item.score.total} acertos ({item.score.percentage}%)
                      </span>
                      <span className="text-sm text-ink-soft">
                        {formatRelativeDateTime(item.finishedAt, now)} · tempo: {formatDuration(item.durationMs)}
                      </span>
                    </span>
                    <Link
                      href={`/simulado/resultado?id=${encodeURIComponent(item.id)}`}
                      className="inline-flex min-h-11 items-center font-bold text-brand underline"
                    >
                      Ver resultado e revisão
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {officialAttempts.length > 0 && (
            <Card className="space-y-3">
              <CardTitle>Provas oficiais corrigidas</CardTitle>
              <ul className="divide-y divide-line">
                {officialAttempts.map((attempt) => {
                  const exam = getOfficialExam(attempt.examId);
                  return (
                    <li key={attempt.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        <span className="block font-bold">{exam?.title ?? "Prova oficial"}</span>
                        <span className="text-sm text-ink-soft">
                          {attempt.score.correct} de {attempt.score.total} ({attempt.score.percentage}%) ·{" "}
                          {formatRelativeDateTime(attempt.finishedAt, now)}
                        </span>
                      </span>
                      {exam && (
                        <Link
                          href={`/provas-oficiais/cartao?prova=${encodeURIComponent(exam.id)}`}
                          className="inline-flex min-h-11 items-center gap-1 font-bold text-brand underline"
                        >
                          <FileText aria-hidden className="size-4" /> Abrir cartão-resposta
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      <DataManagement data={data} />
    </div>
  );
}
