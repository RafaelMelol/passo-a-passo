// @vitest-environment node
import { describe, expect, it } from "vitest";
import { BudgetExceededError, FetchError } from "@/lib/crawler/http/fetcher";
import { isPathAllowed, parseRobots, policyFromResponse } from "@/lib/crawler/http/robots";
import { BlockedUrlError, assertAllowedUrl, isPrivateAddress, resolvePublicAddresses } from "@/lib/crawler/http/url-guard";
import { makePdf } from "../helpers/make-pdf";
import { fakeTransport, html, inepSource, pdf, status, testFetcher } from "../helpers/crawler";

const source = inepSource();
const ROBOTS_GOV = "https://www.gov.br/robots.txt";
const ROBOTS_INEP = "https://download.inep.gov.br/robots.txt";

describe("proteção contra SSRF", () => {
  it("reconhece endereços privados, locais e de metadados de nuvem", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.5", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
    for (const ip of ["200.130.24.15", "8.8.8.8", "2001:4860:4860::8888"]) expect(isPrivateAddress(ip), ip).toBe(false);
  });

  it("bloqueia URLs fora da lista, sem HTTPS, com IP direto, porta ou credenciais", () => {
    const hosts = source.allowedHosts;
    expect(assertAllowedUrl("https://download.inep.gov.br/a.pdf", hosts).hostname).toBe("download.inep.gov.br");
    for (const url of [
      "http://download.inep.gov.br/a.pdf",
      "https://127.0.0.1/a",
      "https://[::1]/a",
      "https://localhost/a",
      "https://download.inep.gov.br:8443/a",
      "https://user:pass@download.inep.gov.br/a",
      "https://inep.gov.br.evil.com/a",
      "https://169.254.169.254/latest/meta-data",
      "file:///etc/passwd",
    ]) {
      expect(() => assertAllowedUrl(url, hosts), url).toThrow(BlockedUrlError);
    }
  });

  it("recusa hosts autorizados cujo DNS aponta para a rede interna", async () => {
    await expect(resolvePublicAddresses("download.inep.gov.br", async () => [{ address: "10.0.0.7", family: 4 }])).rejects.toThrow(BlockedUrlError);
    await expect(resolvePublicAddresses("download.inep.gov.br", async () => [{ address: "200.130.24.15", family: 4 }])).resolves.toHaveLength(1);
  });
});

describe("robots.txt", () => {
  const text = `User-agent: *\nDisallow: /privado/\nAllow: /privado/publico$\nDisallow: /*.zip$\n\nUser-agent: PassoAPassoBot\nDisallow: /so-para-nos/\n`;

  it("aplica o grupo específico do robô quando existe", () => {
    const rules = parseRobots(text, "PassoAPassoBot/1.0");
    expect(rules.disallow).toEqual(["/so-para-nos/"]);
  });

  it("vale a regra mais específica e o curinga", () => {
    const policy = { mode: "rules" as const, rules: parseRobots(text, "OutroBot") };
    expect(isPathAllowed(policy, "/privado/x")).toBe(false);
    expect(isPathAllowed(policy, "/privado/publico")).toBe(true);
    expect(isPathAllowed(policy, "/arquivos/prova.zip")).toBe(false);
    expect(isPathAllowed(policy, "/arquivos/prova.pdf")).toBe(true);
  });

  it("sem robots.txt (404) libera; acesso negado ou erro bloqueia", () => {
    expect(policyFromResponse(404, "", "Bot").mode).toBe("allow-all");
    expect(policyFromResponse(403, "", "Bot").mode).toBe("deny-all");
    expect(policyFromResponse(null, "", "Bot").mode).toBe("deny-all");
  });
});

