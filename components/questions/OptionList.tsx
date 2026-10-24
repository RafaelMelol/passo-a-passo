"use client";

import { CircleCheck, CircleX } from "lucide-react";
import type { OptionLetter, QuestionOption } from "@/types/question";

interface OptionListProps {
  name: string;
  legend: string;
  options: readonly QuestionOption[];
  selected: OptionLetter | null;
  onSelect?: (letter: OptionLetter) => void;
  /** Quando informado, mostra a correção (resposta certa e a marcada). */
  correctOption?: OptionLetter | null;
}

export function OptionList({ name, legend, options, selected, onSelect, correctOption = null }: OptionListProps) {
  const revealed = correctOption !== null;

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const isSelected = selected === option.letter;
        const isCorrect = revealed && option.letter === correctOption;
        const isWrongChoice = revealed && isSelected && !isCorrect;

        let box = "border-line bg-surface hover:border-brand/60";
        let circle = "border-line-strong text-ink";
        if (isCorrect) {
          box = "border-success bg-success-soft";
          circle = "border-success bg-success text-white";
        } else if (isWrongChoice) {
          box = "border-danger bg-danger-soft";
          circle = "border-danger bg-danger text-white";
        } else if (isSelected) {
          box = "border-brand bg-brand-soft";
          circle = "border-brand bg-brand text-white";
        } else if (revealed) {
          box = "border-line bg-surface";
        }

        return (
          <label
            key={option.letter}
            className={`flex min-h-14 items-start gap-3 rounded-xl border-2 p-3 transition-colors sm:p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/40 ${box} ${
              revealed ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.letter}
              checked={isSelected}
              disabled={revealed}
              onChange={() => onSelect?.(option.letter)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-base font-bold ${circle}`}
            >
              {option.letter}
            </span>
            <span className="flex-1 pt-1">
              <span className="sr-only">Letra {option.letter}: </span>
              {option.text}
              {isCorrect && (
                <span className="mt-1 flex items-center gap-1 text-sm font-bold text-success">
                  <CircleCheck aria-hidden className="size-4" /> Resposta correta
                </span>
              )}
              {isWrongChoice && (
                <span className="mt-1 flex items-center gap-1 text-sm font-bold text-danger">
                  <CircleX aria-hidden className="size-4" /> Sua resposta
                </span>
              )}
              {revealed && isSelected && isCorrect && <span className="sr-only"> (sua resposta)</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
