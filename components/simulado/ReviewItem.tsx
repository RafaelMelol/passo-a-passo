import { CircleCheck, CircleMinus, CircleX } from "lucide-react";
import { ExplanationPanel } from "@/components/questions/ExplanationPanel";
import { OptionList } from "@/components/questions/OptionList";
import { QuestionView } from "@/components/questions/QuestionView";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import type { SimuladoItemResult } from "@/types/study";

/** Uma questão na revisão do simulado: resposta dada, gabarito e explicação. */
export function ReviewItem({ item, number }: { item: SimuladoItemResult; number: number }) {
  const question = useQuestionBank().byId.get(item.questionId);
  const status = item.isCorrect ? "certa" : item.selected ? "errada" : "em-branco";
  const label = { certa: "Você acertou", errada: "Você errou", "em-branco": "Ficou em branco" }[status];
  const icon = {
    certa: <CircleCheck aria-hidden className="size-6 text-success" />,
    errada: <CircleX aria-hidden className="size-6 text-danger" />,
    "em-branco": <CircleMinus aria-hidden className="size-6 text-warning" />,
  }[status];

  return (
    <li className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-3 flex items-center gap-2 font-bold">
        {icon}
        Questão {number} — {label}
      </p>
      {question ? (
        <QuestionView question={question} heading={`Revisão da questão ${number}`}>
          <OptionList
            name={`revisao-${item.questionId}`}
            legend="Alternativas"
            options={question.options}
            selected={item.selected}
            correctOption={item.correctOption}
          />
          <p className="text-ink">
            {item.selected ? `Sua resposta: letra ${item.selected}. ` : "Você não respondeu. "}
            Gabarito: <strong>letra {item.correctOption}</strong>.
          </p>
          <details className="group rounded-xl border border-line">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 font-bold text-brand">
              <span className="group-open:hidden">Ver explicação</span>
              <span className="hidden group-open:inline">Ocultar explicação</span>
            </summary>
            <div className="p-3 pt-0">
              <ExplanationPanel question={question} selected={item.selected} />
            </div>
          </details>
        </QuestionView>
      ) : (
        <p className="text-ink-soft">
          Esta questão não está mais disponível no banco. Sua resposta foi {item.selected ?? "em branco"} e o gabarito era{" "}
          {item.correctOption}.
        </p>
      )}
    </li>
  );
}
