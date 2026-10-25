import { createHash } from "node:crypto";
import { lookup as dnsLookup } from "node:dns/promises";
import https from "node:https";
import type { LookupAddress } from "node:dns";
import zlib from "node:zlib";
import type { SourceConfig } from "../types";
import { TRUSTED_CA } from "./extra-ca";
import { isPathAllowed, policyFromResponse, type RobotsPolicy } from "./robots";
import { BlockedUrlError, assertAllowedUrl, resolvePublicAddresses, type LookupFn } from "./url-guard";

export interface TransportRequest {
  url: URL;
  headers: Record<string, string>;
  timeoutMs: number;
  maxBytes: number;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

/** Faz uma única requisição GET (sem seguir redirecionamentos). Substituível nos testes. */
export type Transport = (request: TransportRequest) => Promise<TransportResponse>;

export class FetchError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetExceededError";
  }
}

const defaultLookup: LookupFn = async (hostname) => dnsLookup(hostname, { all: true, verbatim: true });

/**
 * Transporte HTTPS do Node com DNS verificado no momento da conexão
 * (impede que um DNS "trocado" leve a requisição para a rede interna).
 */
export function createNodeTransport(lookupFn: LookupFn = defaultLookup): Transport {
  return (request) =>
    new Promise<TransportResponse>((resolve, reject) => {
      const req = https.request(
        {
          protocol: "https:",
          hostname: request.url.hostname,
          port: 443,
          path: `${request.url.pathname}${request.url.search}`,
          method: "GET",
          headers: request.headers,
          timeout: request.timeoutMs,
          // Verificação TLS sempre ativa; a lista só acrescenta intermediários públicos ausentes em alguns servidores.
          ca: [...TRUSTED_CA],
          lookup: (hostname, options, callback) => {
            resolvePublicAddresses(hostname, lookupFn)
              .then((addresses) => {
                const all = (options as { all?: boolean }).all;
                if (all) (callback as (err: Error | null, addresses: LookupAddress[]) => void)(null, addresses);
                else (callback as (err: Error | null, address: string, family: number) => void)(null, addresses[0].address, addresses[0].family);
              })
              .catch((error: Error) => (callback as (err: Error) => void)(error));
          },
        },
        (res) => {
          const headers: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") headers[key.toLowerCase()] = value;
            else if (Array.isArray(value)) headers[key.toLowerCase()] = value.join(", ");
          }
          const declared = Number(headers["content-length"] ?? "0");
          if (declared > request.maxBytes) {
            res.destroy();
            reject(new FetchError(`Arquivo maior que o limite (${declared} bytes).`, false, res.statusCode));
            return;
          }
          const encoding = (headers["content-encoding"] ?? "").toLowerCase();
          let stream: NodeJS.ReadableStream = res;
          if (encoding === "gzip") stream = res.pipe(zlib.createGunzip());
          else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());
          else if (encoding === "br") stream = res.pipe(zlib.createBrotliDecompress());
          const chunks: Buffer[] = [];
          let size = 0;
          stream.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > request.maxBytes) {
              res.destroy();
              reject(new FetchError("Arquivo maior que o limite permitido.", false, res.statusCode));
              return;
            }
            chunks.push(chunk);
          });
          stream.on("end", () => resolve({ status: res.statusCode ?? 0, headers, body: Buffer.concat(chunks) }));
          stream.on("error", (error: Error) => reject(new FetchError(`Falha ao ler a resposta: ${error.message}`, true)));
        },
      );
      req.on("timeout", () => req.destroy(new FetchError("Tempo limite esgotado.", true)));
      req.on("error", (error) => {
        if (error instanceof FetchError || error instanceof BlockedUrlError) reject(error);
        else reject(new FetchError(`Falha de rede: ${error.message}`, true));
      });
      req.end();
    });
}

export interface FetchedResource {
  url: string;
  status: number;
  contentType: string;
  body: Buffer;
  sha256: string;
  /** Texto decodificado (somente HTML). */
  text?: string;
}

