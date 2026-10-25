"use client";

import { ChevronLeft, ChevronRight, ClipboardList, Eye, EyeOff, Flag, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { OptionList } from "@/components/questions/OptionList";
import { QuestionView } from "@/components/questions/QuestionView";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useStudyData } from "@/hooks/useStudyData";
import { formatClock, plural } from "@/lib/format";
import { MAX_SIMULADOS, recordAttempts } from "@/lib/history";
import { countAnswered, finishSimulado } from "@/lib/simulado";
import { studyStore } from "@/lib/study-store";
import type { OptionLetter } from "@/types/question";
import { QuestionNavigator } from "./QuestionNavigator";

/**
 * Soma ao simulado o tempo desde o início do trecho atual.
 * O tempo só corre com a página visível, então sair e voltar depois não infla o resultado.
 */
function commitElapsed(segmentStart: RefObject<number | null>) {
  if (segmentStart.current === null) return;
  const delta = Date.now() - segmentStart.current;
  segmentStart.current = document.visibilityState === "hidden" ? null : Date.now();
  studyStore.update((data) =>
    data.activeSimulado
      ? { ...data, activeSimulado: { ...data.activeSimulado, elapsedMs: data.activeSimulado.elapsedMs + delta } }
      : data,
  );
}

/**
 * Relógio do simulado. Recebe o tempo já acumulado e conta a partir de quando foi montado
 * (o componente é remontado sempre que o tempo acumulado muda) ou de quando a página voltou a ficar visível.
 */
function Clock({ baseMs }: { baseMs: number }) {
  const [start, setStart] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const time = Date.now();
        setStart(time);
        setNow(time);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return (
    <span role="timer" className="font-mono text-xl font-bold tabular-nums">
      {formatClock(baseMs + Math.max(0, now - start))}
    </span>
  );
}

