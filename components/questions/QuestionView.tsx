import { forwardRef, type ReactNode } from "react";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import { difficultyName, getSubject, topicName } from "@/data/subjects";
import type { Question } from "@/types/question";
import { SourceDetails } from "./SourceDetails";

const DIFFICULTY_STYLE: Record<Question["difficulty"], string> = {
  facil: "bg-success-soft text-success",
  medio: "bg-warning-soft text-warning",
  dificil: "bg-danger-soft text-danger",
};

interface QuestionViewProps {
  question: Question;
  heading: string;
  children: ReactNode;
  showSource?: boolean;
}

/** Cabeçalho, texto de apoio e enunciado de uma questão. As alternativas vêm em `children`. */
export const QuestionView = forwardRef<HTMLHeadingElement, QuestionViewProps>(function QuestionView(
  { question, heading, children, showSource = true },
  headingRef,
) {
  const style = SUBJECT_STYLES[question.subject];
  const Icon = style.icon;

  return (
    <article className="space-y-5">
      <div className="space-y-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          {heading}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${style.soft} ${style.text}`}>
            <Icon aria-hidden className="size-4" />
            {getSubject(question.subject).name}
          </span>
          <span className="rounded-full bg-page px-2.5 py-0.5 font-bold text-ink-soft">{topicName(question.topic)}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-bold ${DIFFICULTY_STYLE[question.difficulty]}`}>
            Nível {difficultyName(question.difficulty).toLowerCase()}
          </span>
        </div>
      </div>

      {question.supportText && (
        <figure className="space-y-3 rounded-xl border-l-4 border-brand/50 bg-page p-4 sm:p-5">
          {question.supportText.title && <p className="font-bold">{question.supportText.title}</p>}
          <div className="space-y-3">
            {question.supportText.body.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {question.supportText.credit && (
            <figcaption className="text-sm text-ink-soft">{question.supportText.credit}</figcaption>
          )}
        </figure>
      )}

      <p className="text-lg font-bold leading-relaxed sm:text-xl">{question.statement}</p>

      {children}

      {showSource && <SourceDetails question={question} />}
    </article>
  );
});
