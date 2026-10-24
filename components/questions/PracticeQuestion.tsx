"use client";

import { ArrowRight, Eye, EyeOff, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { checkAnswer } from "@/lib/grading";
import type { OptionLetter, Question } from "@/types/question";
import { AnswerFeedback } from "./AnswerFeedback";
import { ExplanationPanel } from "./ExplanationPanel";
import { OptionList } from "./OptionList";
import { QuestionView } from "./QuestionView";

interface PracticeQuestionProps {
  question: Question;
  heading: string;
  /** Resposta já registrada (ao retomar uma lista). Se existir, a correção é mostrada. */
  savedAnswer?: OptionLetter;
  onAnswer: (selected: OptionLetter, isCorrect: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
  focusOnMount?: boolean;
}

/**
 * Uma questão no modo prática: escolher → Responder → correção → explicação → próxima.
 * O gabarito só aparece depois da resposta.
 */
export function PracticeQuestion({
  question,
  heading,
  savedAnswer,
  onAnswer,
  onNext,
  nextLabel = "Próxima questão",
  focusOnMount = false,
}: PracticeQuestionProps) {
  const [selected, setSelected] = useState<OptionLetter | null>(savedAnswer ?? null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const answeredHere = useRef(false);
  const explanationId = useId();

  const revealed = savedAnswer !== undefined;
  const result = revealed ? checkAnswer(question, savedAnswer) : null;

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  useEffect(() => {
    if (revealed && answeredHere.current) feedbackRef.current?.focus();
  }, [revealed]);

  function handleSubmit() {
    const check = checkAnswer(question, selected);
    if (check.status === "invalid") {
      setError(check.reason);
      return;
    }
    setError(null);
    answeredHere.current = true;
    onAnswer(check.selected, check.status === "correct");
  }

  return (
    <QuestionView ref={headingRef} question={question} heading={heading}>
      <OptionList
        name={`questao-${question.id}`}
        legend="Alternativas"
        options={question.options}
        selected={revealed ? savedAnswer : selected}
        onSelect={(letter) => {
          setSelected(letter);
          setError(null);
        }}
        correctOption={revealed ? question.correctOption : null}
      />

      {error && (
        <Notice tone="warning" role="alert">
          {error}
        </Notice>
      )}

      {result && result.status !== "invalid" && (
        <AnswerFeedback
          ref={feedbackRef}
          isCorrect={result.status === "correct"}
          selected={result.selected}
          correctOption={result.correctOption}
        />
      )}

      {!revealed ? (
        <Button size="lg" className="w-full sm:w-auto" onClick={handleSubmit} disabled={!selected} icon={<Send aria-hidden className="size-5" />}>
          Responder
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              aria-expanded={showExplanation}
              aria-controls={explanationId}
              onClick={() => setShowExplanation((value) => !value)}
              icon={showExplanation ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
            >
              {showExplanation ? "Ocultar explicação" : "Ver explicação"}
            </Button>
            <Button size="lg" onClick={onNext} icon={<ArrowRight aria-hidden className="size-5" />} className="sm:ml-auto">
              {nextLabel}
            </Button>
          </div>
          <div id={explanationId}>
            {showExplanation && <ExplanationPanel question={question} selected={savedAnswer ?? null} />}
          </div>
        </div>
      )}
    </QuestionView>
  );
}
