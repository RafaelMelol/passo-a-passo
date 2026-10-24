import type { Metadata } from "next";
import { SimuladoRunner } from "@/components/simulado/SimuladoRunner";

export const metadata: Metadata = { title: "Simulado em andamento" };

export default function FazerSimuladoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <SimuladoRunner />
    </div>
  );
}
