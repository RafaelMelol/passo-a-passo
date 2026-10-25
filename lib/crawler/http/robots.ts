/**
 * Leitura de robots.txt (RFC 9309): grupos por User-agent, regras Allow/Disallow
 * com curingas * e $; vence a regra mais específica (mais longa) e, no empate, Allow.
 */

export interface RobotsRules {
  allow: string[];
  disallow: string[];
  crawlDelaySeconds?: number;
}

export interface RobotsPolicy {
  /** "allow-all" quando não há robots.txt; "deny-all" quando o acesso ao arquivo foi negado ou falhou. */
  mode: "rules" | "allow-all" | "deny-all";
  rules: RobotsRules;
  /** Falha temporária ao ler o robots.txt: bloqueia por precaução, mas não deve ser guardada. */
  temporary?: boolean;
  reason?: string;
}

export function parseRobots(text: string, userAgent: string): RobotsRules {
  const agentToken = userAgent.split("/")[0].trim().toLowerCase();
  const groups: { agents: string[]; rules: RobotsRules }[] = [];
  let current: { agents: string[]; rules: RobotsRules } | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: { allow: [], disallow: [] } };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === "allow" && value) current.rules.allow.push(value);
    else if (field === "disallow" && value) current.rules.disallow.push(value);
    else if (field === "crawl-delay" && Number.isFinite(Number(value))) current.rules.crawlDelaySeconds = Number(value);
  }

  const specific = groups.filter((group) => group.agents.some((agent) => agent !== "*" && agentToken.includes(agent)));
  const chosen = specific.length > 0 ? specific : groups.filter((group) => group.agents.includes("*"));
  return chosen.reduce<RobotsRules>(
    (acc, group) => ({
      allow: [...acc.allow, ...group.rules.allow],
      disallow: [...acc.disallow, ...group.rules.disallow],
      crawlDelaySeconds: group.rules.crawlDelaySeconds ?? acc.crawlDelaySeconds,
    }),
    { allow: [], disallow: [] },
  );
}

function patternToRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

export function isPathAllowed(policy: RobotsPolicy, pathWithQuery: string): boolean {
  if (policy.mode === "allow-all") return true;
  if (policy.mode === "deny-all") return false;
  let best: { length: number; allow: boolean } | null = null;
  const consider = (patterns: string[], allow: boolean) => {
    for (const pattern of patterns) {
      if (!patternToRegex(pattern).test(pathWithQuery)) continue;
      const length = pattern.length;
      if (!best || length > best.length || (length === best.length && allow)) best = { length, allow };
    }
  };
  consider(policy.rules.disallow, false);
  consider(policy.rules.allow, true);
  return best === null ? true : (best as { allow: boolean }).allow;
}

/** Converte a resposta do servidor em política: 404/410 = sem regras; 401/403/5xx/erro = não acessar. */
export function policyFromResponse(status: number | null, text: string, userAgent: string, detail?: string): RobotsPolicy {
  if (status !== null && status >= 200 && status < 300) {
    // Alguns servidores devolvem uma página HTML no lugar do robots.txt: sem regras válidas = sem restrições declaradas.
    return { mode: "rules", rules: parseRobots(text, userAgent) };
  }
  if (status === 404 || status === 410) return { mode: "allow-all", rules: { allow: [], disallow: [] } };
  if (status === 401 || status === 403) {
    return { mode: "deny-all", rules: { allow: [], disallow: ["/"] }, reason: `robots.txt com acesso negado (HTTP ${status})` };
  }
  return {
    mode: "deny-all",
    rules: { allow: [], disallow: ["/"] },
    temporary: true,
    reason: status === null ? `robots.txt indisponível (${detail ?? "falha de rede"})` : `robots.txt indisponível (HTTP ${status})`,
  };
}
