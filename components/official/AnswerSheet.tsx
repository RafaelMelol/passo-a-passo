"use client";

import { CircleCheck, CircleMinus, CircleSlash, CircleX, ClipboardCheck, FileText, PencilLine, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink, ExternalLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { getOfficialExam } from "@/data/official-exams";
import { findTopic, topicName } from "@/data/subjects";
import { useStartPractice } from "@/hooks/useStartPractice";
import { useStudyData } from "@/hooks/useStudyData";
import { encouragement, plural } from "@/lib/format";
import { MAX_OFFICIAL_ATTEMPTS } from "@/lib/history";
import { gradeOfficialExam, sectionQuestionNumbers, type OfficialExamGrade, type OfficialItemResult } from "@/lib/official";
import { createId } from "@/lib/random";
import type { OfficialExamSection } from "@/types/official";
import { OPTION_LETTERS, type OptionLetter } from "@/types/question";

const STATUS_VIEW: Record<OfficialItemResult["status"], { label: string; icon: React.ReactNode }> = {
  certa: { label: "Certa", icon: <CircleCheck aria-hidden className="size-5 text-success" /> },
  errada: { label: "Errada", icon: <CircleX aria-hidden className="size-5 text-danger" /> },
  "em-branco": { label: "Em branco", icon: <CircleMinus aria-hidden className="size-5 text-warning" /> },
  anulada: { label: "Anulada pela banca", icon: <CircleSlash aria-hidden className="size-5 text-ink-soft" /> },
};

/** Dados mínimos de uma prova para o cartão-resposta (provas do site ou do banco central). */
export interface SheetExam {
  id: string;
  title: string;
  examBoard: string;
  bookletType: string;
  optionCount: number;
  sections: OfficialExamSection[];
  bookletUrl: string;
}

type Grader = (answers: Record<string, OptionLetter>, sectionIds: string[]) => Promise<OfficialExamGrade>;

function NotFound() {
  return (
    <EmptyState
      icon={<SearchX aria-hidden />}
      title="Prova não encontrada"
      description="Escolha uma das provas oficiais disponíveis."
      action={<ButtonLink href="/provas-oficiais">Ver provas oficiais</ButtonLink>}
    />
  );
}

/** Escolhe a prova: as conferidas do site são corrigidas no navegador; as do banco central, no servidor. */
export function AnswerSheet() {
  const params = useSearchParams();
  const id = params.get("prova") ?? "";
  const staticExam = getOfficialExam(id);
  const [remote, setRemote] = useState<{ id: string; exam: SheetExam | null; error?: string } | null>(null);

  useEffect(() => {
    if (staticExam || !/^[a-z0-9][a-z0-9-]{2,80}$/.test(id)) return;
    let active = true;
    fetch(`/api/exams/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 404) return setRemote({ id, exam: null });
        if (!response.ok) return setRemote({ id, exam: null, error: "O banco de provas está indisponível no momento. Tente mais tarde." });
        const data = (await response.json()) as SheetExam;
        setRemote({ id, exam: { ...data, bookletUrl: data.bookletUrl } });
      })
      .catch(() => active && setRemote({ id, exam: null, error: "Sem conexão com a internet: esta prova precisa da internet para ser corrigida." }));
    return () => {
      active = false;
    };
  }, [id, staticExam]);

  if (staticExam) {
    const exam: SheetExam = { ...staticExam, bookletUrl: staticExam.links.booklet };
    return <AnswerSheetView exam={exam} grade={async (answers, sectionIds) => gradeOfficialExam(staticExam, answers, sectionIds)} />;
  }
  if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(id)) return <NotFound />;
  if (!remote || remote.id !== id) return <LoadingState label="Carregando prova…" />;
  if (remote.error) return <Notice tone="warning" title="Não foi possível abrir a prova">{remote.error}</Notice>;
  if (!remote.exam) return <NotFound />;
  return (
    <AnswerSheetView
      exam={remote.exam}
      grade={async (answers, sectionIds) => {
        const response = await fetch(`/api/exams/${encodeURIComponent(id)}/grade`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers, sectionIds }),
        });
        if (!response.ok) throw new Error("Não foi possível corrigir agora. Verifique a internet e tente de novo.");
        return (await response.json()) as OfficialExamGrade;
      }}
    />
  );
}

function AnswerSheetView({ exam, grade: gradeWith }: { exam: SheetExam; grade: Grader }) {
  const { state, update } = useStudyData();
  const startPractice = useStartPractice();
  const [result, setResult] = useState<OfficialExamGrade | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [confirmGrade, setConfirmGrade] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  // "Caderno único" (Encceja) vira "único" para não repetir a palavra "caderno".
  const bookletName = exam.bookletType.replace(/^caderno\s+/i, "");

  const header = (
    <PageHeader
      title={exam.title}
      back={{ href: "/provas-oficiais", label: "Provas oficiais" }}
      description={`Cartão-resposta · ${exam.examBoard} · caderno ${bookletName}`}
    />
  );

  if (!state) return <LoadingState />;

  const currentExam = exam;
  const draft = state.data.officialDrafts[exam.id];
  const sectionIds = draft?.sectionIds ?? exam.sections.filter((section) => section.subject).map((section) => section.id);
  const answers = draft?.answers ?? {};
  const letters = OPTION_LETTERS.slice(0, exam.optionCount);
  const chosenSections = exam.sections.filter((section) => sectionIds.includes(section.id));
  const numbers = chosenSections.flatMap(sectionQuestionNumbers);
  const answeredCount = numbers.filter((number) => answers[String(number)]).length;

  function saveDraft(nextSections: string[], nextAnswers: Record<string, OptionLetter>) {
    update((data) => ({
      ...data,
      officialDrafts: {
        ...data.officialDrafts,
        [currentExam.id]: { examId: currentExam.id, sectionIds: nextSections, answers: nextAnswers, updatedAt: new Date().toISOString() },
      },
      lastActivity: {
        kind: "prova-oficial",
        title: currentExam.title,
        href: `/provas-oficiais/cartao?prova=${encodeURIComponent(currentExam.id)}`,
        at: new Date().toISOString(),
      },
    }));
  }

  function toggleSection(id: string) {
    const next = sectionIds.includes(id) ? sectionIds.filter((item) => item !== id) : [...sectionIds, id];
    saveDraft(next, answers);
  }

  function mark(number: number, letter: OptionLetter | null) {
    const next = { ...answers };
    if (letter) next[String(number)] = letter;
    else delete next[String(number)];
    saveDraft(sectionIds, next);
  }

  async function grade() {
    setConfirmGrade(false);
    setGrading(true);
    setGradeError(null);
    let graded: OfficialExamGrade;
    try {
      graded = await gradeWith(answers, sectionIds);
    } catch (error) {
      setGradeError(error instanceof Error ? error.message : "Não foi possível corrigir agora.");
      setGrading(false);
      return;
    }
    setGrading(false);
    update((data) => ({
      ...data,
      officialAttempts: [
        ...data.officialAttempts,
        {
          id: createId("prova"),
          examId: currentExam.id,
          sectionIds,
          answers,
          finishedAt: new Date().toISOString(),
          score: graded.score,
        },
      ].slice(-MAX_OFFICIAL_ATTEMPTS),
    }));
    setResult(graded);
    window.scrollTo({ top: 0 });
  }

  if (result) {
    return (
      <>
        {header}
        <div className="space-y-6">
          <Card className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">Resultado da correção</h2>
            <p className="text-5xl font-bold text-brand">
              {result.score.correct} de {result.score.total}
            </p>
            <p className="text-lg">acertos ({result.score.percentage}%)</p>
            <p className="text-ink-soft">{encouragement(result.score.percentage, result.score.total)}</p>
            {result.annulled.length > 0 && (
              <Notice tone="info" className="text-left">
                {plural(result.annulled.length, "questão anulada", "questões anuladas")} pela banca (
                {result.annulled.join(", ")}) não {result.annulled.length === 1 ? "entra" : "entram"} na conta.
              </Notice>
            )}
          </Card>

          <Card className="space-y-3">
            <CardTitle>Por parte da prova</CardTitle>
            <ul className="space-y-3">
              {result.sections.map(({ section, score }) => (
                <li key={section.id} className="space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">{section.title}</span>
                    <span className="text-ink-soft">
                      {score.correct} de {score.total} ({score.percentage}%)
                    </span>
                  </div>
                  <ProgressBar value={score.correct} max={score.total} label={`Acertos em ${section.title}`} barClassName="bg-success" />
                </li>
              ))}
            </ul>
          </Card>

          {result.topicsToPractice.length > 0 && (
            <Card className="space-y-3">
              <CardTitle>Assuntos para praticar</CardTitle>
              <p className="text-ink-soft">Com base nas questões que você errou ou deixou em branco.</p>
              <ul className="space-y-2">
                {result.topicsToPractice.map(({ topic, wrong }) => {
                  const info = findTopic(topic);
                  if (!info) return null;
                  return (
                    <li key={topic} className="flex flex-col gap-2 rounded-xl bg-page p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        <span className="font-bold">{topicName(topic)}</span>
                        <span className="text-ink-soft"> · {plural(wrong, "questão", "questões")} para rever</span>
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => startPractice({ subject: info.subject.id, topic: info.id, difficulty: "todas" })}
                      >
                        Praticar este assunto
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="space-y-3">
            <CardTitle>Questão por questão</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line text-sm text-ink-soft">
                    <th scope="col" className="py-2 pr-3">Nº</th>
                    <th scope="col" className="py-2 pr-3">Sua resposta</th>
                    <th scope="col" className="py-2 pr-3">Gabarito</th>
                    <th scope="col" className="py-2 pr-3">Resultado</th>
                    <th scope="col" className="py-2">Assunto</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.number} className="border-b border-line/60">
                      <td className="py-2 pr-3 font-bold">{item.number}</td>
                      <td className="py-2 pr-3">{item.selected ?? "—"}</td>
                      <td className="py-2 pr-3">{item.answer ?? "Anulada"}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-1">
                          {STATUS_VIEW[item.status].icon}
                          {STATUS_VIEW[item.status].label}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-ink-soft">{item.topicLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-ink-soft">
              Para entender cada questão, abra a prova oficial e compare com o gabarito. Os assuntos são uma indicação aproximada
              feita por este site.
            </p>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setResult(null)} icon={<PencilLine aria-hidden className="size-5" />}>
              Voltar ao cartão-resposta
            </Button>
            <ButtonLink href="/provas-oficiais" variant="secondary">
              Ver outras provas
            </ButtonLink>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="space-y-6">
        <Card className="space-y-3">
          <CardTitle>Antes de começar</CardTitle>
          <ol className="list-decimal space-y-1 pl-5 text-ink-soft">
            <li>
              Abra o caderno de prova <strong className="text-ink">{bookletName}</strong> no site da banca.
            </li>
            <li>Resolva as questões e marque aqui a letra escolhida em cada uma.</li>
            <li>Suas marcações ficam salvas: você pode parar e continuar depois.</li>
          </ol>
          <ExternalLink href={exam.bookletUrl} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand underline">
            <FileText aria-hidden className="size-5" /> Abrir a prova oficial (PDF)
          </ExternalLink>
        </Card>

        <Card>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xl font-bold">Quais partes você vai responder?</legend>
            {exam.sections.map((section) => (
              <label key={section.id} className="flex min-h-12 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={sectionIds.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className="size-6 accent-brand"
                />
                <span>
                  <span className="font-bold">{section.title}</span>
                  <span className="text-ink-soft">
                    {" "}
                    · questões {section.firstQuestion} a {section.lastQuestion}
                    {!section.subject && " (não faz parte das 3 disciplinas do site)"}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </Card>

        {chosenSections.length === 0 ? (
          <Notice tone="warning">Marque pelo menos uma parte da prova para responder.</Notice>
        ) : (
          chosenSections.map((section) => (
            <Card key={section.id}>
              <fieldset className="space-y-1">
                <legend className="mb-2 text-xl font-bold">{section.title}</legend>
                {sectionQuestionNumbers(section).map((number) => {
                  const selected = answers[String(number)] ?? null;
                  return (
                    <div key={number} role="radiogroup" aria-label={`Questão ${number}`} className="flex items-center gap-2 border-b border-line/60 py-2">
                      <span className="w-14 shrink-0 font-bold">{String(number).padStart(2, "0")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {letters.map((letter) => (
                          <label
                            key={letter}
                            className={`grid size-11 cursor-pointer place-items-center rounded-full border-2 font-bold has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/40 ${
                              selected === letter ? "border-brand bg-brand text-white" : "border-line-strong bg-surface hover:border-brand"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${number}`}
                              value={letter}
                              checked={selected === letter}
                              onChange={() => mark(number, letter)}
                              className="sr-only"
                            />
                            <span aria-hidden>{letter}</span>
                            <span className="sr-only">Letra {letter}</span>
                          </label>
                        ))}
                      </div>
                      {selected && (
                        <button
                          type="button"
                          onClick={() => mark(number, null)}
                          className="ml-auto min-h-11 rounded-lg px-2 text-sm font-bold text-ink-soft hover:text-danger"
                          aria-label={`Apagar resposta da questão ${number}`}
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                  );
                })}
              </fieldset>
            </Card>
          ))
        )}

        {gradeError && (
          <Notice tone="danger" role="alert">
            {gradeError}
          </Notice>
        )}
        <div className="sticky bottom-20 z-20 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between xl:bottom-4">
          <p className="font-bold" aria-live="polite">
            {answeredCount} de {numbers.length} questões marcadas
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {answeredCount > 0 && (
              <Button variant="ghost" onClick={() => setConfirmClear(true)}>
                Limpar tudo
              </Button>
            )}
            <Button onClick={() => setConfirmGrade(true)} disabled={numbers.length === 0 || grading} icon={<ClipboardCheck aria-hidden className="size-5" />}>
              {grading ? "Corrigindo…" : "Corrigir minhas respostas"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmGrade}
        title="Corrigir agora?"
        confirmLabel="Corrigir"
        cancelLabel="Continuar marcando"
        onConfirm={grade}
        onCancel={() => setConfirmGrade(false)}
      >
        {answeredCount < numbers.length ? (
          <p>
            {plural(numbers.length - answeredCount, "questão está", "questões estão")} sem resposta e {numbers.length - answeredCount === 1 ? "contará" : "contarão"} como em branco.
          </p>
        ) : (
          <p>Todas as questões escolhidas estão marcadas.</p>
        )}
        <p>Depois da correção, você ainda pode voltar e mudar as respostas.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmClear}
        title="Apagar todas as marcações?"
        confirmLabel="Sim, apagar"
        tone="danger"
        onConfirm={() => {
          saveDraft(sectionIds, {});
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      >
        <p>As letras marcadas neste cartão-resposta serão apagadas.</p>
      </ConfirmDialog>
    </>
  );
}
