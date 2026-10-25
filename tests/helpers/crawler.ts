import { prepareDatabase } from "@/lib/server/db";
import { createPgliteClient, type SqlClient } from "@/lib/server/db/client";
import { createFetcher, type Transport, type TransportResponse } from "@/lib/crawler/http/fetcher";
import type { SourceConfig } from "@/lib/crawler/types";
import { getSourceConfig } from "@/data/crawler-sources";

/** Banco PostgreSQL embutido, só em memória, com as migrações aplicadas. */
export async function createTestDb(): Promise<SqlClient> {
  return prepareDatabase(await createPgliteClient());
}

export type Route = TransportResponse | (() => TransportResponse) | Error;

export function html(body: string, status = 200): TransportResponse {
  return { status, headers: { "content-type": "text/html; charset=utf-8" }, body: Buffer.from(body, "utf8") };
}

export function pdf(bytes: Uint8Array): TransportResponse {
  return { status: 200, headers: { "content-type": "application/pdf" }, body: Buffer.from(bytes) };
}

export function status(code: number, headers: Record<string, string> = {}): TransportResponse {
  return { status: code, headers, body: Buffer.alloc(0) };
}

/** Transporte simulado: responde a partir de um mapa de URLs e registra as chamadas. */
export function fakeTransport(routes: Record<string, Route>) {
  const calls: string[] = [];
  const transport: Transport = async (request) => {
    const url = request.url.toString();
    calls.push(url);
    const route = routes[url];
    if (route === undefined) return status(404);
    if (route instanceof Error) throw route;
    return typeof route === "function" ? route() : route;
  };
  return { transport, calls, routes };
}

export function testFetcher(transport: Transport) {
  const sleeps: number[] = [];
  let clock = 1_000_000;
  const fetcher = createFetcher({
    userAgent: "PassoAPassoBot/teste",
    transport,
    sleep: async (ms) => {
      sleeps.push(ms);
      clock += ms;
    },
    now: () => clock,
    random: () => 0,
  });
  return { fetcher, sleeps };
}

export function inepSource(overrides: Partial<SourceConfig> = {}): SourceConfig {
  const base = getSourceConfig("inep-encceja");
  if (!base) throw new Error("fonte inep-encceja ausente");
  return { ...base, rateLimit: { ...base.rateLimit, minIntervalMs: 0 }, ...overrides };
}

export const INEP_INDEX = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos";
export const INEP_YEAR = `${INEP_INDEX}/2020`;
export const INEP_BOOKLET = "https://download.inep.gov.br/encceja/provas_e_gabaritos/2020_PV_EF_matematica.pdf";
export const INEP_KEY = "https://download.inep.gov.br/encceja/provas_e_gabaritos/2020_GB_EF_matematica.pdf";

export const INEP_INDEX_HTML = `<html><body><div class="tabs-content">
  <div class="tab-content" data-id="2020" data-url="${INEP_YEAR}"></div>
</div></body></html>`;

export const INEP_YEAR_HTML = `<html><body><div id="parent-fieldname-text">
<h3>Aplicação regular</h3>
<p class="callout"><strong>Ensino fundamental – Matemática – Aplicação regular</strong></p>
<ul>
  <li><a href="https://download.inep.gov.br/encceja/provas/EF_matematica.zip"></a><a href="${INEP_BOOKLET}">Prova</a></li>
  <li><a href="${INEP_KEY}">Gabarito&nbsp;</a></li>
  <li><a href="https://download.inep.gov.br/encceja/provas_e_gabaritos/2020_GB_EF_matematica_ledor.pdf">Gabarito | Prova com auxílio de leitura</a></li>
</ul>
<p class="callout"><strong>Ensino fundamental – Matemática (ampliada) – Aplicação regular</strong></p>
<ul><li><a href="https://download.inep.gov.br/x/ampliada.pdf">Prova</a></li><li><a href="${INEP_KEY}">Gabarito</a></li></ul>
<p class="callout"><strong>Ensino fundamental – Ciências naturais – Aplicação regular</strong></p>
<ul><li><a href="https://download.inep.gov.br/x/cn.pdf">Prova</a></li><li><a href="https://download.inep.gov.br/x/cn_gb.pdf">Gabarito</a></li></ul>
<p class="callout"><strong>Ensino médio – Matemática e suas tecnologias – Aplicação regular</strong></p>
<ul><li><a href="https://download.inep.gov.br/x/em.pdf">Prova</a></li><li><a href="https://download.inep.gov.br/x/em_gb.pdf">Gabarito</a></li></ul>
<p class="callout"><strong>Ensino fundamental – Língua portuguesa, língua estrangeira moderna, artes e educação física – Aplicação regular</strong></p>
<ul><li><a href="https://download.inep.gov.br/x/lp_gb.pdf">Gabarito</a></li></ul>
</div></body></html>`;
