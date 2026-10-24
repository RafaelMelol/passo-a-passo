import { isDifficulty, isSubjectId, isTopicOfSubject } from "@/data/subjects";
import { OPTION_LETTERS, type Question, type VerificationStatus } from "@/types/question";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VERIFICATION_STATUSES: readonly VerificationStatus[] = ["verificada", "pendente", "divergente", "anulada"];
const MIN_YEAR = 1990;
const MAX_YEAR = 2100;

export function isHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

/**
 * Confere a estrutura e a coerência de uma questão.
 * Uma questão com erros nunca entra no banco usado para estudar.
 */
export function validateQuestion(question: Question): ValidationResult {
  const errors: string[] = [];

  if (!ID_PATTERN.test(question.id)) {
    errors.push("ID inválido: use letras minúsculas, números e hífens.");
  }
  if (!isSubjectId(question.subject)) {
    errors.push(`Disciplina desconhecida: ${String(question.subject)}.`);
  } else if (!isTopicOfSubject(question.subject, question.topic)) {
    errors.push(`O assunto "${String(question.topic)}" não pertence à disciplina ${question.subject}.`);
  }
  if (!isDifficulty(question.difficulty)) {
    errors.push(`Dificuldade inválida: ${String(question.difficulty)}.`);
  }
  if (isBlank(question.statement) || question.statement.trim().length < 10) {
    errors.push("Enunciado vazio ou curto demais.");
  }
  if (question.supportText && isBlank(question.supportText.body)) {
    errors.push("Texto de apoio vazio.");
  }

  // Alternativas: de 2 a 5, letras em sequência (A, B, C...), sem textos repetidos.
  const options = Array.isArray(question.options) ? question.options : [];
  if (options.length < 2 || options.length > OPTION_LETTERS.length) {
    errors.push("A questão precisa ter de 2 a 5 alternativas.");
  }
  options.forEach((option, index) => {
    if (option.letter !== OPTION_LETTERS[index]) {
      errors.push(`A alternativa ${index + 1} deveria ter a letra ${OPTION_LETTERS[index]}.`);
    }
    if (isBlank(option.text)) {
      errors.push(`A alternativa ${option.letter} está vazia.`);
    }
  });
  const normalizedTexts = options.map((option) => option.text?.trim().toLowerCase());
  if (new Set(normalizedTexts).size !== normalizedTexts.length) {
    errors.push("Há alternativas com o mesmo texto.");
  }

  // A resposta correta precisa ser exatamente uma das alternativas existentes.
  if (!options.some((option) => option.letter === question.correctOption)) {
    errors.push("A resposta correta não corresponde a nenhuma alternativa.");
  }

  if (isBlank(question.explanation?.summary)) {
    errors.push("Falta a explicação da resposta.");
  }

  const verification = question.verification;
  if (
    !verification ||
    !VERIFICATION_STATUSES.includes(verification.statement) ||
    !VERIFICATION_STATUSES.includes(verification.answerKey)
  ) {
    errors.push("Status de verificação inválido.");
  } else if (verification.checkedAt && !DATE_PATTERN.test(verification.checkedAt)) {
    errors.push("Data de verificação deve estar no formato AAAA-MM-DD.");
  }

  const source = question.source;
  if (!source || isBlank(source.description)) {
    errors.push("Falta a descrição da fonte.");
  } else if (question.contentType === "oficial") {
    if (!isHttpUrl(source.url)) errors.push("Questão oficial sem link de referência válido.");
    if (isBlank(source.examBoard)) errors.push("Questão oficial sem banca organizadora.");
    if (isBlank(source.exam)) errors.push("Questão oficial sem nome do concurso.");
    if (source.year === undefined || source.year < MIN_YEAR || source.year > MAX_YEAR) {
      errors.push("Questão oficial sem ano válido.");
    }
  } else if (question.contentType === "pratica-autoral") {
    // Questão autoral não pode parecer oficial: nada de banca, concurso ou número de prova.
    if (source.examBoard || source.exam || source.organization || source.role || source.originalNumber) {
      errors.push("Questão autoral não pode ser atribuída a banca, concurso, órgão ou cargo.");
    }
    if (source.url !== undefined && !isHttpUrl(source.url)) {
      errors.push("Link de referência inválido.");
    }
  } else {
    errors.push(`Tipo de conteúdo desconhecido: ${String(question.contentType)}.`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Só pode ser usada para pontuar a questão válida cujo gabarito foi verificado.
 * Questões oficiais também precisam ter o enunciado conferido com a fonte.
 * Gabarito pendente, divergente ou anulado nunca é tratado como definitivo.
 */
export function isScorable(question: Question): boolean {
  if (!validateQuestion(question).ok) return false;
  if (question.verification.answerKey !== "verificada") return false;
  if (question.contentType === "oficial" && question.verification.statement !== "verificada") return false;
  return true;
}

/** Questão oficial com fonte, enunciado e gabarito conferidos. */
export function isVerifiedOfficial(question: Question): boolean {
  return question.contentType === "oficial" && isScorable(question);
}
