import "server-only";

/** Converte datas vindas do banco (Date ou texto) para ISO 8601. */
export function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }
  return null;
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

/** JSONB pode chegar como objeto (pg, PGlite) ou como texto; normaliza para objeto. */
export function toJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function jsonParam(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/** Mensagem de erro curta e sem detalhes sensíveis para guardar no banco. */
export function safeErrorMessage(error: unknown, max = 300): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[url-do-banco]")
    .replace(/(token|secret|senha|password)=\S+/gi, "$1=[oculto]")
    .slice(0, max);
}
