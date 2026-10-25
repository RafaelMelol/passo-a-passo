import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  // Os testes do servidor rodam no ambiente "node", sem window.
  if (typeof window === "undefined") return;
  cleanup();
  window.localStorage.clear();
});
