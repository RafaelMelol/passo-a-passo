import type { Metadata } from "next";
import { Suspense } from "react";
import { StudySetup } from "@/components/study/StudySetup";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Estudar" };

export default function EstudarPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="O que vamos estudar hoje?"
        description="Escolha a disciplina, o assunto e o nível. Depois é só responder uma questão de cada vez, com correção e explicação."
      />
      <Suspense fallback={<LoadingState label="Carregando opções…" />}>
        <StudySetup />
      </Suspense>
    </div>
  );
}
