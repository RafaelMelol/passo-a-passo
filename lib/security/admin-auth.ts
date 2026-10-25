import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Autenticação do administrador: uma senha definida no servidor (ADMIN_PASSWORD)
 * e um cookie de sessão assinado com HMAC (ADMIN_SESSION_SECRET), HttpOnly e SameSite=Strict.
 * Nenhum segredo é enviado ao navegador nem usa variáveis NEXT_PUBLIC_*.
 */

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const MAX_LOGIN_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type Env = Record<string, string | undefined>;

export type AdminConfig = { enabled: true; password: string; secret: string; secureCookie: boolean } | { enabled: false; reason: string };

export function adminConfig(env: Env = process.env): AdminConfig {
  const password = env.ADMIN_PASSWORD ?? "";
  const secret = env.ADMIN_SESSION_SECRET ?? "";
  if (password.length < 12) return { enabled: false, reason: "ADMIN_PASSWORD não definida ou com menos de 12 caracteres." };
  if (secret.length < 32) return { enabled: false, reason: "ADMIN_SESSION_SECRET não definido ou com menos de 32 caracteres." };
  return { enabled: true, password, secret, secureCookie: env.NODE_ENV === "production" };
}

export function sessionCookieName(env: Env = process.env): string {
  // O prefixo __Host- exige HTTPS e impede que subdomínios definam o cookie.
  return env.NODE_ENV === "production" ? "__Host-pap_admin" : "pap_admin";
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export function verifyPassword(input: string, config: Extract<AdminConfig, { enabled: true }>): boolean {
  return safeEqual(input, config.password);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string, now: Date): string {
  const expires = now.getTime() + SESSION_TTL_MS;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${expires}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | null | undefined, secret: string, now: Date): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [version, expires, nonce, signature] = parts;
  const expected = sign(`${version}.${expires}.${nonce}`, secret);
  if (!safeEqual(signature, expected)) return false;
  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookieHeader(token: string, config: Extract<AdminConfig, { enabled: true }>, env: Env = process.env): string {
  return [
    `${sessionCookieName(env)}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    ...(config.secureCookie ? ["Secure"] : []),
  ].join("; ");
}

export function clearSessionCookieHeader(env: Env = process.env): string {
  return [`${sessionCookieName(env)}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0", ...(env.NODE_ENV === "production" ? ["Secure"] : [])].join(
    "; ",
  );
}

export function isAdminRequest(request: Request, now: Date, env: Env = process.env): boolean {
  const config = adminConfig(env);
  if (!config.enabled) return false;
  return verifySessionToken(readCookie(request, sessionCookieName(env)), config.secret, now);
}

/**
 * Proteção contra CSRF para requisições que alteram dados: a origem precisa ser o próprio site.
 * (Complementa o cookie SameSite=Strict.)
 */
export function isSameOriginRequest(request: Request, env: Env = process.env): boolean {
  const target = new URL(request.url);
  const allowed = new Set([target.origin, ...(env.APP_ORIGIN ? [env.APP_ORIGIN.replace(/\/$/, "")] : [])]);
  const origin = request.headers.get("origin");
  if (origin) return allowed.has(origin);
  return request.headers.get("sec-fetch-site") === "same-origin";
}

/** Identificador anônimo do cliente para limitar tentativas de login (não guarda o IP em claro). */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}|${request.headers.get("user-agent") ?? ""}`).digest("hex").slice(0, 32);
}
