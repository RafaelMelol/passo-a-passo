"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { createPracticeProgress, practiceHref, practiceTitle } from "@/lib/practice";
import { useQuestionBank } from "./useQuestionBank";
import { studyStore } from "@/lib/study-store";
import type { PracticeFilters } from "@/types/study";

/** Cria uma nova lista de prática (no clique) e abre a página de questões. */
export function useStartPractice(): (filters: PracticeFilters) => void {
  const router = useRouter();
  const questionBank = useQuestionBank();
  return useCallback(
    (filters: PracticeFilters) => {
      const now = new Date();
      studyStore.update((data) => {
        const progress = createPracticeProgress(questionBank.questions, filters, data.attempts, now);
        if (!progress) return data;
        return {
          ...data,
          practice: progress,
          lastActivity: { kind: "pratica", title: practiceTitle(filters), href: practiceHref(filters), at: now.toISOString() },
        };
      });
      router.push(practiceHref(filters));
      window.scrollTo({ top: 0 });
    },
    [router, questionBank],
  );
}
