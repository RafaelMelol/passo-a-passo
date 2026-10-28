import type { SqlClient } from "@/lib/server/db/client";
import type { DocumentKind } from "@/lib/server/repositories/documents";
import type { FetchedResource, Fetcher } from "../http/fetcher";
import type { ExamCandidate, SourceConfig, SourceRunStats } from "../types";

export interface TrackedFetch {
  resource: FetchedResource;
  /** O conteúdo mudou desde a última vez (ou é a primeira vez). */
  changed: boolean;
  isNew: boolean;
  /** Já tinha sido processado com sucesso antes desta execução. */
  previouslyProcessed: boolean;
}

export interface AdapterContext {
  source: SourceConfig;
  db: SqlClient;
  fetcher: Fetcher;
  now: () => Date;
  /** Tempo restante do orçamento desta execução, em milissegundos. */
  timeLeftMs: () => number;
  stats: SourceRunStats;
  warn: (message: string) => void;
  /** Baixa um documento com as proteções do coletor e registra o resultado no banco. */
  fetchDocument(input: { url: string; kind: DocumentKind; accept: "html" | "pdf"; title?: string; parentUrl?: string }): Promise<TrackedFetch>;
  /** Consulta o estado de documentos já conhecidos (sem acessar a internet). */
  documentStatus(url: string): Promise<{ status: string; processedAt: string | null; lastCheckedAt: string | null } | null>;
  downloadsLeft: () => number;
  /** Quantos documentos ligados a esta página falharam ou foram devolvidos para a fila e aguardam nova tentativa. */
  failedChildren(parentUrl: string): Promise<number>;
  /** Quantos cadernos já foram encontrados a partir desta página. */
  bookletChildren(parentUrl: string): Promise<number>;
}

/**
 * Contrato dos adaptadores: cada fonte descobre e lê seus próprios documentos
 * e entrega provas candidatas. Validação, classificação, deduplicação e gravação
 * ficam no núcleo (pipeline), iguais para todas as fontes.
 */
export interface SourceAdapter {
  id: string;
  run(context: AdapterContext): AsyncGenerator<ExamCandidate, void, void>;
}
