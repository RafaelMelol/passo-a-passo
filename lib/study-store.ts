import type { StudyData } from "@/types/study";
import {
  STORAGE_KEY,
  getBrowserStorage,
  loadStudyData,
  saveStudyData,
  type LoadWarning,
  type SaveError,
} from "./storage";

/**
 * Store externo para o React (useSyncExternalStore).
 * No servidor não existe localStorage: o snapshot do servidor é sempre null
 * e a interface mostra um estado de carregamento. No navegador, os dados são
 * lidos uma única vez e mantidos em memória; cada alteração é gravada.
 */

export interface StudyState {
  data: StudyData;
  loadWarning: LoadWarning | null;
  saveError: SaveError | null;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let state: StudyState | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function readState(): StudyState {
  if (state === null) {
    const { data, warning } = loadStudyData(getBrowserStorage());
    state = { data, loadWarning: warning, saveError: null };
  }
  return state;
}

function handleStorageEvent(event: StorageEvent) {
  // Outra aba alterou os dados: relemos na próxima consulta.
  if (event.key === STORAGE_KEY || event.key === null) {
    state = null;
    notify();
  }
}

export const studyStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    if (listeners.size === 1 && typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageEvent);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageEvent);
      }
    };
  },

  getSnapshot(): StudyState {
    return readState();
  },

  getServerSnapshot(): null {
    return null;
  },

  update(updater: (data: StudyData) => StudyData): void {
    const current = readState();
    const next = updater(current.data);
    if (next === current.data) return;
    const saved = saveStudyData(getBrowserStorage(), next);
    state = { data: next, loadWarning: current.loadWarning, saveError: saved.ok ? null : saved.error };
    notify();
  },

  /** Usado nos testes para começar do zero. */
  reset(): void {
    state = null;
    notify();
  },
};
