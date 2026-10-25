"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ALL_QUESTIONS, IMPORT_ERRORS } from "@/data/questions";
import { buildBank, questionBank, type QuestionBank } from "@/lib/questions/bank";
import { remoteBankStore } from "@/lib/questions/remote-store";

/**
 * Banco usado na área de estudos: questões do site + questões publicadas no banco central.
 * Sem banco central (ou sem internet), é exatamente o banco do site.
 */
export function useQuestionBank(): QuestionBank {
  const remote = useSyncExternalStore(remoteBankStore.subscribe, remoteBankStore.getSnapshot, remoteBankStore.getServerSnapshot);
  return useMemo(() => (remote.length === 0 ? questionBank : buildBank([...ALL_QUESTIONS, ...remote], IMPORT_ERRORS)), [remote]);
}
