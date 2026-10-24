"use client";

interface QuestionNavigatorProps {
  questionIds: readonly string[];
  answers: Readonly<Record<string, string>>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

/** Grade com o número de cada questão: mostra respondidas, pendentes e a atual. */
export function QuestionNavigator({ questionIds, answers, currentIndex, onSelect }: QuestionNavigatorProps) {
  return (
    <nav aria-label="Ir para a questão">
      <ol className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {questionIds.map((id, index) => {
          const answered = answers[id] !== undefined;
          const current = index === currentIndex;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={current ? "step" : undefined}
                aria-label={`Questão ${index + 1}, ${answered ? "respondida" : "pendente"}${current ? ", atual" : ""}`}
                className={`grid min-h-11 w-full place-items-center rounded-lg border-2 font-bold ${
                  answered ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-ink"
                } ${current ? "ring-4 ring-brand/35 ring-offset-1" : ""}`}
              >
                {index + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-4 rounded bg-brand" /> Respondida
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="inline-block size-4 rounded border-2 border-line-strong bg-surface" /> Pendente
        </span>
      </p>
    </nav>
  );
}
