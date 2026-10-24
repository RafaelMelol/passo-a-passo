"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { forwardRef } from "react";
import type { OptionLetter } from "@/types/question";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  selected: OptionLetter | null;
  correctOption: OptionLetter;
}

/** Faixa de resultado mostrada logo após responder. Recebe o foco para leitores de tela. */
export const AnswerFeedback = forwardRef<HTMLDivElement, AnswerFeedbackProps>(function AnswerFeedback(
  { isCorrect, selected, correctOption },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className={`flex items-start gap-3 rounded-xl border-2 p-4 ${
        isCorrect ? "border-success bg-success-soft" : "border-danger bg-danger-soft"
      }`}
    >
      {isCorrect ? (
        <CircleCheck aria-hidden className="size-8 shrink-0 text-success" />
      ) : (
        <CircleX aria-hidden className="size-8 shrink-0 text-danger" />
      )}
      <div>
        <p className={`text-lg font-bold ${isCorrect ? "text-success" : "text-danger"}`}>
          {isCorrect ? "Resposta correta!" : selected ? "Resposta incorreta" : "Questão em branco"}
        </p>
        <p className="text-ink">
          {isCorrect
            ? `Muito bem! A letra ${correctOption} é a resposta certa.`
            : selected
              ? `Você marcou a letra ${selected}. A resposta correta é a letra ${correctOption}.`
              : `A resposta correta é a letra ${correctOption}.`}
        </p>
      </div>
    </div>
  );
});
