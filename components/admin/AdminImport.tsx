"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { adminFetch } from "./admin-api";

const MANUAL_SOURCES = [
  { id: "fgv-conhecimento", name: "FGV Conhecimento" },
  { id: "cebraspe", name: "Cebraspe" },
  { id: "consulplan", name: "Instituto Consulplan" },
  { id: "ibfc", name: "IBFC" },
];

const inputClass = "min-h-11 w-full rounded-xl border-2 border-line-strong bg-surface px-3";

function Field({ label, name, type = "text", required = true, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="font-bold">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

export function AdminImport() {
  const [examResult, setExamResult] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [questionResult, setQuestionResult] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setExamResult(null);
    try {
      const result = await adminFetch<{ examId: string; questions: number; answerKeyBlock?: string; matchConfidence?: number; warnings: string[] }>(
        "/api/admin/import/exam",
        { form: new FormData(event.currentTarget) },
      );
      setExamResult({
        tone: "success",
        text: `Prova lida: ${result.questions} questões, bloco do gabarito "${result.answerKeyBlock ?? "?"}" (confiança ${result.matchConfidence ?? 0}). Ela está na fila de revisão.${
          result.warnings.length ? ` Avisos: ${result.warnings.join(" ")}` : ""
        }`,
      });
    } catch (error) {
      setExamResult({ tone: "danger", text: error instanceof Error ? error.message : "Erro na importação." });
    } finally {
      setBusy(false);
    }
  }

  async function submitQuestions(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setQuestionResult(null);
    const form = new FormData(event.currentTarget);
    try {
      const questions = JSON.parse(String(form.get("questions") ?? "[]")) as unknown;
      const result = await adminFetch<{ results: { id: string; status: string; reasons?: string[] }[] }>("/api/admin/import/questions", {
        json: { questions, authorization: String(form.get("authorization") ?? "") },
      });
      setQuestionResult({
        tone: "success",
        text: result.results.map((item) => `${item.id}: ${item.status}${item.reasons ? ` (${item.reasons.join(" ")})` : ""}`).join(" | ") || "Nada importado.",
      });
    } catch (error) {
      setQuestionResult({ tone: "danger", text: error instanceof SyntaxError ? "O texto não é um JSON válido." : error instanceof Error ? error.message : "Erro." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <CardTitle>Importar prova oficial (PDFs)</CardTitle>
        <p className="text-ink-soft">
          Para bancas que não permitem coleta automatizada: baixe o caderno e o gabarito no site oficial (como uma pessoa faria) e envie aqui.
          Os links precisam ser do site oficial da banca. A prova entra na fila de revisão; só o texto necessário para contar as questões é lido,
          e ele não é armazenado.
        </p>
        <form onSubmit={submitExam} className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="font-bold">Banca</span>
            <select name="sourceId" className={inputClass} required defaultValue="fgv-conhecimento">
              {MANUAL_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Nome do concurso" name="title" placeholder="Ex.: Prefeitura de … 2025" />
          <Field label="Órgão" name="organization" required={false} />
          <Field label="Cargo (como aparece no gabarito)" name="role" />
          <Field label="Ano" name="year" type="number" />
          <Field label="Tipo do caderno" name="bookletType" required={false} placeholder="Tipo 1" />
          <label className="block space-y-1">
            <span className="font-bold">Versão do gabarito</span>
            <select name="answerKeyVersion" className={inputClass} defaultValue="definitivo">
              <option value="definitivo">Definitivo</option>
              <option value="preliminar">Preliminar</option>
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 font-bold">
            <input type="checkbox" name="level" value="fundamental" required className="size-5 accent-brand" /> Cargo de nível fundamental
          </label>
          <Field label="Página oficial do concurso" name="examPageUrl" type="url" />
          <Field label="Link oficial do caderno" name="bookletUrl" type="url" />
          <Field label="Link oficial do gabarito" name="answerKeyUrl" type="url" />
          <label className="block space-y-1">
            <span className="font-bold">PDF do caderno</span>
            <input name="bookletPdf" type="file" accept="application/pdf" required className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className="font-bold">PDF do gabarito</span>
            <input name="answerKeyPdf" type="file" accept="application/pdf" required className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} icon={<Upload aria-hidden className="size-5" />}>
              Enviar para revisão
            </Button>
          </div>
        </form>
        {examResult && <Notice tone={examResult.tone}>{examResult.text}</Notice>}
      </Card>

      <Card className="space-y-4">
        <CardTitle>Importar questões com texto (JSON)</CardTitle>
        <p className="text-ink-soft">
          Use o mesmo formato de <code>data/questions/importadas.json</code> (veja o README). Questões oficiais só podem ser importadas com
          autorização de reutilização; questões autorais devem ser marcadas como <code>pratica-autoral</code>, sem banca ou concurso.
        </p>
        <form onSubmit={submitQuestions} className="space-y-3">
          <label className="block space-y-1">
            <span className="font-bold">Autorização de uso (obrigatória para questões oficiais)</span>
            <input name="authorization" className={inputClass} maxLength={500} placeholder="Ex.: licença CC BY 4.0 indicada em …" />
          </label>
          <label className="block space-y-1">
            <span className="font-bold">Questões (lista JSON)</span>
            <textarea name="questions" rows={8} className="w-full rounded-xl border-2 border-line-strong p-3 font-mono text-sm" defaultValue="[]" />
          </label>
          <Button type="submit" disabled={busy} icon={<Upload aria-hidden className="size-5" />}>
            Validar e enviar para revisão
          </Button>
        </form>
        {questionResult && <Notice tone={questionResult.tone}>{questionResult.text}</Notice>}
      </Card>
    </div>
  );
}
