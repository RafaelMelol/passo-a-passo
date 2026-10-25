import { BlockedUrlError, assertAllowedUrl } from "../http/url-guard";
import type { SourceConfig } from "../types";

/**
 * Procedência: todo documento precisa vir, por HTTPS, de um host oficial da própria fonte.
 * Páginas encontradas em buscadores ou espelhos de terceiros nunca são aceitas.
 */
export function checkProvenance(urls: readonly string[], source: SourceConfig): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (source.allowedHosts.length === 0) errors.push("A fonte não tem hosts oficiais configurados.");
  for (const url of urls) {
    try {
      assertAllowedUrl(url, source.allowedHosts);
    } catch (error) {
      errors.push(error instanceof BlockedUrlError ? `${error.message} (${url})` : `URL inválida (${url}).`);
    }
  }
  return { ok: errors.length === 0, errors };
}
