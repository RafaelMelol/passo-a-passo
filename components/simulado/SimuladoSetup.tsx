"use client";

import { ClipboardList, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { SUBJECT_STYLES } from "@/components/ui/subject-style";
import { DIFFICULTIES, SUBJECTS } from "@/data/subjects";
import { useStudyData } from "@/hooks/useStudyData";
import { questionBank } from "@/lib/questions/bank";
import { MAX_SIMULADO_QUESTIONS, availableForSimulado, countAnswered, createSimulado } from "@/lib/simulado";
import type { Difficulty, SubjectId } from "@/types/question";

const COUNT_OPTIONS = [5, 10, 20, 30] as const;

function choiceClass(active: boolean) {
  return `flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-center font-bold has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/40 ${
    active ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface hover:border-brand/60"
  }`;
}

export function SimuladoSetup() {
  const router = useRouter();
  const { state, update } = useStudyData();
  const [count, setCount] = useState<number>(10);
  const [customCount, setCustomCount] = useState("");
  const [mixAll, setMixAll] = useState(true);
  const [chosen, setChosen] = useState<SubjectId[]>(["portugues"]);
  const [difficulty, setDifficulty] = useState<Difficulty | "todas">("todas");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state) return <LoadingState />;

  const active = state.data.activeSimulado;
  const subjects = mixAll ? [] : chosen;
  const available = availableForSimulado(questionBank.questions, { subjects, difficulty }).length;
  const isCustom = !COUNT_OPTIONS.includes(count as (typeof COUNT_OPTIONS)[number]);
  const finalCount = Math.min(count, available);

  function toggleSubject(subject: SubjectId) {
    setChosen((current) => (current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]));
  }

  function start() {
    setConfirmReplace(false);
    const result = createSimulado(questionBank.questions, { questionCount: count, subjects, difficulty, timerEnabled });
    if (!result.ok) {
      setError(
        result.reason === "sem-questoes"
          ? "Não há questões com essas escolhas. Tente outra combinação."
          : `Escolha uma quantidade entre 1 e ${MAX_SIMULADO_QUESTIONS} questões.`,
      );
      return;
    }
    update((data) => ({
      ...data,
      activeSimulado: result.session,
      lastActivity: { kind: "simulado", title: "Simulado em andamento", href: "/simulado/fazer", at: result.session.startedAt },
    }));
    router.push("/simulado/fazer");
  }

  function handleStart() {
    setError(null);
    if (!mixAll && chosen.length === 0) {
      setError("Escolha pelo menos uma disciplina.");
      return;
    }
    if (active) setConfirmReplace(true);
    else start();
  }

  return (
    <div className="space-y-6">
      {active && (
        <Card className="space-y-3 border-brand/40 bg-brand-soft">
          <h2 className="text-xl font-bold">Você tem um simulado em andamento</h2>
          <p className="text-ink-soft">
            {countAnswered(active)} de {active.questionIds.length} questões respondidas. Suas respostas estão guardadas.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/simulado/fazer" icon={<ClipboardList aria-hidden className="size-5" />}>
              Continuar simulado
            </ButtonLink>
            <Button variant="ghost" onClick={() => setConfirmDiscard(true)} icon={<Trash2 aria-hidden className="size-5" />}>
              Descartar simulado
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <fieldset>
          <legend className="mb-3 text-xl font-bold">1. Quantas questões?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {COUNT_OPTIONS.map((option) => (
              <label key={option} className={choiceClass(count === option)}>
                <input
                  type="radio"
                  name="quantidade"
                  checked={count === option}
                  onChange={() => {
                    setCount(option);
                    setCustomCount("");
                  }}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
            <label className={`${choiceClass(isCustom)} col-span-2 sm:col-span-1`}>
              <span>Outra:</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_SIMULADO_QUESTIONS}
                value={customCount}
                placeholder="nº"
                aria-label="Outra quantidade de questões"
                onChange={(event) => {
                  setCustomCount(event.target.value);
                  const value = Number.parseInt(event.target.value, 10);
                  if (Number.isInteger(value) && value >= 1 && value <= MAX_SIMULADO_QUESTIONS) setCount(value);
                }}
                className="w-16 rounded-lg border border-line-strong bg-surface px-2 py-1 text-center font-bold text-ink"
              />
            </label>
          </div>
        </fieldset>
      </Card>

      <Card>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-xl font-bold">2. Quais disciplinas?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={choiceClass(mixAll)}>
              <input type="radio" name="modo" checked={mixAll} onChange={() => setMixAll(true)} className="sr-only" />
              Todas misturadas
            </label>
            <label className={choiceClass(!mixAll)}>
              <input type="radio" name="modo" checked={!mixAll} onChange={() => setMixAll(false)} className="sr-only" />
              Escolher disciplinas
            </label>
          </div>
          {!mixAll && (
            <div className="grid gap-2 sm:grid-cols-3">
              {SUBJECTS.map((subject) => {
                const style = SUBJECT_STYLES[subject.id];
                const Icon = style.icon;
                const checked = chosen.includes(subject.id);
                return (
                  <label key={subject.id} className={choiceClass(checked)}>
                    <input type="checkbox" checked={checked} onChange={() => toggleSubject(subject.id)} className="sr-only" />
                    <Icon aria-hidden className={`size-5 ${style.text}`} />
                    {subject.name}
                    {checked && <span className="sr-only">(selecionada)</span>}
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      </Card>

      <Card>
        <fieldset>
          <legend className="mb-3 text-xl font-bold">3. Nível de dificuldade</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ id: "todas" as const, name: "Todos" }, ...DIFFICULTIES].map((item) => (
              <label key={item.id} className={choiceClass(difficulty === item.id)}>
                <input
                  type="radio"
                  name="nivel"
                  checked={difficulty === item.id}
                  onChange={() => setDifficulty(item.id)}
                  className="sr-only"
                />
                {item.name}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xl font-bold">4. Cronômetro (opcional)</h2>
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(event) => setTimerEnabled(event.target.checked)}
            className="size-6 accent-brand"
          />
          <span className="font-bold">Mostrar o tempo na tela</span>
        </label>
        <p className="text-ink-soft">
          Não há limite de tempo. O tempo gasto aparece no resultado de qualquer forma; o cronômetro só mostra a contagem enquanto
          você responde, e pode ser escondido a qualquer momento.
        </p>
      </Card>

      {error && (
        <Notice tone="warning" role="alert">
          {error}
        </Notice>
      )}

      {available > 0 && count > available && (
        <Notice tone="warning" title="Não há questões suficientes">
          Com essas escolhas existem {available} questões. O simulado terá {available} questões, sem repetir nenhuma.
        </Notice>
      )}

      <div className="flex flex-col items-start gap-3 rounded-2xl bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg" aria-live="polite">
          {available === 0 ? (
            "Não há questões com essas escolhas."
          ) : (
            <>
              Seu simulado terá <span className="font-bold">{finalCount} questões</span>.
            </>
          )}
        </p>
        <Button size="lg" onClick={handleStart} disabled={available === 0} icon={<Play aria-hidden className="size-5" />}>
          Começar simulado
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReplace}
        title="Começar um novo simulado?"
        confirmLabel="Sim, começar novo"
        cancelLabel="Voltar"
        onConfirm={start}
        onCancel={() => setConfirmReplace(false)}
      >
        <p>O simulado que está em andamento será descartado e as respostas dele não serão guardadas.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDiscard}
        title="Descartar o simulado em andamento?"
        confirmLabel="Sim, descartar"
        tone="danger"
        onConfirm={() => {
          update((data) => ({ ...data, activeSimulado: null }));
          setConfirmDiscard(false);
        }}
        onCancel={() => setConfirmDiscard(false)}
      >
        <p>As respostas desse simulado serão apagadas. Esta ação não pode ser desfeita.</p>
      </ConfirmDialog>
    </div>
  );
}