export function SimuladoRunner() {
  const router = useRouter();
  const { state, update } = useStudyData();
  const questionBank = useQuestionBank();
  const getQuestion = (id: string) => questionBank.byId.get(id);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showClock, setShowClock] = useState(true);
  const segmentStart = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasSession = Boolean(state?.data.activeSimulado);

  useEffect(() => {
    if (!hasSession) return;
    segmentStart.current = Date.now();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") commitElapsed(segmentStart);
      else if (segmentStart.current === null) segmentStart.current = Date.now();
    };
    const onPageHide = () => commitElapsed(segmentStart);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      commitElapsed(segmentStart);
    };
  }, [hasSession]);

  if (!state || finishing) return <LoadingState label={finishing ? "Corrigindo seu simulado…" : undefined} />;

  const session = state.data.activeSimulado;
  if (!session) {
    return (
      <EmptyState
        icon={<ClipboardList aria-hidden />}
        title="Nenhum simulado em andamento"
        description="Monte um simulado escolhendo a quantidade de questões e as disciplinas."
        action={<ButtonLink href="/simulado">Montar um simulado</ButtonLink>}
      />
    );
  }

  const total = session.questionIds.length;
  const index = Math.min(session.currentIndex, total - 1);
  const question = getQuestion(session.questionIds[index]);
  const answered = countAnswered(session);
  const pending = total - answered;
  const currentSession = session;

  function goTo(nextIndex: number) {
    update((data) =>
      data.activeSimulado ? { ...data, activeSimulado: { ...data.activeSimulado, currentIndex: nextIndex } } : data,
    );
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }

  function select(letter: OptionLetter) {
    const id = currentSession.questionIds[index];
    update((data) =>
      data.activeSimulado
        ? {
            ...data,
            activeSimulado: { ...data.activeSimulado, answers: { ...data.activeSimulado.answers, [id]: letter } },
            lastActivity: { kind: "simulado", title: "Simulado em andamento", href: "/simulado/fazer", at: new Date().toISOString() },
          }
        : data,
    );
  }

  function finish() {
    setConfirmFinish(false);
    setFinishing(true);
    const running = segmentStart.current === null ? 0 : Date.now() - segmentStart.current;
    segmentStart.current = null;
    const finishedAt = new Date();
    const { result, attempts } = finishSimulado(currentSession, getQuestion, finishedAt, currentSession.elapsedMs + running);
    update((data) => {
      const withAttempts = recordAttempts(data, attempts);
      return {
        ...withAttempts,
        simulados: [...data.simulados, result].slice(-MAX_SIMULADOS),
        activeSimulado: null,
        lastActivity: {
          kind: "simulado",
          title: "Resultado do simulado",
          href: `/simulado/resultado?id=${encodeURIComponent(result.id)}`,
          at: finishedAt.toISOString(),
        },
      };
    });
    router.push(`/simulado/resultado?id=${encodeURIComponent(result.id)}`);
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Simulado</h1>
            <p className="text-ink-soft" aria-live="polite">
              {plural(answered, "respondida", "respondidas")} · {plural(pending, "pendente", "pendentes")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session.config.timerEnabled && (
              <div className="flex items-center gap-2 rounded-xl bg-page px-3 py-1">
                <Timer aria-hidden className="size-5 text-brand" />
                {showClock ? (
                  <Clock key={session.elapsedMs} baseMs={session.elapsedMs} />
                ) : (
                  <span className="text-ink-soft">Tempo oculto</span>
                )}
                <button
                  type="button"
                  onClick={() => setShowClock((value) => !value)}
                  className="grid min-h-11 min-w-11 place-items-center rounded-lg text-ink-soft hover:text-brand"
                  aria-label={showClock ? "Esconder o cronômetro" : "Mostrar o cronômetro"}
                >
                  {showClock ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
                </button>
              </div>
            )}
            <Button onClick={() => setConfirmFinish(true)} icon={<Flag aria-hidden className="size-5" />}>
              Finalizar simulado
            </Button>
          </div>
        </div>
        <ProgressBar value={answered} max={total} label="Questões respondidas no simulado" />
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-brand">
            <span className="group-open:hidden">Ver todas as questões</span>
            <span className="hidden group-open:inline">Esconder lista de questões</span>
          </summary>
          <div className="pt-3">
            <QuestionNavigator questionIds={session.questionIds} answers={session.answers} currentIndex={index} onSelect={goTo} />
          </div>
        </details>
      </Card>

      <Card>
        {question ? (
          <QuestionView ref={headingRef} question={question} heading={`Questão ${index + 1} de ${total}`} showSource={false}>
            <OptionList
              name={`simulado-${question.id}`}
              legend="Alternativas"
              options={question.options}
              selected={session.answers[question.id] ?? null}
              onSelect={select}
            />
            <p className="text-ink-soft" aria-live="polite">
              {session.answers[question.id]
                ? `Resposta marcada: letra ${session.answers[question.id]}. Você pode mudar até finalizar.`
                : "Marque uma alternativa. A correção aparece no final do simulado."}
            </p>
          </QuestionView>
        ) : (
          <p>Esta questão não está mais disponível no banco e será ignorada na correção.</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            icon={<ChevronLeft aria-hidden className="size-5" />}
          >
            Anterior
          </Button>
          {index < total - 1 ? (
            <Button className="ml-auto" onClick={() => goTo(index + 1)}>
              Próxima questão <ChevronRight aria-hidden className="size-5" />
            </Button>
          ) : (
            <Button className="ml-auto" onClick={() => setConfirmFinish(true)} icon={<Flag aria-hidden className="size-5" />}>
              Finalizar simulado
            </Button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmFinish}
        title="Finalizar o simulado?"
        confirmLabel="Finalizar e ver resultado"
        cancelLabel="Continuar respondendo"
        onConfirm={finish}
        onCancel={() => setConfirmFinish(false)}
      >
        {pending > 0 ? (
          <p>
            Você ainda tem <strong>{plural(pending, "questão sem resposta", "questões sem resposta")}</strong>. Elas contarão como
            erradas.
          </p>
        ) : (
          <p>Você respondeu todas as questões. Depois de finalizar, não será possível mudar as respostas.</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
