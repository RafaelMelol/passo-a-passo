import { Lightbulb } from "lucide-react";
import type { OptionLetter, Question } from "@/types/question";

interface ExplanationPanelProps {
  question: Question;
  selected: OptionLetter | null;
  id?: string;
}

const STEPS_TITLE: Record<Question["subject"], string> = {
  matematica: "Cálculo passo a passo",
  portugues: "Passo a passo",
  informatica: "Passo a passo",
};

export function ExplanationPanel({ question, selected, id }: ExplanationPanelProps) {
  const { explanation } = question;
  // A alternativa marcada pela usuária aparece primeiro na lista de erradas.
  const wrongOptions = question.options
    .filter((option) => option.letter !== question.correctOption && option.whyWrong)
    .sort((a, b) => Number(b.letter === selected) - Number(a.letter === selected));

  return (
    <section id={id} aria-label="Explicação" className="space-y-4 rounded-xl border border-line bg-page p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold">Por que a letra {question.correctOption} está correta</h3>
        <p>{explanation.summary}</p>
      </div>

      {explanation.steps && explanation.steps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">{STEPS_TITLE[question.subject]}</h3>
          <ol className="space-y-2">
            {explanation.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {explanation.tip && (
        <div className="flex gap-3 rounded-xl bg-warning-soft p-3">
          <Lightbulb aria-hidden className="size-6 shrink-0 text-warning" />
          <p>
            <span className="font-bold">Dica para lembrar: </span>
            {explanation.tip}
          </p>
        </div>
      )}

      {wrongOptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Por que as outras alternativas não servem</h3>
          <ul className="space-y-2">
            {wrongOptions.map((option) => (
              <li key={option.letter} className="flex gap-3">
                <span
                  aria-hidden
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                    option.letter === selected ? "border-danger text-danger" : "border-line-strong text-ink-soft"
                  }`}
                >
                  {option.letter}
                </span>
                <span className="pt-0.5">
                  <span className="sr-only">Letra {option.letter}: </span>
                  {option.letter === selected && <span className="font-bold">(você marcou) </span>}
                  {option.whyWrong}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
