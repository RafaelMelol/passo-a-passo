"use client";

import { useSyncExternalStore } from "react";
import { studyStore, type StudyState } from "@/lib/study-store";

/**
 * Dados de estudo salvos no navegador.
 * Retorna `state: null` durante a renderização no servidor e na hidratação;
 * os componentes devem mostrar um estado de carregamento nesse caso.
 */
export function useStudyData(): { state: StudyState | null; update: typeof studyStore.update } {
  const state = useSyncExternalStore<StudyState | null>(
    studyStore.subscribe,
    studyStore.getSnapshot,
    studyStore.getServerSnapshot,
  );
  return { state, update: studyStore.update };
}
