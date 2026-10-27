// @vitest-environment node
import { describe, expect, it } from "vitest";
import { withExplicitSslMode } from "@/lib/server/db/client";

describe("modo SSL da conexão com o PostgreSQL", () => {
  it("troca prefer/require/verify-ca por verify-full, sem mexer no resto do endereço", () => {
    expect(withExplicitSslMode("postgresql://u:p%40ss@host.neon.tech/db?sslmode=require&channel_binding=require")).toBe(
      "postgresql://u:p%40ss@host.neon.tech/db?sslmode=verify-full&channel_binding=require",
    );
    expect(withExplicitSslMode("postgres://u:p@h/db?channel_binding=require&sslmode=prefer")).toBe(
      "postgres://u:p@h/db?channel_binding=require&sslmode=verify-full",
    );
    expect(withExplicitSslMode("postgres://u:p@h/db?sslmode=verify-ca")).toBe("postgres://u:p@h/db?sslmode=verify-full");
  });

  it("não altera endereços sem sslmode, com verify-full, disable ou com uselibpqcompat", () => {
    for (const url of [
      "postgres://u:p@h/db",
      "postgres://u:p@h/db?sslmode=verify-full",
      "postgres://u:p@localhost/db?sslmode=disable",
      "postgres://u:p@h/db?uselibpqcompat=true&sslmode=require",
    ]) {
      expect(withExplicitSslMode(url)).toBe(url);
    }
  });
});
