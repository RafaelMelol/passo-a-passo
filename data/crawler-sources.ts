import type { SourceConfig } from "@/lib/crawler/types";

/**
 * Fontes do coletor. Cada uma documenta o que foi verificado (robots.txt,
 * termos de uso, licença) e o que o site pode guardar. Verificações feitas em 25/10/2026.
 *
 * Para adicionar uma fonte: inclua a configuração aqui e, se a coleta automatizada
 * for permitida, um adaptador em lib/crawler/adapters/.
 */

const KB = 1024;
const MB = 1024 * KB;

export const CRAWLER_SOURCES: readonly SourceConfig[] = [
  {
    id: "inep-encceja",
    name: "Inep — Encceja (provas e gabaritos do Ensino Fundamental)",
    examBoard: "Inep",
    organization: "Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (Inep)",
    kind: "repositorio-oficial",
    homepage: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos",
    startUrls: ["https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos"],
    allowedHosts: ["www.gov.br", "download.inep.gov.br"],
    strategy: "Página oficial de provas e gabaritos → páginas por ano → PDFs de caderno e gabarito (só Ensino Fundamental, Matemática e Língua Portuguesa).",
    formats: ["text/html", "application/pdf"],
    frequency: "diaria",
    rateLimit: { minIntervalMs: 3000, maxRequestsPerRun: 30, maxDownloadsPerRun: 8, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: { allowed: true, adapter: "inep-encceja" },
    defaultEnabled: true,
    reusePolicy: {
      mode: "metadata-and-answer-key",
      license: "Creative Commons Atribuição-SemDerivações 3.0 (conteúdo do portal gov.br)",
      licenseUrl: "https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR",
      summary:
        "O portal gov.br declara a licença CC BY-ND 3.0. Mesmo assim, os cadernos trazem textos e imagens de terceiros não cobertos por ela; por isso o site guarda apenas metadados, o gabarito oficial e o link para o PDF do Inep. O texto das questões é lido só em memória para contar e classificar as questões.",
      checkedAt: "2026-10-25",
    },
    robots: {
      checkedAt: "2026-10-25",
      summary: "www.gov.br/robots.txt permite /inep/; download.inep.gov.br não publica robots.txt (HTTP 404, sem restrições).",
    },
  },
  {
    id: "fgv-conhecimento",
    name: "FGV Conhecimento — Concursos",
    examBoard: "FGV",
    organization: "Fundação Getulio Vargas",
    kind: "banca-oficial",
    homepage: "https://conhecimento.fgv.br/concursos",
    startUrls: ["https://conhecimento.fgv.br/concursos"],
    allowedHosts: ["conhecimento.fgv.br"],
    strategy: "Somente importação manual pelo painel: o administrador baixa os PDFs no site da FGV e envia ao sistema.",
    formats: ["application/pdf"],
    frequency: "manual",
    rateLimit: { minIntervalMs: 5000, maxRequestsPerRun: 0, maxDownloadsPerRun: 0, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: {
      allowed: false,
      manualImport: true,
      reason:
        "Os Termos de Uso da Plataforma FGV Conhecimento (janeiro de 2026, item 3.1) proíbem ferramentas automatizadas, embora o robots.txt permita as páginas de concursos.",
    },
    defaultEnabled: false,
    reusePolicy: {
      mode: "metadata-and-answer-key",
      termsUrl: "https://conhecimento.fgv.br/sites/default/files/2026.01.16-termos-de-uso-fgv-conhecimento.pdf",
      summary: "Termos vedam reprodução e cópia; o site guarda apenas metadados, gabarito definitivo e link para a prova oficial.",
      checkedAt: "2026-10-25",
    },
    robots: { checkedAt: "2026-10-25", summary: "robots.txt não bloqueia /concursos/ nem /sites/default/files/." },
  },
  {
    id: "cebraspe",
    name: "Cebraspe — Concursos",
    examBoard: "Cebraspe",
    organization: "Centro Brasileiro de Pesquisa em Avaliação e Seleção e de Promoção de Eventos",
    kind: "banca-oficial",
    homepage: "https://www.cebraspe.org.br/concursos/",
    startUrls: ["https://www.cebraspe.org.br/concursos/"],
    allowedHosts: ["www.cebraspe.org.br", "cdn.cebraspe.org.br"],
    strategy: "Ainda sem adaptador automático.",
    formats: ["application/pdf"],
    frequency: "manual",
    rateLimit: { minIntervalMs: 5000, maxRequestsPerRun: 0, maxDownloadsPerRun: 0, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: {
      allowed: false,
      manualImport: true,
      reason:
        "robots.txt permite tudo, mas os termos de uso não foram localizados e muitas provas usam o formato certo/errado; o adaptador não foi implementado.",
    },
    defaultEnabled: false,
    reusePolicy: { mode: "metadata-and-answer-key", summary: "Política de reutilização não confirmada.", checkedAt: "2026-10-25" },
    robots: { checkedAt: "2026-10-25", summary: "User-agent: * / Disallow: (vazio) — sem restrições." },
  },
  {
    id: "consulplan",
    name: "Instituto Consulplan",
    examBoard: "Instituto Consulplan",
    organization: "Instituto Consulplan",
    kind: "banca-oficial",
    homepage: "https://www.institutoconsulplan.org.br/Concursos",
    startUrls: ["https://www.institutoconsulplan.org.br/Concursos"],
    allowedHosts: ["www.institutoconsulplan.org.br", "cdnsite.institutoconsulplan.org.br"],
    strategy: "Ainda sem adaptador automático.",
    formats: ["application/pdf"],
    frequency: "manual",
    rateLimit: { minIntervalMs: 5000, maxRequestsPerRun: 0, maxDownloadsPerRun: 0, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: {
      allowed: false,
      manualImport: true,
      reason:
        "robots.txt permite robôs, mas as páginas de concurso analisadas publicam gabaritos sem os cadernos de prova, que são necessários para conferir o gabarito.",
    },
    defaultEnabled: false,
    reusePolicy: { mode: "metadata-and-answer-key", summary: "Sem termos de uso publicados; reprodução não autorizada.", checkedAt: "2026-10-25" },
    robots: { checkedAt: "2026-10-25", summary: "Allow: / (exceto áreas do candidato, /admin/ e /api/)." },
  },
  {
    id: "ibfc",
    name: "IBFC — Instituto Brasileiro de Formação e Capacitação",
    examBoard: "IBFC",
    organization: "Instituto Brasileiro de Formação e Capacitação",
    kind: "banca-oficial",
    homepage: "https://www.ibfc.org.br/",
    startUrls: ["https://www.ibfc.org.br/"],
    allowedHosts: ["www.ibfc.org.br"],
    strategy: "Desativado.",
    formats: ["application/pdf"],
    frequency: "manual",
    rateLimit: { minIntervalMs: 5000, maxRequestsPerRun: 0, maxDownloadsPerRun: 0, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: {
      allowed: false,
      manualImport: true,
      reason: "O site recusou acessos automatizados identificados (HTTP 403). O coletor não contorna bloqueios.",
    },
    defaultEnabled: false,
    reusePolicy: { mode: "none", summary: "Acesso automatizado bloqueado pela fonte.", checkedAt: "2026-10-25" },
    robots: { checkedAt: "2026-10-25", summary: "Sem robots.txt válido; acesso automatizado bloqueado." },
  },
  {
    id: "importacao-manual",
    name: "Importação manual autorizada",
    examBoard: "Diversas",
    organization: "Administrador do site",
    kind: "manual",
    homepage: "/admin",
    startUrls: [],
    allowedHosts: [],
    strategy: "Questões e provas enviadas pelo administrador no painel, sempre revisadas antes de publicar.",
    formats: ["application/pdf"],
    frequency: "manual",
    rateLimit: { minIntervalMs: 0, maxRequestsPerRun: 0, maxDownloadsPerRun: 0, maxBytes: 20 * MB, timeoutMs: 30_000 },
    automation: { allowed: false, manualImport: true, reason: "Fonte manual." },
    defaultEnabled: true,
    reusePolicy: {
      mode: "full-text-authorized",
      summary: "O administrador declara a autorização de uso de cada item importado; tudo passa pela fila de revisão.",
      checkedAt: "2026-10-25",
    },
    robots: { checkedAt: "2026-10-25", summary: "Não se aplica." },
  },
];

export function getSourceConfig(id: string): SourceConfig | undefined {
  return CRAWLER_SOURCES.find((source) => source.id === id);
}
