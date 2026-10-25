import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS } from "@/data/questions";
import { buildBank } from "@/lib/questions/bank";
import { sanitizeRemoteQuestions } from "@/lib/questions/remote-store";
import { parseStudyData } from "@/lib/storage";
import { createEmptyStudyData } from "@/lib/storage";
import { makeAttempt, makeOfficialQuestion, makeQuestion } from "./fixtures";

describe("questões vindas do banco central", () => {
  it("aceita só questões válidas com gabarito verificado", () => {
    const valid = makeOfficialQuestion({ id: "central-01" });
    const pending = makeOfficialQuestion({ id: "central-02", verification: { statement: "verificada", answerKey: "pendente" } });
    const broken = makeQuestion({ id: "central-03", correctOption: "E" });
    expect(sanitizeRemoteQuestions([valid, pending, broken, { lixo: true }, "texto"]).map((q) => q.id)).toEqual(["central-01"]);
    expect(sanitizeRemoteQuestions({ nao: "é lista" })).toEqual([]);
  });

  it("somam-se ao banco do site sem duplicar IDs existentes", () => {
    const copy = { ...ALL_QUESTIONS[0] };
    const merged = buildBank([...ALL_QUESTIONS, copy, makeOfficialQuestion({ id: "central-01" })]);
    expect(merged.questions.length).toBe(ALL_QUESTIONS.length + 1);
    expect(merged.rejected.map((item) => item.id)).toEqual([copy.id]);
  });
});

describe("versão da questão no histórico", () => {
  it("guarda e recupera a versão respondida", () => {
    const data = { ...createEmptyStudyData(), attempts: [makeAttempt({ questionVersion: 3 }), makeAttempt({ questionVersion: -1 as never })] };
    const parsed = parseStudyData(JSON.parse(JSON.stringify(data)));
    expect(parsed.attempts[0].questionVersion).toBe(3);
    expect(parsed.attempts[1].questionVersion).toBeUndefined();
  });
});
