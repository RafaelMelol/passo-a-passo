import type { Question } from "@/types/question";
import { parseQuestionList } from "./parse";
import { isScorable } from "./validation";

/**
 * Questões publicadas no banco central (texto integral autorizado), guardadas também no
 * navegador para continuar estudando sem internet. As questões do próprio site (data/) são
 * sempre a base; estas apenas se somam a elas.
 */

export const REMOTE_BANK_KEY = "passo-a-passo:banco-central:v1";
const REFRESH_AFTER_MS = 12 * 60 * 60 * 1000;
const EMPTY: readonly Question[] = [];

interface CachedBank {
  fetchedAt: string;
  items: Question[];
}

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot: readonly Question[] | null = null;
let refreshing = false;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Mantém só questões válidas e com gabarito verificado (dados externos nunca são confiáveis por padrão). */
export function sanitizeRemoteQuestions(raw: unknown): Question[] {
  return parseQuestionList(raw).questions.filter((question) => isScorable(question));
}

function readCache(): CachedBank | null {
  const store = storage();
  if (!store) return null;
  try {
    const parsed = JSON.parse(store.getItem(REMOTE_BANK_KEY) ?? "null") as { fetchedAt?: unknown; items?: unknown } | null;
    if (!parsed || typeof parsed.fetchedAt !== "string") return null;
    return { fetchedAt: parsed.fetchedAt, items: sanitizeRemoteQuestions(parsed.items) };
  } catch {
    return null;
  }
}

function writeCache(items: Question[]) {
  try {
    storage()?.setItem(REMOTE_BANK_KEY, JSON.stringify({ fetchedAt: new Date().toISOString(), items }));
  } catch {
    // Sem espaço ou sem armazenamento: as questões ficam só na memória desta visita.
  }
}

function notify() {
  for (const listener of listeners) listener();
}

async function refresh(): Promise<void> {
  if (refreshing || typeof window === "undefined") return;
  refreshing = true;
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const response = await fetch("/api/questions?porPagina=500", { signal: controller.signal, cache: "no-store" });
    window.clearTimeout(timeout);
    if (!response.ok) return; // banco central indisponível: segue com o que já existe
    const data = (await response.json()) as { items?: unknown };
    const items = sanitizeRemoteQuestions(data.items);
    writeCache(items);
    snapshot = items;
    notify();
  } catch {
    // Sem internet: continua com a cópia local.
  } finally {
    refreshing = false;
  }
}

export const remoteBankStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    if (listeners.size === 1) {
      const cached = readCache();
      if (!cached || Date.now() - Date.parse(cached.fetchedAt) > REFRESH_AFTER_MS) void refresh();
    }
    return () => listeners.delete(listener);
  },
  getSnapshot(): readonly Question[] {
    if (snapshot === null) snapshot = readCache()?.items ?? EMPTY;
    return snapshot;
  },
  getServerSnapshot(): readonly Question[] {
    return EMPTY;
  },
  /** Usado nos testes. */
  reset(): void {
    snapshot = null;
  },
};
