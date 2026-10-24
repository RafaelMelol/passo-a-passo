import type { Metadata } from "next";
import { Suspense } from "react";
import { AnswerSheet } from "@/components/official/AnswerSheet";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Cartão-resposta" };

export default function CartaoRespostaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<LoadingState label="Carregando cartão-resposta…" />}>
        <AnswerSheet />
      </Suspense>
    </div>
  );
}
