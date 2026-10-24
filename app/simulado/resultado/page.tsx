import type { Metadata } from "next";
import { Suspense } from "react";
import { SimuladoResultView } from "@/components/simulado/SimuladoResultView";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Resultado do simulado" };

export default function ResultadoSimuladoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<LoadingState label="Carregando resultado…" />}>
        <SimuladoResultView />
      </Suspense>
    </div>
  );
}
