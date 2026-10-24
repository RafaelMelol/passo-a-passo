import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import type { Subject } from "@/data/subjects";
import type { PerformanceStats } from "@/lib/history";

interface SubjectCardProps {
  subject: Subject;
  totalQuestions: number;
  seenQuestions: number;
  stats: PerformanceStats;
}

export function SubjectCard({ subject, totalQuestions, seenQuestions, stats }: SubjectCardProps) {
  const style = SUBJECT_STYLES[subject.id];
  const Icon = style.icon;
  return (
    <Link
      href={`/estudar?disciplina=${subject.id}`}
      className={`group flex flex-col gap-4 rounded-2xl border-2 bg-surface p-5 shadow-sm transition-colors hover:border-brand ${style.border}`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid size-12 place-items-center rounded-xl ${style.soft} ${style.text}`}>
          <Icon aria-hidden className="size-7" />
        </span>
        <div>
          <h3 className="text-xl font-bold">{subject.name}</h3>
          <p className="text-sm text-ink-soft">{totalQuestions} questões</p>
        </div>
      </div>
      <p className="text-ink-soft">{subject.description}</p>
      <div className="space-y-1">
        <p className="text-sm text-ink-soft">
          {stats.answered > 0
            ? `${stats.correct} acertos em ${stats.answered} respostas (${stats.percentage}%)`
            : "Você ainda não respondeu questões desta disciplina."}
        </p>
        <ProgressBar
          value={seenQuestions}
          max={totalQuestions}
          label={`Questões de ${subject.name} já feitas`}
          barClassName={style.bar}
        />
        <p className="text-sm text-ink-soft">
          {seenQuestions} de {totalQuestions} questões já feitas
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 font-bold text-brand group-hover:underline">
        Estudar {subject.name} <ArrowRight aria-hidden className="size-5" />
      </span>
    </Link>
  );
}
