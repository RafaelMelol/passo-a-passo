import { afterEach, describe, expect, it } from "vitest";
import { recordAttempt } from "@/lib/history";
import {
  STORAGE_KEY,
  createEmptyStudyData,
  exportStudyData,
  importStudyData,
  loadStudyData,
  parseStudyData,
  saveStudyData,
} from "@/lib/storage";
import { studyStore } from "@/lib/study-store";
import { MemoryStorage, makeAttempt } from "./fixtures";

describe("persistência e recuperação do progresso", () => {
  it("salva e recupera os mesmos dados", () => {
    const storage = new MemoryStorage();
    const data = {
      ...recordAttempt(createEmptyStudyData(), makeAttempt()),
      settings: { name: "Maria" },
      lastActivity: { kind: "pratica" as const, title: "Matemática · Porcentagem", href: "/praticar?disciplina=matematica", at: "2026-10-23T10:00:00.000Z" },
    };
    expect(saveStudyData(storage, data)).toEqual({ ok: true });
    expect(loadStudyData(storage)).toEqual({ data, warning: null });
  });

  it("primeiro acesso devolve dados vazios, sem aviso", () => {
    expect(loadStudyData(new MemoryStorage())).toEqual({ data: createEmptyStudyData(), warning: null });
  });

  it("JSON corrompido não quebra o site: devolve dados vazios com aviso", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "{isso não é json");
    expect(loadStudyData(storage)).toEqual({ data: createEmptyStudyData(), warning: "corrompido" });
  });

  it("armazenamento indisponível (servidor ou bloqueado) é tratado", () => {
    expect(loadStudyData(null).warning).toBe("indisponivel");
    expect(loadStudyData(new MemoryStorage({ throwOnGet: true })).warning).toBe("indisponivel");
    expect(saveStudyData(null, createEmptyStudyData())).toEqual({ ok: false, error: "indisponivel" });
  });

  it("falta de espaço ao salvar é identificada", () => {
    const storage = new MemoryStorage({ throwOnSet: new DOMException("cheio", "QuotaExceededError") });
    expect(saveStudyData(storage, createEmptyStudyData())).toEqual({ ok: false, error: "sem-espaco" });
  });

  it("descarta registros inválidos e mantém os válidos", () => {
    const raw = {
      version: 1,
      attempts: [makeAttempt(), { questionId: 1 }, makeAttempt({ selected: "Z" as never }), makeAttempt({ topic: "inexistente" as never })],
      practice: { filterKey: "x" },
      activeSimulado: "nada",
      simulados: [{ id: "s" }],
      officialDrafts: { a: { examId: "a", sectionIds: ["portugues"], answers: { "1": "A", "2": "Q" }, updatedAt: "2026-10-23T10:00:00.000Z" } },
      officialAttempts: null,
      lastActivity: { kind: "pratica", title: "x", href: "https://site-externo.com", at: "2026-10-23T10:00:00.000Z" },
      settings: { name: 123 },
    };
    const data = parseStudyData(raw);
    expect(data.attempts).toHaveLength(1);
    expect(data.practice).toBeNull();
    expect(data.activeSimulado).toBeNull();
    expect(data.simulados).toEqual([]);
    expect(data.officialDrafts.a.answers).toEqual({ "1": "A" });
    expect(data.officialAttempts).toEqual([]);
    expect(data.lastActivity).toBeNull();
    expect(data.settings).toEqual({ name: "" });
  });

  it("versão desconhecida começa do zero", () => {
    expect(parseStudyData({ version: 99, attempts: [makeAttempt()] })).toEqual(createEmptyStudyData());
    expect(parseStudyData(null)).toEqual(createEmptyStudyData());
  });

  it("simulado em andamento é recuperado com as respostas", () => {
    const session = {
      id: "simulado-1",
      config: { questionCount: 2, subjects: [], difficulty: "todas", timerEnabled: true },
      questionIds: ["a", "b"],
      answers: { a: "C" },
      currentIndex: 5,
      startedAt: "2026-10-23T10:00:00.000Z",
      elapsedMs: 1000,
    };
    const data = parseStudyData({ ...createEmptyStudyData(), activeSimulado: session });
    expect(data.activeSimulado).toEqual({ ...session, currentIndex: 1 });
  });
});

describe("cópia de segurança", () => {
  it("exporta e importa sem perder dados", () => {
    const data = recordAttempt(createEmptyStudyData(), makeAttempt());
    const text = exportStudyData(data, new Date("2026-10-23T10:00:00.000Z"));
    expect(importStudyData(text)).toEqual({ ok: true, data });
  });

  it("recusa arquivos que não são cópias deste site", () => {
    expect(importStudyData("não é json").ok).toBe(false);
    expect(importStudyData(JSON.stringify({ app: "outro", data: {} })).ok).toBe(false);
  });
});

describe("studyStore (estado compartilhado com o React)", () => {
  afterEach(() => studyStore.reset());

  it("no servidor, o snapshot é null", () => {
    expect(studyStore.getServerSnapshot()).toBeNull();
  });

  it("grava no localStorage a cada alteração e avisa os inscritos", () => {
    studyStore.reset();
    let notified = 0;
    const unsubscribe = studyStore.subscribe(() => notified++);
    studyStore.update((data) => recordAttempt(data, makeAttempt()));
    unsubscribe();
    expect(notified).toBeGreaterThan(0);
    expect(studyStore.getSnapshot().data.attempts).toHaveLength(1);
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.attempts).toHaveLength(1);
  });

  it("recupera o progresso salvo ao recarregar", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordAttempt(createEmptyStudyData(), makeAttempt())));
    studyStore.reset();
    expect(studyStore.getSnapshot().data.attempts).toHaveLength(1);
  });

  it("o snapshot é estável entre leituras (evita renderizações infinitas)", () => {
    studyStore.reset();
    expect(studyStore.getSnapshot()).toBe(studyStore.getSnapshot());
  });
});