describe("cliente HTTP do coletor", () => {
  const page = "https://www.gov.br/inep/pt-br/pagina";
  const file = "https://download.inep.gov.br/arquivo.pdf";

  it("respeita robots.txt", async () => {
    const { transport, calls } = fakeTransport({ [ROBOTS_GOV]: html("User-agent: *\nDisallow: /inep/"), [page]: html("<p>ok</p>") });
    const { fetcher } = testFetcher(transport);
    await expect(fetcher.fetch(page, { source, accept: "html" })).rejects.toThrow(/robots/);
    expect(calls).not.toContain(page);
  });

  it("tenta de novo em falha temporária (503) com espera crescente e depois recupera", async () => {
    let attempts = 0;
    const { transport } = fakeTransport({
      [ROBOTS_INEP]: status(404),
      [file]: () => (++attempts < 3 ? status(503) : pdf(makePdf([[{ x: 10, y: 10, text: "ok" }]]))),
    });
    const { fetcher, sleeps } = testFetcher(transport);
    const result = await fetcher.fetch(file, { source, accept: "pdf" });
    expect(attempts).toBe(3);
    expect(result.sha256).toHaveLength(64);
    expect(sleeps.filter((ms) => ms >= 1000)).toEqual([1000, 2000]);
  });

  it("não insiste em erros definitivos (404)", async () => {
    let attempts = 0;
    const { transport } = fakeTransport({ [ROBOTS_INEP]: status(404), [file]: () => (attempts++, status(404)) });
    const { fetcher } = testFetcher(transport);
    await expect(fetcher.fetch(file, { source, accept: "pdf" })).rejects.toBeInstanceOf(FetchError);
    expect(attempts).toBe(1);
  });

  it("revalida redirecionamentos e bloqueia destino fora da lista", async () => {
    const { transport, calls } = fakeTransport({
      [ROBOTS_INEP]: status(404),
      [file]: status(302, { location: "https://servidor-interno.local/segredo" }),
    });
    const { fetcher } = testFetcher(transport);
    await expect(fetcher.fetch(file, { source, accept: "pdf" })).rejects.toThrow(BlockedUrlError);
    expect(calls.some((url) => url.includes("servidor-interno"))).toBe(false);
  });

  it("confere o formato real do arquivo (não aceita HTML disfarçado de PDF)", async () => {
    const { transport } = fakeTransport({
      [ROBOTS_INEP]: status(404),
      [file]: { status: 200, headers: { "content-type": "application/pdf" }, body: Buffer.from("<html>login</html>") },
    });
    const { fetcher } = testFetcher(transport);
    await expect(fetcher.fetch(file, { source, accept: "pdf" })).rejects.toThrow(/PDF válido/);
  });

  it("espera o intervalo mínimo entre requisições ao mesmo host", async () => {
    const slow = inepSource({ rateLimit: { ...source.rateLimit, minIntervalMs: 3000 } });
    const other = "https://download.inep.gov.br/outro.pdf";
    const bytes = makePdf([[{ x: 10, y: 10, text: "ok" }]]);
    const { transport } = fakeTransport({ [ROBOTS_INEP]: status(404), [file]: pdf(bytes), [other]: pdf(bytes) });
    const { fetcher, sleeps } = testFetcher(transport);
    await fetcher.fetch(file, { source: slow, accept: "pdf" });
    await fetcher.fetch(other, { source: slow, accept: "pdf" });
    expect(sleeps.filter((ms) => ms === 3000).length).toBeGreaterThanOrEqual(2);
  });

  it("para ao atingir o limite de requisições da execução", async () => {
    const tiny = inepSource({ rateLimit: { ...source.rateLimit, maxRequestsPerRun: 2 } });
    const bytes = makePdf([[{ x: 10, y: 10, text: "ok" }]]);
    const { transport } = fakeTransport({ [ROBOTS_INEP]: status(404), [file]: pdf(bytes), ["https://download.inep.gov.br/b.pdf"]: pdf(bytes) });
    const { fetcher } = testFetcher(transport);
    await fetcher.fetch(file, { source: tiny, accept: "pdf" });
    await expect(fetcher.fetch("https://download.inep.gov.br/b.pdf", { source: tiny, accept: "pdf" })).rejects.toBeInstanceOf(BudgetExceededError);
  });
});

describe("robots.txt indisponível", () => {
  it("bloqueia por precaução, sem guardar a falha: o próximo documento tenta de novo e segue", async () => {
    const file = "https://download.inep.gov.br/arquivo.pdf";
    let robotsCalls = 0;
    const { transport } = fakeTransport({
      ["https://download.inep.gov.br/robots.txt"]: () => {
        robotsCalls++;
        if (robotsCalls <= 4) throw new FetchError("Falha de rede: read ECONNRESET", true);
        return status(404);
      },
      [file]: pdf(makePdf([[{ x: 10, y: 10, text: "ok" }]])),
    });
    const { fetcher } = testFetcher(transport);
    await expect(fetcher.fetch(file, { source, accept: "pdf" })).rejects.toThrow(/indisponível.*adiado por precaução/);
    const second = await fetcher.fetch(file, { source, accept: "pdf" });
    expect(second.status).toBe(200);
  });
});

describe("certificados intermediários embutidos", () => {
  it("cada intermediário é válido, ainda não venceu e é assinado por uma raiz confiável do Node", async () => {
    const { X509Certificate } = await import("node:crypto");
    const tls = await import("node:tls");
    const { EXTRA_INTERMEDIATE_CAS, TRUSTED_CA } = await import("@/lib/crawler/http/extra-ca");
    const roots = tls.rootCertificates.map((pem) => new X509Certificate(pem));
    for (const ca of EXTRA_INTERMEDIATE_CAS) {
      const cert = new X509Certificate(ca.pem);
      expect(cert.fingerprint256).toBe(ca.sha256);
      expect(Date.parse(cert.validTo)).toBeGreaterThan(Date.now());
      expect(roots.some((root) => cert.checkIssued(root) && cert.verify(root.publicKey))).toBe(true);
    }
    expect(TRUSTED_CA.length).toBe(tls.rootCertificates.length + EXTRA_INTERMEDIATE_CAS.length);
  });
});
