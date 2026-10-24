"use client";

import { Download, Save, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { useStudyData } from "@/hooks/useStudyData";
import { createEmptyStudyData, exportStudyData, importStudyData } from "@/lib/storage";
import type { StudyData } from "@/types/study";

/** Nome, cópia de segurança, restauração e limpeza dos dados locais. */
export function DataManagement({ data }: { data: StudyData }) {
  const { state, update } = useStudyData();
  const [name, setName] = useState(data.settings.name);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<StudyData | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function saveName(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim().slice(0, 60);
    update((current) => ({ ...current, settings: { ...current.settings, name: trimmed } }));
    setMessage({ tone: "success", text: trimmed ? `Pronto! Vamos chamar você de ${trimmed}.` : "Nome removido." });
  }

  function downloadBackup() {
    const now = new Date();
    const blob = new Blob([exportStudyData(data, now)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `passo-a-passo-copia-${now.toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage({ tone: "success", text: "Cópia de segurança baixada. Guarde o arquivo em um lugar seguro." });
  }

  async function readBackup(file: File) {
    const result = importStudyData(await file.text());
    if (fileInput.current) fileInput.current.value = "";
    if (!result.ok) {
      setMessage({ tone: "danger", text: result.error });
      return;
    }
    setPendingImport(result.data);
  }

  return (
    <Card id="meus-dados" className="scroll-mt-24 space-y-5">
      <CardTitle>Meus dados e preferências</CardTitle>

      <Notice tone="warning" title="Onde fica salvo o seu progresso">
        Tudo fica guardado só neste navegador, neste aparelho. Se os dados do navegador forem apagados, ou se você usar outro
        celular ou computador, o histórico não aparece lá. Baixe uma cópia de segurança de vez em quando: com ela, dá para
        restaurar tudo depois.
      </Notice>

      {state?.saveError && (
        <Notice tone="danger" role="alert" title="Não foi possível salvar">
          {state.saveError === "sem-espaco"
            ? "O espaço de armazenamento do navegador acabou. Baixe uma cópia de segurança e apague o progresso antigo."
            : "O navegador está bloqueando o armazenamento. Seu progresso desta visita pode ser perdido."}
        </Notice>
      )}

      {message && (
        <Notice tone={message.tone} role="status">
          {message.text}
        </Notice>
      )}

      <form onSubmit={saveName} className="space-y-2">
        <label htmlFor="nome" className="block font-bold">
          Como você gostaria de ser chamada(o)? <span className="font-normal text-ink-soft">(opcional)</span>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="nome"
            value={name}
            maxLength={60}
            autoComplete="given-name"
            onChange={(event) => setName(event.target.value)}
            className="min-h-12 flex-1 rounded-xl border-2 border-line-strong bg-surface px-3 text-lg"
          />
          <Button type="submit" variant="secondary" icon={<Save aria-hidden className="size-5" />}>
            Salvar nome
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={downloadBackup} icon={<Download aria-hidden className="size-5" />}>
          Baixar cópia de segurança
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()} icon={<Upload aria-hidden className="size-5" />}>
          Restaurar cópia de segurança
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readBackup(file);
          }}
        />
        <Button variant="ghost" onClick={() => setConfirmReset(true)} icon={<Trash2 aria-hidden className="size-5" />}>
          Apagar todo o progresso
        </Button>
      </div>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Restaurar esta cópia de segurança?"
        confirmLabel="Sim, restaurar"
        onConfirm={() => {
          if (pendingImport) update(() => pendingImport);
          setPendingImport(null);
          setMessage({ tone: "success", text: "Cópia restaurada com sucesso." });
        }}
        onCancel={() => setPendingImport(null)}
      >
        <p>
          A cópia tem {pendingImport?.attempts.length ?? 0} respostas e {pendingImport?.simulados.length ?? 0} simulados. O progresso
          atual deste navegador será substituído por ela.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmReset}
        title="Apagar todo o progresso?"
        confirmLabel="Sim, apagar tudo"
        tone="danger"
        onConfirm={() => {
          update(() => createEmptyStudyData());
          setName("");
          setConfirmReset(false);
          setMessage({ tone: "success", text: "Progresso apagado. Você pode começar de novo quando quiser." });
        }}
        onCancel={() => setConfirmReset(false)}
      >
        <p>Todas as respostas, simulados e preferências deste navegador serão apagados. Isso não pode ser desfeito.</p>
        <p>Se quiser guardar, baixe antes uma cópia de segurança.</p>
      </ConfirmDialog>
    </Card>
  );
}
