import "server-only";
import { isDatabaseConfigError } from "@/lib/server/db";
import { ReviewActionError } from "@/lib/server/repositories/reviews";

/** Erro de entrada inválida (vira HTTP 400 com mensagem clara). */
export class ApiInputError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code = "parametro_invalido",
  ) {
    super(message);
    this.name = "ApiInputError";
  }
}

const NO_STORE = { "cache-control": "no-store" };

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  return Response.json(data, { status: init.status ?? 200, headers: { ...NO_STORE, ...init.headers } });
}

export function apiError(status: number, code: string, message: string, headers: Record<string, string> = {}): Response {
  return json({ error: { code, message } }, { status, headers });
}

/** Converte exceções em respostas consistentes, sem vazar detalhes internos. */
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiInputError) return apiError(error.status, error.code, error.message);
  if (isDatabaseConfigError(error)) {
    return apiError(503, "banco_nao_configurado", "O banco central ainda não foi configurado neste ambiente.");
  }
  if (error instanceof ReviewActionError) return apiError(409, "acao_invalida", error.message);
  console.error("[api] erro interno:", error instanceof Error ? error.message.slice(0, 300) : "desconhecido");
  return apiError(500, "erro_interno", "Ocorreu um erro interno. Tente novamente mais tarde.");
}

export function intParam(url: URL, name: string, options: { min: number; max: number; fallback?: number }): number | undefined {
  const raw = url.searchParams.get(name);
  if (raw === null || raw === "") return options.fallback;
  if (!/^-?\d+$/.test(raw)) throw new ApiInputError(`O parâmetro "${name}" deve ser um número inteiro.`);
  const value = Number(raw);
  if (value < options.min || value > options.max) throw new ApiInputError(`O parâmetro "${name}" deve estar entre ${options.min} e ${options.max}.`);
  return value;
}

export function enumParam<T extends string>(url: URL, name: string, allowed: readonly T[]): T | undefined {
  const raw = url.searchParams.get(name);
  if (raw === null || raw === "") return undefined;
  if (!(allowed as readonly string[]).includes(raw)) throw new ApiInputError(`Valor inválido para "${name}". Use: ${allowed.join(", ")}.`);
  return raw as T;
}

export function textParam(url: URL, name: string, maxLength = 80): string | undefined {
  const raw = url.searchParams.get(name);
  if (raw === null || raw.trim() === "") return undefined;
  if (raw.length > maxLength) throw new ApiInputError(`O parâmetro "${name}" é longo demais.`);
  return raw.trim();
}

export function pagination(url: URL, options: { defaultSize?: number; maxSize?: number } = {}) {
  const pageSize = intParam(url, "porPagina", { min: 1, max: options.maxSize ?? 100, fallback: options.defaultSize ?? 20 }) as number;
  const page = intParam(url, "pagina", { min: 1, max: 10_000, fallback: 1 }) as number;
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}

/** Lê JSON do corpo com limite de tamanho e verificação do Content-Type. */
export async function readJsonBody(request: Request, maxBytes = 512_000): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new ApiInputError("Envie os dados como JSON.", 415, "tipo_invalido");
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new ApiInputError("Conteúdo grande demais.", 413, "conteudo_grande");
  const text = await request.text();
  if (text.length > maxBytes) throw new ApiInputError("Conteúdo grande demais.", 413, "conteudo_grande");
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiInputError("JSON inválido.");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
