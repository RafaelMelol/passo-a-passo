import type { Metadata } from "next";
import { SimuladoSetup } from "@/components/simulado/SimuladoSetup";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Simulado" };

export default function SimuladoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Montar um simulado"
        description="Treine como se fosse a prova: responda todas as questões e veja a correção completa só no final."
      />
      <SimuladoSetup />
    </div>
  );
}
