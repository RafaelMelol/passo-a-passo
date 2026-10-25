import { inepEnccejaAdapter } from "./inep-encceja";
import type { SourceAdapter } from "./types";

/** Adaptadores automáticos disponíveis, pelo identificador usado em data/crawler-sources.ts. */
export const ADAPTERS: Readonly<Record<string, SourceAdapter>> = {
  [inepEnccejaAdapter.id]: inepEnccejaAdapter,
};
