import { isIP } from "node:net";

/**
 * Proteção contra SSRF: o coletor só acessa HTTPS, em hosts da lista da fonte,
 * e nunca endereços privados, locais ou de metadados de nuvem.
 */

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedUrlError";
  }
}

function ipv4ToNumber(ip: string): number {
  return ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);
}

const PRIVATE_V4_RANGES: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // inclui 169.254.169.254 (metadados de nuvem)
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function isPrivateIpv4(ip: string): boolean {
  const value = ipv4ToNumber(ip);
  return PRIVATE_V4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return ((value & mask) >>> 0) === ((ipv4ToNumber(base) & mask) >>> 0);
  });
}

export function isPrivateAddress(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, "").toLowerCase();
  const family = isIP(ip);
  if (family === 4) return isPrivateIpv4(ip);
  if (family === 6) {
    if (ip === "::" || ip === "::1") return true;
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]);
    if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(ip)) return true; // IPv4 mapeado em hexadecimal
    const first = parseInt(ip.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 (rede local única)
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 (link-local)
    if ((first & 0xff00) === 0xff00) return true; // multicast
    if (ip.startsWith("64:ff9b:") || ip.startsWith("2001:db8:")) return true; // NAT64 e documentação
    return false;
  }
  return true; // não é IP válido: trata como inseguro
}

function hostAllowed(hostname: string, allowedHosts: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return allowedHosts.some((allowed) => host === allowed.toLowerCase());
}

/** Valida a URL antes de qualquer acesso. Lança BlockedUrlError com o motivo. */
export function assertAllowedUrl(raw: string, allowedHosts: readonly string[]): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BlockedUrlError("URL inválida.");
  }
  if (url.protocol !== "https:") throw new BlockedUrlError("Somente HTTPS é permitido.");
  if (url.username || url.password) throw new BlockedUrlError("URLs com usuário ou senha não são permitidas.");
  if (url.port && url.port !== "443") throw new BlockedUrlError("Porta não permitida.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(hostname)) throw new BlockedUrlError("Endereços IP diretos não são permitidos.");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    throw new BlockedUrlError("Host local não permitido.");
  }
  if (!hostAllowed(hostname, allowedHosts)) throw new BlockedUrlError(`Host fora da lista autorizada da fonte: ${hostname}.`);
  url.hash = "";
  return url;
}

export type LookupFn = (hostname: string) => Promise<{ address: string; family: number }[]>;

/** Resolve o host e recusa se qualquer endereço for privado (evita DNS apontando para a rede interna). */
export async function resolvePublicAddresses(hostname: string, lookup: LookupFn): Promise<{ address: string; family: number }[]> {
  const addresses = await lookup(hostname);
  if (addresses.length === 0) throw new BlockedUrlError("O host não resolveu para nenhum endereço.");
  const blocked = addresses.find((entry) => isPrivateAddress(entry.address));
  if (blocked) throw new BlockedUrlError("O host resolve para um endereço privado ou reservado.");
  return addresses;
}