export interface FetcherOptions {
  userAgent: string;
  transport?: Transport;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
  maxRetries?: number;
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function looksLikePdf(body: Buffer): boolean {
  return body.subarray(0, 5).toString("latin1") === "%PDF-";
}

function decodeHtml(body: Buffer, contentType: string): string {
  const charset = /charset=([\w-]+)/i.exec(contentType)?.[1]?.toLowerCase();
  if (charset === "iso-8859-1" || charset === "latin1" || charset === "windows-1252") return body.toString("latin1");
  return body.toString("utf8");
}

/**
 * Cliente HTTP educado e seguro do coletor:
 * respeita robots.txt e o intervalo mínimo entre requisições por host, limita o total de
 * requisições por fonte, revalida cada redirecionamento, limita tamanho e tempo, e tenta
 * de novo com espera exponencial apenas em falhas temporárias.
 */
export function createFetcher(options: FetcherOptions) {
  const transport = options.transport ?? createNodeTransport();
  const sleep = options.sleep ?? realSleep;
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  const maxRetries = options.maxRetries ?? 3;
  const robotsCache = new Map<string, RobotsPolicy>();
  const lastRequestAt = new Map<string, number>();
  const requestsBySource = new Map<string, number>();

  async function throttle(host: string, source: SourceConfig, crawlDelaySeconds?: number) {
    const minInterval = Math.max(source.rateLimit.minIntervalMs, (crawlDelaySeconds ?? 0) * 1000);
    const last = lastRequestAt.get(host);
    if (last !== undefined) {
      const wait = last + minInterval - now();
      if (wait > 0) await sleep(wait);
    }
    lastRequestAt.set(host, now());
  }

  function countRequest(source: SourceConfig) {
    const used = requestsBySource.get(source.id) ?? 0;
    if (used >= source.rateLimit.maxRequestsPerRun) {
      throw new BudgetExceededError(`Limite de ${source.rateLimit.maxRequestsPerRun} requisições por execução atingido para ${source.id}.`);
    }
    requestsBySource.set(source.id, used + 1);
  }

  async function rawGet(url: URL, source: SourceConfig, accept: string): Promise<TransportResponse> {
    countRequest(source);
    return transport({
      url,
      headers: {
        "user-agent": options.userAgent,
        accept,
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "pt-BR,pt;q=0.9",
      },
      timeoutMs: source.rateLimit.timeoutMs,
      maxBytes: source.rateLimit.maxBytes,
    });
  }

  async function robotsFor(url: URL, source: SourceConfig): Promise<RobotsPolicy> {
    const origin = url.origin;
    const cached = robotsCache.get(origin);
    if (cached) return cached;
    // Falhas temporárias são tentadas de novo; se persistirem, nada é acessado neste host (conservador).
    let policy: RobotsPolicy = policyFromResponse(null, "", options.userAgent);
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await throttle(url.host, source);
        const response = await rawGet(new URL("/robots.txt", origin), source, "text/plain");
        if ((response.status >= 500 || response.status === 429) && attempt < maxRetries) {
          await sleep(1000 * 2 ** attempt + Math.floor(random() * 250));
          continue;
        }
        policy = policyFromResponse(response.status, response.body.toString("utf8").slice(0, 500_000), options.userAgent);
        break;
      } catch (error) {
        if (error instanceof BudgetExceededError) throw error;
        if (error instanceof FetchError && error.retryable && attempt < maxRetries) {
          await sleep(1000 * 2 ** attempt + Math.floor(random() * 250));
          continue;
        }
        policy = policyFromResponse(null, "", options.userAgent, error instanceof Error ? error.message.slice(0, 120) : undefined);
        break;
      }
    }
    // Falhas temporárias não são guardadas: o próximo documento tenta ler o robots.txt de novo.
    if (!policy.temporary) robotsCache.set(origin, policy);
    return policy;
  }

  async function fetchResource(rawUrl: string, request: { source: SourceConfig; accept: "html" | "pdf" }): Promise<FetchedResource> {
    const { source } = request;
    let url = assertAllowedUrl(rawUrl, source.allowedHosts);
    const acceptHeader = request.accept === "pdf" ? "application/pdf" : "text/html,application/xhtml+xml";

    for (let redirects = 0; redirects <= 3; redirects++) {
      const robots = await robotsFor(url, source);
      if (!isPathAllowed(robots, `${url.pathname}${url.search}`)) {
        if (robots.temporary) throw new FetchError(`${robots.reason}; acesso adiado por precaução: ${url.pathname}`, true);
        throw new FetchError(`Acesso não permitido pelo robots.txt${robots.reason ? ` (${robots.reason})` : ""}: ${url.pathname}`, false);
      }

      let response: TransportResponse | null = null;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        await throttle(url.host, source, robots.rules.crawlDelaySeconds);
        try {
          response = await rawGet(url, source, acceptHeader);
        } catch (error) {
          if (error instanceof FetchError && error.retryable && attempt < maxRetries) {
            await sleep(1000 * 2 ** attempt + Math.floor(random() * 250));
            continue;
          }
          throw error;
        }
        if ((response.status >= 500 || response.status === 429) && attempt < maxRetries) {
          const retryAfter = Number(response.headers["retry-after"]);
          const wait = Number.isFinite(retryAfter) && retryAfter > 0 && retryAfter <= 60 ? retryAfter * 1000 : 1000 * 2 ** attempt;
          await sleep(wait + Math.floor(random() * 250));
          continue;
        }
        break;
      }
      if (!response) throw new FetchError("Sem resposta do servidor.", true);

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        // Cada salto é validado de novo (protocolo, host autorizado e robots.txt).
        url = assertAllowedUrl(new URL(response.headers.location, url).toString(), source.allowedHosts);
        continue;
      }
      if (response.status !== 200) {
        throw new FetchError(`Resposta HTTP ${response.status} para ${url.pathname}.`, response.status >= 500 || response.status === 429, response.status);
      }

      const contentType = (response.headers["content-type"] ?? "").toLowerCase();
      if (request.accept === "pdf") {
        if (!looksLikePdf(response.body)) throw new FetchError("O arquivo recebido não é um PDF válido.", false, 200);
        if (contentType && !/application\/(pdf|octet-stream|x-pdf)/.test(contentType)) {
          throw new FetchError(`Tipo de conteúdo inesperado para PDF: ${contentType}.`, false, 200);
        }
      } else {
        if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
          throw new FetchError(`Tipo de conteúdo inesperado para página: ${contentType || "desconhecido"}.`, false, 200);
        }
        if (response.body.includes(0)) throw new FetchError("A página contém dados binários.", false, 200);
      }

      return {
        url: url.toString(),
        status: response.status,
        contentType,
        body: response.body,
        sha256: createHash("sha256").update(response.body).digest("hex"),
        ...(request.accept === "html" ? { text: decodeHtml(response.body, contentType) } : {}),
      };
    }
    throw new FetchError("Redirecionamentos demais.", false);
  }

  return {
    fetch: fetchResource,
    requestsFor: (sourceId: string) => requestsBySource.get(sourceId) ?? 0,
  };
}

export type Fetcher = ReturnType<typeof createFetcher>;

export function crawlerUserAgent(): string {
  const contact = process.env.CRAWLER_CONTACT_URL;
  return `PassoAPassoBot/1.0 (coletor educacional sem fins comerciais${contact ? `; +${contact}` : ""})`;
}
