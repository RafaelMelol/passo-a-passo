import type { OfficialExam, OfficialExamSection } from "@/types/official";
import { OPTION_LETTERS, type OptionLetter, type TopicId } from "@/types/question";
import type { ScoreSummary } from "@/types/study";
import { summarizeScore } from "./grading";
import { isHttpUrl } from "./questions/validation";

/** Confere se os dados de uma prova oficial são coerentes. */
export function validateOfficialExam(exam: OfficialExam): string[] {
  const errors: string[] = [];
  const allowed = OPTION_LETTERS.slice(0, exam.optionCount);

  if (exam.answerKey.length !== exam.questionCount) {
    errors.push(`O gabarito tem ${exam.answerKey.length} respostas, mas a prova tem ${exam.questionCount} questões.`);
  }
  exam.answerKey.forEach((item, index) => {
    if (item.number !== index + 1) errors.push(`Gabarito fora de ordem na posição ${index + 1}.`);
    if (item.status === "anulada" && item.answer !== null) errors.push(`Questão ${item.number} anulada não pode ter resposta.`);
    if (item.status === "valida" && (item.answer === null || !allowed.includes(item.answer))) {
      errors.push(`Questão ${item.number} com resposta inválida.`);
    }
  });

  const covered = new Set<number>();
  for (const section of exam.sections) {
    if (section.firstQuestion > section.lastQuestion) errors.push(`Seção ${section.title} com intervalo invertido.`);
    for (let n = section.firstQuestion; n <= section.lastQuestion; n++) {
      if (covered.has(n)) errors.push(`Questão ${n} aparece em mais de uma seção.`);
      covered.add(n);
    }
  }
  if (covered.size !== exam.questionCount || [...covered].some((n) => n < 1 || n > exam.questionCount)) {
    errors.push("As seções não cobrem todas as questões da prova.");
  }

  for (const [name, url] of Object.entries(exam.links)) {
    if (url !== undefined && !isHttpUrl(url)) errors.push(`Link inválido: ${name}.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exam.verification.checkedAt)) errors.push("Data de verificação inválida.");
  return errors;
}

export function sectionQuestionNumbers(section: OfficialExamSection): number[] {
  return Array.from({ length: section.lastQuestion - section.firstQuestion + 1 }, (_, i) => section.firstQuestion + i);
}

export interface OfficialItemResult {
  number: number;
  sectionId: string;
  selected: OptionLetter | null;
  answer: OptionLetter | null;
  status: "certa" | "errada" | "em-branco" | "anulada";
  topic?: TopicId;
  topicLabel?: string;
}

export interface OfficialSectionResult {
  section: OfficialExamSection;
  score: ScoreSummary;
  annulled: number[];
}

export interface OfficialExamGrade {
  items: OfficialItemResult[];
  sections: OfficialSectionResult[];
  score: ScoreSummary;
  annulled: number[];
  /** Assuntos do site com erros, para sugerir prática. */
  topicsToPractice: { topic: TopicId; wrong: number }[];
}

/**
 * Corrige o cartão-resposta pelas seções escolhidas.
 * Questões anuladas não contam a favor nem contra.
 */
export function gradeOfficialExam(
  exam: OfficialExam,
  answers: Readonly<Record<string, OptionLetter>>,
  sectionIds: readonly string[],
): OfficialExamGrade {
  const keyByNumber = new Map(exam.answerKey.map((item) => [item.number, item]));
  const chosen = exam.sections.filter((section) => sectionIds.includes(section.id));
  const items: OfficialItemResult[] = [];
  const sections: OfficialSectionResult[] = [];

  for (const section of chosen) {
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    const annulled: number[] = [];
    for (const number of sectionQuestionNumbers(section)) {
      const key = keyByNumber.get(number);
      if (!key) continue;
      const selected = answers[String(number)] ?? null;
      let status: OfficialItemResult["status"];
      if (key.status === "anulada" || key.answer === null) {
        status = "anulada";
        annulled.push(number);
      } else if (!selected) {
        status = "em-branco";
        blank++;
      } else if (selected === key.answer) {
        status = "certa";
        correct++;
      } else {
        status = "errada";
        wrong++;
      }
      items.push({
        number,
        sectionId: section.id,
        selected,
        answer: key.answer,
        status,
        ...(key.topic ? { topic: key.topic } : {}),
        ...(key.topicLabel ? { topicLabel: key.topicLabel } : {}),
      });
    }
    sections.push({ section, score: summarizeScore(correct, wrong, blank), annulled });
  }

  const totals = sections.reduce(
    (acc, item) => ({
      correct: acc.correct + item.score.correct,
      wrong: acc.wrong + item.score.wrong,
      blank: acc.blank + item.score.blank,
    }),
    { correct: 0, wrong: 0, blank: 0 },
  );

  const wrongByTopic = new Map<TopicId, number>();
  for (const item of items) {
    if ((item.status === "errada" || item.status === "em-branco") && item.topic) {
      wrongByTopic.set(item.topic, (wrongByTopic.get(item.topic) ?? 0) + 1);
    }
  }

  return {
    items,
    sections,
    score: summarizeScore(totals.correct, totals.wrong, totals.blank),
    annulled: sections.flatMap((item) => item.annulled),
    topicsToPractice: [...wrongByTopic.entries()]
      .map(([topic, wrong]) => ({ topic, wrong }))
      .sort((a, b) => b.wrong - a.wrong),
  };
}

/** Seções que correspondem às disciplinas do site (marcadas por padrão). */
export function defaultSectionIds(exam: OfficialExam): string[] {
  return exam.sections.filter((section) => section.subject).map((section) => section.id);
}
